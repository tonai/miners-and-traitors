import { ICard, ITileKey } from "../types/game";

import paving_02_tile_256_01 from "../assets/cards/paving_02_tile_256_01.png";
import paving_02_tile_256_11 from "../assets/cards/paving_02_tile_256_11.png";
import paving_02_tile_road_256_01 from "../assets/cards/paving_02_tile_road_256_01.png";
import paving_02_tile_road_256_02 from "../assets/cards/paving_02_tile_road_256_02.png";
import paving_02_tile_road_256_03 from "../assets/cards/paving_02_tile_road_256_03.png";
import paving_02_tile_road_256_04 from "../assets/cards/paving_02_tile_road_256_04.png";
import paving_02_tile_road_256_05 from "../assets/cards/paving_02_tile_road_256_05.png";
import paving_02_tile_road_256_07 from "../assets/cards/paving_02_tile_road_256_07.png";
import paving_02_tile_road_256_09 from "../assets/cards/paving_02_tile_road_256_09.png";
import paving_02_tile_road_256_10 from "../assets/cards/paving_02_tile_road_256_10.png";
import paving_02_tile_road_256_11 from "../assets/cards/paving_02_tile_road_256_11.png";
import paving_02_tile_road_256_12 from "../assets/cards/paving_02_tile_road_256_12.png";
import paving_02_tile_road_256_13 from "../assets/cards/paving_02_tile_road_256_13.png";
import paving_02_tile_road_256_14 from "../assets/cards/paving_02_tile_road_256_14.png";
import paving_02_tile_road_256_15 from "../assets/cards/paving_02_tile_road_256_15.png";
import paving_02_tile_road_256_16 from "../assets/cards/paving_02_tile_road_256_16.png";
import paving_02_tile_road_256_17 from "../assets/cards/paving_02_tile_road_256_17.png";
import paving_02_tile_road_256_18 from "../assets/cards/paving_02_tile_road_256_18.png";
import paving_02_tile_road_256_19 from "../assets/cards/paving_02_tile_road_256_19.png";
import paving_02_tile_road_256_20 from "../assets/cards/paving_02_tile_road_256_20.png";
import paving_02_tile_road_256_21 from "../assets/cards/paving_02_tile_road_256_21.png";
import paving_02_tile_road_256_22 from "../assets/cards/paving_02_tile_road_256_22.png";
import paving_02_tile_road_256_23 from "../assets/cards/paving_02_tile_road_256_23.png";
import paving_02_tile_road_256_24 from "../assets/cards/paving_02_tile_road_256_24.png";
import paving_02_tile_road_256_25 from "../assets/cards/paving_02_tile_road_256_25.png";
import paving_02_tile_road_256_26 from "../assets/cards/paving_02_tile_road_256_26.png";
import paving_02_tile_road_256_27 from "../assets/cards/paving_02_tile_road_256_27.png";
import paving_02_tile_road_256_28 from "../assets/cards/paving_02_tile_road_256_28.png";
import mapAsset from "../assets/cards/map.png";
import pickaxeAsset from "../assets/cards/pickaxe.png";
import broken_pickaxe from "../assets/cards/broken_pickaxe.png";
import cardAsset from "../assets/cards/card.png";
import bomb from "../assets/cards/bomb.png";
import stone_object_07 from "../assets/stone_object_07.png";
import stone_object_08 from "../assets/stone_object_08.png";
import robotAsset from "../assets/robot.png";

export const tileBlock = paving_02_tile_256_01;
export const tileDefault = paving_02_tile_256_11;
export const tileSEW = paving_02_tile_road_256_01;
export const tileNSW = paving_02_tile_road_256_02;
export const tileNSE = paving_02_tile_road_256_03;
export const tileNEW = paving_02_tile_road_256_04;
export const tileNS = paving_02_tile_road_256_05;
export const tileEW = paving_02_tile_road_256_07;
export const tileNSEW = paving_02_tile_road_256_09;
export const tileSE = paving_02_tile_road_256_10;
export const tileSW = paving_02_tile_road_256_11;
export const tileNE = paving_02_tile_road_256_12;
export const tileNW = paving_02_tile_road_256_13;
export const tileW = paving_02_tile_road_256_14;
export const tileN = paving_02_tile_road_256_15;
export const tileE = paving_02_tile_road_256_16;
export const tileS = paving_02_tile_road_256_17;
export const tileWN = paving_02_tile_road_256_18;
export const tileWE = paving_02_tile_road_256_19;
export const tileWS = paving_02_tile_road_256_20;
export const tileEN = paving_02_tile_road_256_21;
export const tileSN = paving_02_tile_road_256_22;
export const tileES = paving_02_tile_road_256_23;
export const tileStart = paving_02_tile_road_256_24;
export const tileWEN = paving_02_tile_road_256_25;
export const tileESN = paving_02_tile_road_256_26;
export const tileWSN = paving_02_tile_road_256_27;
export const tileWES = paving_02_tile_road_256_28;
export const stone = stone_object_07;
export const gold = stone_object_08;
export const map = mapAsset;
export const robot = robotAsset;
export const blockBomb = bomb;
export const pickaxe = pickaxeAsset;
export const brokenPickaxe = broken_pickaxe;
export const card = cardAsset;

export const tiles: Record<string, string> = {
  tileBlock,
  tileNSEW,
  tileSEW,
  tileNSW,
  tileNSE,
  tileNEW,
  tileNS,
  tileEW,
  tileSE,
  tileSW,
  tileNE,
  tileNW,
  tileW,
  tileN,
  tileE,
  tileS,
  tileWN,
  tileWE,
  tileWS,
  tileEN,
  tileSN,
  tileES,
  tileStart,
  tileGoal: tileNSEW,
  tileLure: tileNSEW,
  map,
  blockBomb,
  pickaxe,
  brokenPickaxe,
  tileWEN,
  tileESN,
  tileWSN,
  tileWES,
};

export const addonsImage: Record<string, string> = {
  Spy: map,
  x2: card,
  Walls: tileBlock,
  Pickaxe: pickaxe
};
