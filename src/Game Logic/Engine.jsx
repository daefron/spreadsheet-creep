export default function Engine() {
  //hobject that holds values of entities
  const entityList = {
    goblin: {
      name: "Goblin",
      enemy: true,
      newPosition: undefined,
      levels: {
        lvl1: {
          name: "Level 1",
          hp: 3,
          dmg: 1,
          range: 1,
          rate: 2,
          speed: 1,
        },
        lvl2: {
          name: "Level 2",
          hp: 5,
          dmg: 2,
          range: 1,
          rate: 2,
          speed: 1,
        },
      },
    },
    arrow: {
      name: "Arrow",
      enemy: false,
      newPosition: undefined,
      levels: {
        lvl1: {
          name: "Level 1",
          hp: 5,
          dmg: 2,
          range: 3,
          rate: 2,
          speed: 0,
        },
        lvl2: {
          name: "Level 2",
          hp: 8,
          dmg: 4,
          range: 4,
          rate: 2,
          speed: 0,
        },
      },
    },
  };

  //array that holds active entities
  let activeEntities = [];

  //function that creates new entities
  function Entity(type, level, position, activeEntities) {
    this.name = type.name;
    this.level = level.name;
    this.hp = level.hp;
    this.dmg = level.dmg;
    this.range = level.range;
    this.rate = level.rate;
    this.speed = level.speed;
    this.enemy = type.enemy;
    this.position = position;
    activeEntities.push(this);
    gameboardUpdater(activeEntities, gameboard);
  }

  //default positions for goblins to spawn (far side of map)
  const goblinSpawn = "J1";

  
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
    console.log(gameboard);
    return gameboard;
  }
  
  //function to check if the space to the left is free, and if so, moves the enemy
  function enemyMovement(currentEntity) {
    let oldPosition = currentEntity.position;
    let newPosition = letterChecker(oldPosition) + oldPosition.charAt(1);
    if (gameboard.get(newPosition) == undefined) {
      gameboard.set(oldPosition, undefined);
      currentEntity.position = newPosition;
      gameboardUpdater(activeEntities, gameboard);
    } else console.log("position taken");
  }
  nextTurn(activeEntities);
  
  //function to initiate next turn actions
  function nextTurn(activeEntities) {
    activeEntities.forEach((entity) => {
      if (entity.enemy == true) {
        enemyMovement(entity);
      }
    });
  }
  
  //lazy function to go back one in the alphabet
  function letterChecker(position) {
    let letter = position.charAt(0);
    if (letter == "A") {
      letter = "J";
    } else if (letter == "B") {
      letter = "A";
    } else if (letter == "C") {
      letter = "B";
    } else if (letter == "D") {
      letter = "C";
    } else if (letter == "E") {
      letter = "D";
    } else if (letter == "F") {
      letter = "E";
    } else if (letter == "G") {
      letter = "F";
    } else if (letter == "H") {
      letter = "G";
    } else if (letter == "I") {
      letter = "H";
    } else if (letter == "J") {
      letter = "I";
    }
    return letter;
  }

  //entities to test the Entity object creator
  const testGoblin = new Entity(
    entityList.goblin,
    entityList.goblin.levels.lvl2, goblinSpawn,
    activeEntities
  );
  const testArrow = new Entity(
    entityList.arrow,
    entityList.arrow.levels.lvl2, "B1",
    activeEntities
  );
  
  return <></>;
}
