import {
  entitySpawner,
  spawnChecker,
  terrainMaker,
  ghoster,
} from "./EngineTools.jsx";
export function engine(gameState) {
  let activeEntities = gameState.active.activeEntities;
  let activeProjectiles = gameState.active.activeProjectiles;
  let activeGround = gameState.active.activeGround;
  let activeFluid = gameState.active.activeFluid;
  let activeEffects = gameState.active.activeEffects;
  let enemySpawnCount = gameState.engine.enemySpawnCount;
  let friendlySpawnCount = gameState.engine.friendlySpawnCount;
  let lastEnemySpawnTime = gameState.engine.lastEnemySpawnTime;
  let timer = gameState.engine.timer;
  let gameSpeed = gameState.settings.gameSpeed;
  let totalSpawns = gameState.settings.totalSpawns;
  let gameMode = gameState.settings.gameMode;
  let gameStatus = gameState.render.gameStatus;
  let newRound = gameState.engine.newRound;
  let blobAtEnd = gameState.engine.blobAtEnd;
  let gameStatePacked = gameState;

  if (newRound.current) {
    ghoster(gameStatePacked);
    terrainMaker(gameStatePacked);
    newRound.current = false;
  }
  gamemode();

  function gamemode() {
    if (gameMode.current === "king") {
      gameStatus.current = "King round in progress";
      return kingTurn();
    }
    if (gameMode.current === "battle") {
      gameStatus.current = "Battle round in progress";
      return battleTurn();
    }
    if (gameMode.current === "blob") {
      gameStatus.current = "Blob round in progress";
      return blobTurn();
    }
    if (gameMode.current === "blob fight") {
      gameStatus.current = "Blob fight in progress";
      return blobFightTurn();
    }
    if (gameMode.current === "blob gob") {
      gameStatus.current = "Blob vs enemies round in progress";
      return blobGobTurn();
    }
    if (gameMode.current === "sandbox") {
      gameStatus.current = "Sandbox in progress";
      return sandboxTurn();
    }

    function kingTurn() {
      if (!friendlySpawnCount.current) {
        entitySpawner(["king", 1], false, gameStatePacked);
        friendlySpawnCount.current++;
      }
      spawnChecker(true, gameStatePacked);
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function battleTurn() {
      spawnChecker(true, gameStatePacked);
      spawnChecker(false, gameStatePacked);
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobTurn() {
      if (lastEnemySpawnTime.current < 201) {
        lastEnemySpawnTime.current++;
      }
      if (lastEnemySpawnTime.current === 200) {
        let firstBlob = entitySpawner(["blob", 1], true, gameStatePacked);
        firstBlob.hp = firstBlob.maxHp;
        enemySpawnCount.current++;
      }
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobFightTurn() {
      if (!activeEntities.current.length) {
        lastEnemySpawnTime.current++;
      }
      if (
        lastEnemySpawnTime.current === 200 / gameSpeed.current &&
        !activeEntities.current.length
      ) {
        let firstBlob = entitySpawner(["blob", 1], true, gameStatePacked);
        firstBlob.hp = firstBlob.maxHp;
        let secondBlob = entitySpawner(["blob", 1], false, gameStatePacked);
        secondBlob.hp = secondBlob.maxHp;
      }
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function blobGobTurn() {
      lastEnemySpawnTime.current++;
      if (lastEnemySpawnTime.current === 100 / gameSpeed.current) {
        let firstBlob = entitySpawner(["blob", 1], true, gameStatePacked);
        firstBlob.hp = firstBlob.maxHp * 5;
      }
      spawnChecker(false, gameStatePacked);
      nextTurn();
      if (!victoryChecker()) {
        clearInterval(timer.current);
      }
    }

    function sandboxTurn() {
      nextTurn();
    }

    function nextTurn() {
      for (const entity of activeEntities.current) {
        entity.turn;
      }
      for (const projectile of activeProjectiles.current) {
        projectile.turn;
      }
      for (const ground of activeGround.current) {
        ground.turn;
      }
      for (const fluid of activeFluid.current) {
        fluid.turn;
      }
      for (const effect of activeEffects.current) {
        effect.turn;
      }
    }

    function victoryChecker() {
      if (gameMode.current === "king") {
        let kingAlive = activeEntities.current.find(
          (entity) => entity.type === "king"
        );
        if (!kingAlive && totalSpawns.current) {
          gameStatus.current = "King dead, you lose";
          return false;
        }
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (
          enemySpawnCount.current >= totalSpawns.current &&
          !enemiesAlive.length
        ) {
          gameStatus.current = "All enemies dead";
          return false;
        }
        return true;
      }
      if (gameMode.current === "battle") {
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
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
      if (gameMode.current === "blob") {
        if (blobAtEnd.current) {
          gameStatus.current = "Blob at end. You lose";
          return false;
        }
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (!enemiesAlive.length && enemySpawnCount.current) {
          gameStatus.current = "Enemy blob dead";
          return false;
        }
        return true;
      }
      if (gameMode.current === "blob fight") {
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
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
      if (gameMode.current === "blob gob") {
        let friendliesAlive = activeEntities.current.filter(
          (entity) => !entity.enemy
        );
        if (
          (friendlySpawnCount.current === totalSpawns.current &&
            !friendliesAlive.length) ||
          blobAtEnd
        ) {
          gameStatus.current = "Friendlies lose";
          return false;
        }
        let enemiesAlive = activeEntities.current.filter(
          (entity) => entity.enemy
        );
        if (!enemiesAlive.length && friendlySpawnCount.current > 1) {
          gameStatus.current = "Enemies lose";
          return false;
        }
        return true;
      }
    }
  }
}
