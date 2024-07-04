import { Players as PlayersType } from "dusk-games-sdk";
import { IActions, IPlayer, ISelectedTile } from "../../types/game";
import { MAX_ROUND } from "../../constants/game";
import Player from "./Player";
import "./Players.css";
import { RefObject } from "react";

export interface IPlayersProps {
  actions: IActions;
  allPlayerIds: string[];
  currentPlayer?: string;
  playerId?: string;
  players?: PlayersType;
  playersRef: RefObject<HTMLUListElement>
  round: number;
  selectedTile?: ISelectedTile;
  volume: number;
  you?: IPlayer;
}

export default function Players(props: IPlayersProps) {
  const {
    actions,
    allPlayerIds,
    currentPlayer,
    playerId,
    players,
    playersRef,
    round,
    selectedTile,
    volume,
    you,
  } = props;

  if (!players) {
    return null;
  }

  return (
    <ul className="players" ref={playersRef}>
      {allPlayerIds.map((key) => (
        <Player
          key={key}
          actions={actions}
          currentPlayer={currentPlayer}
          playerId={playerId}
          playerKey={key}
          players={players}
          selectedTile={selectedTile}
          volume={volume}
          you={you}
        />
      ))}
      <li className="players__rounds">
        {round}/{MAX_ROUND}
      </li>
    </ul>
  );
}
