import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListItemText from "@material-ui/core/ListItemText";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Select from "@material-ui/core/Select";
import Switch from "@material-ui/core/Switch";
import { makeStyles } from "@material-ui/core/styles";

const MONTHS = ["May", "June", "July", "August", "September"];

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: "lightgray",
    height: "100%",
    padding: theme.spacing(2),
  },
  formControl: {
    width: "100%",
    paddingBottom: theme.spacing(2),
  },
  map: {
    "& .leaflet-marker-icon": {
      border: 0,
      backgroundColor: "transparent",
    },
    border: 0,
  },
}));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function filterRecords(filters, records) {
  return () =>
    records.filter((record) =>
      Object.keys(filters).every(
        (filterName) => !filters[filterName] || record[filterName]
      )
    );
}

export default function Filter({ locations, children }) {
  const classes = useStyles();

  const [selectedHubs, setSelectedHubs] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [isHeatmap, toggleHeatmap] = useState(false);
  const [showPurchases, setShowPurchases] = useState(true);
  const [showDistributions, setShowDistributions] = useState(true);
  const [selectedHeatmapOption, setSelectedHeatmapOption] = useState(
    "providers"
  );

  const [demographicsFilters, setDemographicsFilters] = useState({
    bipocOwned: false,
    womanOwned: false,
    certifiedOrganic: false,
  });

  const filteredLocations = useMemo(
    filterRecords(demographicsFilters, locations),
    [locations, demographicsFilters]
  );

  const hubs = useMemo(
    () =>
      locations
        ? locations.filter(({ category }) => category.includes("Hub"))
        : [],
    [locations]
  );

  function handleDemographicsFilters({ target: { name } }) {
    setDemographicsFilters({
      ...demographicsFilters,
      [name]: !demographicsFilters[name],
    });
  }

  return (
    <Grid container>
      <Grid item xs={3}>
        <Paper className={classes.paper}>
          <FormControl component="fieldset" className={classes.formControl}>
            <InputLabel id="demo-mutiple-chip-label">Filter Hubs</InputLabel>
            <Select
              labelId="demo-mutiple-chip-label"
              id="demo-mutiple-chip"
              multiple
              value={selectedHubs}
              onChange={(event) => {
                setSelectedHubs(event.target.value);
              }}
              input={<Input id="select-multiple-chip" />}
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {selected.map((name) => (
                    <Chip key={name} label={name} className={classes.chip} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {hubs.map(({ id, name }) => (
                <MenuItem key={id} value={name}>
                  <Checkbox checked={selectedHubs.includes(name)} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">
              Purchases and Distributions
            </FormLabel>
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
            <FormLabel component="legend">Filter Providers</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  name="bipocOwned"
                  checked={demographicsFilters.bipocOwned}
                  onChange={handleDemographicsFilters}
                />
              }
              label="Filter to BIPOC Owned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="womanOwned"
                  checked={demographicsFilters.womanOwned}
                  onChange={handleDemographicsFilters}
                />
              }
              label="Filter to Women Owned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="certifiedOrganic"
                  checked={demographicsFilters.certifiedOrganic}
                  onChange={handleDemographicsFilters}
                />
              }
              label="Filter to Certified Organic"
            />
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <InputLabel id="month-select">Months</InputLabel>
            <Select
              labelId="month-select"
              id="month-chip"
              multiple
              value={selectedMonths}
              onChange={(event) => {
                setSelectedMonths(event.target.value);
              }}
              input={<Input id="select-month-chip" />}
              renderValue={(selected) => (
                <div className={classes.chips}>
                  {selected.map((name) => (
                    <Chip key={name} label={name} className={classes.chip} />
                  ))}
                </div>
              )}
              MenuProps={MenuProps}
            >
              {MONTHS.map((month) => (
                <MenuItem key={month} value={month}>
                  <Checkbox checked={selectedMonths.includes(month)} />
                  <ListItemText primary={month} />
                </MenuItem>
              ))}
            </Select>
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
              <FormLabel component="legend">Heatmap Values</FormLabel>
              <RadioGroup
                aria-label="heatmapvalues"
                name="heatmap-values"
                value={selectedHeatmapOption}
                onChange={({ target }) =>
                  setSelectedHeatmapOption(target.value)
                }
              >
                <FormControlLabel
                  value="providers"
                  control={<Radio />}
                  label="Funds to Providers"
                />
                <FormControlLabel
                  value="distributors"
                  control={<Radio />}
                  label="Food to Distributors"
                />
              </RadioGroup>
            </FormGroup>
          </FormControl>
        </Paper>
      </Grid>

      <Grid className={classes.map} item xs={9}>
        {children({
          filteredLocations,
          isHeatmap,
          selectedHubs,
          showPurchases,
          showDistributions,
        })}
      </Grid>
    </Grid>
  );
}

Filter.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.func.isRequired,
};
