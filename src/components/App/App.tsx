import { useEffect, useState } from "react";
import { IGameState } from "../../logic/logic.ts";
import HowToPlay from "../HowToPlay/HowToPlay.tsx";
import Menu from "../Menu/Menu.tsx";
import Game from "../Game/Game.tsx";
import { Players } from "rune-games-sdk";
import "./App.css";

function App() {
  const [game, setGame] = useState<IGameState>();
  const [players, setPlayers] = useState<Players>();
  const [playerId, setPlayerId] = useState<string>();
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, players, yourPlayerId }) => {
        setGame(game);
        setPlayers(players);
        setPlayerId(yourPlayerId);
      },
    });
  }, []);

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {!game.start && (<Menu game={game} players={players} playerId={playerId} />)}
      {game.start && (<Game game={game} players={players} playerId={playerId} volume={volume} />)}
      {<HowToPlay setVolume={setVolume} volume={volume}/>}
    </>
  );
}

export default App;
