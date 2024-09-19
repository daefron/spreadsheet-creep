export default function Engine() {
  //object that holds default values of entities
  const entityList = {
    goblin: {
      name: "Goblin",
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
        },
        lvl2: {
          name: "Level 2",
          hp: 10,
          dmg: 2,
          range: 1,
          rate: 2,
          speed: 1,
          value: 2,
        },
      },
    },
    arrow: {
      name: "Arrow Turret",
      enemy: false,
      // POSITION TO BE DECIDED BY USER LATER
      position: "C1",
      levels: {
        lvl1: {
          name: "Level 1",
          hp: 5,
          dmg: 2,
          range: 3,
          rate: 2,
          speed: 0,
          value: 5,
        },
        lvl2: {
          name: "Level 2",
          hp: 10,
          dmg: 4,
          range: 4,
          rate: 2,
          speed: 0,
          value: 10,
        },
      },
    },
  };

  //array that holds active entities
  let activeEntities = [];

  //function that creates new active entities
  function Entity(type, level, activeEntities) {
    this.name = type.name;
    this.level = level.name;
    this.hp = level.hp;
    this.dmg = level.dmg;
    this.range = level.range;
    this.rate = level.rate;
    this.speed = level.speed;
    this.enemy = type.enemy;
    this.position = type.position;
    activeEntities.push(this);
    console.log(this.name + " spawned");
    gameboardUpdater(activeEntities, gameboard);
  }

  //function to make the gameboard grid
  let gameboard = new Map();
  function gameboardMaker(gameboard) {
    const boardWidth = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    for (let h = 1; h < 10; h++) {
      boardWidth.forEach((element) => gameboard.set(element + h));
    }
    return gameboard;
  }
  gameboardMaker(gameboard);

  //function to update the gameboard entities
  function gameboardUpdater(activeEntities, gameboard) {
    activeEntities.forEach((entity) => {
      gameboard.forEach((value, location) => {
        if (entity.position == location && location !== undefined) {
          gameboard.set(location, entity);
        }
      });
    });
    return gameboard;
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
            entity.name +
              " damaged " +
              currentEntity.dmg +
              " hp by " +
              currentEntity.name
          );
          healthChecker(entity, activeEntities, graveyard, gameboard);
        }
      });
    } else if (gameboard.get(newPosition) == undefined) {
      gameboard.set(oldPosition, undefined);
      currentEntity.position = newPosition;
      gameboardUpdater(activeEntities, gameboard);
      console.log(currentEntity.name + " moved to " + currentEntity.position);
    } else {
      console.log("position taken");
    }
  }

  function friendlyTurn(currentEntity) {
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
              entity.name +
                " damaged " +
                currentEntity.dmg +
                " hp by " +
                currentEntity.name
            );
            return healthChecker(entity, activeEntities, graveyard, gameboard);
          }
        });
      }
    });
    // console.log(currentEntity.name + " did nothing");
  }

  //stores dead bodies
  let graveyard = [];

  //checks to see if entity dies and if so, sends to graveyard
  function healthChecker(entity, activeEntities, graveyard, gameboard) {
    if (entity.hp <= 0) {
      console.log(entity.name + " died");
      graveyard.push(activeEntities.slice(activeEntities.indexOf(entity)));
      activeEntities.splice(activeEntities.indexOf(entity));
      gameboard.forEach((value, location) => {
        if (entity.position == location) {
          gameboard.set(location, undefined);
        }
      });
    }
  }

  //function to initiate next turn actions
  function nextTurn(activeEntities) {
    activeEntities.forEach((entity) => {
      if (entity.enemy == true) {
        enemyTurn(entity);
      } else if (entity.enemy == false) {
        friendlyTurn(entity);
      }
    });
    console.log("Turn over");
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

  //entities to test the Entity object creator
  const testGoblin = new Entity(
    entityList.goblin,
    entityList.goblin.levels.lvl2,
    activeEntities
  );
  const testArrow = new Entity(
    entityList.arrow,
    entityList.arrow.levels.lvl1,
    activeEntities
  );

  function amountOfTurns(amount, activeEntities) {
    for (let i = amount; i > 0; i--) {
      nextTurn(activeEntities);
    }
  }
  amountOfTurns(10, activeEntities);
  //NEED TO USE STATE TO GET BUTTON WORKING
  return <></>;
}
