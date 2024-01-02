import { TILE_HEIGHT, TILE_WIDTH } from "../../constants/game";
import { IActions, IBoard, ISelectedTile } from "../../types/game";
import Tile from "../Tile/Tile";
import { useRatio } from "../../hooks/useRatio";
import { CSSProperties, RefObject, useEffect, useMemo, useState } from "react";
import "./Board.css";
import classNames from "classnames";

export interface IBoardProps {
  actions: IActions;
  board: IBoard;
  boardRef: RefObject<HTMLDivElement>
  currentPlayer?: string;
  playerId?: string;
  selectedTile?: ISelectedTile;
  volume: number;
}

export default function Board(props: IBoardProps) {
  const { actions, board, boardRef, currentPlayer, playerId, selectedTile, volume } = props;
  const [ref, ratio] = useRatio<HTMLTableElement>();
  const [init, setInit] = useState(false)
  const style = useMemo(() => {
    const style: CSSProperties = { transform: `scale(${ratio})` };
    if (ref.current) {
      style.width = ref.current.scrollWidth;
      style.height = ref.current.scrollHeight;
    }
    return style;
  }, [ratio, ref]);

  useEffect(() => {
    if (boardRef.current && ratio !== 1) {
      boardRef.current.scrollLeft = 50;
      boardRef.current.scrollTop = 50;
    }
  }, [boardRef, ratio]);

  useEffect(() => {
    setInit(true);
  }, [])

  return (
    <div className="board" style={style} ref={boardRef}>
      <div className={classNames("board__margin", { width: ratio < 1 })}>
        <table className="board__table" ref={ref}>
          <tbody>
            {board.map((row, i) => (
              <tr className="board__row" key={i}>
                {row.map((cell, j) => (
                  <td
                    className="board__cell"
                    key={j}
                    style={{
                      width: `${TILE_WIDTH}px`,
                      height: `${TILE_HEIGHT}px`,
                    }}
                  >
                    <Tile
                      actions={actions}
                      board={board}
                      cell={cell}
                      col={j}
                      currentPlayer={currentPlayer}
                      init={init}
                      playerId={playerId}
                      row={i}
                      selectedTile={selectedTile}
                      volume={volume}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
