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

import { App } from "./App";

library.add(faMugSaucer, faSun, faMoon, faTrash, faPills, faBed);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
