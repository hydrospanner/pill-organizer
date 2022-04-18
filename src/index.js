import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faMugSaucer,
  faSun,
  faMoon,
  faTrash,
  faPills,
  faBed,
} from "@fortawesome/free-solid-svg-icons";

import "bootstrap/dist/css/bootstrap.min.css";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";

import { App } from "./App";

library.add(faMugSaucer, faSun, faMoon, faTrash, faPills, faBed);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
      <App />
    </DndProvider>
  </React.StrictMode>
);
