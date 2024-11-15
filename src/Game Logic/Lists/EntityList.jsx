export default {
  goblin: {
    type: "goblin",
    class: "entity",
    enemy: true,
    fallSpeed: 1,
    movement: "walker",
    attack: "melee",
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
    class: "entity",
    enemy: true,
    movement: "walker",
    attack: "projectile",
    projectile: "arrow",
    fallSpeed: 1,
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
    class: "entity",
    enemy: true,
    fallSpeed: 1,
    movement: "scaler",
    attack: "melee",
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
        chance: 8,
      },
    },
  },
  bomber: {
    type: "bomber",
    class: "entity",
    enemy: true,
    fallSpeed: 1,
    movement: "walker",
    attack: "melee",
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
    class: "entity",
    enemy: true,
    fallSpeed: 1,
    movement: "walker",
    attack: "melee",
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
        speed: 15,
        value: 5,
        chance: 5,
      },
    },
  },
  bow: {
    type: "bow",
    class: "entity",
    attack: "projectile",
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
        value: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 12,
        dmg: 4,
        range: 6,
        rate: 27,
        value: 10,
      },
      lvl3: {
        lvl: 3,
        hp: 14,
        dmg: 5,
        range: 6,
        rate: 25,
        value: 15,
      },
    },
  },
  mage: {
    type: "mage",
    class: "entity",
    fallSpeed: 1,
    breathes: true,
    attack: "enemyExists",
    projectile: "missile",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 9,
        dmg: 3,
        rate: 30,
        value: 15,
      },
    },
  },
  well: {
    type: "well",
    class: "entity",
    fallSpeed: 1,
    attack: "automatic",
    projectile: "water",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 20,
        rate: 15,
        value: 20,
      },
    },
  },
  dropper: {
    type: "dropper",
    class: "entity",
    fallSpeed: 1,
    attack: "enemyExists",
    projectile: "barrel",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 20,
        dmg: 10,
        rate: 60,
        value: 30,
      },
    },
  },
  knight: {
    type: "knight",
    class: "entity",
    attack: "melee",
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
        value: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 15,
        dmg: 5,
        range: 1,
        rate: 20,
        value: 10,
      },
      lvl3: {
        lvl: 3,
        hp: 18,
        dmg: 6,
        range: 2,
        rate: 15,
        value: 15,
      },
    },
  },
  laser: {
    type: "laser",
    class: "entity",
    attack: "projectile",
    projectile: "laser",
    fallSpeed: 1,
    breathes: true,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        dmg: 2,
        range: 100,
        rate: 120,
        value: 30,
      },
      lvl2: {
        lvl: 2,
        hp: 20,
        dmg: 2,
        range: 100,
        rate: 1,
        value: 100,
      },
    },
  },
  wall: {
    type: "wall",
    class: "entity",
    fallSpeed: 1,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        dmg: 0,
        range: 0,
        rate: 0,
        value: 2,
      },
      lvl2: {
        lvl: 2,
        hp: 20,
        dmg: 0,
        range: 0,
        rate: 0,
        value: 2,
      },
      lvl3: {
        lvl: 3,
        hp: 100000000,
        dmg: 0,
        range: 0,
        rate: 0,
        value: 2,
      },
    },
  },
  aura: {
    type: "aura",
    class: "entity",
    attack: "radius",
    fallSpeed: 1,
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 20,
        dmg: 1,
        rate: 20,
        range: 1,
        value: 20,
      },
      lvl2: {
        lvl: 2,
        hp: 20,
        dmg: 1,
        rate: 10,
        range: 2,
        value: 50,
      },
      lvl3: {
        lvl: 3,
        hp: 20,
        dmg: 1,
        rate: 1,
        range: 1,
        value: 50,
      },
    },
  },
  bomb: {
    type: "bomb",
    class: "entity",
    fallSpeed: 1,
    death: "explodes",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 10,
        explosionDmg: 22,
        explosionRange: 1,
        rate: 0,
        value: 5,
      },
      lvl2: {
        lvl: 2,
        hp: 10,
        explosionDmg: 40,
        explosionRange: 2,
        rate: 0,
        value: 5,
      },
      lvl3: {
        lvl: 3,
        hp: 10,
        explosionDmg: 80,
        explosionRange: 5,
        rate: 0,
        value: 5,
      },
    },
  },
  king: {
    type: "king",
    class: "entity",
    attack: "melee",
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
        value: 0,
      },
    },
  },
  blob: {
    type: "blob",
    class: "entity",
    enemy: true,
    sponge: true,
    attack: "blob",
    style: {},
    lvls: {
      lvl1: {
        lvl: 1,
        hp: 1,
        maxHp: 10,
        speed: 60,
      },
      lvl2: {
        lvl: 2,
        hp: 1,
        maxHp: 10,
        speed: 35,
      },
    },
  },
};
