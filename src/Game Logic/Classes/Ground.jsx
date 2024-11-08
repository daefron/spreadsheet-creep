class Ground {
  constructor(type, position, ID) {
    this.name = ID;
    this.type = type.type;
    this.position = position;
    this.hp = type.hp;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.style = type.style;
  }
}

export default Ground;
