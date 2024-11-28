import { onBoard, toBoard, moveBoard } from "../Tools.jsx";

class Ground {
  constructor(type, position, ID, gameState) {
    this.name = ID;
    this.type = type.type;
    this.class = type.class;
    this.position = position;
    this.hp = type.hp;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
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
    let gameboardHeight = this.gameState.settings.gameboardHeight;
    if (this.hp <= 0) {
      entityKiller(this);
    }
    if (groundCanFall(this)) {
      return groundFall(this);
    } else {
      return (this.falling = false);
    }
    function groundCanFall(ground) {
      if (ground.position[1] < 0) {
        return true;
      }
      if (ground.position[1] >= gameboardHeight.current) {
        if (ground.ghost) {
          entityKiller(ground);
        }
        return false;
      }
      if (ground.fallCharge < ground.fallSpeed) {
        ground.fallCharge++;
        return false;
      }
      let positionBelow = [ground.position[0], ground.position[1] + 1];
      let groundBelow = onBoard(groundBoard.current, positionBelow);
      if (!groundBelow) {
        let entityBelow = onBoard(entityBoard.current, positionBelow);
        if (entityBelow) {
          groundAttack(ground, entityBelow);
        }
        return true;
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

    function groundFall(ground) {
      ground.fallCharge = 0;
      if (ground.position[1] < 0) {
        ground.position = [ground.position[0], ground.position[1] + 1];
      } else {
        moveBoard(
          groundBoard.current,
          [ground.position[0], ground.position[1] + 1],
          ground
        );
      }
      ground.falling = true;
    }

    function groundAttack(entityBelow) {
      entityKiller(entityBelow);
    }
  }
}

export default Ground;
