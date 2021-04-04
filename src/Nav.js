import React from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles(() => ({
  title: {
    flexGrow: 1,
  },
}));

function Nav({ removeToken }) {
  const classes = useStyles();

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className={classes.title}>
          Fresh Approach
        </Typography>
        <Button color="inherit" onClick={removeToken}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Nav;

Nav.propTypes = {
  removeToken: PropTypes.func.isRequired,
};
