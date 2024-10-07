import type { RuneClient } from "rune-sdk"
import { isAi } from "../helpers/utils"
import {
  IActions,
  IBoard,
  IPlayers,
  ISelectedTile,
  ITileKey,
} from "../types/game"
import {
  addActionTile,
  addSelectedTile,
  discardHandTile,
  drawAndPass,
  lockAi,
  nextRound,
  processAi,
  restart,
  selectHandTile,
  start,
  voteAddon,
} from "../helpers/actions"

export interface IGameState {
  actions: IActions
  addons: string[]
  allPlayerIds: string[]
  board: IBoard
  canPlay: boolean
  currentPlayerIndex: number
  currentPlayer: string
  drawPile: ITileKey[]
  playerAction: number
  players: IPlayers
  processingAi: boolean | string
  selectedTile?: ISelectedTile
  results: string | null
  resultsAddons: string[]
  round: number
  start: boolean
  votes: Record<string, string>
}

export type IGameActions = {
  addActionTile: (params: {
    col?: number
    playerId?: string
    row?: number
    selectedTile?: ITileKey
  }) => void
  addSelectedTile: (params: { col: number; row: number }) => void
  discardHandTile: (params: { index: number; tile: ITileKey }) => void
  drawAndPass: () => void
  lockAi: () => void
  nextRound: () => void
  processAi: () => void
  restart: () => void
  selectHandTile: (params: { index: number; tile: ITileKey }) => void
  start: () => void
  voteAddon: (params: { addon: string }) => void
}

declare global {
  const Rune: RuneClient<IGameState, IGameActions>
}

Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 4,
  setup: (allPlayerIds): IGameState => {
    let i = 1
    while (allPlayerIds.length < 4) {
      allPlayerIds.push("AI " + i++)
    }

    return {
      actions: {},
      addons: [],
      allPlayerIds,
      board: [],
      canPlay: true,
      currentPlayerIndex: 0,
      currentPlayer: allPlayerIds[0],
      drawPile: [],
      playerAction: 0,
      players: Object.fromEntries(
        allPlayerIds.map((id) => [id, { ai: isAi(id), hand: [], score: 0 }])
      ),
      processingAi: false,
      results: null,
      resultsAddons: [],
      round: 1,
      start: false,
      votes: {},
    }
  },
  actions: {
    addActionTile: (params, { game, playerId }) =>
      addActionTile(params, game, playerId),
    addSelectedTile: (params, { game }) => addSelectedTile(params, game),
    discardHandTile: (params, { game, playerId }) =>
      discardHandTile(params, game, playerId),
    drawAndPass: (_, { game }) => drawAndPass(game),
    lockAi: (_, { game, playerId }) => lockAi(game, playerId),
    nextRound: (_, { game }) => nextRound(game),
    processAi: (_, { game, playerId }) => processAi(game, playerId),
    restart: (_, { game }) => restart(game),
    selectHandTile: (params, { game, playerId }) =>
      selectHandTile(params, game, playerId),
    start: (_, { game }) => start(game),
    voteAddon: (params, { game, playerId }) =>
      voteAddon(params, game, playerId),
  },
  events: {
    playerJoined: (playerId, { game }) => {
      const aiIndex = game.allPlayerIds.findIndex(isAi)
      const aiId = game.allPlayerIds[aiIndex]

      game.allPlayerIds.splice(aiIndex, 1, playerId)

      game.players[playerId] = game.players[aiId]
      game.players[playerId].ai = false
      delete game.players[aiId]

      game.actions[playerId] = game.actions[aiId]
      delete game.actions[aiId]

      if (game.currentPlayer === aiId) {
        game.currentPlayer = playerId
      }
      if (game.results === aiId) {
        game.results = playerId
      }
    },
    playerLeft: (playerId, { game }) => {
      const playerIndex = game.allPlayerIds.findIndex((id) => id === playerId)
      const aiNumbers = game.allPlayerIds.reduce(
        (acc, id) => {
          if (isAi(id)) {
            return acc.filter((i) => i !== Number(id.at(-1)))
          }
          return acc
        },
        [1, 2, 3]
      )
      const aiId = "AI " + Math.min(...aiNumbers)

      game.allPlayerIds.splice(playerIndex, 1, aiId)

      game.players[aiId] = game.players[playerId]
      game.players[aiId].ai = true
      delete game.players[playerId]

      game.actions[aiId] = game.actions[playerId]
      delete game.actions[playerId]

      if (game.currentPlayer === playerId) {
        game.currentPlayer = aiId
      }
      if (game.results === playerId) {
        game.results = aiId
      }
    },
  },
})
