export default {
  goblin: {
    type: "goblin",
    enemy: true,
    projectile: false,
    fallSpeed: 1,
    climber: true,
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
    climber: true,
    breathes: false,
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
  bow: {
    type: "bow",
    enemy: false,
    projectile: "arrow",
    fallSpeed: 1,
    climber: false,
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
  wall: {
    type: "wall",
    enemy: false,
    projectile: false,
    fallSpeed: 1,
    climber: false,
    breathes: false,
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
  friendGoblin: {
    type: "friendGoblin",
    enemy: false,
    projectile: false,
    fallSpeed: 1,
    climber: true,
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
  friendSkeleton: {
    type: "friendSkeleton",
    enemy: false,
    projectile: "arrow",
    fallSpeed: 1,
    climber: true,
    breathes: false,
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
  king: {
    type: "king",
    enemy: false,
    projectile: false,
    fallSpeed: 0,
    climber: false,
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
