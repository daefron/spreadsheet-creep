export default function Stats(props) {
  let bank = props.gameState.engine.bank;
  let totalSpawns = props.gameState.settings.totalSpawns;
  let friendlySpawnCount = props.gameState.engine.friendlySpawnCount;
  let enemySpawnCount = props.gameState.engine.enemySpawnCount;
  let gameStatus = props.gameState.render.gameStatus;
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
        {totalSpawns.current - friendlySpawnCount.current}/{totalSpawns.current}
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
