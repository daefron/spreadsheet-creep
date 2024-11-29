import { entitySpawner, spawnChecker } from "./EngineTools.jsx";
export function kingTurn(gameState, nextTurn) {
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let activeEntities = gameState.active.activeEntities;
  let totalSpawns = gameState.settings.totalSpawns;
  let gameStatus = gameState.render.gameStatus;
  let timer = gameState.engine.timer;
  gameStatus.current = "King round in progress";
  if (!friendlySpawnCount.current) {
    entitySpawner(["king", 1], false, gameState);
    friendlySpawnCount.current++;
  }
  spawnChecker(true, gameState);
  nextTurn();

  if (!kingVictory()) {
    clearInterval(timer.current);
  }

  function kingVictory() {
    let kingAlive = activeEntities.current.find(
      (entity) => entity.type === "king"
    );
    if (!kingAlive && totalSpawns.current) {
      gameStatus.current = "King dead, you lose";
      return false;
    }
    let enemiesAlive = activeEntities.current.filter((entity) => entity.enemy);
    if (
      enemySpawnCount.current >= totalSpawns.current &&
      !enemiesAlive.length
    ) {
      gameStatus.current = "All enemies dead";
      return false;
    }
    return true;
  }
}

export function battleTurn(gameState, nextTurn) {
  let gameStatus = gameState.render.gameStatus;
  let activeEntities = gameState.active.activeEntities;
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let totalSpawns = gameState.settings.totalSpawns;
  let timer = gameState.engine.timer;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  gameStatus.current = "Battle round in progress";
  spawnChecker(true, gameState);
  spawnChecker(false, gameState);
  nextTurn();
  if (!battleVictory()) {
    clearInterval(timer.current);
  }
  function battleVictory() {
    let enemiesAlive = activeEntities.current.filter((entity) => entity.enemy);
    if (
      enemySpawnCount.current >= totalSpawns.current &&
      !enemiesAlive.length
    ) {
      gameStatus.current = "All enemies dead";
      return false;
    }
    let friendliesAlive = activeEntities.current.filter(
      (entity) => !entity.enemy
    );
    if (
      friendlySpawnCount.current >= totalSpawns.current &&
      !friendliesAlive.length
    ) {
      gameStatus.current = "All friendlies dead";
      return false;
    }
    return true;
  }
}

export function blobTurn(gameState, nextTurn) {
  let gameStatus = gameState.render.gameStatus;
  let activeEntities = gameState.active.activeEntities;
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let blobAtEnd = gameState.engine.blobAtEnd;
  let timer = gameState.engine.timer;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  gameStatus.current = "Blob round in progress";
  if (lastEnemySpawnTime.current < 201) {
    lastEnemySpawnTime.current++;
  }
  if (lastEnemySpawnTime.current === 200) {
    let firstBlob = entitySpawner(["blob", 1], true, gameState);
    firstBlob.hp = firstBlob.maxHp;
    enemySpawnCount.current++;
  }
  nextTurn();
  if (!blobVictory()) {
    clearInterval(timer.current);
  }
  function blobVictory() {
    if (blobAtEnd.current) {
      gameStatus.current = "Blob at end. You lose";
      return false;
    }
    let enemiesAlive = activeEntities.current.filter((entity) => entity.enemy);
    if (!enemiesAlive.length && enemySpawnCount.current) {
      gameStatus.current = "Enemy blob dead";
      return false;
    }
    return true;
  }
}

export function blobFightTurn(gameState, nextTurn) {
  let gameStatus = gameState.render.gameStatus;
  let activeEntities = gameState.active.activeEntities;
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let timer = gameState.engine.timer;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  let gameSpeed = gameState.settings.gameSpeed;
  gameStatus.current = "Blob fight in progress";
  if (!activeEntities.current.length) {
    lastEnemySpawnTime.current++;
  }
  if (
    lastEnemySpawnTime.current === 200 / gameSpeed.current &&
    !activeEntities.current.length
  ) {
    let firstBlob = entitySpawner(["blob", 1], true, gameState);
    firstBlob.hp = firstBlob.maxHp;
    let secondBlob = entitySpawner(["blob", 1], false, gameState);
    secondBlob.hp = secondBlob.maxHp;
  }
  nextTurn();
  if (!blobFightVictory()) {
    clearInterval(timer.current);
  }
  function blobFightVictory() {
    let enemiesAlive = activeEntities.current.filter((entity) => entity.enemy);
    let friendliesAlive = activeEntities.current.filter(
      (entity) => !entity.enemy
    );
    if (
      !enemiesAlive.length &&
      friendliesAlive.length &&
      enemySpawnCount.current
    ) {
      gameStatus.current = "Enemy blob dead";
      return false;
    }
    if (
      !friendliesAlive.length &&
      enemiesAlive.length &&
      friendlySpawnCount.current
    ) {
      gameStatus.current = "Friendly blob dead";
      return false;
    }
    return true;
  }
}

export function blobGobTurn(gameState, nextTurn) {
  let gameStatus = gameState.render.gameStatus;
  let activeEntities = gameState.active.activeEntities;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let gameSpeed = gameState.settings.gameSpeed;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  let totalSpawns = gameState.settings.totalSpawns;
  let timer = gameState.engine.timer;
  let blobAtEnd = gameState.engine.blobAtEnd;
  gameStatus.current = "Blob vs enemies round in progress";
  lastEnemySpawnTime.current++;
  if (lastEnemySpawnTime.current === 100 / gameSpeed.current) {
    let firstBlob = entitySpawner(["blob", 1], true, gameState);
    firstBlob.hp = firstBlob.maxHp * 5;
  }
  spawnChecker(false, gameState);
  nextTurn();
  if (!blobGobVictory()) {
    clearInterval(timer.current);
  }
  function blobGobVictory() {
    let friendliesAlive = activeEntities.current.filter(
      (entity) => !entity.enemy
    );
    if (
      (friendlySpawnCount.current === totalSpawns.current &&
        !friendliesAlive.length) ||
      blobAtEnd.current
    ) {
      gameStatus.current = "Friendlies lose";
      return false;
    }
    let enemiesAlive = activeEntities.current.filter((entity) => entity.enemy);
    if (!enemiesAlive.length && friendlySpawnCount.current > 1) {
      gameStatus.current = "Enemies lose";
      return false;
    }
    return true;
  }
}

export function sandboxTurn(nextTurn) {
  gameStatus.current = "Sandbox in progress";
  nextTurn();
}
