import { cards } from "../constants/cards"
import { IGameState } from "../logic/logic"
import {
  IBoard,
  IBoardTile,
  ISolution,
  ISolutions,
  ITileKey,
} from "../types/game"
import {
  addActionTile,
  addSelectedTile,
  discardHandTile,
  drawAndPass,
  selectHandTile,
} from "./actions"
import { getRandomInt, isCellAvailable } from "./utils"

interface IPosition {
  x: number
  y: number
}

export function getNeighbors(
  board: IBoard,
  position: IBoardTile
): IBoardTile[] {
  const { x, y } = position
  const cell = board[x][y]
  const cellNorth = board[x - 1]?.[y]
  const cellSouth = board[x + 1]?.[y]
  const cellWest = board[x]?.[y - 1]
  const cellEst = board[x]?.[y + 1]
  const neighbors = []
  const hasPath =
    cell.path || cell.tile === "tileLure" || cell.tile === "tileGoal"
  if (
    (cell.tile === null || (cards[cell.tile].north && hasPath)) &&
    cellNorth
  ) {
    neighbors.push(cellNorth)
  }
  if (
    (cell.tile === null || (cards[cell.tile].south && hasPath)) &&
    cellSouth
  ) {
    neighbors.push(cellSouth)
  }
  if ((cell.tile === null || (cards[cell.tile].west && hasPath)) && cellWest) {
    neighbors.push(cellWest)
  }
  if ((cell.tile === null || (cards[cell.tile].est && hasPath)) && cellEst) {
    neighbors.push(cellEst)
  }
  return neighbors
}

export function getKey(startPos: IBoardTile, endPos: IPosition): string {
  return `${startPos.x}-${startPos.y}-${endPos.x}-${endPos.y}`
}

export function createAstarSimple(board: IBoard) {
  const memo = new Map()

  return function astarSimple(
    startPos: IBoardTile,
    endPos: IPosition
  ): IBoardTile[] {
    if (memo.has(getKey(startPos, endPos))) {
      return memo.get(getKey(startPos, endPos))
    }

    const openSet: IBoardTile[] = [startPos]
    const cameFrom: Map<IBoardTile, IBoardTile> = new Map()

    while (openSet.length > 0) {
      let current = openSet.shift()

      if (current === endPos) {
        const path = []
        while (current && current !== startPos) {
          path.push(current)
          current = cameFrom.get(current)
        }
        const solution = path.reverse()
        memo.set(getKey(startPos, endPos), solution)
        path.forEach((pos, i) => {
          if (i !== path.length - 1) {
            memo.set(getKey(pos, endPos), solution.slice(i + 1))
          }
        })
        return solution
      }

      if (current) {
        for (const neighbor of getNeighbors(board, current)) {
          if (!cameFrom.has(neighbor)) {
            openSet.push(neighbor)
            cameFrom.set(neighbor, current)
          }
        }
      }
    }

    memo.set(getKey(startPos, endPos), [])
    return []
  }
}

export function getTestBoard(
  board: IBoard,
  { x, y }: IBoardTile,
  tileKey: ITileKey
) {
  return board.map((row) =>
    row.map((tile) =>
      tile.x === x && tile.y === y
        ? tileKey === "blockBomb"
          ? { tile: null, x: tile.x, y: tile.y }
          : { ...tile, tile: tileKey, path: !cards[tileKey].closed }
        : tile
    )
  )
}

const excludedCards = ["map", "pickaxe", "brokenPickaxe"]
export function getSolutions(
  game: IGameState,
  flatBoard: IBoardTile[]
): ISolutions {
  const astarSimple = createAstarSimple(game.board)
  const startTile = flatBoard.find(
    ({ tile }) => tile === "tileStart"
  ) as IBoardTile
  let good: ISolution = { diff: 0, score: Infinity }
  let bad: ISolution = { diff: 0, score: Infinity }

  game.players[game.currentPlayer].hand
    .filter((handTile) => !excludedCards.includes(handTile))
    .forEach((handTile, index) => {
      const tileGoal = game.actions[game.currentPlayer].find(
        ({ action, x, y }) =>
          action === "map" &&
          x !== undefined &&
          y !== undefined &&
          game.board[x][y].tile === "tileGoal"
      )
      flatBoard
        .filter((tile) =>
          isCellAvailable(
            game.board,
            tile.x,
            tile.y,
            game.actions[game.currentPlayer],
            handTile
          )
        )
        .forEach((availableTile) => {
          const newBoard = getTestBoard(game.board, availableTile, handTile)
          const newAstarSimple = createAstarSimple(newBoard)
          let diff = 0
          let score = 0
          if (handTile === "blockBomb" || handTile === "tileBlock") {
            flatBoard
              .filter(
                (tile) => tile.tile === "tileGoal" || tile.tile === "tileLure"
              )
              .filter(
                (tile) =>
                  !tileGoal || (tile.x === tileGoal.x && tile.y === tileGoal.y)
              )
              .forEach((endTile) => {
                const path = astarSimple(startTile, endTile)
                const newPath = newAstarSimple(startTile, endTile)
                diff += path.length - newPath.length
                score += path.length
                if (newPath.length === 0) {
                  diff = -Infinity
                }
              })
            if (diff > 0 && diff > good.diff) {
              good = { diff, score, index, handTile, tile: availableTile }
            }
            if (diff < 0 && diff < bad.diff) {
              bad = { diff, score, index, handTile, tile: availableTile }
            }
          } else {
            flatBoard
              .filter(
                (tile) => tile.tile === "tileGoal" || tile.tile === "tileLure"
              )
              .filter(
                (tile) =>
                  !tileGoal || (tile.x === tileGoal.x && tile.y === tileGoal.y)
              )
              .forEach((endTile) => {
                const path = astarSimple(availableTile, endTile)
                const newPath = newAstarSimple(availableTile, endTile)
                diff += path.length - newPath.length
                score += path.length
                if (newPath.length === 0) {
                  diff = -Infinity
                }
              })
            if (diff === 0 && good.diff === 0 && score < good.score) {
              good = { diff, score, index, handTile, tile: availableTile }
            }
            if (
              diff < 0 &&
              (diff < bad.diff || (diff === bad.diff && score < bad.score))
            ) {
              bad = { diff, score, index, handTile, tile: availableTile }
            }
          }
        })
    })
  return { bad, good }
}

export function getSpySolution(
  game: IGameState,
  flatBoard: IBoardTile[]
): IBoardTile | null {
  const spiedTiles = game.actions[game.currentPlayer].filter(
    ({ action }) => action === "map"
  )
  const availableTiles = flatBoard
    .filter((tile) => tile.tile === "tileGoal" || tile.tile === "tileLure")
    .filter(
      (tile) =>
        !spiedTiles.some(
          (spiedTile) => spiedTile.x === tile.x && spiedTile.y === tile.y
        )
    )
  if (availableTiles.length === 0) {
    return null
  }
  const index = getRandomInt(0, availableTiles.length - 1)
  return availableTiles[index]
}

export function processTraitor(game: IGameState): void {
  const flatBoard = game.board.flat()
  const { bad, good } = getSolutions(game, flatBoard)
  const brokenIndex = game.players[game.currentPlayer].hand.findIndex(
    (card) => card === "brokenPickaxe"
  )
  const players = Object.entries(game.players).filter(
    ([id, player]) =>
      !player.traitor &&
      !game.actions[id].some(({ action }) => action !== "brokenPickaxe")
  )
  const repairIndex = game.players[game.currentPlayer].hand.findIndex(
    (card) => card === "pickaxe"
  )
  const mapIndex = game.players[game.currentPlayer].hand.findIndex(
    (card) => card === "map"
  )
  const spySolution = getSpySolution(game, flatBoard)

  if (
    game.actions[game.currentPlayer].find(
      ({ action }) => action === "brokenPickaxe"
    ) &&
    repairIndex !== -1
  ) {
    // Repair
    selectHandTile(
      { index: repairIndex, tile: "pickaxe" },
      game,
      game.currentPlayer
    )
    addActionTile({ playerId: game.currentPlayer }, game, game.currentPlayer)
  } else if (bad.handTile && bad.tile && bad.index !== undefined) {
    // Place tile
    selectHandTile(
      { index: bad.index, tile: bad.handTile },
      game,
      game.currentPlayer
    )
    addSelectedTile({ col: bad.tile.y, row: bad.tile.x }, game)
  } else if (brokenIndex !== -1 && players.length > 0) {
    // Broken pickaxe
    selectHandTile(
      { index: brokenIndex, tile: "brokenPickaxe" },
      game,
      game.currentPlayer
    )
    const playerIndex = getRandomInt(0, players.length - 1)
    addActionTile(
      { playerId: players[playerIndex][0] },
      game,
      game.currentPlayer
    )
  } else if (mapIndex !== -1 && spySolution) {
    // Spy
    selectHandTile({ index: mapIndex, tile: "map" }, game, game.currentPlayer)
    addActionTile(
      { col: spySolution.y, row: spySolution.x },
      game,
      game.currentPlayer
    )
  } else if (good.handTile && good.tile && good.index !== undefined) {
    // Discard tile
    selectHandTile(
      { index: good.index, tile: good.handTile },
      game,
      game.currentPlayer
    )
    discardHandTile(
      { index: good.index, tile: good.handTile },
      game,
      game.currentPlayer
    )
  } else {
    // Discard random card
    const index = getRandomInt(
      0,
      game.players[game.currentPlayer].hand.length - 1
    )
    selectHandTile(
      { index: index, tile: game.players[game.currentPlayer].hand[index] },
      game,
      game.currentPlayer
    )
    discardHandTile(
      { index: index, tile: game.players[game.currentPlayer].hand[index] },
      game,
      game.currentPlayer
    )
  }
  drawAndPass(game)
  if (
    game.canPlay &&
    game.addons.includes("x2") &&
    game.playerAction === 1 &&
    game.players[game.currentPlayer].hand.length !== 0
  ) {
    processTraitor(game)
  }
}

export function processMiner(game: IGameState): void {
  const flatBoard = game.board.flat()
  const { bad, good } = getSolutions(game, flatBoard)
  const repairIndex = game.players[game.currentPlayer].hand.findIndex(
    (card) => card === "pickaxe"
  )
  const mapIndex = game.players[game.currentPlayer].hand.findIndex(
    (card) => card === "map"
  )
  const spySolution = getSpySolution(game, flatBoard)

  if (
    game.actions[game.currentPlayer].find(
      ({ action }) => action === "brokenPickaxe"
    ) &&
    repairIndex !== -1
  ) {
    // Repair
    selectHandTile(
      { index: repairIndex, tile: "pickaxe" },
      game,
      game.currentPlayer
    )
    addActionTile({ playerId: game.currentPlayer }, game, game.currentPlayer)
  } else if (good.handTile && good.tile && good.index !== undefined) {
    // Place tile
    selectHandTile(
      { index: good.index, tile: good.handTile },
      game,
      game.currentPlayer
    )
    if (good.handTile === "blockBomb") {
      addActionTile(
        { col: good.tile.y, row: good.tile.x },
        game,
        game.currentPlayer
      )
    } else {
      addSelectedTile({ col: good.tile.y, row: good.tile.x }, game)
    }
  } else if (mapIndex !== -1 && spySolution) {
    // Spy
    selectHandTile({ index: mapIndex, tile: "map" }, game, game.currentPlayer)
    addActionTile(
      { col: spySolution.y, row: spySolution.x },
      game,
      game.currentPlayer
    )
  } else if (bad.handTile && bad.tile && bad.index !== undefined) {
    // Discard tile
    selectHandTile(
      { index: bad.index, tile: bad.handTile },
      game,
      game.currentPlayer
    )
    discardHandTile(
      { index: bad.index, tile: bad.handTile },
      game,
      game.currentPlayer
    )
  } else {
    // Discard random card
    const index = getRandomInt(
      0,
      game.players[game.currentPlayer].hand.length - 1
    )
    selectHandTile(
      { index: index, tile: game.players[game.currentPlayer].hand[index] },
      game,
      game.currentPlayer
    )
    discardHandTile(
      { index: index, tile: game.players[game.currentPlayer].hand[index] },
      game,
      game.currentPlayer
    )
  }
  drawAndPass(game)
  if (
    game.canPlay &&
    game.addons.includes("x2") &&
    game.playerAction === 1 &&
    game.players[game.currentPlayer].hand.length !== 0
  ) {
    processMiner(game)
  }
}
