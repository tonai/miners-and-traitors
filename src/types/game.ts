import { tiles } from "../constants/assets"

export type ITileKey = keyof typeof tiles

export interface IPlayer {
  ai: boolean
  hand: ITileKey[]
  score: number
  traitor?: boolean
}

export type IPlayers = Record<string, IPlayer>

export interface ISelectedTile {
  index: number
  tile: ITileKey
}

export interface ICard {
  action?: boolean
  closed?: boolean
  north?: boolean
  south?: boolean
  est?: boolean
  west?: boolean
}

export interface IBoardTile {
  path?: boolean
  tile: ITileKey | null
  revealed?: boolean
  x: number // row
  y: number // col
}

export type IBoard = IBoardTile[][]

export interface IAction {
  action: string
  x?: number // row
  y?: number // col
}

export type IActions = Record<string, IAction[]>

export interface ISolution {
  diff: number
  index?: number
  score: number
  handTile?: ITileKey
  tile?: IBoardTile
}

export interface ISolutions {
  bad: ISolution
  good: ISolution
}
