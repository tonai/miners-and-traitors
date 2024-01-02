import { Players as PlayersType } from "rune-games-sdk";
import classNames from "classnames";
import { IActions, IPlayer, ISelectedTile } from "../../types/game";
import "./Players.css";
import { isAi } from "../../helpers/utils";
import { brokenPickaxe, robot } from "../../constants/assets";
import { cards } from "../../constants/cards";
import { useEffect, useState } from "react";
import { playSound } from "../../helpers/sound";

export interface IPlayerProps {
  actions: IActions;
  currentPlayer?: string;
  playerId?: string;
  playerKey: string
  players?: PlayersType;
  selectedTile?: ISelectedTile;
  you?: IPlayer;
  volume: number;
}

function Player(props: IPlayerProps) {
  const {
    actions,
    currentPlayer,
    playerId,
    playerKey,
    players,
    selectedTile,
    volume,
    you,
  } = props;
  const [init, setInit] = useState(false);
  const isBroken = Boolean(actions[playerKey].find(({ action }) => action === "brokenPickaxe"));

  useEffect(() => {
    if (init) {
      if (isBroken) {
        playSound('brokenPickaxe', volume)
      } else {
        playSound('pickaxe', volume)
      }
    }
  }, [isBroken]);

  useEffect(() => {
    setInit(true);
  }, [])

  function isActive(key: string): boolean {
    return Boolean(
      currentPlayer === playerId &&
      actions[key] &&
      ((selectedTile?.tile === "brokenPickaxe" &&
        !actions[key].find(({ action }) => action === "brokenPickaxe")) ||
        (selectedTile?.tile === "pickaxe" &&
          actions[key].find(({ action }) => action === "brokenPickaxe")))
    );
  }

  function handleClick(key: string) {
    return () => {
      if (selectedTile?.tile && cards[selectedTile.tile].action) {
        Rune.actions.addActionTile({ playerId: key });
      }
      setTimeout(() => Rune.actions.drawAndPass(), 1000);
    };
  }

  const active = isActive(playerKey);
  return (
    <li
      key={playerKey}
      className={classNames("players__player", {
        current: currentPlayer === playerKey,
        you: playerId === playerKey,
      })}
    >
      {isAi(playerKey) && (
        <img
          className={classNames("players__img", {
            active,
          })}
          src={robot}
          width={42}
          height={42}
        />
      )}
      {!isAi(playerKey) && (
        <img
          className={classNames("players__img", {
            active,
          })}
          src={players?.[playerKey].avatarUrl}
          width={42}
          height={42}
        />
      )}
      {active && (
        <button
          className="players__btn"
          onClick={handleClick(playerKey)}
          type="button"
        >
          +
        </button>
      )}
      {playerId === playerKey && (
        <div
          className={classNames("players__role", {
            traitor: you?.traitor,
          })}
        >
          {you?.traitor ? "traitor" : "miner"}
        </div>
      )}
      {playerId === playerKey && <div className="players__score">{you?.score}</div>}
      {isBroken && (
        <img
          className="players__broken"
          src={brokenPickaxe}
          width={21}
          height={21}
        />
      )}
    </li>
  );
}

export default Player;
