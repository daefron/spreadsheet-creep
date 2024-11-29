import { onBoard, moveBoard } from "../Tools.jsx";
import { entityKiller } from "./EntityTools.jsx";
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
      let directionDecider = Math.random();
      if (directionDecider > 0.5) {
        this.direction = "left";
      } else {
        this.direction = "right";
      }
    }
    this.weight = type.weight;
    this.gameState = gameState;
  }
  get turn() {
    let groundBoard = this.gameState.active.groundBoard;
    let fluidBoard = this.gameState.active.fluidBoard;
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
        return;
      }
      moveBoard(
        fluidBoard.current,
        [fluid.position[0], fluid.position[1] + 1],
        fluid
      );
    }

    function fluidMovement(fluid) {
      if (fluid.speedCharge < fluid.speed) {
        fluid.speedCharge++;
        return;
      }
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
      }
      if (fluid.direction === "left") {
        fluid.direction = "right";
      } else fluid.direction = "left";
      let fluidBelow = onBoard(fluidBoard.current, [
        fluid.position[0],
        fluid.position[1] + 1,
      ]);
      if (fluid.speed > 50 && fluidBelow) {
        fluid.speed = Infinity;
      }
    }
  }
}

export default Fluid;
