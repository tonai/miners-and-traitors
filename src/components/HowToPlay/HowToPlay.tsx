import { ChangeEvent, useState } from "react";
import "./HowToPlay.css";
import classNames from "classnames";
import { gold, tileNSEW, tileStart } from "../../constants/assets";
import { MAX_ROUND } from "../../constants/game";

interface IHowToPlayProps {
  setVolume: (volume: number) => void;
  volume: number;
}

export default function HowToPlay(props: IHowToPlayProps) {
  const { setVolume, volume } = props;
  const [open, setOpen] = useState(false);

  function handleClick() {
    setOpen(!open);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setVolume(Number(event.target.value));
  }

  return (
    <div className={classNames("htp", { open })}>
      <div className="htp__corner">
        <button className="htp__btn" onClick={handleClick} type="button">
          {open ? "✖" : "?"}
        </button>
      </div>
      <div className="htp__overflow">
        <div className="htp__content">
          <h2 className="htp__title">Audio</h2>
          <label className="htp__form">
            <span className="htp__label">Volume:</span>{" "}
            <input min={0} max={100} onChange={handleChange} type="range" value={volume} />
          </label>
          <h2 className="htp__title">How to play ?</h2>
          You are miners who dig the mountain to find gold.
          <br />
          Cooperate together to build a tunnel from the start tile{" "}
          <img
            className="htp__img"
            src={tileStart}
            width={32}
            height={32}
            alt="Start tile"
          />{" "}
          to one of the goal tiles{" "}
          <span className="htp__imgWrapper">
            <img
              className="htp__img"
              src={tileNSEW}
              width={32}
              height={32}
              alt="Goal tile"
            />
            <div className="htp__overlay">?</div>
          </span>
          .<br />
          But be careful, one of you is a traitor and his goal is to stop you
          from finding the gold (the traitor role changes between each round).
          <br />
          When you arrive to one of the goal tile reveal it and if you found the
          gold{" "}
          <span className="htp__imgWrapper">
            <img
              className="htp__img"
              src={tileNSEW}
              width={32}
              height={32}
              alt="Start tile"
            />{" "}
            <div className="htp__overlay">
              <img width="19" height="18" src={gold} />
            </div>
          </span>
          then the round ends.
          <br />
          <ul>
            <li>The first miner to find the gold scores from 2 to 3 points.</li>
            <li>The other miners score 1 point.</li>
            <li>The traitor scores 0 point.</li>
          </ul>
          But if the traitor achieves his goal, then he alone scores 4 points.
          <br />
          The game ends after {MAX_ROUND} rounds and the miner with the most
          points win the game.
        </div>
      </div>
    </div>
  );
}
