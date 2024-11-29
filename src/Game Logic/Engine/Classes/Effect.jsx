import { toBoard } from "../../Tools.jsx";
class Effect {
  constructor(type, position, ID, gameState) {
    this.name = ID;
    this.type = type.type;
    this.class = type.class;
    this.position = position;
    this.symbol = type.symbol;
    this.duration = type.duration;
    this.durationCharge = 0;
    this.style = type.style;
    this.gameState = gameState;
  }
  get turn() {
    let activeEffects = this.gameState.active.activeEffects;
    let effectBoard = this.gameState.active.effectBoard;
    if (this.durationCharge < this.duration) {
      this.durationCharge++;
    } else {
      toBoard(effectBoard.current, this.position, undefined);
      activeEffects.current.splice(activeEffects.current.indexOf(this), 1);
    }
  }
}
export default Effect;
