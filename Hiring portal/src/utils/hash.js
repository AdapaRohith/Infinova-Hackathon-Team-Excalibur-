import SHA256 from 'crypto-js/sha256'
import stableStringify from 'json-stable-stringify'

export const generateHash = (data) => {
  return SHA256(stableStringify(data)).toString()
}