import { direction, cellContents } from "../Tools.jsx";

class Projectile {
  constructor(parent, name, type) {
    this.type = type.type;
    this.name = name;
    this.parent = parent;
    this.enemy = parent.enemy;
    this.dmg = parent.dmg;
    this.speed = type.speed;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.position = parent.position;
    this.distance = parent.range;
    this.name = name;
    this.death = type.death;
    if (type.type === "arrow") {
      if (this.enemy) {
        this.symbol = type.enemySymbol;
      } else this.symbol = type.friendlySymbol;
    }
    if (type.type === "missile") {
      this.direction = "up";
      this.symbol = type.upSymbol;
    }
    if (type.type === "barrel") {
      this.symbol = type.symbol;
      this.position = [direction(parent), parent.position[1]];
    }
    if (type.death === "explodes") {
      this.explosionDmg = this.dmg;
      this.explosionRange = 1;
      this.armed = true;
    }
  }
}

export default Projectile;
