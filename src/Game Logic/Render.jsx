import { useState, useEffect, useRef } from "react";
import { keyboardSelect, clickSelect } from "./Input.jsx";
import { initialGameboard } from "./Tools.jsx";
import {
  handleScroll,
  scrollCheck,
  xScrollUpdate,
  yScrollUpdate,
  cellOverlap,
  autoCell,
} from "./Render/Scrolling.jsx";
import { engine } from "./Engine.jsx";
import EntityList from "./Lists/EntityList.jsx";
import Purchasables from "./Render/Purchasables.jsx";
import { updateGameboardEntities } from "./Render/UpdateGameboardEntities.jsx";

export default function EngineOutput() {
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
  const gameboardHeight = useRef(55);
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
  const cellHeight = useRef(20);
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const scrollPositionX = useRef(0);
  const scrollPositionY = useRef(0);
  const cellSelectMoved = useRef(false);
  const cellCursorPosition = useRef();
  const entityBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const groundBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const fluidBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const projectileBoard = useRef(
    initialGameboard(gameboardHeight, gameboardWidth)
  );
  const effectBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const gameStatus = useRef();
  const scrolledThisTurn = useRef(false);
  let entityList = EntityList;

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
        cellCursorPosition: cellCursorPosition,
      },
      render: {
        cellWidth: cellWidth,
        cellHeight: cellHeight,
      },
    };
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
    xScrollUpdate(gameboardWidth, renderWidth, renderWidthMin, cellWidth);
    yScrollUpdate(gameboardHeight, renderHeight, renderHeightMin, cellHeight);
    autoCell(
      renderWidth,
      renderWidthMin,
      renderHeight,
      renderHeightMin,
      cellWidth,
      cellHeight
    );
    cellOverlap(
      renderWidthMin,
      renderHeightMin,
      selectedCell,
      cellWidth,
      cellHeight
    );
    setGameboardEntities(updateGameboardEntities(gameStatePacker()));
    scrollCheck(scrollPositionX, scrollPositionY, scrolledThisTurn);
    cellSelectMoved.current = false;
  }

  useEffect(() => {
    let board = document.getElementById("gameboardHolder");
    board.addEventListener("scroll", function () {
      handleScroll(
        gameboardWidth,
        gameboardHeight,
        renderWidth,
        renderWidthMin,
        renderHeight,
        renderHeightMin,
        scrollPositionX,
        scrollPositionY,
        scrolledThisTurn,
        cellWidth,
        cellHeight
      );
    });
  }, []);

  function newButton() {
    clearInterval(renderTimer.current);
    clearInterval(gameTimer.current);
    autoCell(
      renderWidth,
      renderWidthMin,
      renderHeight,
      renderHeightMin,
      cellWidth,
      cellHeight
    );
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
    }, renderSpeed.current * 4);
    engine(true, gameStatePacker());
  }

  function updateGameboardWidth(e) {
    gameboardWidth.current = parseInt(e.target.value);
    entityBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    groundBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    projectileBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    effectBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    fluidBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    renderUpdate();
  }
  function updateGameboardHeight(e) {
    gameboardHeight.current = parseInt(e.target.value);
    entityBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    groundBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    projectileBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    effectBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
    fluidBoard.current = initialGameboard(gameboardHeight, gameboardWidth);
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

  function Stats() {
    return (
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
    );
  }

  //renders the gameboard once on page load
  useEffect(() => {
    renderUpdate();
  }, []);

  return (
    <>
      <Stats></Stats>
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
      <div
        id="xLine"
        style={
          activeTab === "gameboardHolder"
            ? { visibility: "visible" }
            : { visibility: "collapse" }
        }
      ></div>
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
