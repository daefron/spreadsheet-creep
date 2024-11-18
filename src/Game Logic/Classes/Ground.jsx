class Ground {
  constructor(type, position, ID) {
    this.name = ID;
    this.type = type.type;
    this.class = type.class;
    this.position = position;
    this.hp = type.hp;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
  }
}

export default Ground;
