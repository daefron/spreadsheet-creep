class Effect {
  constructor(type, position, ID) {
    this.name = ID;
    this.type = type.type;
    this.class = type.class;
    this.position = position;
    this.symbol = type.symbol;
    this.duration = type.duration;
    this.durationCharge = 0;
    this.style = type.style;
  }
}
export default Effect;