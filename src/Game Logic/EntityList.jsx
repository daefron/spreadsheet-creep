export default {
  goblin: {
    type: "goblin",
    enemy: true,
    fallSpeed: 1,
    movement: "walker",
    breathes: true,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 9,
        dmg: 3,
        range: 1,
        rate: 15,
        speed: 15,
        value: 1,
        chance: 15,
      },
      lvl2: {
        lvl: 2,
        hp: 12,
        dmg: 4,
        range: 1,
        rate: 13,
        speed: 13,
        value: 3,
        chance: 10,
      },
    },
  },
  skeleton: {
    type: "skeleton",
    enemy: true,
    projectile: "arrow",
    fallSpeed: 1,
    movement: "walker",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 5,
        dmg: 2,
        range: 3,
        rate: 15,
        speed: 23,
        value: 1,
        chance: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 8,
        dmg: 3,
        range: 3,
        rate: 13,
        speed: 15,
        value: 3,
        chance: 3,
      },
    },
  },
  spider: {
    type: "spider",
    enemy: true,
    fallSpeed: 1,
    movement: "scaler",
    breathes: true,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 7,
        dmg: 3,
        range: 1,
        rate: 12,
        speed: 10,
        value: 6,
        chance: 5,
      },
    },
  },
  bombBoy: {
    type: "bombBoy",
    enemy: true,
    fallSpeed: 1,
    movement: "walker",
    breathes: true,
    death: "explodes",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 9,
        dmg: 3,
        range: 1,
        explosionDmg: 22,
        explosionRange: 1,
        rate: 25,
        speed: 25,
        value: 1,
        chance: 5,
      },
    },
  },
  spawner: {
    type: "spawner",
    enemy: true,
    fallSpeed: 1,
    movement: "walker",
    breathes: true,
    death: "spawn",
    spawnType: "goblin",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 5,
        dmg: 4,
        range: 1,
        rate: 15,
        speed: 20,
        value: 5,
        chance: 5,
      },
    },
  },
  bow: {
    type: "bow",
    projectile: "arrow",
    fallSpeed: 1,
    breathes: true,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        dmg: 3,
        range: 6,
        rate: 30,
        speed: 0,
        value: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 12,
        dmg: 4,
        range: 6,
        rate: 27,
        speed: 0,
        value: 10,
      },
      lvl3: {
        lvl: 3,
        hp: 14,
        dmg: 5,
        range: 6,
        rate: 25,
        speed: 0,
        value: 15,
      },
    },
  },
  knight: {
    type: "knight",
    fallSpeed: 1,
    breathes: true,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 13,
        dmg: 4,
        range: 1,
        rate: 25,
        speed: 0,
        value: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 15,
        dmg: 5,
        range: 1,
        rate: 20,
        speed: 0,
        value: 10,
      },
      lvl3: {
        lvl: 3,
        hp: 18,
        dmg: 6,
        range: 2,
        rate: 15,
        speed: 0,
        value: 15,
      },
    },
  },
  wall: {
    type: "wall",
    fallSpeed: 1,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        dmg: 0,
        range: 0,
        rate: 0,
        speed: 0,
        value: 2,
      },
      lvl2: {
        lvl: 2,
        hp: 20,
        dmg: 0,
        range: 0,
        rate: 0,
        speed: 0,
        value: 2,
      },
      lvl3: {
        lvl: 3,
        hp: 100000000,
        dmg: 0,
        range: 0,
        rate: 0,
        speed: 0,
        value: 2,
      },
    },
  },
  bomb: {
    type: "bomb",
    fallSpeed: 1,
    death: "explodes",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 20,
        explosionDmg: 22,
        explosionRange: 1,
        rate: 0,
        speed: 0,
        value: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 20,
        explosionDmg: 40,
        explosionRange: 2,
        rate: 0,
        speed: 0,
        value: 5,
      },
      lvl3: {
        lvl: 3,
        hp: 20,
        explosionDmg: 80,
        explosionRange: 5,
        rate: 0,
        speed: 0,
        value: 5,
      },
    },
  },
  king: {
    type: "king",
    fallSpeed: 0,
    breathes: true,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 20,
        dmg: 5,
        range: 1,
        rate: 12,
        speed: 0,
        value: 0,
      },
    },
  },
};
