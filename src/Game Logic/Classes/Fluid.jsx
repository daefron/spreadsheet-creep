class Fluid {
  constructor(type, position, ID) {
    this.name = ID;
    this.type = type.type;
    this.position = position;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.speed = type.speed;
    this.speedCharge = 0;
    if (type.speed !== undefined) {
      let directionDecider = Math.random() * 10;
      if (directionDecider > 5) {
        this.direction = "left";
      } else {
        this.direction = "right";
      }
    }
    this.weight = type.weight;
    this.style = type.style;
  }
}

export default Fluid;