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

export function keyboardSelect(e, gameState) {
  let gameboardHeight = gameState.settings.gameboardHeight;
  let renderWidth = gameState.render.renderWidth;
  let renderHeight = gameState.render.renderHeight;
  let renderWidthMin = gameState.render.renderWidthMin;
  let renderHeightMin = gameState.render.renderHeightMin;
  let selectedCell = gameState.input.selectedCell;
  let currentInput = gameState.input.currentInput;
  let cellTyping = gameState.input.cellTyping;
  let cellSelectMoved = gameState.input.cellSelectMoved;
  let cellCursorPosition = gameState.input.cellCursorPosition;
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
  if (newPosition === undefined) {
    return;
  }
  if (
    newPosition[0] === -1 ||
    newPosition[0] > renderWidth.current ||
    newPosition[1] === -1
  ) {
    return;
  }
  if (newPosition[1] > renderHeight.current) {
    if (
      newPosition[1] > renderHeight.current &&
      renderHeight.current < gameboardHeight.current
    ) {
      renderHeight.current++;
      renderHeightMin.current++;
    } else {
      return;
    }
  }
  if (newPosition[0] === renderWidthMin.current) {
    if (renderWidthMin.current !== 0) {
      renderWidth.current--;
      renderWidthMin.current--;
      return;
    }
  }
  if (newPosition[1] === renderHeightMin.current) {
    if (renderHeightMin.current !== 0) {
      renderHeight.current--;
      renderHeightMin.current--;
      return;
    }
  }
  selectedCell.current.readOnly = true;
  let newID = newPosition[0] + "x" + newPosition[1];
  if (document.getElementById(newID) === null) {
    return;
  }
  selectedCell.current = document.getElementById(newID);
  selectedCell.current.focus();
  cellSelectMoved.current = true;

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
        cellCursorPosition.current--;
        return;
      }
      e.preventDefault();
      cellTyping.current = false;
      return [position[0] - 1, position[1]];
    }
    if (keyPressed === "ArrowRight") {
      if (cellTyping.current) {
        cellCursorPosition.current++;
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
    if (keyPressed.length === 1 || keyPressed === " ") {
      if (typingChecker(position, gameState)) {
        cellTyping.current = true;
        selectedCell.current.readOnly = false;
        if (keyPressed === " ") {
          sliceAtCursor(" ");
        } else {
          sliceAtCursor(keyPressed);
        }
      }
      return;
    }
    if (keyPressed === "Backspace") {
      sliceAtCursor("Backspace");
      return;
    }
    if (keyPressed === "Delete") {
      sliceAtCursor("Delete");
      return;
    }
  }

  function sliceAtCursor(character) {
    let cursorPosition = selectedCell.current.selectionStart;
    let firstHalf = currentInput.current.slice(0, cursorPosition);
    let secondHalf = currentInput.current.slice(
      cursorPosition,
      currentInput.current.length
    );
    if (character === "Backspace") {
      firstHalf = currentInput.current.slice(0, cursorPosition - 1);
      character = "";
      cellCursorPosition.current--;
    } else if (character === "Delete") {
      secondHalf = currentInput.current.slice(
        cursorPosition + 1,
        currentInput.current.length
      );
      character = "";
    } else {
      cellCursorPosition.current = cursorPosition + 1;
    }
    currentInput.current = firstHalf + character + secondHalf;
  }
}

function typingChecker(position, gameState) {
  let targetCell = cellContents(position, gameState.active);
  if (targetCell.ground === undefined && targetCell.entity === undefined) {
    return true;
  }
}

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

function friendlySpawner(
  friendlyType,
  friendlyPosition,
  friendlyLvl,
  gameState
) {
  if (validFriendly(friendlyType, friendlyLvl, gameState.settings.gameMode)) {
    let friendlyCost = entityList[friendlyType].lvls["lvl" + friendlyLvl].value;
    if (bankChecker(friendlyCost, gameState.engine.bank)) {
      gameState.engine.setBank(gameState.engine.bank - friendlyCost);
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

function bankChecker(friendlyCost, bank) {
  if (friendlyCost <= bank) {
    return true;
  }
}

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
