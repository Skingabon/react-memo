import { createContext, useState } from "react";
export const GameContext = createContext(null);

export const getLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("gameMode"));
  } catch (_) {
    return false;
  }
};

export const GameProvider = ({ children }) => {
  const [gameMode, setGameMode] = useState(getLocalStorage());

  const handleGameMode = () => {
    setGameMode(!gameMode);
    localStorage.setItem("gameMode", JSON.stringify(!gameMode));
  };

  return <GameContext.Provider value={{ handleGameMode, gameMode }}>{children}</GameContext.Provider>;
};
