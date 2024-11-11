export class Entity {
  constructor(type, lvl, position, ID) {
    this.name = ID;
    this.type = type.type;
    this.position = position;
    this.lvl = lvl.lvl;
    this.hp = lvl.hp;
    this.enemy = type.enemy;
    this.value = lvl.value;
    this.dmg = lvl.dmg;
    this.range = lvl.range;
    this.rate = lvl.rate;
    this.rateCharge = this.rate;
    this.speed = lvl.speed;
    this.speedCharge = 0;
    this.fallSpeed = type.fallSpeed;
    this.fallCharge = 0;
    this.movement = type.movement;
    this.attack = type.attack;
    this.breathes = type.breathes;
    this.projectile = type.projectile;
    this.style = type.style;
    this.explosionDmg = lvl.explosionDmg;
    this.explosionRange = lvl.explosionRange;
    this.death = type.death;
    this.spawnType = type.spawnType;
  }
}

export default Entity;