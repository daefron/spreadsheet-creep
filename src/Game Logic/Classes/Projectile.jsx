import { onBoard, moveBoard, direction } from "../Tools.jsx";
import { entityKiller } from "./EntityTools.jsx";
import ProjectileList from "../Lists/ProjectileList.jsx";

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
    let fluidBoard = this.gameState.active.fluidBoard;
    let gameboardWidth = this.gameState.settings.gameboardWidth;
    let gameboardHeight = this.gameState.settings.gameboardHeight;
    let gameSpeed = this.gameState.settings.gameSpeed;
    let projectileList = ProjectileList;

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
  }
}
export default Projectile;
