import { onBoard, moveBoard } from "../Tools.jsx";
import { entityKiller, healthChecker } from "./EntityTools.jsx";
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
    let groundBoard = this.gameState.active.groundBoard;
    let gameboardHeight = this.gameState.settings.gameboardHeight;
    if (healthChecker(this)) {
      return;
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
          return true;
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
          groundAttack(entityBelow);
        }
        return true;
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
