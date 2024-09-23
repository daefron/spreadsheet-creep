import { useState } from "react";
import Engine from "./Game Logic/Engine.jsx";
import "./App.css";
function App() {
  const [gameboard, setGameboard] = useState(new Map());
  const [activeEntities, setActiveEntities] = useState([]);
  const [graveyard, setGraveyard] = useState([]);
  const [bank, setBank] = useState(0);
  const [newEntity, setNewEntity] = useState();

  Engine(gameboard, activeEntities, graveyard, bank);
}

export default App;
