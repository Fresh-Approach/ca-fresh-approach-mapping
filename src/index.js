import React, { Fragment } from "react";
import ReactDOM from "react-dom";

import { makeStyles } from "@material-ui/core/styles";

import Nav from "./nav";
import CustomMap from "./map";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "100vh",
  },
}));

const position = [-43.5321, 172.6362];

function App() {
  const classes = useStyles();

  return (
    <div>
      <Nav />
      <CustomMap />
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector("#app"));
