import { initialGameboard } from "../Tools.jsx";
export function updateGameboardWidth(
  e,
  gameboardWidth,
  gameboardHeight,
  entityBoard,
  groundBoard,
  projectileBoard,
  effectBoard,
  fluidBoard,
  renderUpdate
) {
  gameboardWidth.current = parseInt(e.target.value);
  entityBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  groundBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  projectileBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  effectBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  fluidBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  renderUpdate();
}
export function updateGameboardHeight(
  e,
  gameboardWidth,
  gameboardHeight,
  entityBoard,
  groundBoard,
  projectileBoard,
  effectBoard,
  fluidBoard,
  renderUpdate
) {
  gameboardHeight.current = parseInt(e.target.value);
  entityBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  groundBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  projectileBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  effectBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  fluidBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
  renderUpdate();
}
export function updateGroundHeight(e, groundLevel, renderUpdate) {
  groundLevel.current = parseInt(e.target.value);
  renderUpdate();
}
export function updateWaterLevel(e, waterLevel, renderUpdate) {
  waterLevel.current = parseInt(e.target.value);
  renderUpdate();
}
export function updateGroundRoughness(e, groundRoughness, renderUpdate) {
  groundRoughness.current = parseFloat(e.target.value);
  renderUpdate();
}
export function updateGameSpeed(e, gameSpeed, renderUpdate) {
  gameSpeed.current = parseFloat(e.target.value);
  renderUpdate();
}
export function updateRenderSpeed(e, renderSpeed, renderUpdate) {
  renderSpeed.current = parseFloat(e.target.value);
  renderUpdate();
}
export function updateTotalSpawns(e, totalSpawns, renderUpdate) {
  totalSpawns.current = parseInt(e.target.value);
  renderUpdate();
}
export function updateSpawnSpeed(e, spawnSpeed, renderUpdate) {
  spawnSpeed.current = parseFloat(e.target.value);
  renderUpdate();
}
export function updateKingHP(e, kingHP, renderUpdate, entityList) {
  kingHP.current = parseInt(e.target.value);
  entityList.king.lvls.lvl1.hp = kingHP.current + 1;
  renderUpdate();
}
export function updateGameMode(e, gameMode, renderUpdate) {
  gameMode.current = e.target.value;
  renderUpdate();
}
export function updateCellWidth(e, cellWidth, renderUpdate) {
  cellWidth.current = e.target.value;
  renderUpdate();
}
export function updateCellHeight(e, cellHeight, renderUpdate) {
  cellHeight.current = e.target.value;
  renderUpdate();
}

export function tabButton(e, setActiveTab) {
  setActiveTab(e.target.textContent + "Holder");
}
