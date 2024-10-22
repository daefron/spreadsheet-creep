export default {
  goblin: {
    type: "goblin",
    enemy: true,
    projectile: false,
    fallSpeed: 10,
    climber: true,
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 9,
        dmg: 3,
        range: 1,
        rate: 60,
        speed: 60,
        value: 1,
        exp: 1,
        chance: 15,
      },
      lvl2: {
        lvl: 2,
        hp: 12,
        dmg: 4,
        range: 1,
        rate: 50,
        speed: 50,
        value: 3,
        exp: 2,
        chance: 10,
      },
    },
  },
  skeleton: {
    type: "skeleton",
    enemy: true,
    projectile: "arrow",
    fallSpeed: 10,
    climber: true,
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 5,
        dmg: 2,
        range: 3,
        rate: 60,
        speed: 90,
        value: 1,
        exp: 1,
        chance: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 8,
        dmg: 3,
        range: 3,
        rate: 50,
        speed: 60,
        value: 3,
        exp: 2,
        chance: 3,
      },
    },
  },
  bow: {
    type: "bow",
    enemy: false,
    projectile: "arrow",
    fallSpeed: 1,
    climber: false,
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        dmg: 3,
        range: 6,
        rate: 60,
        speed: 0,
        value: 5,
        neededExp: 3,
      },
      lvl2: {
        lvl: 2,
        hp: 12,
        dmg: 4,
        range: 6,
        rate: 50,
        speed: 0,
        value: 10,
        neededExp: 6,
      },
      lvl3: {
        lvl: 3,
        hp: 14,
        dmg: 5,
        range: 6,
        rate: 40,
        speed: 0,
        value: 15,
        neededExp: 30,
      },
    },
  },
  wall: {
    type: "wall",
    enemy: false,
    projectile: false,
    fallSpeed: 1,
    climber: false,
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        dmg: 0,
        range: 0,
        rate: 0,
        speed: 0,
        value: 2,
        neededExp: 100,
      },
      lvl2: {
        lvl: 2,
        hp: 100000000,
        dmg: 0,
        range: 0,
        rate: 0,
        speed: 0,
        value: 2,
        neededExp: 100,
      },
    },
  },
  king: {
    type: "king",
    enemy: false,
    projectile: false,
    fallSpeed: 10,
    climber: false,
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 20,
        dmg: 5,
        range: 1,
        rate: 1 * 30,
        speed: 0 * 30,
        value: 0,
        neededExp: 100,
      },
    },
  },
};
