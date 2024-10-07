import { cards } from "../constants/cards"
import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/game"
import { IAction, IBoard, IBoardTile, IPlayers, ITileKey } from "../types/game"
import { createAstarSimple } from "./ai"

export function getArray(size: number): number[] {
  return new Array(size).fill(null).map((_, i) => i)
}

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function getRandomTile(): ITileKey {
  const keys = Object.keys(cards)
  const index = getRandomInt(0, keys.length - 1)
  return keys[index] as ITileKey
}

export function randomizeArray<T>(array: T[]): T[] {
  const clone = [...array]
  let currentIndex = clone.length
  let randomIndex

  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    ;[clone[currentIndex], clone[randomIndex]] = [
      clone[randomIndex],
      clone[currentIndex],
    ]
  }

  return clone
}

export function draw(drawPile: ITileKey[]): ITileKey | undefined {
  return drawPile.pop()
}

export function drawN(drawPile: ITileKey[], n = 1): ITileKey[] {
  const cards: ITileKey[] = []
  for (let i = 1; i <= n; i++) {
    const card = draw(drawPile)
    if (card) {
      cards.push(card)
    }
  }
  return cards
}

export function isBoardTileAvailable(
  board: IBoard,
  row: number,
  col: number,
  actions: IAction[],
  tile: ITileKey
): boolean {
  if (
    board[row][col].tile !== null ||
    actions.find(({ action }) => action === "brokenPickaxe")
  ) {
    return false
  }

  let connectedPaths = 0
  const cellNorth = board[row - 1]?.[col]
  const cellSouth = board[row + 1]?.[col]
  const cellWest = board[row]?.[col - 1]
  const cellEst = board[row]?.[col + 1]

  if (tile === "tileBlock") {
    return (
      (!cellNorth ||
        cellNorth.tile === null ||
        cards[cellNorth.tile].south === false) &&
      (!cellSouth ||
        cellSouth.tile === null ||
        cards[cellSouth.tile].north === false) &&
      (!cellWest ||
        cellWest.tile === null ||
        cards[cellWest.tile].est === false) &&
      (!cellEst || cellEst.tile === null || cards[cellEst.tile].west === false)
    )
  }

  if (cards[tile].north) {
    if (cellNorth && cellNorth.tile !== null) {
      if (!cellNorth.tile || cards[cellNorth.tile].south === false) {
        return false
      }
      if (cellNorth.path) {
        connectedPaths++
      }
    }
  } else {
    if (cellNorth?.tile && cards[cellNorth.tile].south === true) {
      return false
    }
  }

  if (cards[tile].south) {
    if (cellSouth && cellSouth.tile !== null) {
      if (!cellSouth.tile || cards[cellSouth.tile].north === false) {
        return false
      }
      if (cellSouth.path) {
        connectedPaths++
      }
    }
  } else {
    if (cellSouth?.tile && cards[cellSouth.tile].north === true) {
      return false
    }
  }

  if (cards[tile].est) {
    if (cellEst && cellEst.tile !== null) {
      if (!cellEst.tile || cards[cellEst.tile].west === false) {
        return false
      }
      if (cellEst.path) {
        connectedPaths++
      }
    }
  } else {
    if (cellEst?.tile && cards[cellEst.tile].west === true) {
      return false
    }
  }

  if (cards[tile].west) {
    if (cellWest && cellWest.tile !== null) {
      if (!cellWest.tile || cards[cellWest.tile].est === false) {
        return false
      }
      if (cellWest.path) {
        connectedPaths++
      }
    }
  } else {
    if (cellWest?.tile && cards[cellWest.tile].est === true) {
      return false
    }
  }

  return connectedPaths > 0
}

export function isActionTileAvailable(
  board: IBoard,
  row: number,
  col: number,
  actions: IAction[],
  tile: ITileKey
): boolean {
  if (tile === "map") {
    return (
      (board[row][col].tile === "tileGoal" ||
        board[row][col].tile === "tileLure") &&
      !actions.find(
        ({ action, x, y }) => action === "map" && x === row && y === col
      )
    )
  } else if (tile === "blockBomb") {
    return board[row][col].tile === "tileBlock"
  }
  return false
}

export function isCellAvailable(
  board: IBoard,
  row: number,
  col: number,
  actions: IAction[],
  tile?: ITileKey
): boolean {
  if (!tile) {
    return false
  }
  if (cards[tile].action) {
    return isActionTileAvailable(board, row, col, actions, tile)
  }
  return isBoardTileAvailable(board, row, col, actions, tile)
}

const columns = getArray(BOARD_WIDTH)
const rows = getArray(BOARD_HEIGHT)

export function initBoard(): IBoard {
  const board: IBoard = rows.map((x) =>
    columns.map((y) => ({ tile: null, x, y }))
  )
  const y = Math.floor(BOARD_WIDTH / 2)
  board[1][y] = { tile: "tileStart", path: true, x: 1, y }
  addGoal(board, "tileGoal")
  addGoal(board, "tileLure")
  addGoal(board, "tileLure")
  addBlock(board, "tileBlock")
  addBlock(board, "tileBlock")
  addBlock(board, "tileBlock")
  return board
}

export function addAtRandomPosition(
  board: IBoard,
  rowMin = 2
): { row: number; col: number } {
  let row, col
  do {
    row = getRandomInt(rowMin, rows.length - 1) - 1
    col = getRandomInt(2, columns.length - 1) - 1
  } while (
    board[row][col].tile !== null ||
    board[row + 1][col].tile !== null ||
    board[row - 1][col].tile !== null ||
    board[row][col + 1].tile !== null ||
    board[row][col - 1].tile !== null
  )
  return { row, col }
}

export function addGoal(board: IBoard, tile: ITileKey) {
  const { row, col } = addAtRandomPosition(board, rows.length - 2)
  board[row][col] = { tile, revealed: false, x: row, y: col }
}

export function addBlock(board: IBoard, tile: ITileKey) {
  const { row, col } = addAtRandomPosition(board)
  board[row][col] = { tile, x: row, y: col }
}

export function reveal(board: IBoard, force = false): boolean {
  return board.some((row, i) => {
    return row.some((tile, j) => {
      if (tile.revealed === false) {
        if (
          (board[i - 1][j] && board[i - 1][j].path) ||
          (board[i + 1][j] && board[i + 1][j].path) ||
          (board[i][j - 1] && board[i][j - 1].path) ||
          (board[i][j + 1] && board[i][j + 1].path) ||
          force
        ) {
          tile.path = true
          tile.revealed = true
          return tile.tile === "tileGoal"
        }
      }
      return false
    })
  })
}

export function cardsLeft(players: IPlayers): number {
  return Object.values(players).reduce((acc, player) => {
    return acc + player.hand.length
  }, 0)
}

export function isAi(id: string): boolean {
  return id.indexOf("AI ") === 0
}

export function noPath(board: IBoard): boolean {
  const flaBoard = board.flat()
  const start = flaBoard.find((tile) => tile.tile === "tileStart") as IBoardTile
  const astarSimple = createAstarSimple(board)
  const end = flaBoard.find((tile) => tile.tile === "tileGoal") as IBoardTile
  const path = astarSimple(start, end)
  return path.length === 0
}
