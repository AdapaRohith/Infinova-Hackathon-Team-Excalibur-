import algosdk from 'algosdk'

export const blockchainNetworkName = 'Algorand'
export const blockchainNetworkLabel = 'Algorand TestNet'
export const explorerBaseUrl = 'https://testnet.explorer.perawallet.app'
export const attestationReferenceLabel = 'Attestation Method'
export const attestationReferenceValue = 'Self-payment note attestation'
export const contractExplorerUrl = explorerBaseUrl
export const contractAddress = attestationReferenceValue

let peraWalletInstance = null
const notePrefix = 'INFINOVA_PROOF_V1|'
const notePrefixBytes = new TextEncoder().encode(notePrefix)
const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '')
const indexerClient = new algosdk.Indexer('', 'https://testnet-idx.algonode.cloud', '')

export const getTxExplorerUrl = (txHash) =>
  txHash ? `${explorerBaseUrl}/tx/${txHash}/` : ''

const createBlockchainError = (message, code) => {
  const error = new Error(message)
  error.code = code
  return error
}

const getPeraWallet = async () => {
  if (peraWalletInstance) return peraWalletInstance

  try {
    if (typeof globalThis.global === 'undefined') {
      globalThis.global = globalThis
    }

    const { PeraWalletConnect } = await import('@perawallet/connect')
    peraWalletInstance = new PeraWalletConnect({
      chainId: 416002,
      shouldShowSignTxnToast: false,
    })
    return peraWalletInstance
  } catch (error) {
    throw createBlockchainError(
      `Unable to load Pera Wallet. ${error?.message || 'Please refresh and try again.'}`,
      'NO_PERA',
    )
  }
}

export const disconnectWalletSession = async () => {
  if (!peraWalletInstance) return

  try {
    await peraWalletInstance.disconnect()
  } finally {
    peraWalletInstance = null
  }
}

const fromBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0))

const encodeAttestationNote = (candidateId, hash) =>
  new TextEncoder().encode(
    `${notePrefix}${JSON.stringify({
      candidateId,
      hash,
      createdAt: new Date().toISOString(),
    })}`,
  )

const decodeAttestationNote = (note) => {
  if (!note) return null

  try {
    const decoded = new TextDecoder().decode(fromBase64(note))
    if (!decoded.startsWith(notePrefix)) return null
    return JSON.parse(decoded.slice(notePrefix.length))
  } catch {
    return null
  }
}

const connectWallet = async () => {
  const peraWallet = await getPeraWallet()
  let accounts = await peraWallet.reconnectSession()

  if (!accounts?.length) {
    try {
      accounts = await peraWallet.connect()
    } catch (error) {
      if (String(error?.message || '').toLowerCase().includes('closed')) {
        throw createBlockchainError('Pera Wallet connection was closed before approval.', 'WALLET_REJECTED')
      }
      throw error
    }
  }

  if (!accounts?.length) {
    throw createBlockchainError('No Algorand account is available in Pera Wallet.', 'NO_ACCOUNT')
  }

  return {
    account: accounts[0],
  }
}

const listAttestations = async (candidateId) => {
  const response = await indexerClient
    .searchForTransactions()
    .txType('pay')
    .notePrefix(notePrefixBytes)
    .limit(200)
    .do()

  const transactions = response.transactions ?? []

  return transactions
    .map((transaction) => {
      const note = decodeAttestationNote(transaction.note)
      if (!note || note.candidateId !== candidateId) return null

      return {
        hash: note.hash,
        timestamp: transaction['round-time'] ?? 0,
        txHash: transaction.id,
        senderAddress: transaction.sender,
      }
    })
    .filter(Boolean)
    .sort((left, right) => right.timestamp - left.timestamp)
}

export const storeHash = async (candidateId, hash, onStatusChange) => {
  onStatusChange?.({
    status: 'waiting_approval',
    message: 'Waiting for Pera Wallet approval...',
  })

  const { account } = await connectWallet()
  const peraWallet = await getPeraWallet()
  const suggestedParams = await algodClient.getTransactionParams().do()
  const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: account,
    receiver: account,
    amount: 0,
    note: encodeAttestationNote(candidateId, hash),
    suggestedParams,
  })
  const txId = transaction.txID()
  const txnGroup = [[{ txn: transaction, signers: [account] }]]
  let signedTransactions
  try {
    signedTransactions = await peraWallet.signTransaction(txnGroup)
  } catch (error) {
    if (String(error?.message || '').toLowerCase().includes('closed')) {
      throw createBlockchainError('Pera Wallet signing was closed before approval.', 'WALLET_REJECTED')
    }
    throw error
  }
  await algodClient.sendRawTransaction(signedTransactions).do()

  onStatusChange?.({
    status: 'pending',
    message: 'Algorand transaction pending...',
    txHash: txId,
  })

  return {
    txHash: txId,
    timestamp: new Date().toISOString(),
    senderAddress: account,
    confirmed: false,
  }
}

export const isTransactionConfirmed = async (txHash) => {
  if (!txHash) return false

  try {
    const pendingTransaction = await algodClient.pendingTransactionInformation(txHash).do()
    if (pendingTransaction['confirmed-round']) {
      return true
    }
  } catch {
    // fall through to indexer lookup
  }

  try {
    const response = await indexerClient.lookupTransactionByID(txHash).do()
    return Boolean(response.transaction?.['confirmed-round'] || response.transaction?.['round-time'])
  } catch {
    return false
  }
}

export const verifyHash = async (candidateId, hash) => {
  const attestations = await listAttestations(candidateId)
  return attestations.some((item) => item.hash === hash)
}

export const getAttestationRecordCount = async (candidateId) => {
  const attestations = await listAttestations(candidateId)
  return attestations.length
}

export const getAttestationRecord = async (candidateId, index) => {
  const attestations = await listAttestations(candidateId)
  const record = attestations[index]
  if (!record) return null

  return {
    hash: record.hash,
    timestamp: record.timestamp,
    txHash: record.txHash,
    senderAddress: record.senderAddress,
  }
}

export const getLatestAttestation = async (candidateId) => {
  const attestations = await listAttestations(candidateId)
  if (!attestations.length) return null
  const [latestRecord] = attestations

  return {
    ...latestRecord,
    count: attestations.length,
  }
}
