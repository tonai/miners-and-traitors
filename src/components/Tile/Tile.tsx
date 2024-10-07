import { gold, stone, tileDefault, tiles } from "../../constants/assets"
import { cards } from "../../constants/cards"
import { TILE_HEIGHT, TILE_WIDTH } from "../../constants/game"
import { IActions, IBoard, IBoardTile, ISelectedTile } from "../../types/game"
import { isCellAvailable } from "../../helpers/utils"
import "./Tile.css"
import classNames from "classnames"
import { useEffect, useRef } from "react"
import { playSound } from "../../helpers/sound"

export interface ITileKeyProps {
  actions: IActions
  board: IBoard
  cell: IBoardTile
  col: number
  currentPlayer?: string
  init: boolean
  playerId?: string
  row: number
  selectedTile?: ISelectedTile
  volume: number
}

export default function Tile(props: ITileKeyProps) {
  const {
    actions,
    board,
    cell,
    col,
    currentPlayer,
    init,
    playerId,
    row,
    selectedTile,
    volume,
  } = props
  const action = actions[playerId ?? ""]
  const highlighted =
    currentPlayer === playerId &&
    isCellAvailable(board, row, col, action, selectedTile?.tile)
  const revealed =
    cell.revealed ||
    Boolean(
      playerId &&
        action.find(
          ({ action, x, y }) => action === "map" && x === row && y === col
        )
    )
  const removeTileRef = useRef(cell.tile)

  function handleClick() {
    if (selectedTile?.tile && !cards[selectedTile.tile].action) {
      Rune.actions.addSelectedTile({ row, col })
    } else if (selectedTile?.tile && cards[selectedTile.tile].action) {
      Rune.actions.addActionTile({ row, col })
    }
    setTimeout(() => Rune.actions.drawAndPass(), 1000)
  }

  useEffect(() => {
    if (cell.tile !== null && init) {
      playSound("addTile", volume)
    }
  }, [cell.tile])

  useEffect(() => {
    if (cell.tile === null && removeTileRef.current !== null) {
      playSound("removeTile", volume)
    }
    removeTileRef.current = cell.tile
  }, [cell.tile])

  useEffect(() => {
    if (revealed) {
      if (cell.tile === "tileGoal") {
        playSound("tileGoal", volume)
      } else if (cell.tile === "tileLure") {
        playSound("tileLure", volume)
      }
    }
  }, [revealed])

  return (
    <>
      <img
        className={classNames("tile", { new: cell.tile !== null })}
        src={cell.tile === null ? tileDefault : tiles[cell.tile]}
        width={TILE_WIDTH}
        height={TILE_HEIGHT}
      />
      {!revealed && (cell.tile === "tileGoal" || cell.tile === "tileLure") && (
        <div className="tile__overlay">?</div>
      )}
      {revealed && cell.tile === "tileGoal" && (
        <div className="tile__overlay">
          <img width="38" height="36" src={gold} />
        </div>
      )}
      {revealed && cell.tile === "tileLure" && (
        <div className="tile__overlay">
          <img width="36" height="41" src={stone} />
        </div>
      )}
      {highlighted && (
        <button
          className="tile__highlighted active"
          onClick={handleClick}
          type="button"
        >
          {selectedTile?.tile && !cards[selectedTile.tile].action && "+"}
        </button>
      )}
    </>
  )
}
