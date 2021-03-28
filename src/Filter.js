import React from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Paper from "@material-ui/core/Paper";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: "lightgray",
    height: "100%",
    padding: theme.spacing(2),
  },
  formControl: {
    paddingBottom: theme.spacing(2),
  },
}));

export default function Filter({
  isHeatmap,
  toggleHeatmap,
  showPurchases,
  setShowPurchases,
  showDistributions,
  setShowDistributions,
}) {
  const classes = useStyles();
  const [checked, setChecked] = React.useState({
    bipoc: false,
    women: false,
    organic: false,
  });

  const [month, setMonth] = React.useState({
    may: true,
    june: true,
    july: true,
    august: true,
    september: true,
  });

  return (
    <Paper className={classes.paper}>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Purchases and Distributions</FormLabel>
        <FormControlLabel
          control={
            <Checkbox
              name="purchases"
              onChange={() => setShowPurchases(!showPurchases)}
              checked={showPurchases}
            />
          }
          label="Purchases"
        />
        <FormControlLabel
          control={
            <Checkbox
              name="distributions"
              onChange={() => setShowDistributions(!showDistributions)}
              checked={showDistributions}
            />
          }
          label="Distributions"
        />
      </FormControl>
      <FormControl component="fieldset" className={classes.formControl}>
        <FormLabel component="legend">Filter</FormLabel>
        <FormControlLabel
          control={<Checkbox name="bipoc" />}
          label="Filter to BIPOC Owned"
        />
        <FormControlLabel
          control={<Checkbox name="women" />}
          label="Filter to Women Owned"
        />
        <FormControlLabel
          control={<Checkbox name="organic" />}
          label="Filter to Certified Organic"
        />
      </FormControl>
      <FormControl className={classes.formControl}>
        <FormLabel component="legend">Months</FormLabel>
        <FormControlLabel
          control={<Checkbox name="may" value={month.may} />}
          label="May"
        />
        <FormControlLabel control={<Checkbox name="june" />} label="June" />
        <FormControlLabel control={<Checkbox name="july" />} label="July" />
        <FormControlLabel control={<Checkbox name="august" />} label="August" />
        <FormControlLabel
          control={<Checkbox name="september" />}
          label="September"
        />
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">Map Display</FormLabel>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={isHeatmap}
                onChange={() => toggleHeatmap(!isHeatmap)}
                name="heatmap"
              />
            }
            label="Use Heatmap"
          />
        </FormGroup>
      </FormControl>
    </Paper>
  );
}
