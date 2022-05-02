import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import Checkbox from "@material-ui/core/Checkbox";
import Chip from "@material-ui/core/Chip";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import ListItemText from "@material-ui/core/ListItemText";
import FormLabel from "@material-ui/core/FormLabel";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import { scaleLinear } from "d3-scale";

import Legend from "./Legend";
import { parsePrice, getDistributionAmount, getDate } from "./utils";

const PURCHASE_GRADIENT = ["#a7c0d4", "#0076d6"];
const DISTRIBUTION_GRADIENT = ["#f7caa6", "#fc7405"];

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: "#90a4ae",
    height: "100%",
    padding: theme.spacing(2),
  },
  legendCaptions: {
    display: "flex",
    "& > *": {
      flex: 1,
    },
  },
  mapPaper: {
    backgroundColor: "#b0bec5",
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

function filteredHubsTest(selectedHubs, record, recordKey) {
  return !selectedHubs.length || selectedHubs.includes(record[recordKey]);
}

function filteredTest(record, filters) {
  return Object.keys(filters).every(
    (filterName) => !filters[filterName] || record[filterName]
  );
}

function filterIncludes(array, keySet) {
  if (!array.length) {
    return true;
  }
  return keySet.some((key) => array.includes(key));
}

export default function Filter({
  availableMonths,
  locations,
  contracts,
  distributions,
  purchases,
  children,
}) {
  const classes = useStyles();

  const [selectedHubs, setSelectedHubs] = useState([]);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [showPurchases, setShowPurchases] = useState(true);
  const [showDistributions, setShowDistributions] = useState(true);

  const [providerFilters, setProviderFilters] = useState({
    bipocOwned: false,
    womanOwned: false,
    certifiedOrganic: false,
  });

  const [distributorFilters, setDistributorFilters] = useState({
    schoolSite: false,
    foodBankPartner: false,
  });

  const filteredLocations = useMemo(
    () =>
      locations.filter((record) => {
        if (record.category && record.category.includes("Hub")) {
          return (
            filterIncludes(selectedLocationTypes, ["Hub"]) &&
            filteredHubsTest(selectedHubs, record, "name")
          );
        }

        if (
          record.category &&
          (record.category.includes("Farm") ||
            record.category.includes("Aggregating Farm"))
        ) {
          return (
            filterIncludes(selectedLocationTypes, [
              "Farm",
              "Aggregating Farm",
            ]) && filteredTest(record, providerFilters)
          );
        }

        if (
          record.category &&
          (record.category.includes("Distributor") ||
            record.category.includes("Food Distribution Org"))
        ) {
          return (
            filterIncludes(selectedLocationTypes, [
              "Distributor",
              "Food Distribution Org",
            ]) && filteredTest(record, distributorFilters)
          );
        }

        return true;
      }),
    [
      locations,
      providerFilters,
      distributorFilters,
      selectedHubs,
      selectedLocationTypes,
    ]
  );

  const locationTypes = useMemo(() => {
    const newTypes = {};

    locations.forEach(({ category }) => {
      category.forEach((c) => {
        newTypes[c] = true;
      });
    });

    return Object.keys(newTypes);
  }, [locations]);

  const hubs = useMemo(
    () =>
      locations
        ? locations.filter(({ category }) => category.includes("Hub"))
        : [],
    [locations]
  );

  function handleProviderFilters({ target: { name } }) {
    setProviderFilters({
      ...providerFilters,
      [name]: !providerFilters[name],
    });
  }

  function handleDistributorFilters({ target: { name } }) {
    setDistributorFilters({
      ...distributorFilters,
      [name]: !distributorFilters[name],
    });
  }

  const filteredPurchases = useMemo(
    () =>
      purchases.filter(
        (purchase) =>
          filteredHubsTest(selectedHubs, purchase, "hubOrganization") &&
          filteredTest(purchase, providerFilters) &&
          (!selectedContracts.length ||
            selectedContracts.includes(purchase.contract))
      ),
    [selectedHubs, providerFilters, selectedContracts, purchases]
  );

  const purchaseMinMax = useMemo(() => {
    let min = null;
    let max = null;

    for (let i = 0; i < filteredPurchases.length; i += 1) {
      let month = 0;

      availableMonths.forEach((monthValue) => {
        const monthPrice = parsePrice(
          filteredPurchases[i][monthValue.toLowerCase()]
        );

        if (selectedMonths.includes(monthValue)) {
          month += monthPrice;
        }
      });

      if (min === null || month < min) {
        min = month;
      }

      if (min === null || month > max) {
        max = month;
      }
    }

    return [min || 0, max || 0];
  }, [filteredPurchases, selectedMonths, availableMonths]);

  const purchaseGradient = useMemo(
    // #4897D8 is the base color.
    () => scaleLinear().domain(purchaseMinMax).range(PURCHASE_GRADIENT),
    [purchaseMinMax]
  );

  const filteredDistributions = useMemo(
    () =>
      distributions.filter(
        (distribution) =>
          filteredHubsTest(selectedHubs, distribution, "hub") &&
          filteredTest(distribution, distributorFilters)
      ),
    [selectedHubs, distributorFilters, distributions]
  );

  const distributionMinMax = useMemo(() => {
    let min = null;
    let max = null;

    for (let i = 0; i < filteredDistributions.length; i += 1) {
      const distribution = filteredDistributions[i];
      const distributionAmount = getDistributionAmount(
        distribution,
        selectedMonths,
        "totalPounds",
        availableMonths
      );

      if (min === null || distributionAmount < min) {
        min = distributionAmount;
      }

      if (max === null || distributionAmount > max) {
        max = distributionAmount;
      }
    }

    return [min || 0, max || 0];
  }, [filteredDistributions, selectedMonths, availableMonths]);

  const distributionGradient = useMemo(
    () => scaleLinear().domain(distributionMinMax).range(DISTRIBUTION_GRADIENT),
    [distributionMinMax]
  );

  return (
    <Grid container alignItems="stretch">
      <Grid item xs={3}>
        <Paper square className={classes.paper}>
          <Typography as="legend" variant="subtitle1">
            Filters
          </Typography>
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
            <InputLabel id="demo-mutiple-chip-label">Filter Types</InputLabel>
            <Select
              labelId="demo-mutiple-chip-label"
              id="demo-mutiple-chip"
              multiple
              value={selectedLocationTypes}
              onChange={(event) => setSelectedLocationTypes(event.target.value)}
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
              {locationTypes.map((types) => (
                <MenuItem key={types} value={types}>
                  <Checkbox checked={selectedLocationTypes.includes(types)} />
                  <ListItemText primary={types} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl component="fieldset" className={classes.formControl}>
            <InputLabel id="demo-mutiple-chip-label">
              Filter Contracts
            </InputLabel>
            <Select
              labelId="demo-mutiple-chip-label"
              id="demo-mutiple-chip"
              multiple
              value={selectedContracts}
              onChange={(event) => setSelectedContracts(event.target.value)}
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
              {contracts.map((contract) => (
                <MenuItem key={contract} value={contract}>
                  <Checkbox checked={selectedContracts.includes(contract)} />
                  <ListItemText primary={contract} />
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
                  checked={providerFilters.bipocOwned}
                  onChange={handleProviderFilters}
                />
              }
              label="BIPOC Owned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="womanOwned"
                  checked={providerFilters.womanOwned}
                  onChange={handleProviderFilters}
                />
              }
              label="Women Owned"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="certifiedOrganic"
                  checked={providerFilters.certifiedOrganic}
                  onChange={handleProviderFilters}
                />
              }
              label="Certified Organic"
            />
          </FormControl>

          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">Filter Distributors</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  name="schoolSite"
                  checked={providerFilters.schoolSite}
                  onChange={handleDistributorFilters}
                />
              }
              label="School Site"
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="foodBankPartner"
                  checked={providerFilters.foodBankPartner}
                  onChange={handleDistributorFilters}
                />
              }
              label="Food Bank Partner"
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
                <small className={classes.chips}>
                  {selected.map((name) => name).join(", ")}
                </small>
              )}
              MenuProps={MenuProps}
            >
              {availableMonths
                .sort((a, b) => (getDate(a) > getDate(b) ? 1 : -1))
                .map((month) => (
                  <MenuItem key={month} value={month}>
                    <Checkbox checked={selectedMonths.includes(month)} />
                    <ListItemText primary={month} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <div>
            <Typography as="legend" variant="subtitle1">
              Legend
            </Typography>
            <Legend
              title="Purchases"
              gradient={PURCHASE_GRADIENT}
              minMax={purchaseMinMax}
            />
            <Legend
              title="Distributions"
              gradient={DISTRIBUTION_GRADIENT}
              minMax={distributionMinMax}
            />
          </div>
        </Paper>
      </Grid>

      <Grid className={classes.map} item xs={9}>
        <Paper square className={`${classes.paper} ${classes.mapPaper}`}>
          {children({
            filteredLocations,
            filteredPurchases,
            filteredDistributions,
            selectedMonths,
            selectedHubs,
            showPurchases:
              showPurchases &&
              Object.values(distributorFilters).every((d) => !d),
            showDistributions:
              showDistributions &&
              Object.values(providerFilters).every((d) => !d),
            purchaseGradient,
            distributionGradient,
            distributionMinMax,
            purchaseMinMax,
          })}
        </Paper>
      </Grid>
    </Grid>
  );
}

Filter.propTypes = {
  availableMonths: PropTypes.arrayOf(PropTypes.string).isRequired,
  locations: PropTypes.arrayOf(PropTypes.object).isRequired,
  contracts: PropTypes.arrayOf(PropTypes.object).isRequired,
  children: PropTypes.func.isRequired,
  distributions: PropTypes.arrayOf(PropTypes.object).isRequired,
  purchases: PropTypes.arrayOf(PropTypes.object).isRequired,
};
