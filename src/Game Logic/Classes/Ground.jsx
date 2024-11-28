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
    let entityBoard = this.gameState.active.entityBoard;
    let activeGround = this.gameState.active.activeGround;
    let groundBoard = this.gameState.active.groundBoard;
    let groundGraveyard = this.gameState.graveyard.groundGraveyard;
    let gameboardHeight = this.gameState.settings.gameboardHeight;
    if (this.hp <= 0) {
      kill(this);
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
          kill(ground);
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

    function kill(entity) {
      toBoard(groundBoard.current, entity.position, undefined);
      groundGraveyard.current.push(
        activeGround.current.splice(activeGround.current.indexOf(entity), 1)
      );
      return;
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
      kill(entityBelow);
    }
  }
}

export default Ground;
