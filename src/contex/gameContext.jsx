import { createContext, useState } from "react";

export const GameContext = createContext(null);

export const GameProvider = ({ children }) => {
  const [gameMode, setGameMode] = useState(false);

  const handleGameMode = () => {
    setGameMode(!gameMode);
  };

  return <GameContext.Provider value={{ handleGameMode }}>{children}</GameContext.Provider>;
};
