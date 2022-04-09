import React from "react";
import ReactDOM from "react-dom";
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

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
