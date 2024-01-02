import { Players as PlayersType } from "rune-games-sdk";
import { IGameState } from "../../logic/logic";
import Board from "../Board/Board";
import Hand from "../Hand/Hand";
import Players from "../Players/Players";
import { Results } from "../Results/Results";
import { useEffect, useRef, useState } from "react";
import { getRandomInt } from "../../helpers/utils";
import "./Game.css";

export interface IGameProps {
  game: IGameState;
  players?: PlayersType;
  playerId?: string;
  volume: number;
}

function isInside(el: HTMLElement, event: TouchEvent | MouseEvent): boolean {
  const { height, left, top, width } = el.getBoundingClientRect();
  if (event instanceof MouseEvent) {
    if (
      event.pageX >= left &&
      event.pageX <= left + width &&
      event.pageY >= top &&
      event.pageY <= top + height
    ) {
      el.dispatchEvent(
        new CustomEvent("click", { bubbles: true })
      );
      return true;
    }
  } else if (event instanceof TouchEvent) {
    if (
      event.changedTouches[0].pageX >= left &&
      event.changedTouches[0].pageX <= left + width &&
      event.changedTouches[0].pageY >= top &&
      event.changedTouches[0].pageY <= top + height
    ) {
      el.dispatchEvent(
        new CustomEvent("click", { bubbles: true })
      );
      return true;
    }
  }
  return false;
}

export default function Game(props: IGameProps) {
  const { game, players, playerId, volume } = props;
  const [drag, setDrag] = useState<{
    index: number;
    tile: string;
    tileRef: HTMLDivElement;
    x: number;
    y: number;
  }>();
  const boardRef = useRef<HTMLDivElement>(null);
  const playersRef = useRef<HTMLUListElement>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!game.results) {
      const time = getRandomInt(1000, 2000);
      const interval = setInterval(() => {
        Rune.actions.lockAi();
        setTimeout(() => Rune.actions.processAi(), 200);
      }, time);
      return () => clearInterval(interval);
    }
  }, [game.results]);

  useEffect(() => {
    if (drag) {
      drag.tileRef.style.zIndex = "1";

      // eslint-disable-next-line no-inner-declarations
      function move(event: TouchEvent | MouseEvent) {
        if (drag) {
          if (event instanceof MouseEvent) {
            drag.tileRef.style.translate = `${event.pageX - drag.x}px ${
              event.pageY - drag.y
            }px`;
          } else if (event instanceof TouchEvent) {
            drag.tileRef.style.translate = `${
              event.touches[0].pageX - drag.x
            }px ${event.touches[0].pageY - drag.y}px`;
          }
        }
      }

      // eslint-disable-next-line no-inner-declarations
      function drop(event: TouchEvent | MouseEvent) {
        if (drag) {
          drag.tileRef.style.translate = `0 0`;
          drag.tileRef.style.zIndex = "";
        }
        if (boardRef.current && Date.now() - timeRef.current > 200) {
          (
            boardRef.current.querySelectorAll(
              ".tile__highlighted"
            ) as NodeListOf<HTMLButtonElement>
          ).forEach((el) => isInside(el, event));
        }
        if (playersRef.current) {
          (
            playersRef.current.querySelectorAll(
              ".players__btn"
            ) as NodeListOf<HTMLButtonElement>
          ).forEach((el) => isInside(el, event));
        }
        setDrag(undefined);
      }

      timeRef.current = Date.now();
      window.addEventListener("mousemove", move);
      window.addEventListener("touchmove", move);
      window.addEventListener("mouseup", drop);
      window.addEventListener("touchend", drop);
      return () => {
        window.removeEventListener("mousemove", move);
        window.removeEventListener("touchmove", move);
        window.removeEventListener("mouseup", drop);
        window.removeEventListener("touchend", drop);
      };
    }
  }, [drag]);

  return (
    <div className="game">
      <div className="game__mask"></div>
      <Players
        actions={game.actions}
        allPlayerIds={game.allPlayerIds}
        currentPlayer={game.currentPlayer}
        playerId={playerId}
        players={players}
        playersRef={playersRef}
        round={game.round}
        selectedTile={game.selectedTile}
        volume={volume}
        you={game.players[playerId ?? ""]}
      />
      <Board
        boardRef={boardRef}
        key={game.round}
        actions={game.actions}
        board={game.board}
        currentPlayer={game.currentPlayer}
        playerId={playerId}
        selectedTile={game.selectedTile}
        volume={volume}
      />
      <Hand
        canPlay={game.canPlay}
        currentPlayer={game.currentPlayer}
        hand={game.players[playerId ?? ""]?.hand}
        playerId={playerId}
        selectedTile={game.selectedTile}
        setDrag={setDrag}
        volume={volume}
      />
      <Results
        addons={game.addons}
        canPlay={game.canPlay}
        playersInfo={game.players}
        playerId={playerId}
        players={players}
        results={game.results}
        resultsAddons={game.resultsAddons}
        round={game.round}
        volume={volume}
        votes={game.votes}
      />
    </div>
  );
}
