import { useState, useEffect, useRef } from "react";
import EntityList from "./Lists/EntityList.jsx";
import ProjectileList from "./Lists/ProjectileList.jsx";
import GroundList from "./Lists/GroundList.jsx";
import FluidList from "./Lists/FluidList.jsx";
import EffectList from "./Lists/EffectList.jsx";
import Entity from "./Classes/Entity.jsx";
import { cellContents, direction, comparePosition } from "./Tools.jsx";
import { engine } from "./Engine.jsx";

export default function engineOutput() {
  const activeEntities = useRef([]);
  const activeProjectiles = useRef([]);
  const activeGround = useRef([]);
  const activeFluid = useRef([]);
  const activeEffects = useRef([]);
  const activeHolder = useRef([
    activeEntities.current,
    activeProjectiles.current,
    activeGround.current,
    activeFluid.current,
    activeEffects.current,
  ]);
  const friendlyGraveyard = useRef([]);
  const enemyGraveyard = useRef([]);
  const groundGraveyard = useRef([]);
  const fluidGraveyard = useRef([]);
  const [bank, setBank] = useState(10000);
  const enemySpawnCount = useRef(0);
  const friendlySpawnCount = useRef(0);
  const lastEnemySpawnTime = useRef(0);
  const lastFriendlySpawnTime = useRef(0);
  const timer = useRef();
  const gameboardWidth = useRef(11);
  const gameboardHeight = useRef(33);
  const groundLevel = useRef(15);
  const groundRoughness = useRef(5);
  const waterLevel = useRef(1);
  const renderSpeed = useRef(5);
  const gameSpeed = useRef(0.5);
  const totalSpawns = useRef(30);
  const spawnSpeed = useRef(1);
  const kingHP = useRef(20);
  const gameMode = useRef("king");
  const friendlyCount = useRef(1);
  const terrainIsFalling = useRef(false);
  const projectileCount = useRef(0);
  const selectedCell = useRef();
  const cellTyping = useRef(false);
  const currentInput = useRef("");
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const [settingsState, setSettingsState] = useState("none");
  let entityList = EntityList;
  let projectileList = ProjectileList;
  let groundList = GroundList;
  let fluidList = FluidList;
  let effectList = EffectList;

  //function that creates new active entities
  // class Entity {
  //   constructor(type, lvl, position, ID) {
  //     this.name = ID;
  //     this.type = type.type;
  //     this.position = position;
  //     this.lvl = lvl.lvl;
  //     this.hp = lvl.hp;
  //     this.enemy = type.enemy;
  //     this.value = lvl.value;
  //     this.dmg = lvl.dmg;
  //     this.range = lvl.range;
  //     this.rate = lvl.rate / gameSpeed.current;
  //     this.rateCharge = this.rate;
  //     this.speed = lvl.speed / gameSpeed.current;
  //     this.speedCharge = 0;
  //     this.fallSpeed = type.fallSpeed / gameSpeed.current;
  //     this.fallCharge = 0;
  //     this.movement = type.movement;
  //     this.attack = type.attack;
  //     this.breathes = type.breathes;
  //     this.projectile = type.projectile;
  //     this.style = type.style;
  //     this.explosionDmg = lvl.explosionDmg;
  //     this.explosionRange = lvl.explosionRange;
  //     this.death = type.death;
  //     this.spawnType = type.spawnType;
  //   }

  //   get onDeath() {
  //     if (this.death === "explodes") {
  //       explosion(this);
  //     }
  //     if (this.death === "spawn") {
  //       this.spawn();
  //     }
  //   }

  //   spawn() {
  //     let entityID = this.name;
  //     let entityType = entityList[this.spawnType];
  //     let entityLvl = entityType.lvls["lvl" + this.lvl];
  //     entityID = new Entity(entityType, entityLvl, this.position, entityID);
  //     entityID.enemy = this.enemy;
  //     activeEntities.current.push(entityID);
  //   }
  // }

  //turns position into spreadsheet style coordinate
  function toLetter(position) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return letters[position];
  }

  //checks to see if user input is in space of other entity
  function typingChecker(position) {
    let targetCell = cellContents(position, activeHolder.current);
    if (targetCell.ground === undefined && targetCell.entity === undefined) {
      return true;
    }
  }

  //parses user input into usable data
  function friendlyInput(position) {
    let input = currentInput.current;
    let parsedType = "";
    let parsedLvl = "";
    let hitNumber = false;
    for (let i = 0; i < input.length; i++) {
      if (isNaN(input[i]) && !hitNumber) {
        parsedType = parsedType.concat(input[i]);
      } else parsedLvl = parsedLvl.concat(input[i]);
    }
    friendlySpawner(parsedType, position, parsedLvl);
  }

  //runs friendly through checks before spawning
  function friendlySpawner(friendlyType, friendlyPosition, friendlyLvl) {
    if (validFriendly(friendlyType, friendlyLvl)) {
      let friendlyCost = entityList[friendlyType].lvls["lvl" + friendlyLvl].value;
      if (bankChecker(friendlyCost)) {
        setBank(bank - friendlyCost);
        friendlyEntityMaker(friendlyType, friendlyPosition, friendlyLvl);
      }
    }
  }

  //determines if entity name and level are valid
  function validFriendly(friendlyType, friendlyLvl) {
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
  function bankChecker(friendlyCost) {
    if (friendlyCost <= bank) {
      return true;
    }
  }

  //translates user input into data Entity maker can use
  function friendlyEntityMaker(entityType, entityPosition, entitylvl) {
    let ID = friendlyCount.current + 1;
    friendlyCount.current = ID;
    entityType = entityList[entityType];
    entitylvl = entityType.lvls["lvl" + entitylvl];
    let entityID = entityType.type + friendlyCount.current;
    entityID = new Entity(entityType, entitylvl, entityPosition, entityID);
    activeEntities.current.push(entityID);
    updateGameboardEntities();
  }

  //gives the ground entities a thicker outline if groundline
  function groundLine(ground) {
    if (!ground.falling) {
      if (ground.fallSpeed > ground.fallCharge) {
        return;
      }
      ground.style.boxShadow = "";
      let made = false;
      let cellAbove = cellContents(
        [ground.position[0], ground.position[1] - 1],
        activeHolder.current
      );
      let cellLeft = cellContents(
        [ground.position[0] - 1, ground.position[1]],
        activeHolder.current
      );
      let cellRight = cellContents(
        [ground.position[0] + 1, ground.position[1]],
        activeHolder.current
      );
      if (cellAbove.ground === undefined) {
        ground.style.boxShadow = "inset 0px 2px 0px grey";
        made = true;
      }
      if (cellLeft.ground === undefined && ground.position[0] - 1 !== 0 && !made) {
        ground.style.boxShadow = "inset 2px 0px 0px grey";
        made = true;
      } else if (cellLeft.ground === undefined && ground.position[0] - 1 !== 0 && made) {
        ground.style.boxShadow = ground.style.boxShadow + ",inset 2px 0px 0px grey";
      }
      if (
        cellRight.ground === undefined &&
        ground.position[0] < gameboardWidth.current &&
        !made
      ) {
        ground.style.boxShadow = "inset -2px 0px 0px grey";
        made = true;
      } else if (
        cellRight.ground === undefined &&
        ground.position[0] < gameboardWidth.current &&
        made
      ) {
        ground.style.boxShadow = ground.style.boxShadow + ",inset -2px 0px 0px grey";
      }
    } else {
      ground.style.boxShadow = false;
    }
  }

  function fluidLine(fluid) {
    if (!fluid.falling) {
      if (fluid.fallSpeed > fluid.fallCharge) {
        return;
      }
      fluid.style.boxShadow = "";
      let made = false;
      let cellAbove = cellContents(
        [fluid.position[0], fluid.position[1] - 1],
        activeHolder.current
      );
      let cellLeft = cellContents(
        [fluid.position[0] - 1, fluid.position[1]],
        activeHolder.current
      );
      let cellRight = cellContents(
        [fluid.position[0] + 1, fluid.position[1]],
        activeHolder.current
      );
      if (cellAbove.fluid === undefined) {
        fluid.style.boxShadow = "inset 0px 1px 0px blue";
        made = true;
      }
      if (cellLeft.fluid === undefined && cellLeft.ground === undefined && !made) {
        fluid.style.boxShadow = "inset 1px 0px 0px blue";
        made = true;
      } else if (cellLeft.fluid === undefined && cellLeft.ground === undefined && made) {
        fluid.style.boxShadow = fluid.style.boxShadow + ",inset 1px 0px 0px blue";
      }
      if (cellRight.fluid === undefined && cellRight.ground === undefined && !made) {
        fluid.style.boxShadow = "inset -1px 0px 0px blue";
        made = true;
      } else if (
        cellRight.fluid === undefined &&
        cellRight.ground === undefined &&
        made
      ) {
        fluid.style.boxShadow = fluid.style.boxShadow + ",inset -1px 0px 0px blue";
      }
    } else {
      fluid.style.boxShadow = false;
    }
  }

  //gives entities an attack bar
  function attackBar(currentEntity) {
    let maxWidth = 157;
    let percentage = currentEntity.rateCharge / currentEntity.rate;
    let currentWidth = maxWidth * percentage;
    if (currentEntity.enemy) {
      currentEntity.style.boxShadow =
        "inset " + -currentWidth + "px 0px 0px 0px #0000001e";
    } else {
      currentEntity.style.boxShadow =
        "inset " + currentWidth + "px 0px 0px 0px #0000001e";
    }
  }

  function healthBar(currentEntity) {
    let percentage;
    if (currentEntity.constructor.name === "Entity") {
      percentage =
        currentEntity.hp /
        entityList[currentEntity.type].lvls["lvl" + currentEntity.lvl].hp;
    } else if (currentEntity.constructor.name === "Ground") {
      percentage = currentEntity.hp / groundList[currentEntity.type].hp;
    }
    let color = "rgb(200 200 200 /" + (1 - percentage) + ")";
    if (currentEntity.constructor.name === "Ground") {
      if (currentEntity.style.boxShadow === "") {
        currentEntity.style.boxShadow = "inset 157px 21px 0px 0px " + color;
        return;
      }
    }
    currentEntity.style.boxShadow += ",inset 157px 21px 0px 0px " + color;
  }

  //stops the game loop
  function pause() {
    clearInterval(timer.current);
  }

  //pushes everything back into the game and starts the loop
  function resume() {
    engine(true, false);
  }

  //handles making a usable array for the grid renderer
  function updateGameboardEntities() {
    let grid = [];
    for (let h = 0; h <= gameboardHeight.current; h++) {
      let subGrid = [];
      for (let w = 0; w <= gameboardWidth.current; w++) {
        subGrid.push(cellType(w, h));
      }
      grid.push(subGrid);
    }
    setGameboardEntities(grid);

    //determines what type function to call
    function cellType(w, h) {
      let id = w + "x" + h;
      let cell = cellContents([w, h], activeHolder.current);
      let key = id;
      if (selectedCell.current !== undefined && currentInput.current !== "") {
        let inputPosition = selectedCell.current.id.split("x");
        inputPosition[0] = parseInt(inputPosition[0]);
        inputPosition[1] = parseInt(inputPosition[1]);
        if (comparePosition(inputPosition, [w, h])) {
          return [key, id, currentInput.current];
        }
      }
      if (w === 0) {
        return firstColumnCell(h, id, key);
      }
      if (h === 0) {
        return firstRowCell(w, id, key);
      }
      if (cell.effect !== undefined) {
        return effectCell(cell.effect, id, key);
      }
      if (cell.entity !== undefined) {
        return entityCell(cell.entity, id, key);
      }
      if (cell.ground !== undefined) {
        return groundCell(cell.ground, id, key);
      }
      if (cell.projectile !== undefined) {
        return projectileCell(cell.projectile, id, key);
      }
      if (cell.fluid !== undefined) {
        return fluidCell(cell.fluid, id, key);
      }
      let style = {};
      return [key, id, "", style];
    }

    //below functions return what is to be rendered in cell
    function firstColumnCell(h, id, key) {
      if (h === 0) {
        let style = {
          width: "50px",
          position: "sticky",
          boxShadow: "inset -1px 0px 0px #404040, inset 0px -2px 0px #404040",
        };
        return [key, id, "", style];
      } else {
        let style = {
          textAlign: "center",
          width: "50px",
          boxShadow: "inset -1px 0px 0px #404040",
          color: "#404040",
        };
        return [key, id, h + " ", style];
      }
    }

    function firstRowCell(w, id, key) {
      let style = {
        textAlign: "center",
        color: "#404040",
        position: "sticky",
        boxShadow: "inset 0px -2px 0px #404040",
      };
      return [key, id, toLetter(w - 1) + " ", style];
    }

    function groundCell(ground, id, key) {
      groundLine(ground);
      healthBar(ground);
      let style = {
        boxShadow: ground.style.boxShadow,
        backgroundColor: ground.style.backgroundColor,
      };
      return [key, id, ground.type + " (hp: " + ground.hp + ")", style];
    }

    function fluidCell(fluid, id, key) {
      if (terrainIsFalling.current) {
        fluidLine(fluid);
      }
      let style = {
        boxShadow: fluid.style.boxShadow,
      };
      style.fontStyle = "italic";
      return [key, id, fluid.type, style];
    }

    function effectCell(effect, id, key) {
      let style = {
        backgroundColor: effect.style.backgroundColor,
        color: effect.style.color,
      };
      return [key, id, effect.symbol, style];
    }

    function entityCell(entity, id, key) {
      attackBar(entity);
      healthBar(entity);
      let style = {
        boxShadow: entity.style.boxShadow,
      };
      let cellText = entity.type + entity.lvl + " (hp: " + entity.hp + ")";
      if (entity.enemy === true) {
        style.color = "darkRed";
      } else {
        style.color = "darkGreen";
      }
      if (entity.inLiquid) {
        style.fontStyle = "italic";
        inFluid(entity, style);
      } else {
        style.fontStyle = "normal";
      }
      return [key, id, cellText, style];
    }

    function projectileCell(projectile, id, key) {
      if (
        activeEntities.current.find((entity) =>
          comparePosition(entity.position, projectile.position)
        ) === undefined
      ) {
        let style = {};
        inFluid(projectile, style);

        return [key, id, projectile.symbol, style];
      }
    }

    function inFluid(entity, style) {
      let cellAbove = cellContents(
        [entity.position[0], entity.position[1] - 1],
        activeHolder.current
      );
      let cellLeft = cellContents(
        [entity.position[0] - 1, entity.position[1]],
        activeHolder.current
      );
      let cellRight = cellContents(
        [entity.position[0] + 1, entity.position[1]],
        activeHolder.current
      );
      if (cellAbove.fluid === undefined) {
        style.boxShadow = style.boxShadow + ",inset 0px 1px 0px blue";
      }
      if (cellLeft.fluid === undefined && cellLeft.ground === undefined) {
        style.boxShadow = style.boxShadow + ",inset 1px 0px 0px blue";
      }
      if (cellRight.fluid === undefined && cellRight.ground === undefined) {
        style.boxShadow = style.boxShadow + ",inset -1px 0px 0px blue";
      }
      return style;
    }
  }

  useEffect(() => {
    function handleKeyPress(e) {
      keyboardSelect(e);
    }
    function handleClick(e) {
      clickSelect(e);
    }
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("click", handleClick);
    return function cleanup() {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  function clickSelect(e) {
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
  function keyboardSelect(e) {
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
          friendlyInput(position);
          currentInput.current = "";
          return [position[0], position[1] + 1];
        }
        if (typingChecker(position)) {
          selectedCell.current.readOnly = false;
          cellTyping.current = true;
          return;
        }
        return;
      }
      if (keyPressed === "Tab") {
        e.preventDefault();
        cellTyping.current = false;
        friendlyInput(position);
        currentInput.current = "";
        return [position[0] + 1, position[1]];
      }
      if (keyPressed.length === 1 || keyPressed === "space") {
        if (typingChecker(position)) {
          cellTyping.current = true;
          selectedCell.current.readOnly = false;
          if (keyPressed === "space") {
            currentInput.current += " ";
          }
          currentInput.current += keyPressed;
          updateGameboardEntities();
        } else e.preventDefault();
      }
      if (keyPressed === "Backspace") {
        currentInput.current = currentInput.current.slice(0, -1);
        updateGameboardEntities();
      } else return false;
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

  function gameStatePacker() {
    let object = {
      activeEntities: activeEntities,
      activeProjectiles: activeProjectiles,
      activeGround: activeGround,
      activeFluid: activeFluid,
      activeEffects: activeEffects,
      activeHolder: activeHolder,
      friendlyGraveyard: friendlyGraveyard,
      enemyGraveyard: enemyGraveyard,
      groundGraveyard: groundGraveyard,
      fluidGraveyard: fluidGraveyard,
      bank: bank,
      enemySpawnCount: enemySpawnCount,
      friendlySpawnCount: friendlySpawnCount,
      lastEnemySpawnTime: lastEnemySpawnTime,
      lastFriendlySpawnTime: lastFriendlySpawnTime,
      timer: timer,
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
      terrainIsFalling: terrainIsFalling,
      projectileCount: projectileCount,
    };
    return object;
  }

  function newButton() {
    clearInterval(timer.current);
    enemyGraveyard.current = [];
    friendlyGraveyard.current = [];
    groundGraveyard.current = [];
    fluidGraveyard.current = [];
    enemySpawnCount.current = 0;
    friendlySpawnCount.current = 0;
    lastEnemySpawnTime.current = 0;
    lastFriendlySpawnTime.current = 0;
    engine(false, true, gameStatePacker());
    timer.current = setInterval(() => {
      updateGameboardEntities();
    }, renderSpeed.current * 4);
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

  //renders the gameboard once on page load
  useEffect(() => {
    // gameMode.current = "sandbox";
    // engine(
    //   false,
    //   true,
    //   gameStatePacker()
    // );
    // timer.current = setInterval(() => {
    //   updateGameboardEntities();
    // }, renderSpeed.current * 4);
    updateGameboardEntities();
  }, []);

  return (
    <>
      <div id="above">
        <div id="stats">
          <p className="statTitle" id="firstStat"></p>
          <p className="statTitle">Money:</p>
          <p className="stat">{bank}</p>

          <p className="statTitle">Friendly deaths: </p>
          <p className="stat">{friendlyGraveyard.current.length}</p>

          <p className="statTitle">Enemy deaths: </p>
          <p className="stat">{enemyGraveyard.current.length}</p>

          <p className="statTitle">Terrain destroyed: </p>
          <p className="stat">{groundGraveyard.current.length}</p>

          <p className="statTitle">Enemies remaining: </p>
          <p className="stat">
            {totalSpawns.current - enemySpawnCount.current}/{totalSpawns.current}
          </p>
          <button className="statTitle" id="settingsButton" onClick={toggleSettings}>
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
                      <td key={position[0]} id={position[1] + "xtd"}>
                        <input
                          className="boardCell"
                          type="text"
                          style={position[3]}
                          id={position[1]}
                          value={position[2]}
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
              style={{ boxShadow: "inset 0px -2px 0px 0px black" }}
            >
              Settings:
            </p>
            <input
              id="settingTitle"
              style={{ boxShadow: "inset 0px -2px 0px 0px black" }}
            ></input>
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
                max="80"
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
                max="50"
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
          </div>{" "}
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
                min="1"
                max="100"
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
          <div
            className="settingHolder"
            style={{ display: "flex", alignItems: "center" }}
          >
            <p className="settingTitle">Gamemode:</p>
            <select
              id="gamemode.currentSelect"
              defaultValue={gameMode.current}
              onChange={updateGameMode}
            >
              <option value="king">king</option>
              <option value="battle">battle</option>
              <option value="sandbox">sandbox</option>
            </select>
          </div>
        </div>
      </div>
      <button id="newButton" onClick={newButton}>
        New Round
      </button>
    </>
  );
}
