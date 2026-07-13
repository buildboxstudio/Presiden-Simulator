import { useGame } from '../context/GameContext'

export default function NewsTicker() {
  const { newsFeed } = useGame()
  const latest = newsFeed.slice(-3)

  return (
    <div className="bg-retroGray border-y-2 border-retroYellow py-1 overflow-hidden">
      <div className="news-ticker">
        <div className="news-ticker-content text-sm text-retroLight px-4">
          {latest.map((item, i) => (
            <span key={i}>
              <span className="text-retroYellow">►</span> {item}
              <span className="mx-8 text-retroYellow">◆</span>
            </span>
          ))}
          <span className="text-retroYellow blink">▌</span>
        </div>
      </div>
    </div>
  )
}
