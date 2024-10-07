import classNames from "classnames"
import { addonsImage } from "../../constants/assets"
import { useEffect } from "react"
import { playSound } from "../../helpers/sound"

export interface IAddonProps {
  addon: string
  addons: string[]
  isAddonChosen: boolean
  selectedAddon?: string
  setSelectedAddon: (addon: string) => void
  volume: number
}

export default function Addon(props: IAddonProps) {
  const {
    addon,
    addons,
    isAddonChosen,
    selectedAddon,
    setSelectedAddon,
    volume,
  } = props

  useEffect(() => {
    if (addons.includes(addon)) {
      playSound("addon", volume)
    }
  }, [addons, addon])

  function handleAddon(addon: string) {
    return () => setSelectedAddon(addon)
  }

  return (
    <li key={addon} className={classNames({ chosen: addons.includes(addon) })}>
      <button
        className={classNames("results__addon", {
          active: !selectedAddon && !isAddonChosen,
          selected: addon === selectedAddon,
        })}
        onClick={handleAddon(addon)}
        type="button"
      >
        <img className="results__addonImage" src={addonsImage[addon]} />
        {addon === "x2" && <div className="results__addonText">x2</div>}
      </button>
    </li>
  )
}
