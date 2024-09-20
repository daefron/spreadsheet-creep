export default function Engine() {
  //object that holds default values of entities
  const entityList = {
    goblin: {
      type: "goblin",
      enemy: true,
      levels: {
        lvl1: {
          lvl: 1,
          hp: 6,
          dmg: 2,
          range: 1,
          rate: 2,
          speed: 2,
          value: 1,
          exp: 1,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 3,
          range: 1,
          rate: 2,
          speed: 2,
          value: 3,
          exp: 2,
        },
      },
    },
    arrow: {
      type: "arrow",
      enemy: false,
      levels: {
        lvl1: {
          lvl: 1,
          hp: 10,
          dmg: 3,
          range: 3,
          rate: 2,
          speed: 0,
          value: 5,
          neededExp: 3,
        },
        lvl2: {
          lvl: 2,
          hp: 12,
          dmg: 4,
          range: 3,
          rate: 2,
          speed: 0,
          value: 10,
          neededExp: 6,
        },
        lvl3: {
          lvl: 3,
          hp: 14,
          dmg: 5,
          range: 3,
          rate: 2,
          speed: 0,
          value: 15,
          neededExp: 30,
        },
      },
    },
  };

  //objects holding wave properties
  const waves = {
    wave1: {
      wave: 1,
      1: {
        name: "goblin",
        level: "lvl1",
        position: "J1",
      },
      2: {
        name: "arrow",
        level: "lvl1",
        position: "A1",
      },
      3: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      14: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      19: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      27: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      30: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      40: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
      41: {
        name: "goblin",
        level: "lvl2",
        position: "J1",
      },
    },
  };

  //array that holds active entities
  let activeEntities = [];

  //current money
  let bank = 0;

  //stores dead bodies
  let graveyard = [];

  //function that creates new active entities
  function Entity(type, level, position, activeEntities, name) {
    this.name = name;
    this.type = type.type;
    this.position = position;
    this.level = level.lvl;
    this.hp = level.hp;
    this.dmg = level.dmg;
    this.range = level.range;
    this.rate = level.rate;
    let neededRate = level.rate;
    this.rateCharge = neededRate;
    this.speed = level.speed;
    let neededSpeed = level.speed;
    this.speedCharge = neededSpeed;
    this.enemy = type.enemy;
    this.value = level.value;
    if (this.enemy == false) {
      this.currentExp = 0;
      this.neededExp = level.neededExp;
    } else {
      this.exp = level.exp;
    }
    activeEntities.push(this);
    console.log(this.name + " spawned at " + this.position + ".");
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

  //function to update the gameboard entities in the gameboard
  function gameboardUpdater() {
    activeEntities.forEach((entity) => {
      gameboard.forEach((value, location) => {
        if (entity.position == location && location !== undefined) {
          gameboard.set(location, entity);
        }
      });
    });
  }

  //function to tell entities what to do on their turn
  function entityTurn(currentEntity) {
    let turnTaken = false;
    let rangeCells = [];
    currentEntity.rateCharge++;
    currentEntity.speedCharge++;
    let oldPosition = currentEntity.position;
    if (currentEntity.enemy == false) {
      var rangeLetter = letterAdder(oldPosition.charAt(0));
      var newPosition =
        letterAdder(oldPosition.charAt(0)) + oldPosition.charAt(1);
    } else {
      var rangeLetter = letterSubtractor(oldPosition.charAt(0));
      var newPosition =
        letterSubtractor(oldPosition.charAt(0)) + oldPosition.charAt(1);
    }
    for (let i = currentEntity.range; i > 0; i--) {
      rangeCells.push(rangeLetter + oldPosition.charAt(1));
      if (currentEntity.enemy == false) {
        rangeLetter = letterAdder(rangeLetter);
      } else {
        rangeLetter = letterSubtractor(rangeLetter);
      }
    }
    rangeCells.forEach((rangeTarget) => {
      if (
        gameboard.get(rangeTarget) !== undefined &&
        gameboard.get(rangeTarget).enemy !== currentEntity.enemy
      ) {
        activeEntities.forEach((entity) => {
          if (
            entity.position == rangeTarget &&
            currentEntity.rateCharge >= currentEntity.rate &&
            gameboard.get(rangeTarget).enemy !== currentEntity.enemy
          ) {
            currentEntity.rateCharge = 0;
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
      } else if (
        gameboard.get(newPosition) == undefined &&
        currentEntity.speedCharge >= currentEntity.speed &&
        currentEntity.speed !== 0 &&
        turnTaken == false
      ) {
        currentEntity.speedCharge = 0;
        gameboard.set(oldPosition, undefined);
        currentEntity.position = newPosition;
        gameboardUpdater();
        console.log(currentEntity.name + " moved to " + currentEntity.position);
        turnTaken = true;
      }
    });
    if (currentEntity.rateCharge < currentEntity.rate && turnTaken == false) {
      console.log(currentEntity.name + " charging attack.");
    } else if (
      currentEntity.speedCharge < currentEntity.speed &&
      currentEntity.speed !== 0
    ) {
      console.log(currentEntity.name + " charging movement.");
    } else if (turnTaken == false) {
      console.log(currentEntity.name + " did nothing.");
    }
  }

  //checks to see if entity dies
  function healthChecker(entity, currentEntity) {
    if (entity.hp <= 0) {
      currentEntity.rateCharge = 0;
      console.log(entity.name + " was killed by " + currentEntity.name);
      if (entity.enemy == true) {
        bank = bank + entity.value;
        expTracker(entity, currentEntity);
        console.log(
          currentEntity.name +
            " EXP: " +
            currentEntity.currentExp +
            "/" +
            currentEntity.neededExp
        );
        console.log("Total money: $" + bank);
      }
      graveyard.push(activeEntities.splice(activeEntities.indexOf(entity), 1));
      gameboard.forEach((value, location) => {
        if (entity.position == location) {
          gameboard.set(location, undefined);
        }
      });
    }
  }

  //adds and checks exp on kill
  function expTracker(entity, currentEntity) {
    currentEntity.currentExp = currentEntity.currentExp + entity.exp;
    if (currentEntity.currentExp >= currentEntity.neededExp) {
      levelUp(currentEntity);
    }
  }

  //applies level up for friendly entity
  function levelUp(currentEntity) {
    let oldProperties = Object.entries(currentEntity);
    currentEntity.level++;
    let newLevel = currentEntity.level;
    let newProperties = Object.entries(
      entityList[currentEntity.type].levels["lvl" + newLevel]
    );
    oldProperties.forEach((oldProperty) => {
      newProperties.forEach((newProperty) => {
        if (
          oldProperty[0] == newProperty[0] &&
          oldProperty[1] !== newProperty[1]
        ) {
          currentEntity[oldProperty[0]] = newProperty[1];
        }
      });
    });
    console.log(
      currentEntity.name + " has leveled up to level " + currentEntity.level
    );
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

  //spawns entities based on wave
  function spawner(currentWave, currentTurn) {
    let entityType = entityList[currentWave[currentTurn].name];
    let entityLevel =
      entityList[currentWave[currentTurn].name].levels[
        currentWave[currentTurn].level
      ];
    let position = currentWave[currentTurn].position;
    let entityID = currentWave[currentTurn].name + currentTurn;
    entityID = new Entity(
      entityType,
      entityLevel,
      position,
      activeEntities,
      entityID
    );
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

  //function to initiate next turn actions
  function nextTurn(currentTurn) {
    activeEntities.forEach((entity) => {
      // if (entity.enemy == true) {
      //   enemyTurn(entity);
      // } else if (entity.enemy == false) {
      //   friendlyTurn(entity);
      // }
      entityTurn(entity);
    });
    console.log("Turn " + currentTurn + " over.");
  }

  gameboardMaker();
  amountOfTurns(100, "wave1");
  //NEED TO USE STATE TO GET BUTTON WORKING
  return <></>;
}
