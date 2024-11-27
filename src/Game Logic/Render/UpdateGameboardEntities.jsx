import { comparePosition, toLetter, onBoard } from "../Tools.jsx";
import EntityList from "../Lists/EntityList.jsx";
import GroundList from "../Lists/GroundList.jsx";
export function updateGameboardEntities(gamestate) {
  let entityList = EntityList;
  let groundList = GroundList;
  let entityBoard = gamestate.active.entityBoard;
  let projectileBoard = gamestate.active.projectileBoard;
  let groundBoard = gamestate.active.groundBoard;
  let fluidBoard = gamestate.active.fluidBoard;
  let effectBoard = gamestate.active.effectBoard;
  let gameboardWidth = gamestate.settings.gameboardWidth;
  let gameboardHeight = gamestate.settings.gameboardHeight;
  let renderWidth = gamestate.settings.renderWidth;
  let renderWidthMin = gamestate.settings.renderWidthMin;
  let renderHeight = gamestate.settings.renderHeight;
  let renderHeightMin = gamestate.settings.renderHeightMin;
  let selectedCell = gamestate.input.selectedCell;
  let currentInput = gamestate.input.currentInput;
  let cellCursorPosition = gamestate.input.cellCursorPosition;
  let cellWidth = gamestate.render.cellWidth;
  let cellHeight = gamestate.render.cellHeight;

  let grid = [];
  if (renderHeight.current > gameboardHeight.current) {
    renderHeight.current = gameboardHeight.current;
  }
  if (renderWidth.current > gameboardWidth.current) {
    renderWidth.current = gameboardWidth.current;
  }
  let heightMin = renderHeightMin.current;
  let height = renderHeight.current;
  let widthMin = renderWidthMin.current;
  let width = renderWidth.current;
  for (let h = heightMin; h <= height; h++) {
    let subGrid = [];
    for (let w = widthMin; w <= width; w++) {
      subGrid.push(cellType(w, h));
    }
    grid.push(subGrid);
  }
  return grid;

  function cellType(w, h) {
    let style = {
      width: cellWidth.current + "px",
      height: cellHeight.current + "px",
      "--cell-select-width": cellWidth.current + "px",
      "--cell-select-height": cellHeight.current + "px",
    };
    if (selectedCell.current !== undefined) {
      selectedCell.current.setSelectionRange(
        cellCursorPosition.current,
        cellCursorPosition.current
      );
      if (currentInput.current !== "") {
        let inputPosition = selectedCell.current.id.split("x");
        inputPosition[0] = parseInt(inputPosition[0]);
        inputPosition[1] = parseInt(inputPosition[1]);
        if (comparePosition(inputPosition, [w, h])) {
          return [w + "x" + h, currentInput.current, style];
        }
      }
    }
    if (w === widthMin) {
      return firstColumnCell(w, h);
    }
    if (h === heightMin) {
      return firstRowCell(w, h);
    }
    let cell = onBoard(effectBoard.current, [w, h]);
    if (cell !== undefined) {
      return effectCell(cell, w, h, style);
    }
    cell = onBoard(entityBoard.current, [w, h]);
    if (cell !== undefined) {
      return entityCell(cell, w, h, style);
    }
    cell = onBoard(groundBoard.current, [w, h]);
    if (cell !== undefined) {
      return groundCell(cell, w, h, style);
    }
    cell = onBoard(projectileBoard.current, [w, h]);
    if (cell !== undefined) {
      return projectileCell(cell, w, h, style);
    }
    cell = onBoard(fluidBoard.current, [w, h]);
    if (cell !== undefined) {
      return fluidCell(cell, w, h, style);
    }
    return blankCell(w, h, style);
  }

  function firstColumnCell(w, h) {
    if (h === renderHeightMin.current) {
      let style = {
        width: "50px",
        height: cellHeight.current + "px",
        "--cell-select-width": 50 + "px",
        "--cell-select-height": cellHeight.current + "px",
        boxShadow: "inset -1px 0px 0px #404040, inset 0px -2px 0px #404040",
        left: "0px",
        position: "sticky",
        zIndex: "1000",
      };
      return [w + "x" + h, "", style, "0", w, h];
    } else {
      let style = {
        textAlign: "center",
        width: "50px",
        height: cellHeight.current + "px",
        "--cell-select-width": 50 + "px",
        "--cell-select-height": cellHeight.current + "px",
        boxShadow: "inset -1px 0px 0px #404040",
        color: "#404040",
        left: "0px",
        position: "sticky",
        zIndex: "1000",
      };
      return [w + "x" + h, h + " ", style, "", w, h];
    }
  }

  function firstRowCell(w, h) {
    let style = {
      width: cellWidth.current + "px",
      height: cellHeight.current + "px",
      "--cell-select-width": cellWidth.current + "px",
      "--cell-select-height": cellHeight.current + "px",
      textAlign: "center",
      color: "#404040",
      boxShadow: "inset 0px -2px 0px #404040",
    };
    return [w + "x" + h, toLetter(w - 1) + " ", style, "0", w, h];
  }

  function blankCell(w, h, style) {
    return [w + "x" + h, "", style, "", w, h];
  }

  function effectCell(effect, w, h, style) {
    style.backgroundColor = effect.style.backgroundColor;
    style.color = effect.style.color;
    style.fontStyle = effect.style.fontStyle;
    if (effect.symbol === "") {
      if (onBoard(entityBoard.current, effect.position) !== undefined) {
        return entityCell(
          onBoard(entityBoard.current, effect.position),
          w,
          h,
          style
        );
      }
      if (onBoard(fluidBoard.current, effect.position) !== undefined) {
        return fluidCell(
          onBoard(fluidBoard.current, effect.position),
          w,
          h,
          style
        );
      }
    }
    return [w + "x" + h, effect.symbol, style, "", w, h];
  }

  function entityCell(entity, w, h, style) {
    let cellText = "";
    if (entity.enemy) {
      style.color = "darkRed";
    } else {
      style.color = "darkGreen";
    }
    if (entity.type === "blob") {
      blobHealthBar(entity, style);
      blobLine(entity, style);
    } else {
      attackBar(entity, style);
      entityHealthBar(entity, style);
      entityLine(style);
      cellText = entity.type + entity.lvl + " (hp: " + entity.hp + ")";
      if (entity.inFluid) {
        inFluid(entity, style);
      } else {
        style.fontStyle = "normal";
      }
    }
    return [w + "x" + h, cellText, style, "", w, h];

    function attackBar(currentEntity, style) {
      let maxWidth = cellWidth.current;
      let percentage = currentEntity.rateCharge / currentEntity.rate;
      let currentWidth = maxWidth * percentage;
      if (currentEntity.enemy) {
        style.boxShadow = "inset " + -currentWidth + "px 0px 0px 0px #0000001e";
      } else {
        style.boxShadow = "inset " + currentWidth + "px 0px 0px 0px #0000001e";
      }
    }

    function entityHealthBar(entity, style) {
      let percentage =
        entity.hp / entityList[entity.type].lvls["lvl" + entity.lvl].hp;
      let color;
      if (entity.enemy) {
        color = "rgb(139 0 0 /" + (1 - percentage / 1.5) + ")";
      } else {
        color = "rgb(2 48 32 /" + (1 - percentage / 1.5) + ")";
      }
      style.boxShadow +=
        ",inset " +
        cellWidth.current +
        "px " +
        cellHeight.current +
        "px 0px 0px " +
        color;
    }

    function entityLine(style) {
      style.boxShadow += ",inset 1px 0px 0px " + style.color;
      style.boxShadow += ",inset -1px 0px 0px " + style.color;
      style.boxShadow += ",inset 0px 1px 0px " + style.color;
      style.boxShadow += ",inset 0px -1px 0px " + style.color;
    }

    function blobHealthBar(entity, style) {
      let percentage = entity.hp / 20;
      let color;
      if (entity.enemy) {
        color = "rgb(139 0 0 /" + percentage + ")";
      } else {
        color = "rgb(2 48 32 /" + percentage + ")";
      }
      style.boxShadow =
        "inset " +
        cellWidth.current +
        "px " +
        cellHeight.current +
        "px 0px 0px " +
        color;
    }

    function blobLine(blob, style) {
      if (entity.hp === entity.maxHp) {
        return;
      }
      let color = style.color;
      let entityAbove = onBoard(entityBoard.current, [
        blob.position[0],
        blob.position[1] - 1,
      ]);
      let entityLeft = onBoard(entityBoard.current, [
        blob.position[0] - 1,
        blob.position[1],
      ]);
      let entityRight = onBoard(entityBoard.current, [
        blob.position[0] + 1,
        blob.position[1],
      ]);
      let entityBelow = onBoard(entityBoard.current, [
        blob.position[0],
        blob.position[1] + 1,
      ]);
      if (entityAbove === undefined || entityAbove.type !== blob.type) {
        style.boxShadow += ",inset 0px 2px 0px " + color;
      }
      if (
        (entityLeft === undefined || entityLeft.type !== blob.type) &&
        blob.position[0] - 1 !== 0
      ) {
        style.boxShadow += ",inset 2px 0px 0px " + color;
      }
      if (
        (entityRight === undefined || entityRight.type !== blob.type) &&
        blob.position[0] < gameboardWidth.current
      ) {
        style.boxShadow += ",inset -2px 0px 0px " + color;
      }
      if (
        (entityBelow === undefined || entityBelow.type !== blob.type) &&
        blob.position[1] < gameboardHeight.current
      ) {
        style.boxShadow += ",inset 0px -3px 0px " + color;
      }
    }
  }

  function groundCell(ground, w, h, style) {
    groundLine(ground, style);
    groundHealthBar(ground, style);
    let text = "";
    if (ground.type === "corpse") {
      text = "corpse";
      style.fontStyle = "bold";
      if (ground.enemy) {
        style.color = "darkRed";
      } else style.color = "darkGreen";
    }
    return [w + "x" + h, text, style, "", w, h];

    function groundLine(ground, style) {
      if (
        ground.falling ||
        ground.fallSpeed > ground.fallCharge ||
        ground.type === "corpse"
      ) {
        return;
      }
      let made;
      let groundAbove = onBoard(groundBoard.current, [
        ground.position[0],
        ground.position[1] - 1,
      ]);
      let groundLeft = onBoard(groundBoard.current, [
        ground.position[0] - 1,
        ground.position[1],
      ]);
      let groundRight = onBoard(groundBoard.current, [
        ground.position[0] + 1,
        ground.position[1],
      ]);
      if (
        groundAbove === undefined ||
        (groundAbove !== undefined && groundAbove.type === "corpse")
      ) {
        style.boxShadow = "inset 0px 2px 0px grey";
        made = true;
      }
      if (
        (groundLeft === undefined && ground.position[0] - 1 !== 0) ||
        (groundLeft !== undefined && groundLeft.type === "corpse")
      ) {
        if (!made) {
          style.boxShadow = "inset 2px 0px 0px grey";
          made = true;
        } else {
          style.boxShadow += ",inset 2px 0px 0px grey";
        }
      }
      if (
        (groundRight === undefined &&
          ground.position[0] < gameboardWidth.current) ||
        (groundRight !== undefined && groundRight.type === "corpse")
      ) {
        if (!made) {
          style.boxShadow = "inset -2px 0px 0px grey";
          made = true;
        } else {
          style.boxShadow += ",inset -2px 0px 0px grey";
        }
      }
    }

    function groundHealthBar(ground, style) {
      let color =
        "rgb(150 150 150 /" +
        (1 - ground.hp / groundList[ground.type].hp / 2) +
        ")";
      if (ground.type === "corpse") {
        if (ground.enemy) {
          color =
            "rgb(139 0 0 /" +
            (1 - ground.hp / groundList[ground.type].hp / 4) +
            ")";
        } else {
          color =
            "rgb(2 48 32 /" +
            (1 - ground.hp / groundList[ground.type].hp / 4) +
            ")";
        }
      }
      if (style.boxShadow === undefined) {
        style.boxShadow =
          "inset " +
          cellWidth.current +
          "px " +
          cellHeight.current +
          "px 0px 0px " +
          color;
      } else
        style.boxShadow +=
          ",inset " +
          cellWidth.current +
          "px " +
          cellHeight.current +
          "px 0px 0px " +
          color;
    }
  }

  function projectileCell(projectile, w, h, style) {
    if (projectile.inFluid) {
      inFluid(projectile, style);
    }
    return [w + "x" + h, projectile.symbol, style, "", w, h];
  }

  function fluidCell(fluid, w, h, style) {
    style.backgroundColor = "lightBlue";
    fluidLine(fluid, style);
    return [w + "x" + h, "", style, "", w, h];

    function fluidLine(fluid, style) {
      if (fluid.falling || fluid.fallSpeed > fluid.fallCharge) {
        return;
      }
      style.boxShadow = "";
      let made;
      let fluidAbove = onBoard(fluidBoard.current, [
        fluid.position[0],
        fluid.position[1] - 1,
      ]);
      let fluidLeft = onBoard(fluidBoard.current, [
        fluid.position[0] - 1,
        fluid.position[1],
      ]);
      let fluidRight = onBoard(fluidBoard.current, [
        fluid.position[0] + 1,
        fluid.position[1],
      ]);
      let groundLeft = onBoard(groundBoard.current, [
        fluid.position[0] - 1,
        fluid.position[1],
      ]);
      let groundRight = onBoard(groundBoard.current, [
        fluid.position[0] + 1,
        fluid.position[1],
      ]);
      if (fluidAbove === undefined) {
        style.boxShadow = "inset 0px 1px 0px blue";
        made = true;
      }
      if (fluidLeft === undefined && groundLeft === undefined) {
        if (!made) {
          style.boxShadow = "inset 1px 0px 0px blue";
          made = true;
        } else {
          style.boxShadow += ",inset 1px 0px 0px blue";
        }
      }
      if (fluidRight === undefined && groundRight === undefined) {
        if (!made) {
          style.boxShadow = "inset -1px 0px 0px blue";
          made = true;
        } else {
          style.boxShadow += ",inset -1px 0px 0px blue";
        }
      }
    }
  }

  function inFluid(entity, style) {
    let fluidAbove = onBoard(fluidBoard.current, [
      entity.position[0],
      entity.position[1] - 1,
    ]);
    let fluidLeft = onBoard(fluidBoard.current, [
      entity.position[0] - 1,
      entity.position[1],
    ]);
    let fluidRight = onBoard(fluidBoard.current, [
      entity.position[0] + 1,
      entity.position[1],
    ]);
    let groundLeft = onBoard(groundBoard.current, [
      entity.position[0] - 1,
      entity.position[1],
    ]);
    let groundRight = onBoard(groundBoard.current, [
      entity.position[0] + 1,
      entity.position[1],
    ]);
    if (fluidAbove === undefined) {
      style.boxShadow += ",inset 0px 1px 0px blue";
    }
    if (fluidLeft === undefined && groundLeft === undefined) {
      style.boxShadow += ",inset 1px 0px 0px blue";
    }
    if (fluidRight === undefined && groundRight === undefined) {
      style.boxShadow += ",inset -1px 0px 0px blue";
    }
    style.fontStyle = "italic";
    style.backgroundColor = "lightBlue";
  }
}
