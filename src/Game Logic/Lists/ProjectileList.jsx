export default {
  arrow: {
    type: "arrow",
    class: "projectile",
    friendlySymbol: ">-<>",
    enemySymbol: "<>-<",
    projectile: true,
    speed: 3,
    distance: 5,
  },
  missile: {
    type: "missile",
    class: "projectile",
    upSymbol: "^^^",
    rightSymbol: ">>>",
    downSymbol: "vvv",
    projectile: true,
    speed: 0,
  },
  barrel: {
    type: "barrel",
    class: "projectile",
    symbol: "(II)",
    projectile: true,
    speed: 10,
    fallSpeed: 1,
    death: "explodes",
  },
};
