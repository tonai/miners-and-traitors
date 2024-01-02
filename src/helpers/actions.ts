import {
  cards,
  pickaxeTiles,
  spyTiles,
  tilesPile,
  wallTiles,
} from "../constants/cards";
import { ADDONS, MAX_ROUND } from "../constants/game";
import { IGameState } from "../logic/logic";
import { ITileKey } from "../types/game";
import { processMiner, processTraitor } from "./ai";
import {
  cardsLeft,
  draw,
  drawN,
  getRandomInt,
  initBoard,
  isAi,
  noPath,
  randomizeArray,
  reveal,
} from "./utils";

export function discard(game: IGameState) {
  if (game.selectedTile) {
    game.players[game.currentPlayer].hand.splice(game.selectedTile.index, 1);
    game.selectedTile = undefined;
    game.playerAction++;
    if (
      (!game.addons.includes("x2") && game.playerAction === 1) ||
      (game.addons.includes("x2") && game.playerAction >= 2)
    ) {
      game.canPlay = false;
    }
  }
}

export function addActionTile(
  params: { col?: number; playerId?: string; row?: number },
  game: IGameState,
  playerId: string
): void {
  const { col, row } = params;
  if (game.selectedTile && cards[game.selectedTile?.tile].action) {
    if (
      game.selectedTile?.tile === "map" &&
      row !== undefined &&
      col !== undefined &&
      (game.board[row][col].tile === "tileGoal" ||
        game.board[row][col].tile === "tileLure")
    ) {
      game.actions[playerId].push({
        action: game.selectedTile?.tile,
        x: row,
        y: col,
      });
    } else if (
      game.selectedTile?.tile === "blockBomb" &&
      row !== undefined &&
      col !== undefined &&
      game.board[row][col].tile === "tileBlock"
    ) {
      game.board[row][col].tile = null;
    } else if (
      game.selectedTile?.tile === "brokenPickaxe" &&
      params.playerId !== undefined
    ) {
      game.actions[params.playerId].push({
        action: game.selectedTile?.tile,
      });
    } else if (
      game.selectedTile?.tile === "pickaxe" &&
      params.playerId !== undefined
    ) {
      const index = game.actions[params.playerId].findIndex(
        ({ action }) => action === "brokenPickaxe"
      );
      game.actions[params.playerId].splice(index, 1);
    }
    discard(game);
  }
}

export function addSelectedTile(
  params: { col: number; row: number },
  game: IGameState
): void {
  const { col, row } = params;
  if (game.selectedTile && !cards[game.selectedTile?.tile].action) {
    game.board[row][col].tile = game.selectedTile?.tile;
    game.board[row][col].path = !cards[game.selectedTile?.tile].closed;
    discard(game);
  }
}

export function discardHandTile(
  params: {
    index: number;
    tile: ITileKey;
  },
  game: IGameState,
  playerId: string
): void {
  const { index, tile } = params;
  if (game.canPlay && playerId && playerId === game.currentPlayer) {
    if (
      game.selectedTile &&
      tile === game.selectedTile.tile &&
      index === game.selectedTile.index
    ) {
      discard(game);
    }
  }
}

export function nextPlayer(game: IGameState) {
  game.playerAction = 0;
  game.currentPlayerIndex++;
  if (game.currentPlayerIndex === game.allPlayerIds.length) {
    game.currentPlayerIndex = 0;
  }
  game.currentPlayer = game.allPlayerIds[game.currentPlayerIndex];
  game.canPlay = true;
}

export function drawAndPass(game: IGameState): void {
  const end = reveal(game.board);
  if (!end) {
    if (cardsLeft(game.players) === 0 || noPath(game.board)) {
      // Traitor win
      game.canPlay = false;
      game.allPlayerIds.forEach((playerId) => {
        if (game.players[playerId].traitor) {
          game.results = playerId;
          game.players[playerId].score += 4;
        }
      });
      reveal(game.board);
      if (game.round === MAX_ROUND) {
        return endGame(game);
      }
    } else {
      // Continue game
      const card = draw(game.drawPile);
      if (card) {
        game.players[game.currentPlayer].hand.push(card);
      }
      if (
        (!game.addons.includes("x2") && game.playerAction === 1) ||
        (game.addons.includes("x2") && game.playerAction >= 2) ||
        game.players[game.currentPlayer].hand.length === 0
      ) {
        nextPlayer(game);
      }
    }
  } else {
    // Miners win
    game.canPlay = false;
    if (!game.players[game.currentPlayer].traitor) {
      game.results = game.currentPlayer;
    } else {
      game.results = "miners";
    }
    game.allPlayerIds.forEach((playerId) => {
      if (!game.players[playerId].traitor) {
        if (playerId === game.currentPlayer) {
          game.players[playerId].score += getRandomInt(2, 3);
        } else {
          game.players[playerId].score += 1;
        }
      }
    });
    if (game.round === MAX_ROUND) {
      return endGame(game);
    }
  }
}

export function endGame(game: IGameState) {
  Rune.gameOver({
    players: Object.fromEntries(
      Object.entries(game.players)
        .filter(([_, player]) => !player.ai)
        .map(([id, player]) => [id, player.score])
    ),
  });
}

export function selectHandTile(
  params: {
    index: number;
    tile: ITileKey;
  },
  game: IGameState,
  playerId: string
): void {
  const { index, tile } = params;
  if (game.canPlay && playerId && playerId === game.currentPlayer) {
    game.selectedTile = { index, tile };
  }
}

export function start(game: IGameState): void {
  game.round = 1;
  game.start = true;
  game.actions = Object.fromEntries(game.allPlayerIds.map((id) => [id, []]));
  game.addons = [];
  newRound(game);
}

export function nextRound(game: IGameState): void {
  const isAddonChosen = game.addons.some(addon => game.resultsAddons.includes(addon));
  if (!isAddonChosen) {
    throw Rune.invalidAction();
  } else {
    game.round++;
    newRound(game);
  }
}

export function newRound(game: IGameState): void {
  game.playerAction = 0;
  game.results = null;
  game.canPlay = true;
  game.votes = {};

  // board
  game.board = initBoard();

  const cards = game.addons.reduce((acc, addon) => {
    if (addon === "Spy") {
      return acc.concat(spyTiles);
    }
    if (addon === "Walls") {
      return acc.concat(wallTiles);
    }
    if (addon === "Pickaxe") {
      return acc.concat(pickaxeTiles);
    }
    return acc;
  }, tilesPile);
  game.drawPile = randomizeArray(cards);
  game.allPlayerIds.forEach((playerId) => {
    game.players[playerId].hand = drawN(game.drawPile, 6);
    game.players[playerId].traitor = false;
  });

  // Result addons
  const addons = ADDONS.filter((addon) => !game.addons.includes(addon));
  game.resultsAddons = [];
  while (game.resultsAddons.length !== 2) {
    const index = getRandomInt(0, addons.length - 1);
    game.resultsAddons.push(addons[index]);
    addons.splice(index, 1);
  }

  // traitor
  const traitorIndex = getRandomInt(0, game.allPlayerIds.length - 1);
  game.players[game.allPlayerIds[traitorIndex]].traitor = true;

  // starting player (always a real)
  const players = game.allPlayerIds.filter((id) => !isAi(id));
  const randomPlayerIndex = getRandomInt(0, players.length - 1);
  game.currentPlayer = players[randomPlayerIndex];
  game.currentPlayerIndex = game.allPlayerIds.findIndex(
    (playerId) => playerId === game.currentPlayer
  );
}

export function restart(game: IGameState): void {
  game.start = false;
  game.allPlayerIds.forEach((playerId) => {
    game.players[playerId].score = 0;
    game.players[playerId].hand = [];
  });
}

export function voteAddon(
  params: { addon: string },
  game: IGameState,
  playerId: string
) {
  const { addon } = params;
  game.votes[playerId] = addon;

  const nonAiPlayers = Object.entries(game.players).filter(
    ([_, player]) => !player.ai
  );
  const votes = Object.values(game.votes);
  if (votes.length === nonAiPlayers.length) {
    const groupedVotes = votes.reduce<Record<string, number>>((acc, vote) => {
      acc[vote] = (acc[vote] ?? 0) + 1;
      return acc;
    }, {});
    const max = Math.max(...Object.values(groupedVotes));
    const maxVotes = Object.entries(groupedVotes).filter(
      ([_, number]) => number === max
    );
    const index = getRandomInt(0, maxVotes.length - 1);
    game.addons.push(maxVotes[index][0]);
  }
}

export function lockAi(game: IGameState, playerId: string) {
  if (isAi(game.currentPlayer) && !game.results) {
    game.processingAi = playerId;
  }
}

export function processAi(game: IGameState, playerId: string): void {
  if (isAi(game.currentPlayer) && game.processingAi === playerId && !game.results) {
    if (game.players[game.currentPlayer].traitor) {
      processTraitor(game);
    } else {
      processMiner(game);
    }
    game.processingAi = false;
  }
}
