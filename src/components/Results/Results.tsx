import { Players } from "rune-games-sdk";
import { IPlayer, IPlayers } from "../../types/game";
import { isAi } from "../../helpers/utils";
import { robot } from "../../constants/assets";
import classNames from "classnames";
import { MAX_ROUND } from "../../constants/game";
import { useEffect, useState } from "react";
import "./Results.css";
import Addon from "./Addon";

export interface IResultsProps {
  addons: string[];
  canPlay: boolean;
  playerId?: string;
  players?: Players;
  playersInfo: IPlayers;
  results: string | null;
  resultsAddons: string[];
  round: number;
  volume: number;
  votes: Record<string, string>;
}

export function Results(props: IResultsProps) {
  const {
    addons,
    canPlay,
    playerId,
    players,
    playersInfo,
    results,
    resultsAddons,
    round,
    volume,
    votes,
  } = props;
  const [hide, setHide] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<string>();
  const playersEntries = Object.entries(playersInfo);
  const votesNumber = Object.values(votes).length;
  const nonAiPlayersNumber = playersEntries.filter(
    ([_, player]) => !player.ai
  ).length;
  const end = round === MAX_ROUND;
  const isAddonChosen = addons.some(addon => resultsAddons.includes(addon));
  const disabled =
    canPlay ||
    ((Boolean(playerId && votes[playerId]) || (!end && !selectedAddon)) &&
      !isAddonChosen &&
      round !== MAX_ROUND);

  let winner: IPlayer | undefined;
  let winners: [string, IPlayer][] | undefined;
  if (end) {
    const winnerInfo = playersEntries.reduce<[string, IPlayer] | undefined>(
      (acc, [key, player]) => {
        if (!acc || player.score > acc[1].score) {
          acc = [key, player];
        }
        return acc;
      },
      undefined
    ) as [string, IPlayer];
    winner = winnerInfo[1];
    winners = playersEntries.sort(([_1, a], [_2, b]) => b.score - a.score);
  } else if (results === "miners") {
    winners = playersEntries.filter(([_, player]) => !player.traitor);
  } else {
    winner = results ? playersInfo[results] : undefined;
    winners = playersEntries
      .filter(([_, player]) => player.traitor === winner?.traitor)
      .sort(([a], [b]) => (a === results ? -1 : b === results ? 1 : 0));
  }

  useEffect(() => {
    setSelectedAddon(undefined);
  }, [round]);

  function handleClick() {
    if (end) {
      Rune.actions.restart();
    } else if (isAddonChosen) {
      Rune.actions.nextRound();
    } else if (selectedAddon) {
      Rune.actions.voteAddon({ addon: selectedAddon });
    }
  }

  function handleHide() {
    setHide(true);
  }

  function handleShow() {
    setHide(false);
  }

  return (
    <>
      {results && (
        <button className="results__show" onClick={handleShow} type="button">
          Show results
        </button>
      )}
      <div
        className={classNames("results__overlay", {
          visible: results && !hide,
        })}
      ></div>
      <div
        className={classNames("results", { visible: results && !hide, end })}
      >
        <button className="results__close" onClick={handleHide} type="button">
          ✖
        </button>
        <h2 className="results__title">Winners</h2>
        {results && (
          <>
            <ul className={classNames("results__list", { end })}>
              {winners.map(([key, player]) => (
                <li
                  key={key}
                  className={classNames("results__item", {
                    winner: key === results,
                  })}
                >
                  {isAi(key) && (
                    <img
                      className="results__img"
                      src={robot}
                      width={42}
                      height={42}
                    />
                  )}
                  {!isAi(key) && (
                    <img
                      className="results__img"
                      src={players?.[key].avatarUrl}
                      width={42}
                      height={42}
                    />
                  )}
                  <div
                    className={classNames("results__role", {
                      traitor: player.traitor,
                    })}
                  >
                    {isAi(key) ? key : players?.[key].displayName}
                  </div>
                  {end && <div className="results__score">{player.score}</div>}
                </li>
              ))}
            </ul>
          </>
        )}
        {!end && results && (
          <>
            <h2 className="results__title">Choose new addon</h2>
            <ul className="results__addons">
              {resultsAddons.map((addon) => (
                <Addon
                  key={addon}
                  addon={addon}
                  addons={addons}
                  isAddonChosen={isAddonChosen}
                  selectedAddon={selectedAddon}
                  setSelectedAddon={setSelectedAddon}
                  volume={volume}
                />
              ))}
            </ul>
          </>
        )}
        {!end && (
          <button
            className={classNames("results__btn", { active: !disabled })}
            disabled={disabled}
            onClick={handleClick}
            type="button"
          >
            {isAddonChosen
              ? "Next round"
              : `Vote (${votesNumber}/${nonAiPlayersNumber})`}
          </button>
        )}
      </div>
    </>
  );
}
