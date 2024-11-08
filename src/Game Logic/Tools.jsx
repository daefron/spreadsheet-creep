export function cellContents(position, activeHolder) {
  let entityInCell = activeHolder[0].find((entity) =>
    comparePosition(entity.position, position)
  );
  let groundInCell = activeHolder[2].find((ground) =>
    comparePosition(ground.position, position)
  );
  let fluidInCell = activeHolder[3].find((fluid) =>
    comparePosition(fluid.position, position)
  );
  let projectileInCell = activeHolder[1].find((projectile) =>
    comparePosition(projectile.position, position)
  );
  let effectInCell = activeHolder[4].find((effect) =>
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
  return letters[position];
}
