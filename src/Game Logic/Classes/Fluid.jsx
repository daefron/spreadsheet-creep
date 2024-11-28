import { onBoard, toBoard, moveBoard} from "../Tools.jsx";
class Fluid {
  constructor(type, position, ID, gameState) {
    this.name = ID;
    this.type = type.type;
    this.class = type.class;
    this.position = position;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.speed = type.speed;
    this.speedCharge = 0;
    if (type.speed) {
      let directionDecider = Math.random() * 10;
      if (directionDecider > 5) {
        this.direction = "left";
      } else {
        this.direction = "right";
      }
    }
    this.weight = type.weight;
    this.gameState = gameState;
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
    let friendlyGraveyard = this.gameState.graveyard.friendlyGraveyard;
    let enemyGraveyard = this.gameState.graveyard.enemyGraveyard;
    let groundGraveyard = this.gameState.graveyard.groundGraveyard;
    let fluidGraveyard = this.gameState.graveyard.fluidGraveyard;
    let bank = this.gameState.engine.bank;
    let setBank = this.gameState.engine.setBank;
    let gameboardWidth = this.gameState.settings.gameboardWidth;
    let gameboardHeight = this.gameState.settings.gameboardHeight;

    if (fluidCanFall(this)) {
      this.speed = 5;
      this.falling = true;
      fluidFall(this);
    } else {
      this.falling = false;
      fluidMovement(this);
    }

    function fluidCanFall(fluid) {
      if (fluid.position[1] < 0) {
        return true;
      }
      if (fluid.position[1] >= gameboardHeight.current) {
        if (fluid.ghost) {
          entityKiller(fluid);
          return true;
        }
        return false;
      }
      if (fluid.fallCharge < fluid.fallSpeed) {
        fluid.fallCharge++;
        return false;
      }
      let positionBelow = [fluid.position[0], fluid.position[1] + 1];
      let groundBelow = onBoard(groundBoard.current, positionBelow);
      let fluidBelow = onBoard(fluidBoard.current, positionBelow);
      if (groundBelow || fluidBelow) {
        return false;
      }
      return true;
    }

    function fluidFall(fluid) {
      fluid.fallCharge = 0;
      if (fluid.position[1] < 0) {
        fluid.position = [fluid.position[0], fluid.position[1] + 1];
      } else {
        moveBoard(
          fluidBoard.current,
          [fluid.position[0], fluid.position[1] + 1],
          fluid
        );
      }
    }

    function fluidMovement(fluid) {
      if (fluid.speedCharge < fluid.speed) {
        fluid.speedCharge++;
      } else {
        let targetPosition;
        if (fluid.direction === "left") {
          targetPosition = [fluid.position[0] - 1, fluid.position[1]];
        } else if (fluid.direction === "right") {
          targetPosition = [fluid.position[0] + 1, fluid.position[1]];
        }
        if (
          targetPosition[0] === -1 ||
          targetPosition[0] === gameboardWidth.current
        ) {
          return entityKiller(fluid);
        }
        let groundTarget = onBoard(groundBoard.current, targetPosition);
        let fluidTarget = onBoard(fluidBoard.current, targetPosition);
        if (!groundTarget && !fluidTarget) {
          moveBoard(fluidBoard.current, targetPosition, fluid);
          fluid.speedCharge = 0;
          fluid.speed *= 1.3;
          return;
        } else {
          if (fluid.direction === "left") {
            fluid.direction = "right";
          } else fluid.direction = "left";
        }
      }
      let fluidBelow = onBoard(fluidBoard.current, [
        fluid.position[0],
        fluid.position[1] + 1,
      ]);
      if (fluid.speed > 50 && fluidBelow) {
        fluid.speed = Infinity;
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
  }
}

export default Fluid;
