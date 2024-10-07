import { ISelectedTile, ITileKey } from "../../types/game"
import { useRatio } from "../../hooks/useRatio"
import Card from "./Card"
import "./Hand.css"

export interface IHandProps {
  canPlay?: boolean
  currentPlayer?: string
  hand?: ITileKey[]
  playerId?: string
  selectedTile?: ISelectedTile
  setDrag: (params: {
    index: number
    tile: string
    tileRef: HTMLDivElement
    x: number
    y: number
  }) => void
  volume: number
}

export default function Hand(props: IHandProps) {
  const {
    canPlay,
    currentPlayer,
    playerId,
    hand = [],
    selectedTile,
    setDrag,
    volume,
  } = props
  const [ref, ratio] = useRatio<HTMLDivElement>()

  return (
    <div className="hand" ref={ref} style={{ transform: `scale(${ratio})` }}>
      <ul className="hand__list">
        {hand.map((tile, index) => (
          <Card
            key={index}
            canPlay={canPlay}
            currentPlayer={currentPlayer}
            index={index}
            playerId={playerId}
            selectedTile={selectedTile}
            setDrag={setDrag}
            tile={tile}
            volume={volume}
          />
        ))}
      </ul>
    </div>
  )
}
