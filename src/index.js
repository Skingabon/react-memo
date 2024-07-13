import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { GameProvider } from "./contex/gameContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <GameProvider>
      <RouterProvider router={router}></RouterProvider>
    </GameProvider>
  </React.StrictMode>,
);
