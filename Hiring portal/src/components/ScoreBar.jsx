export function ScoreBar({ score }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Skill Score</span>
        <span className="font-semibold text-white">{score}/100</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-800">
        <div
          className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all duration-700"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}
