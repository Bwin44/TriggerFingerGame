import { useState } from "react";
import Menu from "../components/Menu";
import Game from "../components/Game";
import Stats from "../components/Stats";


export default function GameRunner() {
  const [screen, setScreen] = useState("menu");
  const [gameData, setGameData] = useState(null);

  return (
    <>
      {screen === "menu" && (
        <Menu onStart={() => setScreen("game")} />
      )}

      {screen === "game" && (
        <Game
          onGameOver={(data) => {
            setGameData(data);
            setScreen("stats");
          }}
        />
      )}

      {screen === "stats" && (
        <Stats
          {...gameData}
          onReplay={() => {
            setGameData(null);
            setScreen("menu");
          }}
        />
      )}
    </>
  );
}
