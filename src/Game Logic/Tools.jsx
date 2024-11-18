export function cellContents(position, active) {
  let entityInCell = active.activeEntities.current.find((entity) =>
    comparePosition(entity.position, position)
  );
  let groundInCell = active.activeGround.current.find((ground) =>
    comparePosition(ground.position, position)
  );
  let fluidInCell = active.activeFluid.current.find((fluid) =>
    comparePosition(fluid.position, position)
  );
  let projectileInCell = active.activeProjectiles.current.find((projectile) =>
    comparePosition(projectile.position, position)
  );
  let effectInCell = active.activeEffects.current.find((effect) =>
    comparePosition(effect.position, position)
  );
  let inCell = {
    entity: entityInCell,
    ground: groundInCell,
    fluid: fluidInCell,
    projectile: projectileInCell,
    effect: effectInCell,
  };
  return inCell;
}

export function cellGround(position, active) {
  return active.find((ground) => comparePosition(ground.position, position));
}
export function cellEntity(position, active) {
  return active.find((entity) => comparePosition(entity.position, position));
}
export function cellProjectile(position, active) {
  return active.find((projectile) =>
    comparePosition(projectile.position, position)
  );
}
export function cellFluid(position, active) {
  return active.find((fluid) => comparePosition(fluid.position, position));
}
export function cellEffect(position, active) {
  return active.find((effect) => comparePosition(effect.position, position));
}

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
