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
import {
  updateGameboardWidth,
  updateGameboardHeight,
  updateGroundHeight,
  updateWaterLevel,
  updateGroundRoughness,
  updateGameSpeed,
  updateRenderSpeed,
  updateTotalSpawns,
  updateSpawnSpeed,
  updateKingHP,
  updateGameMode,
  updateCellWidth,
  updateCellHeight,
  tabButton,
} from "./Render/SettingUpdaters.jsx";
import { engine } from "./Engine.jsx";
import EntityList from "./Lists/EntityList.jsx";
import Stats from "./Render/Stats.jsx";
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
  const gameboardWidth = useRef(40);
  const gameboardHeight = useRef(45);
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
  const cellTyping = useRef();
  const currentInput = useRef("");
  const cellWidth = useRef(120);
  const cellHeight = useRef(20);
  const [gameboardEntities, setGameboardEntities] = useState([]);
  const scrollPositionX = useRef(0);
  const scrollPositionY = useRef(0);
  const cellSelectMoved = useRef();
  const cellCursorPosition = useRef();
  const entityBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const groundBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const fluidBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const projectileBoard = useRef(
    initialGameboard(gameboardHeight, gameboardWidth)
  );
  const effectBoard = useRef(initialGameboard(gameboardHeight, gameboardWidth));
  const gameStatus = useRef();
  const scrolledThisTurn = useRef();
  const newRound = useRef(true);
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
        newRound: newRound,
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
        cellSelectMoved: cellSelectMoved,
        cellCursorPosition: cellCursorPosition,
      },
      render: {
        renderWidth: renderWidth,
        renderWidthMin: renderWidthMin,
        renderHeight: renderHeight,
        renderHeightMin: renderHeightMin,
        cellWidth: cellWidth,
        cellHeight: cellHeight,
        scrollPositionX: scrollPositionX,
        scrollPositionY: scrollPositionY,
        scrolledThisTurn: scrolledThisTurn,
        gameStatus: gameStatus,
      },
    };
  }

  function renderUpdate() {
    xScrollUpdate(gameStatePacker());
    yScrollUpdate(gameStatePacker());
    autoCell(gameStatePacker());
    cellOverlap(gameStatePacker());
    setGameboardEntities(updateGameboardEntities(gameStatePacker()));
    scrollCheck(gameStatePacker());
    cellSelectMoved.current = false;
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
    newRound.current = true;
    renderTimer.current = setInterval(() => {
      engine(gameStatePacker());
      renderUpdate();
    }, renderSpeed.current * 4);
  }

  const [activeTab, setActiveTab] = useState("gameboardHolder");

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    function handleKeyPress(e) {
      keyboardSelect(e, gameStatePacker());
    }
    document.addEventListener("click", handleClick);
    function handleClick(e) {
      clickSelect(e, gameStatePacker());
    }
    let board = document.getElementById("gameboardHolder");
    board.addEventListener("scroll", function () {
      handleScroll(gameStatePacker());
    });
    renderUpdate();
    return function cleanup() {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <>
      <Stats gameState={gameStatePacker()}></Stats>
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
                  onChange={function (e) {
                    updateGameboardWidth(
                      e,
                      gameboardWidth,
                      gameboardHeight,
                      entityBoard,
                      groundBoard,
                      projectileBoard,
                      effectBoard,
                      fluidBoard,
                      renderUpdate
                    );
                  }}
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
                  onChange={function (e) {
                    updateGameboardHeight(
                      e,
                      gameboardWidth,
                      gameboardHeight,
                      entityBoard,
                      groundBoard,
                      projectileBoard,
                      effectBoard,
                      fluidBoard,
                      renderUpdate
                    );
                  }}
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
                  onChange={function (e) {
                    updateGroundHeight(e, groundLevel, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateWaterLevel(e, waterLevel, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateGroundRoughness(e, groundRoughness, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateGameSpeed(e, gameSpeed, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateRenderSpeed(e, renderSpeed, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateTotalSpawns(e, totalSpawns, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateSpawnSpeed(e, spawnSpeed, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateKingHP(e, kingHP, renderUpdate, entityList);
                  }}
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
                  onChange={function (e) {
                    updateCellWidth(e, cellWidth, renderUpdate);
                  }}
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
                  onChange={function (e) {
                    updateCellHeight(e, cellHeight, renderUpdate);
                  }}
                ></input>
              </div>
            </div>
            <div className="settingHolder">
              <p className="settingTitle">Gamemode:</p>
              <select
                id="gamemode.currentSelect"
                defaultValue={gameMode.current}
                onChange={function (e) {
                  updateGameMode(e, gameMode, renderUpdate);
                }}
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
          id="yLine"
          style={
            activeTab === "gameboardHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse", width: "0px" }
          }
        ></div>
        <div
          className="customScroll"
          id="yScroll"
          style={
            activeTab === "gameboardHolder"
              ? { visibility: "visible" }
              : { visibility: "collapse", width: "0px" }
          }
        >
          <div id="yScrollBar"></div>
        </div>
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
          onClick={function (e) {
            tabButton(e, setActiveTab);
          }}
          style={
            activeTab === "gameboardHolder"
              ? {
                  backgroundColor: "#cacaca",
                  fontWeight: 500,
                  border: "solid 2px",
                }
              : { backgroundColor: "white" }
          }
        >
          gameboard
        </button>
        <button
          className="tab"
          id="entitiesTab"
          onClick={function (e) {
            tabButton(e, setActiveTab);
          }}
          style={
            activeTab === "entitiesHolder"
              ? {
                  backgroundColor: "#cacaca",
                  fontWeight: 500,
                  border: "solid 2px",
                }
              : { backgroundColor: "white" }
          }
        >
          entities
        </button>
        <button
          className="tab"
          id="settingsTab"
          onClick={function (e) {
            tabButton(e, setActiveTab);
          }}
          style={
            activeTab === "settingsHolder"
              ? {
                  backgroundColor: "#cacaca",
                  fontWeight: 500,
                  border: "solid 2px",
                }
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
