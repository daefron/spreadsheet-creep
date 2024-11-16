import { useState, useEffect, useRef } from "react";
import {
  cellEntity,
  cellProjectile,
  cellGround,
  cellFluid,
  cellEffect,
  comparePosition,
  toLetter,
} from "./Tools.jsx";
import { keyboardSelect, clickSelect } from "./Input.jsx";
import { engine } from "./Engine.jsx";
import EntityList from "./Lists/EntityList.jsx";
import GroundList from "./Lists/GroundList.jsx";

export default function engineOutput() {
  const activeEntities = useRef([]);
  const activeProjectiles = useRef([]);
  const activeGround = useRef([]);
  const activeFluid = useRef([]);
  const activeEffects = useRef([]);
  const activeHolder = useRef({
    activeEntities: activeEntities,
    activeProjectiles: activeProjectiles,
    activeGround: activeGround,
    activeFluid: activeFluid,
    activeEffects: activeEffects,
  });
  const friendlyGraveyard = useRef([]);
  const enemyGraveyard = useRef([]);
  const groundGraveyard = useRef([]);
  const fluidGraveyard = useRef([]);
  const [bank, setBank] = useState(10000);
  const enemySpawnCount = useRef(0);
  const friendlySpawnCount = useRef(0);
  const lastEnemySpawnTime = useRef(0);
  const lastFriendlySpawnTime = useRef(0);
  const gameTimer = useRef();
  const renderTimer = useRef();
  const gameboardWidth = useRef(11);
  const gameboardHeight = useRef(31);
  const groundLevel = useRef(15);
  const groundRoughness = useRef(5);
  const waterLevel = useRef(1);
  const renderSpeed = useRef(5);
  const gameSpeed = useRef(1);
  const totalSpawns = useRef(30);
  const spawnSpeed = useRef(1);
  const kingHP = useRef(20);
  const gameMode = useRef("blob");
  const friendlyCount = useRef(1);
  const terrainIsFalling = useRef(false);
  const projectileCount = useRef(0);
  const selectedCell = useRef();
  const cellTyping = useRef(false);
  const currentInput = useRef("");
  const cellWidth = useRef(150);
  const cellHeight = useRef(21);
  const gameboardTime = useRef(0);
  const entityTime = useRef(0);
  const projectileTime = useRef(0);
  const groundTime = useRef(0);
  const fluidTime = useRef(0);
  const effectTime = useRef(0);
  const testTime = useRef(0);
  const second = useRef(0);
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const [settingsState, setSettingsState] = useState("none");
  let entityList = EntityList;
  let groundList = GroundList;

  function gameStatePacker() {
    return {
      active: {
        activeEntities: activeEntities,
        activeProjectiles: activeProjectiles,
        activeGround: activeGround,
        activeFluid: activeFluid,
        activeEffects: activeEffects,
      },
      graveyard: {
        friendlyGraveyard: friendlyGraveyard,
        enemyGraveyard: enemyGraveyard,
        groundGraveyard: groundGraveyard,
        fluidGraveyard: fluidGraveyard,
      },
      engine: {
        enemySpawnCount: enemySpawnCount,
        friendlySpawnCount: friendlySpawnCount,
        lastEnemySpawnTime: lastEnemySpawnTime,
        lastFriendlySpawnTime: lastFriendlySpawnTime,
        terrainIsFalling: terrainIsFalling,
        projectileCount: projectileCount,
        friendlyCount: friendlyCount,
        bank: bank,
        timer: gameTimer,
      },
      settings: {
        gameboardWidth: gameboardWidth,
        gameboardHeight: gameboardHeight,
        groundLevel: groundLevel,
        groundRoughness: groundRoughness,
        waterLevel: waterLevel,
        renderSpeed: renderSpeed,
        gameSpeed: gameSpeed,
        totalSpawns: totalSpawns,
        spawnSpeed: spawnSpeed,
        gameMode: gameMode,
      },
      input: {
        selectedCell: selectedCell,
        cellTyping: cellTyping,
        currentInput: currentInput,
      },
      test: {
        gameboardTime: gameboardTime,
        entityTime: entityTime,
        projectileTime: projectileTime,
        groundTime: groundTime,
        fluidTime: fluidTime,
        effectTime: effectTime,
        testTime: testTime,
      },
    };
  }

  function timeTest() {
    setInterval(() => {
      console.log("In second " + second.current + ":");
      console.log("Renderer time: " + gameboardTime.current + "ms");
      console.log("Entity time: " + entityTime.current + "ms");
      console.log("Ground time: " + groundTime.current + "ms");
      console.log("Projectile time: " + projectileTime.current + "ms");
      console.log("Fluid time: " + fluidTime.current + "ms");
      console.log("Effect time: " + effectTime.current + "ms");
      console.log("Test time: " + testTime.current + "ms");
      gameboardTime.current = 0;
      entityTime.current = 0;
      groundTime.current = 0;
      projectileTime.current = 0;
      fluidTime.current = 0;
      effectTime.current = 0;
      testTime.current = 0;
      second.current++;
    }, 1000);
  }

  useEffect(() => {
    function handleKeyPress(e) {
      keyboardSelect(e, gameStatePacker());
    }
    function handleClick(e) {
      clickSelect(e, gameStatePacker());
    }
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("click", handleClick);
    return function cleanup() {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  function updateGameboardEntities() {
    let grid = [];
    for (let h = 0; h <= gameboardHeight.current; h++) {
      let subGrid = [];
      for (let w = 0; w <= gameboardWidth.current; w++) {
        subGrid.push(cellType(w, h));
      }
      grid.push(subGrid);
    }
    let initialTime = Date.now();
    setGameboardEntities(grid);
    let timeElapsed = Date.now() - initialTime;
    testTime.current += timeElapsed;

    function cellType(w, h) {
      if (selectedCell.current !== undefined) {
        if (currentInput.current !== "") {
          let inputPosition = selectedCell.current.id.split("x");
          inputPosition[0] = parseInt(inputPosition[0]);
          inputPosition[1] = parseInt(inputPosition[1]);
          if (comparePosition(inputPosition, [w, h])) {
            let style = {
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
              "--cell-select-width": cellWidth.current - 2 + "px",
              "--cell-select-height": cellHeight.current - 2 + "px",
            };
            return [w + "x" + h, currentInput.current, style];
          }
        }
      }
      if (w === 0) {
        return firstColumnCell(w, h);
      }
      if (h === 0) {
        return firstRowCell(w, h);
      }
      let cell = cellEffect([w, h], activeEffects.current);
      if (cell !== undefined) {
        return effectCell(cell, w, h);
      }
      cell = cellEntity([w, h], activeEntities.current);
      if (cell !== undefined) {
        return entityCell(cell, w, h);
      }
      cell = cellGround([w, h], activeGround.current);
      if (cell !== undefined) {
        return groundCell(cell, w, h);
      }
      cell = cellProjectile([w, h], activeProjectiles.current);
      if (cell !== undefined) {
        return projectileCell(cell, w, h);
      }
      cell = cellFluid([w, h], activeFluid.current);
      if (cell !== undefined) {
        return fluidCell(cell, w, h);
      }
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
      };
      return [w + "x" + h, "", style];
    }

    //below functions return what is to be rendered in cell
    function firstColumnCell(w, h) {
      if (h === 0) {
        let style = {
          width: "50px",
          height: cellHeight.current + "px",
          "--cell-select-width": 50 - 2 + "px",
          "--cell-select-height": cellHeight.current - 2 + "px",
          boxShadow: "inset -1px 0px 0px #404040, inset 0px -2px 0px #404040",
        };
        return [w + "x" + h, "", style];
      } else {
        let style = {
          textAlign: "center",
          width: "50px",
          height: cellHeight.current + "px",
          "--cell-select-width": 50 - 2 + "px",
          "--cell-select-height": cellHeight.current - 2 + "px",
          boxShadow: "inset -1px 0px 0px #404040",
          color: "#404040",
        };
        return [w + "x" + h, h + " ", style];
      }
    }

    function firstRowCell(w, h) {
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
        textAlign: "center",
        color: "#404040",
        boxShadow: "inset 0px -2px 0px #404040",
      };
      return [w + "x" + h, toLetter(w - 1) + " ", style];
    }

    function effectCell(effect, w, h) {
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
        backgroundColor: effect.style.backgroundColor,
        color: effect.style.color,
        fontStyle: effect.style.fontStyle,
      };
      if (effect.symbol === "") {
        if (cellEntity(effect.position, activeEntities.current) !== undefined) {
          cellEntity(
            effect.position,
            activeEntities.current
          ).style.backgroundColor = effect.style.backgroundColor;
          return entityCell(cellEntity(effect.position, activeHolder.current));
        }
        if (cellFluid(effect.position, activeFluid.current) !== undefined) {
          cellFluid(
            effect.position,
            activeFluid.current
          ).style.backgroundColor = effect.style.backgroundColor;
          return fluidCell(cellFluid(effect.position, activeFluid.current));
        }
      }
      return [w + "x" + h, effect.symbol, style];
    }

    function entityCell(entity, w, h) {
      let cellText;
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
      };
      if (entity.type === "blob") {
        blobLine(entity, style);
        blobHealthBar(entity, style);
        cellText = "";
      } else {
        attackBar(entity, style);
        entityHealthBar(entity, style);
        cellText = entity.type + entity.lvl + " (hp: " + entity.hp + ")";
        if (entity.inLiquid) {
          style.fontStyle = "italic";
          inFluid(entity, style);
        } else {
          style.fontStyle = "normal";
        }
      }
      if (entity.enemy === true) {
        style.color = "darkRed";
      } else {
        style.color = "darkGreen";
      }

      return [w + "x" + h, cellText, style];

      function attackBar(currentEntity, style) {
        let maxWidth = 157;
        let percentage = currentEntity.rateCharge / currentEntity.rate;
        let currentWidth = maxWidth * percentage;
        if (currentEntity.enemy) {
          style.boxShadow =
            "inset " + -currentWidth + "px 0px 0px 0px #0000001e";
        } else {
          style.boxShadow =
            "inset " + currentWidth + "px 0px 0px 0px #0000001e";
        }
      }

      function entityHealthBar(entity, style) {
        let percentage =
          entity.hp / entityList[entity.type].lvls["lvl" + entity.lvl].hp;
        let color;
        if (entity.enemy) {
          color = "rgb(139 0 0 /" + (1 - percentage) + ")";
        } else {
          color = "rgb(2 48 32 /" + (1 - percentage) + ")";
        }
        style.boxShadow += ",inset 157px 21px 0px 0px " + color;
      }

      function blobLine(blob, style) {
        let color, made;
        if (blob.enemy) {
          color = "darkRed";
        } else color = "darkGreen";
        let entityAbove = cellEntity(
          [blob.position[0], blob.position[1] - 1],
          activeEntities.current
        );
        let entityLeft = cellEntity(
          [blob.position[0] - 1, blob.position[1]],
          activeEntities.current
        );
        let entityRight = cellEntity(
          [blob.position[0] + 1, blob.position[1]],
          activeEntities.current
        );
        let entityBelow = cellEntity(
          [blob.position[0], blob.position[1] + 1],
          activeEntities.current
        );
        let groundLeft = cellGround(
          [blob.position[0] - 1, blob.position[1]],
          activeGround.current
        );
        let groundRight = cellGround(
          [blob.position[0] + 1, blob.position[1]],
          activeGround.current
        );
        let groundBelow = cellGround(
          [blob.position[0], blob.position[1] + 1],
          activeGround.current
        );
        if (entityAbove === undefined || entityAbove.type !== blob.type) {
          style.boxShadow = "inset 0px 2px 0px " + color;
          made = true;
        }
        if (
          (entityLeft === undefined || entityLeft.type !== blob.type) &&
          groundLeft === undefined &&
          blob.position[0] - 1 !== 0
        ) {
          if (!made) {
            style.boxShadow = "inset 2px 0px 0px " + color;
            made = true;
          } else {
            style.boxShadow += ",inset 2px 0px 0px " + color;
          }
        }
        if (
          (entityRight === undefined || entityRight.type !== blob.type) &&
          groundRight === undefined &&
          blob.position[0] < gameboardWidth.current
        ) {
          if (!made) {
            style.boxShadow = "inset -2px 0px 0px " + color;
            made = true;
          } else {
            style.boxShadow += ",inset -2px 0px 0px " + color;
          }
        }
        if (
          (entityBelow === undefined || entityBelow.type !== blob.type) &&
          groundBelow === undefined &&
          blob.position[0] < gameboardWidth.current
        ) {
          if (!made) {
            style.boxShadow = "inset 0px -3px 0px " + color;
            made = true;
          } else {
            style.boxShadow += ",inset 0px -3px 0px " + color;
          }
        }
      }

      function blobHealthBar(entity, style) {
        let percentage = 1 - entity.hp / 10;
        let color;
        if (entity.enemy) {
          color = "rgb(139 0 0 /" + (1 - percentage) + ")";
        } else {
          color = "rgb(2 48 32 /" + (1 - percentage) + ")";
        }
        if (style.boxShadow === undefined) {
          style.boxShadow = "inset 157px 21px 0px 0px " + color;
        } else style.boxShadow += ",inset 157px 21px 0px 0px " + color;
      }
    }

    function groundCell(ground, w, h) {
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
      };
      groundLine(ground, style);
      groundHealthBar(ground, style);

      return [w + "x" + h, ground.type, style];

      function groundLine(ground, style) {
        if (!ground.falling) {
          if (ground.fallSpeed > ground.fallCharge) {
            return;
          }
          let made;
          let groundAbove = cellGround(
            [ground.position[0], ground.position[1] - 1],
            activeGround.current
          );
          let groundLeft = cellGround(
            [ground.position[0] - 1, ground.position[1]],
            activeGround.current
          );
          let groundRight = cellGround(
            [ground.position[0] + 1, ground.position[1]],
            activeGround.current
          );
          if (groundAbove === undefined) {
            style.boxShadow = "inset 0px 2px 0px grey";
            made = true;
          }
          if (groundLeft === undefined && ground.position[0] - 1 !== 0) {
            if (!made) {
              style.boxShadow = "inset 2px 0px 0px grey";
              made = true;
            } else {
              style.boxShadow += ",inset 2px 0px 0px grey";
            }
          }
          if (
            groundRight === undefined &&
            ground.position[0] < gameboardWidth.current
          ) {
            if (!made) {
              style.boxShadow = "inset -2px 0px 0px grey";
              made = true;
            } else {
              style.boxShadow += ",inset -2px 0px 0px grey";
            }
          }
        } else {
          style.boxShadow = false;
        }
      }

      function groundHealthBar(ground, style) {
        let percentage = ground.hp / groundList[ground.type].hp;
        let color = "rgb(200 200 200 /" + (1 - percentage) + ")";
        if (style.boxShadow === undefined) {
          style.boxShadow = "inset 157px 21px 0px 0px " + color;
        } else style.boxShadow += ",inset 157px 21px 0px 0px " + color;
      }
    }

    function projectileCell(projectile) {
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
      };
      inFluid(projectile, style);
      return [w + "x" + h, projectile.symbol, style];
    }

    function fluidCell(fluid, w, h) {
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current - 2 + "px",
        "--cell-select-height": cellHeight.current - 2 + "px",
        fontStyle: "italic",
      };
      fluidLine(fluid, style);
      return [w + "x" + h, fluid.type, style];

      function fluidLine(fluid, style) {
        if (!fluid.falling) {
          if (fluid.fallSpeed > fluid.fallCharge) {
            return;
          }
          style.boxShadow = "";
          let made;
          let fluidAbove = cellFluid(
            [fluid.position[0], fluid.position[1] - 1],
            activeFluid.current
          );
          let fluidLeft = cellFluid(
            [fluid.position[0] - 1, fluid.position[1]],
            activeFluid.current
          );
          let fluidRight = cellFluid(
            [fluid.position[0] + 1, fluid.position[1]],
            activeFluid.current
          );
          let groundLeft = cellGround(
            [fluid.position[0] - 1, fluid.position[1]],
            activeGround.current
          );
          let groundRight = cellGround(
            [fluid.position[0] + 1, fluid.position[1]],
            activeGround.current
          );
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
        } else {
          style.boxShadow = false;
        }
      }
    }

    function inFluid(entity, style) {
      let fluidAbove = cellFluid(
        [entity.position[0], entity.position[1] - 1],
        activeFluid.current
      );
      let fluidLeft = cellFluid(
        [entity.position[0] - 1, entity.position[1]],
        activeFluid.current
      );
      let fluidRight = cellFluid(
        [entity.position[0] + 1, entity.position[1]],
        activeFluid.current
      );
      let groundLeft = cellGround(
        [entity.position[0] - 1, entity.position[1]],
        activeGround.current
      );
      let groundRight = cellGround(
        [entity.position[0] + 1, entity.position[1]],
        activeGround.current
      );
      if (fluidAbove === undefined) {
        style.boxShadow += ",inset 0px 1px 0px blue";
      }
      if (fluidLeft === undefined && groundLeft === undefined) {
        style.boxShadow += ",inset 1px 0px 0px blue";
      }
      if (fluidRight === undefined && groundRight === undefined) {
        style.boxShadow += ",inset -1px 0px 0px blue";
      }
    }
  }

  //makes a list of purchasble entities
  function Purchasables() {
    let entityArray = Object.values(entityList);
    let friendlyEntityArray = entityArray.filter((entity) => !entity.enemy);
    //removes king from array
    friendlyEntityArray.pop();
    let parsedFriendlyEntityArray = [
      [
        [gameboardHeight.current + 1 + " "],
        ["Purchasable entities:"],
        [""],
        [""],
        [""],
        [""],
        [""],
        [""],
      ],
      [
        [gameboardHeight.current + 2 + " "],
        ["Name"],
        ["Level"],
        ["Cost"],
        ["HP"],
        ["Damage"],
        ["Range"],
        ["Rate"],
      ],
    ];
    let headerNumber = gameboardHeight.current + 3;
    friendlyEntityArray.forEach((entity) => {
      let lvls = Object.values(entity.lvls);
      lvls.forEach((lvl) => {
        let name = "";
        if (lvl.lvl === 1) {
          name = entity.type;
        }
        let thisLevel = [
          [headerNumber + " "],
          [name],
          [lvl.lvl],
          [lvl.value],
          [lvl.hp],
          [lvl.dmg],
          [lvl.range],
          [lvl.rate],
        ];
        parsedFriendlyEntityArray.push(thisLevel);
        headerNumber++;
      });
    });
    let cellCount = 0;
    let style = {};
    parsedFriendlyEntityArray.forEach((row) => {
      row.forEach((cell) => {
        cell.push(cellCount + "purchasable");
        cellCount++;
      });
    });
    parsedFriendlyEntityArray.forEach((row) => {
      style = {
        textAlign: "center",
        width: "50px",
        boxShadow: "inset -1px 0px 0px #404040",
        color: "#404040",
      };
      row[0].push(style);
    });
    parsedFriendlyEntityArray[0].forEach((cell) => {
      if (cell[0] !== gameboardHeight.current + 1 + " ") {
        style = {
          boxShadow: "inset 0px -2px 0px 0px black",
        };
        cell.push(style);
      }
    });
    parsedFriendlyEntityArray.forEach((row) => {
      row.forEach((cell) => {
        if (cell[2] === undefined) {
          cell.push({});
        }
        if (cell[2].width === undefined) {
          cell[2].width = cellWidth.current + "px";
        }
        cell[2].height = cellHeight.current + "px";
      });
    });
    return (
      <table id="purchasables">
        <tbody>
          {parsedFriendlyEntityArray.map((row) => {
            return (
              <tr className="purchasableRow" key={row}>
                {row.map((position) => {
                  return (
                    <td key={position[1]}>
                      <input
                        id={position[1]}
                        className="purchasableCell"
                        type="text"
                        defaultValue={position[0]}
                        style={position[2]}
                        readOnly
                      ></input>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  function newButton() {
    clearInterval(renderTimer.current);
    clearInterval(gameTimer.current);
    enemyGraveyard.current = [];
    friendlyGraveyard.current = [];
    groundGraveyard.current = [];
    fluidGraveyard.current = [];
    enemySpawnCount.current = 0;
    friendlySpawnCount.current = 0;
    lastEnemySpawnTime.current = 0;
    lastFriendlySpawnTime.current = 0;
    renderTimer.current = setInterval(() => {
      let initialTime = Date.now();
      updateGameboardEntities();
      let timeElapsed = Date.now() - initialTime;
      gameboardTime.current += timeElapsed;
    }, renderSpeed.current * 4);
    engine(true, gameStatePacker());
  }

  function updateGameboardWidth(e) {
    gameboardWidth.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGameboardHeight(e) {
    gameboardHeight.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGroundHeight(e) {
    groundLevel.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateWaterLevel(e) {
    waterLevel.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateGroundRoughness(e) {
    groundRoughness.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateGameSpeed(e) {
    gameSpeed.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateRenderSpeed(e) {
    renderSpeed.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateTotalSpawns(e) {
    totalSpawns.current = parseInt(e.target.value);
    updateGameboardEntities();
  }
  function updateSpawnSpeed(e) {
    spawnSpeed.current = parseFloat(e.target.value);
    updateGameboardEntities();
  }
  function updateKingHP(e) {
    kingHP.current = parseInt(e.target.value);
    entityList.king.lvls.lvl1.hp = kingHP.current + 1;
    updateGameboardEntities();
  }
  function updateGameMode(e) {
    gameMode.current = e.target.value;
    updateGameboardEntities();
  }
  function toggleSettings() {
    if (settingsState === "flex") {
      setSettingsState("none");
    } else setSettingsState("flex");
  }
  function xDown() {
    cellWidth.current -= 10;
    updateGameboardEntities();
  }
  function xUp() {
    cellWidth.current += 10;
    updateGameboardEntities();
  }
  function yDown() {
    cellHeight.current--;
    updateGameboardEntities();
  }
  function yUp() {
    cellHeight.current++;
    updateGameboardEntities();
  }

  //renders the gameboard once on page load
  useEffect(() => {
    timeTest();
    updateGameboardEntities();
  }, []);

  return (
    <>
      <div id="above">
        <div id="stats">
          <p
            className="statTitle"
            id="firstStat"
            style={{
              height: cellHeight.current + "px",
            }}
          ></p>
          <p
            className="statTitle"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            Money:
          </p>
          <p
            className="stat"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            {bank}
          </p>

          <p
            className="statTitle"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            Friendly deaths:{" "}
          </p>
          <p
            className="stat"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            {friendlyGraveyard.current.length}
          </p>

          <p
            className="statTitle"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            Enemy deaths:{" "}
          </p>
          <p
            className="stat"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            {enemyGraveyard.current.length}
          </p>

          <p
            className="statTitle"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            Terrain destroyed:{" "}
          </p>
          <p
            className="stat"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            {groundGraveyard.current.length}
          </p>

          <p
            className="statTitle"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            Enemies remaining:{" "}
          </p>
          <p
            className="stat"
            style={{
              width: cellWidth.current + "px",
              height: cellHeight.current + "px",
            }}
          >
            {totalSpawns.current - enemySpawnCount.current}/
            {totalSpawns.current}
          </p>
          <button
            className="statTitle"
            id="settingsButton"
            style={{
              width: cellWidth.current + 7 + "px",
              height: cellHeight.current + 2 + "px",
            }}
            onClick={toggleSettings}
          >
            Settings/Entities &nbsp;
          </button>
        </div>
        <table id="gameboard">
          <tbody>
            {gameboardEntities.map((row) => {
              return (
                <tr className="boardRow" key={row[0][0].split("x")[1]}>
                  {row.map((position) => {
                    return (
                      <td key={position[0]} id={position[0] + "xtd"}>
                        <input
                          className="boardCell"
                          type="text"
                          style={position[2]}
                          id={position[0]}
                          value={position[1]}
                          readOnly={true}
                        ></input>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div id="below" style={{ display: settingsState }}>
        <Purchasables></Purchasables>
        <div id="settings">
          <div
            className="settingHolder"
            style={{ display: "flex", alignItems: "center" }}
          >
            <p
              className="settingTitle"
              style={{
                boxShadow: "inset 0px -2px 0px 0px black",
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
            >
              Settings:
            </p>
            <input
              id="settingTitle"
              style={{
                boxShadow: "inset 0px -2px 0px 0px black",
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
            ></input>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Gameboard width:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{gameboardWidth.current}</p>
              <input
                id="boardWidth"
                className="settingSlider"
                type="range"
                min="2"
                max="80"
                value={gameboardWidth.current}
                onChange={updateGameboardWidth}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Gameboard height:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{gameboardHeight.current}</p>
              <input
                id="boardHeight"
                className="settingSlider"
                type="range"
                min="1"
                max="50"
                value={gameboardHeight.current}
                onChange={updateGameboardHeight}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Ground height:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{groundLevel.current}</p>
              <input
                id="groundLevel.current"
                className="settingSlider"
                type="range"
                min="0"
                max={gameboardHeight.current}
                value={groundLevel.current}
                onChange={updateGroundHeight}
              ></input>
            </div>
          </div>{" "}
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Water level:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{waterLevel.current}</p>
              <input
                id="waterLevel.current"
                className="settingSlider"
                type="range"
                min="0"
                max={gameboardHeight.current}
                value={waterLevel.current}
                onChange={updateWaterLevel}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Ground roughness:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{groundRoughness.current}</p>
              <input
                id="groundRoughness.current"
                className="settingSlider"
                type="range"
                min="0"
                max="10"
                value={groundRoughness.current}
                onChange={updateGroundRoughness}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Game speed:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{gameSpeed.current}</p>
              <input
                id="gameSpeed.current"
                className="settingSlider"
                type="range"
                min="0"
                max="10"
                value={gameSpeed.current}
                onChange={updateGameSpeed}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Render speed:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{renderSpeed.current}</p>
              <input
                id="renderSpeed.current"
                className="settingSlider"
                type="range"
                min="1"
                max="10"
                value={renderSpeed.current}
                onChange={updateRenderSpeed}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Total spawns:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{totalSpawns.current}</p>
              <input
                id="totalSpawns.current"
                className="settingSlider"
                type="range"
                min="1"
                max="300"
                value={totalSpawns.current}
                onChange={updateTotalSpawns}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Spawn speed:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{spawnSpeed.current}</p>
              <input
                id="spawnSpeed.current"
                className="settingSlider"
                type="range"
                min="1"
                max="100"
                value={spawnSpeed.current}
                onChange={updateSpawnSpeed}
              ></input>
            </div>
          </div>
          <div className="settingHolder">
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              King HP:
            </p>
            <div
              style={{
                width: cellWidth.current - 4 + "px",
                height: cellHeight.current + "px",
              }}
            >
              <p>{kingHP.current}</p>
              <input
                id="kingHP.current"
                className="settingSlider"
                type="range"
                min="10"
                max="10000"
                value={kingHP.current}
                onChange={updateKingHP}
              ></input>
            </div>
          </div>
          <div
            className="settingHolder"
            style={{ display: "flex", alignItems: "center" }}
          >
            <p
              style={{
                width: cellWidth.current + "px",
                height: cellHeight.current + "px",
              }}
              className="settingTitle"
            >
              Gamemode:
            </p>
            <select
              id="gamemode.currentSelect"
              defaultValue={gameMode.current}
              onChange={updateGameMode}
              style={{ color: "black" }}
            >
              <option value="king">king</option>
              <option value="battle">battle</option>
              <option value="blob">blob</option>
              <option value="blob fight">blob fight</option>
              <option value="blob gob">blob gob</option>
              <option value="sandbox">sandbox</option>
            </select>
          </div>
        </div>
      </div>
      <div id="bottom">
        <div id="dimensions">
          <div className="dimensionButtonHolder">
            <button className="dimensionButton" onClick={xDown}>
              -
            </button>
            <p>X = {cellWidth.current}</p>
            <button className="dimensionButton" onClick={xUp}>
              +
            </button>
          </div>
          <div className="dimensionButtonHolder">
            <button className="dimensionButton" onClick={yDown}>
              -
            </button>
            <p>Y = {cellHeight.current}</p>
            <button className="dimensionButton" onClick={yUp}>
              +
            </button>
          </div>
        </div>
        <button
          id="newButton"
          onClick={newButton}
          style={{ color: "black", backgroundColor: "white" }}
        >
          New Round
        </button>
      </div>
    </>
  );
}
