import { useState, useEffect, useRef } from "react";
import { comparePosition, toLetter, onBoard } from "./Tools.jsx";
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
  const gameboardWidth = useRef(25);
  const gameboardHeight = useRef(38);
  const renderWidth = useRef();
  const renderWidthMin = useRef(0);
  const renderHeight = useRef();
  const renderHeightMin = useRef(0);
  const groundLevel = useRef(15);
  const groundRoughness = useRef(5);
  const waterLevel = useRef(1);
  const renderSpeed = useRef(5);
  const gameSpeed = useRef(1);
  const totalSpawns = useRef(5);
  const spawnSpeed = useRef(1);
  const kingHP = useRef(20);
  const gameMode = useRef("blob");
  const friendlyCount = useRef(1);
  const projectileCount = useRef(0);
  const selectedCell = useRef();
  const cellTyping = useRef(false);
  const currentInput = useRef("");
  const cellWidth = useRef(120);
  const cellHeight = useRef(21);
  const renderTime = useRef(0);
  const blankIfTime = useRef(0);
  const blankRenderTime = useRef(0);
  const entityIfTime = useRef(0);
  const entityRenderTime = useRef(0);
  const projectileIfTime = useRef(0);
  const projectileRenderTime = useRef(0);
  const groundIfTime = useRef(0);
  const groundRenderTime = useRef(0);
  const fluidIfTime = useRef(0);
  const fluidRenderTime = useRef(0);
  const effectIfTime = useRef(0);
  const effectRenderTime = useRef(0);
  const engineTime = useRef(0);
  const entityEngineTime = useRef(0);
  const projectileEngineTime = useRef(0);
  const groundEngineTime = useRef(0);
  const fluidEngineTime = useRef(0);
  const effectEngineTime = useRef(0);
  const testTime1 = useRef(0);
  const testTime2 = useRef(0);
  const testTime3 = useRef(0);
  const testTime4 = useRef(0);
  const testTime5 = useRef(0);
  const second = useRef(0);
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const scrollPositionX = useRef(0);
  const scrollPositionY = useRef(0);
  const cellSelectMoved = useRef(false);
  let entityList = EntityList;
  let groundList = GroundList;

  const entityBoard = useRef(initialGameboard());
  const groundBoard = useRef(initialGameboard());
  const fluidBoard = useRef(initialGameboard());
  const projectileBoard = useRef(initialGameboard());
  const effectBoard = useRef(initialGameboard());

  const gameStatus = useRef();

  function initialGameboard() {
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

  function gameStatePacker() {
    return {
      active: {
        activeEntities: activeEntities,
        entityBoard: entityBoard,
        activeProjectiles: activeProjectiles,
        projectileBoard: projectileBoard,
        activeGround: activeGround,
        groundBoard: groundBoard,
        activeFluid: activeFluid,
        fluidBoard: fluidBoard,
        activeEffects: activeEffects,
        effectBoard: effectBoard,
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
        projectileCount: projectileCount,
        friendlyCount: friendlyCount,
        bank: bank,
        setBank: setBank,
        timer: gameTimer,
      },
      settings: {
        gameboardWidth: gameboardWidth,
        gameboardHeight: gameboardHeight,
        renderWidth: renderWidth,
        renderWidthMin: renderWidthMin,
        renderHeight: renderHeight,
        renderHeightMin: renderHeightMin,
        groundLevel: groundLevel,
        groundRoughness: groundRoughness,
        waterLevel: waterLevel,
        renderSpeed: renderSpeed,
        gameSpeed: gameSpeed,
        totalSpawns: totalSpawns,
        spawnSpeed: spawnSpeed,
        gameMode: gameMode,
        gameStatus: gameStatus,
      },
      input: {
        selectedCell: selectedCell,
        cellTyping: cellTyping,
        currentInput: currentInput,
        cellSelectMoved: cellSelectMoved,
      },
      test: {
        engineTime: engineTime,
        entityTime: entityEngineTime,
        projectileTime: projectileEngineTime,
        groundTime: groundEngineTime,
        fluidTime: fluidEngineTime,
        effectTime: effectEngineTime,
        testTime1: testTime1,
        testTime2: testTime2,
        testTime3: testTime3,
        testTime4: testTime4,
        testTime5: testTime5,
      },
    };
  }

  function timeTest() {
    setInterval(() => {
      console.log("In second " + second.current + ":");
      console.log("Renderer total time: " + renderTime.current + "ms");
      console.log(
        "Blank Render time: " + blankRenderTime.current + "ms",
        parseInt((blankRenderTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Entity Render time: " + entityRenderTime.current + "ms",
        parseInt((entityRenderTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Ground Render time: " + groundRenderTime.current + "ms",
        parseInt((groundRenderTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Projectile Render time: " + projectileRenderTime.current + "ms",
        parseInt((projectileRenderTime.current / renderTime.current) * 100) +
          "%"
      );
      console.log(
        "Fluid Render time: " + fluidRenderTime.current + "ms",
        parseInt((fluidRenderTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Effect Render time: " + effectRenderTime.current + "ms",
        parseInt((effectRenderTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Blank If time: " + blankIfTime.current + "ms",
        parseInt((blankIfTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Entity If time: " + entityIfTime.current + "ms",
        parseInt((entityIfTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Ground If time: " + groundIfTime.current + "ms",
        parseInt((groundIfTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Projectile If time: " + projectileIfTime.current + "ms",
        parseInt((projectileIfTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Fluid If time: " + fluidIfTime.current + "ms",
        parseInt((fluidIfTime.current / renderTime.current) * 100) + "%"
      );
      console.log(
        "Effect If time: " + effectIfTime.current + "ms",
        parseInt((effectIfTime.current / renderTime.current) * 100) + "%"
      );
      console.log("Engine total time: " + engineTime.current + "ms");
      console.log(
        "Entity engine time: " + entityEngineTime.current + "ms",
        parseInt((entityEngineTime.current / engineTime.current) * 100) + "%"
      );
      console.log(
        "Ground engine time: " + groundEngineTime.current + "ms",
        parseInt((groundEngineTime.current / engineTime.current) * 100) + "%"
      );
      console.log(
        "Projectile engine time: " + projectileEngineTime.current + "ms",
        parseInt((projectileEngineTime.current / engineTime.current) * 100) +
          "%"
      );
      console.log(
        "Fluid engine time: " + fluidEngineTime.current + "ms",
        parseInt((fluidEngineTime.current / engineTime.current) * 100) + "%"
      );
      console.log(
        "Effect engine time: " + effectEngineTime.current + "ms",
        parseInt((effectEngineTime.current / engineTime.current) * 100) + "%"
      );
      // console.log("Select: " + testTime1.current + "ms");
      // console.log("Fall: " + testTime2.current + "ms");
      // console.log("Sort: " + testTime3.current + "ms");
      // console.log("Recursion: " + testTime4.current + "ms");
      // console.log("Other: " + testTime5.current + "ms");
      renderTime.current = 0;
      blankRenderTime.current = 0;
      entityRenderTime.current = 0;
      groundRenderTime.current = 0;
      projectileRenderTime.current = 0;
      fluidRenderTime.current = 0;
      effectRenderTime.current = 0;
      blankIfTime.current = 0;
      entityIfTime.current = 0;
      groundIfTime.current = 0;
      projectileIfTime.current = 0;
      fluidIfTime.current = 0;
      effectIfTime.current = 0;
      entityEngineTime.current = 0;
      engineTime.current = 0;
      groundEngineTime.current = 0;
      projectileEngineTime.current = 0;
      fluidEngineTime.current = 0;
      effectEngineTime.current = 0;
      testTime1.current = 0;
      testTime2.current = 0;
      testTime3.current = 0;
      testTime4.current = 0;
      testTime5.current = 0;
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

  function renderUpdate() {
    let initialTime = Date.now();
    if (cellSelectMoved.current) {
      xScrollUpdate();
      yScrollUpdate();
    }
    if (clickPosition.current !== undefined) {
      scrollDrag();
    }
    autoCell();
    cellOverlap();
    updateGameboardEntities();
    scrollCheck();
    cellSelectMoved.current = false;
    scrolledThisTurn.current = false;
    renderTime.current += Date.now() - initialTime;
  }

  function cellOverlap() {
    if (selectedCell.current === undefined) {
      return;
    }
    let position = selectedCell.current.id.split("x");
    let left = selectedCell.current.getBoundingClientRect().left;
    let top = selectedCell.current.getBoundingClientRect().top;
    let elementOnTop = document.elementFromPoint(left, top);
    let xHeader = document.getElementById(
      renderWidthMin.current + "x" + position[1]
    );
    if (elementOnTop === xHeader) {
      let board = document.getElementById("gameboardHolder");
      board.scrollBy(-50, 0);
      let gap = board.scrollLeft;
      if (gap % cellWidth.current !== 0) {
        let loop;
        while (!loop) {
          gap -= cellWidth.current;
          if (gap < 0) {
            loop = true;
          }
        }
        board.scrollBy(0, -gap);
      }
    }
    let yHeader = document.getElementById(
      position[0] + "x" + renderHeightMin.current
    );
    if (elementOnTop === yHeader) {
      let board = document.getElementById("gameboardHolder");
      board.scrollBy(0, -cellHeight.current);
      let gap = board.scrollTop;
      if (gap % cellHeight.current !== 0) {
        let loop;
        while (!loop) {
          gap -= cellHeight.current;
          if (gap < 0) {
            loop = true;
          }
        }
        board.scrollBy(0, -gap);
      }
    }
  }

  const scrollBufferX = useRef();
  function xScrollUpdate() {
    let board = document.getElementById("gameboardHolder");
    let width = board.offsetWidth;
    let xScroll = document.getElementById("xScroll");
    let totalWidth = gameboardWidth.current * (cellWidth.current - 1) - 50;
    let xScrollPercentage = width / totalWidth;
    let xScrollWidth = width * xScrollPercentage;
    xScroll.style.width = xScrollWidth + "px";
    let renderMax = renderWidth.current * cellWidth.current;
    if (scrollBufferX.current === undefined) {
      scrollBufferX.current = renderMax - width;
    }
    renderMax -= scrollBufferX.current;
    let marginPercentage = renderMax / width;
    let marginLeft = xScrollWidth * marginPercentage - xScrollWidth;
    xScroll.style.marginLeft = marginLeft + "px";
  }

  const scrollBufferY = useRef();
  function yScrollUpdate() {
    let board = document.getElementById("gameboardHolder");
    let height = board.offsetHeight;
    let yScroll = document.getElementById("yScroll");
    let totalHeight = gameboardHeight.current * (cellHeight.current - 2);
    let yScrollPercentage = height / totalHeight;
    let yScrollHeight = height * yScrollPercentage;
    yScroll.style.height = yScrollHeight + "px";
    let renderMax = renderHeight.current * cellHeight.current;
    if (scrollBufferY.current === undefined) {
      scrollBufferY.current = renderMax - height;
    }
    renderMax -= scrollBufferX.current;
    let marginPercentage = renderMax / height;
    let marginTop = yScrollHeight * marginPercentage - yScrollHeight + 17;
    yScroll.style.marginTop = marginTop + "px";
  }

  const clickPosition = useRef(undefined);
  const mousePosition = useRef([undefined, undefined]);
  const selectedScroll = useRef(undefined);

  function scrollDrag() {
    let old, current, x;
    if (selectedScroll.current.id === "xScroll") {
      old = clickPosition.current[0];
      current = mousePosition.current[0];
      x = true;
    } else if (selectedScroll.current.id === "yScroll") {
      old = clickPosition.current[1];
      current = mousePosition.current[1];
      x = false;
    }
    let board = document.getElementById("gameboardHolder");
    let diff = current - old;
    if (x) {
      board.scrollBy(diff * 50, 0);
    } else {
      board.scrollBy(0, diff * 50);
    }
    clickPosition.current[0] = current;
  }

  const scrolledThisTurn = useRef(false);

  useEffect(() => {
    let board = document.getElementById("gameboardHolder");
    board.addEventListener("scroll", handleScroll);
    function handleScroll() {
      xScrollUpdate();
      yScrollUpdate();
      if (!scrolledThisTurn.current) {
        let left = board.scrollLeft;
        let width = board.offsetWidth;
        let scrollWidth = board.scrollWidth;
        if (left + width > scrollWidth) {
          scrollEndX();
        } else if (left === 0) {
          scrollStartX();
        }
        let top = board.scrollTop;
        let height = board.offsetHeight;
        let scrollHeight = board.scrollHeight;
        if (top + height >= scrollHeight) {
          scrollEndY();
        } else if (top === 0) {
          scrollStartY();
        }
      }
    }
    let xScroll = document.getElementById("xScroll");
    let yScroll = document.getElementById("yScroll");
    xScroll.addEventListener("mousedown", scrollClick);
    yScroll.addEventListener("mousedown", scrollClick);
    function scrollClick(e) {
      clickPosition.current = [e.pageX, e.pageY];
      selectedScroll.current = e.target;
    }
    document.addEventListener("mousemove", scrollMove);
    function scrollMove(e) {
      mousePosition.current = [e.clientX, e.clientY];
    }
    document.addEventListener("mouseup", scrollRelease);
    function scrollRelease() {
      clickPosition.current = undefined;
    }
  }, []);

  function scrollEndX() {
    if (renderWidth.current < gameboardWidth.current) {
      renderWidthMin.current++;
      renderWidth.current++;
      scrollPositionX.current = cellWidth.current / 3;
      scrolledThisTurn.current = true;
    }
  }
  function scrollStartX() {
    if (renderWidthMin.current > 0) {
      renderWidthMin.current--;
      renderWidth.current--;
      scrollPositionX.current = cellWidth.current;
      scrolledThisTurn.current = true;
    }
  }
  function scrollEndY() {
    if (renderHeight.current < gameboardHeight.current) {
      renderHeightMin.current++;
      renderHeight.current++;
      scrollPositionY.current = cellHeight.current * 4.7;
      scrolledThisTurn.current = true;
    }
  }
  function scrollStartY() {
    if (renderHeightMin.current > 0) {
      renderHeightMin.current--;
      renderHeight.current--;
      scrollPositionY.current = cellHeight.current / 2;
      scrolledThisTurn.current = true;
    }
  }

  function autoCell() {
    let board = document.getElementById("gameboardHolder");
    let width = board.offsetWidth;
    let height = board.offsetHeight;
    renderWidth.current =
      1 + parseInt(width / cellWidth.current) + renderWidthMin.current;
    renderHeight.current =
      4 + parseInt(height / cellHeight.current) + renderHeightMin.current;
  }

  function scrollCheck() {
    let board = document.getElementById("gameboardHolder");
    if (scrollPositionX.current !== 0) {
      board.scrollTo(scrollPositionX.current, board.scrollTop);
      scrollPositionX.current = 0;
    }
    if (scrollPositionY.current !== 0) {
      board.scrollTo(board.scrollLeft, scrollPositionY.current);
      scrollPositionY.current = 0;
    }
  }

  function updateGameboardEntities() {
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
    setGameboardEntities(grid);

    function cellType(w, h) {
      let testTimeInitial = Date.now();
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
            testTime1.current += Date.now() - testTimeInitial;
            return [w + "x" + h, currentInput.current, style];
          }
        }
      }
      testTime1.current += Date.now() - testTimeInitial;
      if (w === widthMin) {
        return firstColumnCell(w, h);
      }
      if (h === heightMin) {
        return firstRowCell(w, h);
      }
      let style = {
        width: cellWidth.current + "px",
        height: cellHeight.current + "px",
        "--cell-select-width": cellWidth.current + "px",
        "--cell-select-height": cellHeight.current + "px",
      };
      let effectInitial = Date.now();
      let cell = onBoard(effectBoard.current, [w, h]);
      if (cell !== undefined) {
        effectIfTime.current += Date.now() - effectInitial;
        return effectCell(cell, w, h, style);
      }
      effectIfTime.current += Date.now() - effectInitial;
      let entityInitial = Date.now();
      cell = onBoard(entityBoard.current, [w, h]);
      if (cell !== undefined) {
        entityIfTime.current += Date.now() - entityInitial;
        return entityCell(cell, w, h, style);
      }
      entityIfTime.current += Date.now() - entityInitial;
      let groundInitial = Date.now();
      cell = onBoard(groundBoard.current, [w, h]);
      if (cell !== undefined) {
        groundIfTime.current += Date.now() - groundInitial;
        return groundCell(cell, w, h, style);
      }
      groundIfTime.current += Date.now() - groundInitial;
      let projectileInitial = Date.now();
      cell = onBoard(projectileBoard.current, [w, h]);
      if (cell !== undefined) {
        projectileIfTime.current += Date.now() - projectileInitial;
        return projectileCell(cell, w, h, style);
      }
      projectileIfTime.current += Date.now() - projectileInitial;
      let fluidInitial = Date.now();
      cell = onBoard(fluidBoard.current, [w, h]);
      if (cell !== undefined) {
        fluidIfTime.current += Date.now() - fluidInitial;
        return fluidCell(cell, w, h, style);
      }
      fluidIfTime.current += Date.now() - fluidInitial;
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
      let initialTime = Date.now();
      blankRenderTime.current += Date.now() - initialTime;
      return [w + "x" + h, "", style, "", w, h];
    }

    function effectCell(effect, w, h, style) {
      let initialTime = Date.now();
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
      effectRenderTime.current += Date.now() - initialTime;
      return [w + "x" + h, effect.symbol, style, "", w, h];
    }

    function entityCell(entity, w, h, style) {
      let initialTime = Date.now();
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
      entityRenderTime.current += Date.now() - initialTime;
      return [w + "x" + h, cellText, style, "", w, h];

      function attackBar(currentEntity, style) {
        let maxWidth = cellWidth.current;
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
      let initialTime = Date.now();
      groundLine(ground, style);
      groundHealthBar(ground, style);
      groundRenderTime.current += Date.now() - initialTime;
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
      let initialTime = Date.now();
      if (projectile.inFluid) {
        inFluid(projectile, style);
      }
      projectileRenderTime.current += Date.now() - initialTime;
      return [w + "x" + h, projectile.symbol, style, "", w, h];
    }

    function fluidCell(fluid, w, h, style) {
      let initialTime = Date.now();
      style.backgroundColor = "lightBlue";
      fluidLine(fluid, style);
      fluidRenderTime.current += Date.now() - initialTime;
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

  //makes a list of purchasble entities
  function Purchasables() {
    let entityArray = Object.values(entityList);
    let friendlyEntityArray = entityArray.filter(
      (entity) => !entity.enemy && entity.type !== "king"
    );
    let parsedFriendlyEntityArray = [
      [["Purchasable entities:"], [""], [""], [""], [""], [""], [""]],
      [["Name"], ["Level"], ["Cost"], ["HP"], ["Damage"], ["Range"], ["Rate"]],
    ];
    friendlyEntityArray.forEach((entity) => {
      let lvls = Object.values(entity.lvls);
      lvls.forEach((lvl) => {
        let name = "";
        if (lvl.lvl === 1) {
          name = entity.type;
        }
        let thisLevel = [
          [name],
          [lvl.lvl],
          [lvl.value],
          [lvl.hp],
          [lvl.dmg],
          [lvl.range],
          [lvl.rate],
        ];
        parsedFriendlyEntityArray.push(thisLevel);
      });
    });
    for (let i = 0; i < parsedFriendlyEntityArray.length; i++) {
      let row = parsedFriendlyEntityArray[i];
      for (let x = 0; x < row.length; x++) {
        let cell = row[x];
        cell.push(i + "x" + x + "purchasable");
      }
      if (i > 1) {
        if (row[0][0] !== "") {
          row[0][2] = {
            borderTop: "solid 1px black",
          };
        }
      }
    }
    return (
      <table id="purchasables">
        <tbody>
          {parsedFriendlyEntityArray.map((row) => {
            return (
              <tr className="purchasableRow" key={row} style={row[0][2]}>
                {row.map((position) => {
                  return (
                    <td key={position[1]}>
                      <input
                        id={position[1]}
                        className="purchasableCell"
                        type="text"
                        defaultValue={position[0]}
                        style={{ width: "140px", height: "21px" }}
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
    autoCell();
    enemyGraveyard.current = [];
    friendlyGraveyard.current = [];
    groundGraveyard.current = [];
    fluidGraveyard.current = [];
    enemySpawnCount.current = 0;
    friendlySpawnCount.current = 0;
    lastEnemySpawnTime.current = 0;
    lastFriendlySpawnTime.current = 0;
    renderTimer.current = setInterval(() => {
      renderUpdate();
    }, renderSpeed.current);
    engine(true, gameStatePacker());
  }

  function updateGameboardWidth(e) {
    gameboardWidth.current = parseInt(e.target.value);
    entityBoard.current = initialGameboard();
    groundBoard.current = initialGameboard();
    projectileBoard.current = initialGameboard();
    effectBoard.current = initialGameboard();
    fluidBoard.current = initialGameboard();
    renderUpdate();
  }
  function updateGameboardHeight(e) {
    gameboardHeight.current = parseInt(e.target.value);
    entityBoard.current = initialGameboard();
    groundBoard.current = initialGameboard();
    projectileBoard.current = initialGameboard();
    effectBoard.current = initialGameboard();
    fluidBoard.current = initialGameboard();
    renderUpdate();
  }
  function updateGroundHeight(e) {
    groundLevel.current = parseInt(e.target.value);
    renderUpdate();
  }
  function updateWaterLevel(e) {
    waterLevel.current = parseInt(e.target.value);
    renderUpdate();
  }
  function updateGroundRoughness(e) {
    groundRoughness.current = parseFloat(e.target.value);
    renderUpdate();
  }
  function updateGameSpeed(e) {
    gameSpeed.current = parseFloat(e.target.value);
    renderUpdate();
  }
  function updateRenderSpeed(e) {
    renderSpeed.current = parseFloat(e.target.value);
    renderUpdate();
  }
  function updateTotalSpawns(e) {
    totalSpawns.current = parseInt(e.target.value);
    renderUpdate();
  }
  function updateSpawnSpeed(e) {
    spawnSpeed.current = parseFloat(e.target.value);
    renderUpdate();
  }
  function updateKingHP(e) {
    kingHP.current = parseInt(e.target.value);
    entityList.king.lvls.lvl1.hp = kingHP.current + 1;
    renderUpdate();
  }
  function updateGameMode(e) {
    gameMode.current = e.target.value;
    renderUpdate();
  }
  function updateCellWidth(e) {
    cellWidth.current = e.target.value;
    renderUpdate();
  }
  function updateCellHeight(e) {
    cellHeight.current = e.target.value;
    renderUpdate();
  }

  const [activeTab, setActiveTab] = useState("gameboardHolder");
  function tabButton(e) {
    setActiveTab(e.target.textContent + "Holder");
  }

  //renders the gameboard once on page load
  useEffect(() => {
    // timeTest();
    renderUpdate();
    xScrollUpdate();
    yScrollUpdate();
  }, []);

  return (
    <>
      <div id="stats">
        <p
          className="statTitle"
          style={{ textAlign: "right", paddingRight: "5px" }}
        >
          Money:
        </p>
        <p className="stat">{bank}</p>
        <p
          className="statTitle"
          style={{ textAlign: "right", paddingRight: "5px" }}
        >
          Friendly spawns:
        </p>
        <p className="stat">
          {totalSpawns.current - friendlySpawnCount.current}/
          {totalSpawns.current}
        </p>
        <p
          className="statTitle"
          style={{ textAlign: "right", paddingRight: "5px" }}
        >
          Enemy spawns:
        </p>
        <p className="stat">
          {totalSpawns.current - enemySpawnCount.current}/{totalSpawns.current}
        </p>
        <p className="statTitle" id="status" style={{ textAlign: "center" }}>
          {gameStatus.current}
        </p>
      </div>
      <div id="above">
        <div
          id="gameboardHolder"
          style={
            activeTab === "gameboardHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse", width: "0px", border: "none" }
          }
        >
          <div id="gameboard">
            {gameboardEntities.map((row) => {
              return (
                <div
                  className="boardRow"
                  key={row[0][0].split("x")[1]}
                  id={"row" + row[1][3]}
                >
                  {row.map((position) => {
                    return (
                      <input
                        className={"boardCell"}
                        type="text"
                        style={position[2]}
                        key={position[0]}
                        id={position[0]}
                        value={position[1]}
                        readOnly={true}
                      ></input>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
        <div
          id="purchasablesHolder"
          style={
            activeTab === "entitiesHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse", width: "0px", border: "none" }
          }
        >
          <Purchasables></Purchasables>
        </div>
        <div
          id="settingsHolder"
          style={
            activeTab === "settingsHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse", width: "0px", border: "none" }
          }
        >
          <div id="settings">
            <div className="settingHolder">
              <p className="settingTitle">Settings:</p>
              <input className="settingTitle"></input>
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Gameboard width:</p>
              <div>
                <p>{gameboardWidth.current}</p>
                <input
                  id="boardWidth"
                  className="settingSlider"
                  type="range"
                  min="2"
                  max="800"
                  value={gameboardWidth.current}
                  onChange={updateGameboardWidth}
                ></input>
              </div>
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Gameboard height:</p>
              <div>
                <p>{gameboardHeight.current}</p>
                <input
                  id="boardHeight"
                  className="settingSlider"
                  type="range"
                  min="1"
                  max="800"
                  value={gameboardHeight.current}
                  onChange={updateGameboardHeight}
                ></input>
              </div>
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Ground height:</p>
              <div>
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
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Water level:</p>
              <div>
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
              <p className="settingTitle">Ground roughness:</p>
              <div>
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
              <p className="settingTitle">Game speed:</p>
              <div>
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
              <p className="settingTitle">Render speed:</p>
              <div>
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
              <p className="settingTitle">Total spawns:</p>
              <div>
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
              <p className="settingTitle">Spawn speed:</p>
              <div>
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
              <p className="settingTitle">King HP:</p>
              <div>
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
            <div className="settingHolder">
              <p className="settingTitle">Cell width: </p>
              <div>
                <p>{cellWidth.current}</p>
                <input
                  id="cellWidth"
                  className="settingSlider"
                  type="range"
                  min="1"
                  max="300"
                  value={cellWidth.current}
                  onChange={updateCellWidth}
                ></input>
              </div>
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Cell height:</p>
              <div>
                <p>{cellHeight.current}</p>
                <input
                  id="cellHeight"
                  className="settingSlider"
                  type="range"
                  min="1"
                  max="300"
                  value={cellHeight.current}
                  onChange={updateCellHeight}
                ></input>
              </div>
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Gamemode:</p>
              <select
                id="gamemode.currentSelect"
                defaultValue={gameMode.current}
                onChange={updateGameMode}
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
        <div
          className="customScroll"
          id="yScroll"
          style={
            activeTab === "gameboardHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse" }
          }
        >
          <div id="yScrollBar"></div>
        </div>
        <div
          id="yLine"
          style={
            activeTab === "gameboardHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse" }
          }
        ></div>
      </div>
      <div className="customScroll" id="xScroll">
        <div
          id="xScrollBar"
          style={
            activeTab === "gameboardHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse" }
          }
        ></div>
      </div>
      <div id="bottom">
        <button
          className="tab"
          id="gameboardTab"
          onClick={tabButton}
          style={
            activeTab === "gameboardHolder"
              ? { backgroundColor: "#cacaca", fontWeight: 500 }
              : { backgroundColor: "white" }
          }
        >
          gameboard
        </button>
        <button
          className="tab"
          id="entitiesTab"
          onClick={tabButton}
          style={
            activeTab === "entitiesHolder"
              ? { backgroundColor: "#cacaca", fontWeight: 500 }
              : { backgroundColor: "white" }
          }
        >
          entities
        </button>
        <button
          className="tab"
          id="settingsTab"
          onClick={tabButton}
          style={
            activeTab === "settingsHolder"
              ? { backgroundColor: "#cacaca", fontWeight: 500 }
              : { backgroundColor: "white" }
          }
        >
          settings
        </button>
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
