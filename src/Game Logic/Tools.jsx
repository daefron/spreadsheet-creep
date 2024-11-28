export function direction(currentEntity) {
  if (currentEntity.enemy) {
    return currentEntity.position[0] - 1;
  }
  return currentEntity.position[0] + 1;
}

export function comparePosition(position1, position2) {
  if (position1[0] === position2[0] && position1[1] === position2[1]) {
    return true;
  }
  return false;
}

export function toLetter(position) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (position / letters.length >= 1) {
    let firstLetter = letters[parseInt(position / letters.length) - 1];
    let secondLetter =
      letters[position - parseInt(position / letters.length) * letters.length];
    return firstLetter + secondLetter;
  } else return letters[position];
}

export function toBoard(board, position, entity) {
  board[position[1]][position[0]] = entity;
}

export function onBoard(board, position) {
  return board[position[1]][position[0]];
}

export function moveBoard(board, position, entity) {
  board[entity.position[1]][entity.position[0]] = undefined;
  entity.position = position;
  board[position[1]][position[0]] = entity;
}

export function initialGameboard(gameboardHeight, gameboardWidth) {
  let grid = [];
  for (let h = 0; h <= gameboardHeight.current + 1; h++) {
    let subGrid = [];
    for (let w = 0; w <= gameboardWidth.current; w++) {
      subGrid.push();
    }
    grid.push(subGrid);
  }
  return grid;
}
