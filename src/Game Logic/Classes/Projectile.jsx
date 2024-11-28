import { onBoard, toBoard, moveBoard, direction } from "../Tools.jsx";
import ProjectileList from "../Lists/ProjectileList.jsx";
import EffectList from "../Lists/EffectList.jsx";
class Projectile {
  constructor(parent, name, type, gameState) {
    this.type = type.type;
    this.name = name;
    this.class = type.class;
    this.parent = parent;
    this.enemy = parent.enemy;
    this.dmg = parent.dmg;
    this.speed = type.speed;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.position = parent.position;
    this.distance = parent.range;
    this.name = name;
    this.death = type.death;
    this.piercing = type.piercing;
    this.symbol = type.symbol;
    this.gameState = gameState;
    if (type.type === "arrow") {
      if (this.enemy) {
        this.symbol = type.enemySymbol;
      } else this.symbol = type.friendlySymbol;
    }
    if (type.type === "missile") {
      this.direction = "up";
      this.symbol = type.upSymbol;
    }
    if (type.type === "barrel") {
      this.position = [direction(parent), parent.position[1]];
    }
    if (type.death === "explodes") {
      this.explosionDmg = this.dmg;
      this.explosionRange = 1;
      this.armed = true;
    }
  }
  get turn() {
    let activeEntities = this.gameState.active.activeEntities;
    let entityBoard = this.gameState.active.entityBoard;
    let activeProjectiles = this.gameState.active.activeProjectiles;
    let projectileBoard = this.gameState.active.projectileBoard;
    let activeGround = this.gameState.active.activeGround;
    let groundBoard = this.gameState.active.groundBoard;
    let activeFluid = this.gameState.active.activeFluid;
    let fluidBoard = this.gameState.active.fluidBoard;
    let activeEffects = this.gameState.active.activeEffects;
    let effectBoard = this.gameState.active.effectBoard;
    let friendlyGraveyard = this.gameState.graveyard.friendlyGraveyard;
    let enemyGraveyard = this.gameState.graveyard.enemyGraveyard;
    let groundGraveyard = this.gameState.graveyard.groundGraveyard;
    let fluidGraveyard = this.gameState.graveyard.fluidGraveyard;
    let bank = this.gameState.engine.bank;
    let setBank = this.gameState.engine.setBank;
    let gameboardWidth = this.gameState.settings.gameboardWidth;
    let gameboardHeight = this.gameState.settings.gameboardHeight;
    let gameSpeed = this.gameState.settings.gameSpeed;
    let projectileList = ProjectileList;
    let effectList = EffectList;

    fluidChecker(this);
    this.speedCharge++;
    if (this.type === "missile") {
      if (missleCanMove(this)) {
        missileMovement(this);
        return;
      }
    }
    if (this.type === "arrow" || this.type === "laser") {
      if (arrowCanMove(this)) {
        arrowMovement(this);
        return;
      }
    }
    if (this.type === "barrel") {
      if (barrelCanFall(this, this.position)) {
        barrelFall(this);
        return;
      }
      if (barrelCanMove(this)) {
        barrelMovement(this);
        return;
      }
    }

    function barrelCanFall(projectile, position) {
      if (position[1] !== gameboardHeight.current) {
        let positionBelow = [position[0], position[1] + 1];
        let entityBelow = onBoard(entityBoard.current, positionBelow);
        let groundBelow = onBoard(groundBoard.current, positionBelow);
        if (entityBelow) {
          entityKiller(projectile);
          return false;
        } else if (groundBelow) {
          return false;
        }
        return true;
      }
    }

    function barrelFall(projectile) {
      if (projectile.fallCharge < projectile.fallSpeed) {
        projectile.fallCharge++;
      } else {
        projectile.fallCharge = 0;
        let position = [projectile.position[0], projectile.position[1] + 1];
        moveBoard(projectileBoard.current, position, projectile);
        projectile.speedCharge = projectile.speed / 2;
      }
    }

    function barrelCanMove(projectile) {
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function barrelMovement(projectile) {
      let entityInCurrent = onBoard(entityBoard.current, projectile.position);
      if (entityInCurrent) {
        entityKiller(projectile);
        return;
      }
      let positionNextTo = [direction(projectile), projectile.position[1]];
      let entityNextTo = onBoard(entityBoard.current, positionNextTo);
      if (entityNextTo) {
        if (entityNextTo.enemy !== projectile.enemy) {
          entityKiller(projectile);
          return;
        }
      }
      let groundNextTo = onBoard(groundBoard.current, positionNextTo);
      if (groundNextTo) {
        entityKiller(projectile);
        return;
      }
      if (
        positionNextTo[0] === -1 ||
        positionNextTo[0] === gameboardWidth.current
      ) {
        entityKiller(projectile);
        return;
      }
      moveBoard(projectileBoard.current, positionNextTo, projectile);
      projectile.speedCharge = 0;
    }

    function missleCanMove(projectile) {
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function missileMovement(projectile) {
      if (projectile.direction === "up") {
        let enemies = activeEntities.current.filter((entity) => entity.enemy);
        let highest = { position: [1, Infinity] };
        for (const ground of activeGround.current) {
          if (ground.position[1] < highest.position[1]) {
            highest = ground;
          }
        }
        for (const entity of enemies) {
          if (entity.position[1] < highest.position[1]) {
            highest = entity;
          }
        }
        if (projectile.position[1] > highest.position[1] - 4) {
          let newPosition = [
            projectile.position[0],
            projectile.position[1] - 1,
          ];
          let entityInPosition = onBoard(entityBoard.current, newPosition);
          if (entityInPosition) {
            if (entityInPosition.enemy !== projectile.enemy) {
              entityInPosition.hp -= projectile.dmg;
              entityKiller(projectile);
              return;
            }
          }
          moveBoard(projectileBoard.current, newPosition, projectile);
          projectile.speedCharge = 0;
        } else {
          projectile.direction = "right";
          projectile.speed = 4;
          projectile.symbol = projectileList[projectile.type].rightSymbol;
          return;
        }
      } else if (projectile.direction === "right") {
        if (belowTargetter(projectile)) {
          projectile.direction = "down";
          projectile.speed = 0;
          projectile.symbol = projectileList[projectile.type].downSymbol;
          return;
        }
        let newPosition = [projectile.position[0] + 1, projectile.position[1]];
        let entityInPosition = onBoard(entityBoard.current, newPosition);
        if (entityInPosition) {
          if (entityInPosition.enemy !== projectile.enemy) {
            entityInPosition.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.speedCharge = 0;
      } else if (projectile.direction === "down") {
        let newPosition = [projectile.position[0], projectile.position[1] + 1];
        let entityInPosition = onBoard(entityBoard.current, newPosition);
        if (entityInPosition) {
          if (entityInPosition.enemy !== projectile.enemy) {
            entityInPosition.hp -= projectile.dmg;
            entityKiller(projectile);
            return;
          }
        }
        let groundInPosition = onBoard(groundBoard.current, newPosition);
        if (groundInPosition || newPosition[1] === gameboardHeight.current) {
          entityKiller(projectile);
          return;
        }
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.speedCharge = 0;
      }

      function belowTargetter(projectile) {
        let targetFound;
        for (let h = gameboardHeight.current; h > 1; h--) {
          let targetPosition = [projectile.position[0], h];
          let targetEntity = onBoard(entityBoard.current, targetPosition);
          if (targetEntity) {
            if (targetEntity.enemy !== projectile.enemy) {
              targetFound = true;
            }
          }
        }
        if (targetFound) {
          return true;
        }
      }
    }

    function arrowCanMove(projectile) {
      if (!projectile.distance) {
        activeProjectiles.current.splice(
          activeProjectiles.current.indexOf(projectile),
          1
        );
        return false;
      }
      if (projectile.speedCharge >= projectile.speed) {
        return true;
      }
    }

    function arrowMovement(projectile) {
      let newPosition = [direction(projectile), projectile.position[1]];
      let entityInPosition = onBoard(entityBoard.current, newPosition);
      let groundInPosition = onBoard(groundBoard.current, newPosition);
      if (entityInPosition) {
        if (projectile.type === "laser") {
          entityInPosition.hp -= projectile.dmg;
        } else if (entityInPosition.enemy === projectile.enemy) {
          entityInPosition.hp -= projectile.dmg;
        }
        if (!projectile.piercing) {
          entityKiller(projectile);
        } else projectile.position = newPosition;
      } else if (groundInPosition) {
        groundInPosition.hp -= projectile.dmg;
        if (!projectile.piercing) {
          entityKiller(projectile);
        } else projectile.position = newPosition;
      } else {
        projectile.speedCharge = 0;
        moveBoard(projectileBoard.current, newPosition, projectile);
        projectile.distance--;
      }
    }
    function fluidChecker(currentEntity) {
      if (currentEntity.position[1] < 1) {
        return;
      }
      let fluidInPosition = onBoard(fluidBoard.current, currentEntity.position);
      if (fluidInPosition) {
        if (currentEntity.sponge) {
          currentEntity.hp -= 2;
          entityKiller(fluidInPosition);
        } else if (!currentEntity.inFluid) {
          currentEntity.inFluid = true;
          currentEntity.speed *= 1.5;
          currentEntity.rate *= 1.5;
          currentEntity.rateCharge *= 1.5;
          currentEntity.fallSpeed *= 8;
          if (currentEntity.breathes) {
            currentEntity.oxygen = 300 / gameSpeed.current;
          }
        } else {
          currentEntity.oxygen--;
          if (!currentEntity.oxygen) {
            currentEntity.hp--;
            if (currentEntity.hp <= 0) {
              entityKiller(currentEntity);
            }
            currentEntity.oxygen = 50 / gameSpeed.current;
          }
        }
      } else if (currentEntity.inFluid) {
        currentEntity.inFluid = false;
        currentEntity.speed /= 1.5;
        currentEntity.rate /= 1.5;
        currentEntity.rateCharge /= 1.5;
        currentEntity.fallSpeed /= 8;
        currentEntity.oxygen = undefined;
      }
    }
    function entityKiller(entity) {
      if (entity.death) {
        if (entity.death === "explodes") {
          if (entity.armed) {
            entity.armed = false;
            explosion(entity);
          }
        } else if (entity.death === "spawn") {
          spawn(entity);
        }
      }
      if (entity.class === "entity") {
        toBoard(entityBoard.current, entity.position, undefined);
        if (entity.enemy) {
          setBank(entity.value + bank);
          enemyGraveyard.current.push(
            activeEntities.current.splice(
              activeEntities.current.indexOf(entity),
              1
            )
          );
        } else {
          friendlyGraveyard.current.push(
            activeEntities.current.splice(
              activeEntities.current.indexOf(entity),
              1
            )
          );
        }
      } else if (entity.class === "ground") {
        toBoard(groundBoard.current, entity.position, undefined);
        groundGraveyard.current.push(
          activeGround.current.splice(activeGround.current.indexOf(entity), 1)
        );
      } else if (entity.class === "fluid") {
        toBoard(fluidBoard.current, entity.position, undefined);
        fluidGraveyard.current.push(
          activeFluid.current.splice(activeFluid.current.indexOf(entity), 1)
        );
      } else if (entity.class === "projectile") {
        toBoard(projectileBoard.current, entity.position, undefined);
        activeProjectiles.current.splice(
          activeProjectiles.current.indexOf(entity),
          1
        );
      }
    }
    function explosion(currentEntity) {
      let w = currentEntity.explosionRange;
      let h = currentEntity.explosionRange;
      let initialW = w;
      let initialH = h;
      while (w >= -initialW) {
        while (h >= -initialH) {
          let position = [
            currentEntity.position[0] + w,
            currentEntity.position[1] + h,
          ];
          let entityInCell = onBoard(entityBoard.current, position);
          let groundInCell = onBoard(groundBoard.current, position);
          let fluidInCell = onBoard(fluidBoard.current, position);
          let projectileInCell = onBoard(projectileBoard.current, position);
          let dmg = parseInt(
            currentEntity.explosionDmg -
              (Math.random() * currentEntity.explosionDmg) / 4
          );
          if (entityInCell) {
            entityInCell.hp -= dmg;
          }
          if (groundInCell) {
            groundInCell.hp -= dmg;
          }
          if (fluidInCell) {
            let deathChance = Math.random() * 10;
            if (deathChance > 5) {
              entityKiller(fluidInCell);
            }
          }
          if (projectileInCell) {
            entityKiller(projectileInCell);
          }
          let effectType = effectList["explosion"];
          let effectPosition = [
            currentEntity.position[0] + w,
            currentEntity.position[1] + h,
          ];
          let effectID =
            "explosion" +
            currentEntity.position[0] +
            w +
            currentEntity.position[1] +
            h;
          effectID = new Effect(effectType, effectPosition, effectID);
          toBoard(effectBoard.current, effectPosition, effectID);
          activeEffects.current.push(effectID);
          h--;
        }
        h = initialH;
        w--;
      }
    }
  }
}
export default Projectile;
