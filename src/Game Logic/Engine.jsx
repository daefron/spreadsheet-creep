export default function Engine() {
  //object that holds default values of entities
  const entityList = {
    goblin: {
      type: "Goblin",
      enemy: true,
      position: "J1",
      levels: {
        lvl1: {
          name: "Level 1",
          hp: 6,
          dmg: 1,
          range: 1,
          rate: 2,
          speed: 1,
          value: 1,
          exp: 1,
        },
        lvl2: {
          name: "Level 2",
          hp: 10,
          dmg: 2,
          range: 1,
          rate: 2,
          speed: 1,
          value: 3,
          exp: 2,
        },
      },
    },
    arrow: {
      type: "Arrow Turret",
      enemy: false,
      // POSITION TO BE DECIDED BY USER LATER
      position: "C1",
      levels: {
        lvl1: {
          name: "Level 1",
          hp: 5,
          dmg: 3,
          range: 3,
          rate: 2,
          speed: 0,
          value: 5,
          expLevel: 3,
        },
        lvl2: {
          name: "Level 2",
          hp: 10,
          dmg: 4,
          range: 4,
          rate: 2,
          speed: 0,
          value: 10,
          expLevel: 6,
        },
      },
    },
  };

  //array that holds active entities
  let activeEntities = [];

  //function that creates new active entities
  function Entity(type, level, activeEntities, name) {
    this.name = name;
    this.level = level.name;
    this.hp = level.hp;
    this.dmg = level.dmg;
    this.range = level.range;
    this.rate = level.rate;
    this.speed = level.speed;
    this.enemy = type.enemy;
    this.position = type.position;
    this.value = level.value;
    if (this.enemy == false) {
      this.currentExp = 0;
    }
    activeEntities.push(this);
    console.log(this.name + " spawned at " + this.position);
    gameboardUpdater();
  }

  //function to make the gameboard grid
  let gameboard = new Map();
  function gameboardMaker() {
    const boardWidth = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    for (let h = 1; h < 10; h++) {
      boardWidth.forEach((element) => gameboard.set(element + h));
    }
  }
  gameboardMaker();

  //function to update the gameboard entities
  function gameboardUpdater() {
    activeEntities.forEach((entity) => {
      gameboard.forEach((value, location) => {
        if (entity.position == location && location !== undefined) {
          gameboard.set(location, entity);
        }
      });
    });
  }

  //function to check if the space to the left is free, and if so, moves the enemy and attacks friendly
  function enemyTurn(currentEntity) {
    let oldPosition = currentEntity.position;
    let newPosition =
      letterSubtractor(oldPosition.charAt(0)) + oldPosition.charAt(1);

    //selects cell based off entity range
    let rangeLetter = letterSubtractor(oldPosition.charAt(0));
    for (let i = currentEntity.range; i > 1; i--) {
      rangeLetter = letterSubtractor(rangeLetter);
    }
    let rangeTarget = rangeLetter + oldPosition.charAt(1);

    if (
      gameboard.get(rangeTarget) !== undefined &&
      gameboard.get(rangeTarget).enemy == false
    ) {
      activeEntities.forEach((entity) => {
        if (entity.position == rangeTarget) {
          entity.hp = entity.hp - currentEntity.dmg;
          console.log(
            currentEntity.name +
              " attacked " +
              entity.name +
              " for " +
              currentEntity.dmg +
              " damage. " +
              entity.name +
              " HP is " +
              entity.hp
          );
          healthChecker(entity, currentEntity);
        }
      });
    } else if (gameboard.get(newPosition) == undefined) {
      gameboard.set(oldPosition, undefined);
      currentEntity.position = newPosition;
      gameboardUpdater();
      console.log(currentEntity.name + " moved to " + currentEntity.position);
    } else {
      console.log("position taken");
    }
  }

  function friendlyTurn(currentEntity) {
    let turnTaken = false;
    let oldPosition = currentEntity.position;
    //selects cell based off entity range
    let rangeLetter = letterAdder(oldPosition.charAt(0));
    let rangeCells = [];
    for (let i = currentEntity.range; i > 0; i--) {
      rangeCells.push(rangeLetter + oldPosition.charAt(1));
      rangeLetter = letterAdder(rangeLetter);
    }
    rangeCells.forEach((rangeTarget) => {
      if (
        gameboard.get(rangeTarget) !== undefined &&
        gameboard.get(rangeTarget).enemy == true
      ) {
        activeEntities.forEach((entity) => {
          if (entity.position == rangeTarget) {
            entity.hp = entity.hp - currentEntity.dmg;
            console.log(
              currentEntity.name +
                " attacked " +
                entity.name +
                " for " +
                currentEntity.dmg +
                " damage. " +
                entity.name +
                " HP is " +
                entity.hp
            );
            healthChecker(entity, currentEntity);
            turnTaken = true;
          }
        });
      }
    });
    if (turnTaken == false) {
      console.log(currentEntity.name + " did nothing");
    }
  }

  //current money
  let bank = 0;

  //stores dead bodies
  let graveyard = [];

  //checks to see if entity dies and if so, sends to graveyard
  function healthChecker(entity, currentEntity) {
    if (entity.hp <= 0) {
      if (entity.enemy == true) {
        bank = bank + entity.value;
      }
      console.log(
        entity.name +
          " was killed by " +
          currentEntity.name +
          ". Total Money: $" +
          bank
      );
      graveyard.push(activeEntities.splice(activeEntities.indexOf(entity), 1));
      gameboard.forEach((value, location) => {
        if (entity.position == location) {
          gameboard.set(location, undefined);
        }
      });
    }
  }

  //function to initiate next turn actions
  function nextTurn(currentTurn) {
    activeEntities.forEach((entity) => {
      if (entity.enemy == true) {
        enemyTurn(entity);
      } else if (entity.enemy == false) {
        friendlyTurn(entity);
      }
    });
    console.log("Turn " + currentTurn + " over");
  }

  //very lazy function to go back one letter in the alphabet
  function letterSubtractor(position) {
    if (position == "B") {
      position = "A";
    } else if (position == "C") {
      position = "B";
    } else if (position == "D") {
      position = "C";
    } else if (position == "E") {
      position = "D";
    } else if (position == "F") {
      position = "E";
    } else if (position == "G") {
      position = "F";
    } else if (position == "H") {
      position = "G";
    } else if (position == "I") {
      position = "H";
    } else if (position == "J") {
      position = "I";
    }
    return position;
  }
  //very lazy function to go forward one letter in the alphabet
  function letterAdder(position) {
    if (position == "A") {
      position = "B";
    } else if (position == "B") {
      position = "C";
    } else if (position == "C") {
      position = "D";
    } else if (position == "D") {
      position = "E";
    } else if (position == "E") {
      position = "F";
    } else if (position == "F") {
      position = "G";
    } else if (position == "G") {
      position = "H";
    } else if (position == "H") {
      position = "I";
    } else if (position == "I") {
      position = "J";
    }
    return position;
  }

  //objects holding wave properties
  const waves = {
    wave1: {
      wave: 1,
      1: {
        name: "goblin",
        level: "lvl1",
      },
      2: {
        name: "arrow",
        level: "lvl1",
      },
      12: {
        name: "goblin",
        level: "lvl2",
      },
      20: {
        name: "goblin",
        level: "lvl2",
      },
      25: {
        name: "goblin",
        level: "lvl2",
      },
    },
  };

  //spawns entities based on wave
  function spawner(currentWave, currentTurn) {
    let EntityType = entityList[currentWave[currentTurn].name];
    let EntityLevel =
      entityList[currentWave[currentTurn].name].levels[
        currentWave[currentTurn].level
      ];
    let entityID = currentWave[currentTurn].name + currentTurn;
    entityID = new Entity(EntityType, EntityLevel, activeEntities, entityID);
  }

  //function to set amount of turns to play
  function amountOfTurns(waveLength, round) {
    let currentTurn = 1;
    let currentWave = waves[round];
    while (currentTurn <= waveLength) {
      if (currentWave[currentTurn] !== undefined) {
        spawner(currentWave, currentTurn);
      }
      nextTurn(currentTurn);
      currentTurn++;
    }
    console.log("Wave over");
  }

  amountOfTurns(40, "wave1");
  //NEED TO USE STATE TO GET BUTTON WORKING
  return <></>;
}
