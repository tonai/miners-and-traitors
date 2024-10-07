import { Players } from "rune-sdk"
import { IGameState } from "../../logic/logic"
import classNames from "classnames"
import "./Menu.css"
import { robot } from "../../constants/assets"
import { isAi } from "../../helpers/utils"

export interface IMenuProps {
  game: IGameState
  players?: Players
  playerId?: string
}

export default function Menu(props: IMenuProps) {
  const { game, playerId, players } = props

  function handleClick() {
    Rune.actions.start()
  }

  return (
    <div className="menu">
      <h1 className="menu__title">Miners and traitors</h1>
      <h2 className="menu__subtitle">Players</h2>
      <ul className="menu__players">
        {game.allPlayerIds.map((key) => (
          <li
            key={key}
            className={classNames("menu__player", {
              you: playerId === key,
            })}
          >
            {isAi(key) && (
              <>
                <img className="menu__img" src={robot} width={42} height={42} />
                {key}
              </>
            )}
            {!isAi(key) && (
              <>
                <img
                  className="menu__img"
                  src={players?.[key].avatarUrl}
                  width={42}
                  height={42}
                />
                {players?.[key].displayName} ({players?.[key].playerId})
              </>
            )}
          </li>
        ))}
      </ul>
      <button className="menu_play active" onClick={handleClick} type="button">
        Play
      </button>
    </div>
  )
}
