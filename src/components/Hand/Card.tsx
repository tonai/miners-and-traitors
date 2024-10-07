import classNames from "classnames"
import { tiles } from "../../constants/assets"
import { TILE_HEIGHT, TILE_WIDTH } from "../../constants/game"
import { ISelectedTile, ITileKey } from "../../types/game"
import { playSound } from "../../helpers/sound"
import { PointerEvent, useEffect, useRef, useState } from "react"

export interface ICardProps {
  canPlay?: boolean
  currentPlayer?: string
  index: number
  playerId?: string
  selectedTile?: ISelectedTile
  setDrag: (params: {
    index: number
    tile: string
    tileRef: HTMLDivElement
    x: number
    y: number
  }) => void
  tile: string
  volume: number
}

export default function Card(props: ICardProps) {
  const {
    canPlay,
    currentPlayer,
    index,
    playerId,
    selectedTile,
    setDrag,
    tile,
    volume,
  } = props
  const [discard, setDiscard] = useState<
    false | { index: number; tile: string }
  >(false)
  const tileRef = useRef<HTMLDivElement>(null)
  const [isNew, setIsNew] = useState(true)

  useEffect(() => {
    if (discard) {
      playSound("discard", volume)
      setTimeout(() => {
        Rune.actions.discardHandTile?.(discard)
        Rune.actions.drawAndPass()
      }, 1000)
    }
  }, [discard])

  useEffect(() => {
    setTimeout(() => setIsNew(false), 1000)
  }, [])

  function handleDiscard(tile: ITileKey, index: number) {
    return () => {
      setDiscard({ index, tile })
      setTimeout(() => setDiscard(false), 1200)
    }
  }

  function handlePointerDown(tile: ITileKey, index: number) {
    return (event: PointerEvent<HTMLButtonElement>) => {
      if (canPlay && playerId && playerId === currentPlayer) {
        Rune.actions.selectHandTile?.({ index, tile })
        setDrag({
          index,
          tile,
          tileRef: tileRef.current as HTMLDivElement,
          x: event.pageX,
          y: event.pageY,
        })
      }
    }
  }

  return (
    <li
      className={classNames("hand__item", {
        discard: discard && discard.index === index,
        isNew,
      })}
    >
      <div
        className={classNames("hand__tile", {
          selected: currentPlayer === playerId && selectedTile?.index === index,
        })}
        ref={tileRef}
      >
        <button
          className={classNames("hand__btn", {
            active: currentPlayer === playerId && !selectedTile && canPlay,
          })}
          onPointerDown={handlePointerDown(tile, index)}
          type="button"
        >
          <img
            className="hand__img"
            draggable="false"
            src={tiles[tile]}
            width={TILE_WIDTH}
            height={TILE_HEIGHT}
          />
        </button>
        {currentPlayer === playerId && selectedTile?.index === index && (
          <button
            className="hand__trash active"
            onClick={handleDiscard(tile, index)}
            type="button"
          >
            🗑
          </button>
        )}
      </div>
    </li>
  )
}
