import Entity from "./Classes/Entity.jsx";
import EntityList from "./Lists/EntityList";
import { cellContents, toBoard } from "./Tools.jsx";
let entityList = EntityList;
export function clickSelect(e, gameState) {
  let selectedCell = gameState.input.selectedCell;
  let currentInput = gameState.input.currentInput;
  let cellTyping = gameState.input.cellTyping;
  if (e.target === selectedCell.current) {
    e.target.readOnly = false;
    cellTyping.current = true;
  } else if (e.target.className === "boardCell") {
    if (selectedCell.current !== undefined) {
      selectedCell.current.readOnly = true;
    }
    selectedCell.current = e.target;
    currentInput.current = "";
  }
}
//gives the user input a spreadsheet like experience
export function keyboardSelect(e, gameState) {
  let gameboardWidth = gameState.settings.gameboardWidth;
  let gameboardHeight = gameState.settings.gameboardHeight;
  let selectedCell = gameState.input.selectedCell;
  let currentInput = gameState.input.currentInput;
  let cellTyping = gameState.input.cellTyping;
  if (selectedCell.current === undefined) {
    return;
  }
  let position = selectedCell.current.id.split("x");
  position[0] = parseInt(position[0]);
  position[1] = parseInt(position[1]);
  let newPosition = keyPosition(e.key, position, e);
  if (!newPosition) {
    return;
  }
  if (
    newPosition === undefined ||
    newPosition[0] === 0 ||
    newPosition[0] > gameboardWidth.current ||
    newPosition[1] === 0 ||
    newPosition[1] > gameboardHeight.current
  ) {
    return;
  }
  selectedCell.current.readOnly = true;
  let newID = newPosition[0] + "x" + newPosition[1];
  selectedCell.current = document.getElementById(newID);
  selectedCell.current.focus();
  function keyPosition(keyPressed, position, e) {
    if (keyPressed === "ArrowUp") {
      if (cellTyping.current) {
        return;
      }
      e.preventDefault();
      cellTyping.current = false;
      return [position[0], position[1] - 1];
    }
    if (keyPressed === "ArrowDown") {
      if (cellTyping.current) {
        return;
      }
      e.preventDefault();
      cellTyping.current = false;
      return [position[0], position[1] + 1];
    }
    if (keyPressed === "ArrowLeft") {
      if (cellTyping.current) {
        return;
      }
      e.preventDefault();
      cellTyping.current = false;
      return [position[0] - 1, position[1]];
    }
    if (keyPressed === "ArrowRight") {
      if (cellTyping.current) {
        return;
      }
      e.preventDefault();
      cellTyping.current = false;
      return [position[0] + 1, position[1]];
    }
    if (keyPressed === "Enter") {
      if (cellTyping.current) {
        cellTyping.current = false;
        friendlyInput(position, gameState);
        currentInput.current = "";
        return [position[0], position[1] + 1];
      }
      if (typingChecker(position, gameState)) {
        selectedCell.current.readOnly = false;
        cellTyping.current = true;
        return;
      }
      return;
    }
    if (keyPressed === "Tab") {
      e.preventDefault();
      cellTyping.current = false;
      friendlyInput(position, gameState);
      currentInput.current = "";
      return [position[0] + 1, position[1]];
    }
    if (keyPressed.length === 1 || keyPressed === "space") {
      if (typingChecker(position, gameState)) {
        cellTyping.current = true;
        selectedCell.current.readOnly = false;
        if (keyPressed === "space") {
          currentInput.current += " ";
        }
        currentInput.current += keyPressed;
      } else e.preventDefault();
    }
    if (keyPressed === "Backspace") {
      currentInput.current = currentInput.current.slice(0, -1);
    } else return false;
  }
}

//checks to see if user input is in space of other entity
function typingChecker(position, gameState) {
  let targetCell = cellContents(position, gameState.active);
  if (targetCell.ground === undefined && targetCell.entity === undefined) {
    return true;
  }
}

//parses user input into usable data
function friendlyInput(position, gameState) {
  let input = gameState.input.currentInput.current;
  let parsedType = "";
  let parsedLvl = "";
  let hitNumber = false;
  for (let i = 0; i < input.length; i++) {
    if (isNaN(input[i]) && !hitNumber) {
      parsedType = parsedType.concat(input[i]);
    } else parsedLvl = parsedLvl.concat(input[i]);
  }
  friendlySpawner(parsedType, position, parsedLvl, gameState);
}

//runs friendly through checks before spawning
function friendlySpawner(
  friendlyType,
  friendlyPosition,
  friendlyLvl,
  gameState
) {
  if (validFriendly(friendlyType, friendlyLvl, gameState.settings.gameMode)) {
    let friendlyCost = entityList[friendlyType].lvls["lvl" + friendlyLvl].value;
    if (bankChecker(friendlyCost, gameState.engine.bank)) {
      gameState.engine.bank -= friendlyCost;
      friendlyEntityMaker(
        friendlyType,
        friendlyPosition,
        friendlyLvl,
        gameState.engine.friendlyCount,
        gameState.active.activeEntities,
        gameState.active.entityBoard
      );
    }
  }
}

//determines if entity name and level are valid
function validFriendly(friendlyType, friendlyLvl, gameMode) {
  if (entityList[friendlyType] !== undefined) {
    if (entityList[friendlyType].lvls["lvl" + friendlyLvl] !== undefined) {
      if (gameMode.current === "sandbox") {
        return true;
      }
      if (!entityList[friendlyType].enemy) {
        return true;
      }
    }
  }
}

//determines if enough money in bank to spawn friendly
function bankChecker(friendlyCost, bank) {
  if (friendlyCost <= bank) {
    return true;
  }
}

//translates user input into data Entity maker can use
function friendlyEntityMaker(
  entityType,
  entityPosition,
  entitylvl,
  friendlyCount,
  activeEntities,
  entityBoard
) {
  let ID = friendlyCount.current + 1;
  friendlyCount.current = ID;
  entityType = entityList[entityType];
  entitylvl = entityType.lvls["lvl" + entitylvl];
  let entityID = entityType.type + friendlyCount.current;
  entityID = new Entity(entityType, entitylvl, entityPosition, entityID);
  toBoard(entityBoard.current, entityPosition, entityID);
  activeEntities.current.push(entityID);
}
