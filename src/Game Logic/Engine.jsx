export default function Engine() {

  //hobject that holds values of entities
  const entityList = {
    goblin: {
      name: "Goblin",
      enemy: true,
      position: "B1",
      newPosition: undefined,
      lvl1: {
        hp: 3,
        dmg: 1,
        range: 1,
        rate: 2,
        speed: 1,
      },
      lvl2: {
        hp: 5,
        dmg: 2,
        range: 1,
        rate: 2,
        speed: 1,
      },
    },
    arrow: {
      name: "Arrow",
      enemy: false,
      position: "E1",
      newPosition: undefined,
      lvl1: {
        hp: 5,
        dmg: 2,
        range: 3,
        rate: 2,
        speed: 0,
      },
      lvl2: {
        hp: 8,
        dmg: 4,
        range: 4,
        rate: 2,
        speed: 0,
      },
    },
  };

  //array that holds active entities
  let activeEntities = [entityList.goblin, entityList.arrow];

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
  gameboardUpdater(activeEntities, gameboard);

  //function to check if the space to the left is free, and if so, moves the enemy
  function enemyMovement(currentEntity) {
    let oldPosition = currentEntity.position;
    let newPosition =
      letterChecker(oldPosition) + oldPosition.charAt(1);
    if (gameboard.get(newPosition) == undefined) {
      gameboard.set(oldPosition, undefined);
      currentEntity.position = newPosition;
      gameboardUpdater(activeEntities, gameboard);
    } else console.log("position taken");
  }
  nextTurn(activeEntities);

  //function to initiate next turn actions
  function nextTurn(activeEntities) {
    activeEntities.forEach(entity => {
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

  return (
    <>
    </>
  );
}
