import React, { useState, useEffect, useMemo, Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { scaleLinear } from "d3-scale";

import Nav from "./Nav";
import Filter from "./Filter";
import Heatmap from "./Heatmap";

const URL = "/.netlify/functions/locations";

const LocationTypes = {
  FARM: "Farm",
  AGGREGATING_FARM: "Aggregating Farm",
  HUB: "Hub",
  FOOD_DISTRIBUTION_ORG: "Food Distribution Org",
  DISTRIBUTOR: "Distributor",
};

const LocationIcons = {
  [LocationTypes.FARM]: "./spa-24px.svg",
  [LocationTypes.AGGREGATING_FARM]: "./spa-24px.svg",
  [LocationTypes.HUB]: "./flare-24px.svg",
  [LocationTypes.FOOD_DISTRIBUTION_ORG]: "./store_mall_directory-24px.svg",
  [LocationTypes.DISTRIBUTOR]: "./local_shipping-24px.svg",
};

const mapIcons = Object.entries(LocationIcons).reduce(
  (accumulator, [key, imageUrl]) => ({
    ...accumulator,
    [key]: L.divIcon({
      iconUrl: imageUrl,
      iconSize: [24, 24],
      html: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="blue"/></svg>`,
    }),
  }),
  {}
);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "80vh",
  },
  paper: {
    backgroundColor: "lightgray",
    height: "100%",
  },
  map: {
    "& .leaflet-marker-icon": {
      border: 0,
      backgroundColor: "transparent",
    },
    border: 0,
  },
}));
// initial location on map
const position = [37.77191462466318, -122.4291251170002];

const CustomMap = ({ token, removeToken }) => {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isHeatmap, toggleHeatmap] = useState(false);

  async function fetchData() {
    const { locations, distributions, purchases } = await fetch(URL, {
      headers: { Authorization: token },
    }).then((res) => res.json());

    const rows = locations.filter(({ geocode }) => geocode);
    setItems(rows);
    setDistributions(distributions);
    setPurchases(purchases);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const selectedDistributions = useMemo(() => {
    return distributions.filter((distribution) => {
      return distribution.hubGeo && distribution.distributionSiteGeo;
    });
  }, [selectedLocationId, distributions]);

  const distributionGradient = useMemo(() => {
    let min = 0,
      max = 0;

    for (let i = 0; i < selectedDistributions.length; i++) {
      const { boxes } = selectedDistributions[i];

      if (boxes < min) {
        min = boxes;
      }

      if (boxes > max) {
        max = boxes;
      }
    }

    return scaleLinear().domain([min, max]).range(["red", "steelblue"]);
  }, [selectedDistributions]);

  const selectedPurchases = useMemo(() => {
    return purchases.filter((purchases) => {
      return purchases.hubOrganizationGeo && purchases.farmNameGeo;
    });
  }, [selectedLocationId, purchases]);

  const purchaseGradient = useMemo(() => {
    let min = 0,
      max = 0;

    for (let i = 0; i < selectedPurchases.length; i++) {
      const { june } = selectedPurchases[i];
      // Hack to see more stuff.
      const month = (june || "$0.00")
        .split("$")[1]
        .replace(",", "")
        .replace(".00", "");

      if (month < min) {
        min = month;
      }

      if (month > max) {
        max = month;
      }
    }

    return scaleLinear().domain([min, max]).range(["pink", "purple"]);
  }, [selectedPurchases]);

  return (
    <div>
      <Nav removeToken={removeToken} />
      {/* <pre>{selectedLocationId}</pre> */}
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Filter
            className={classes.paper}
            isHeatmap={isHeatmap}
            toggleHeatmap={toggleHeatmap}
          />
        </Grid>
        <Grid className={classes.map} item xs={9}>
          <MapContainer center={position} zoom={8} className={classes.root}>
            <TileLayer
              attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isHeatmap ? (
              <Heatmap items={items} />
            ) : (
              <Fragment>
                {items.map((item) => {
                  return (
                    <Marker
                      key={item.id}
                      className={classes.icon}
                      position={item.geocode}
                      icon={mapIcons[item.category]}
                      eventHandlers={{
                        click: () => {
                          setSelectedLocationId(item.id);
                        },
                      }}
                      style={{ border: 0 }}
                    >
                      <Popup>
                        <strong>Name: </strong>
                        {item.name}
                        <br />
                        <strong>Address: </strong>
                        {item.address}
                        <br />
                        <strong>Category: </strong>
                        {item.category}
                      </Popup>
                    </Marker>
                  );
                })}
                {selectedDistributions.map(
                  ({ hubGeo, distributionSiteGeo, boxes }) => (
                    <Polyline
                      positions={[hubGeo, distributionSiteGeo]}
                      pathOptions={{ color: distributionGradient(boxes) }}
                    />
                  )
                )}
                {selectedPurchases.map((purchases) => (
                  <Polyline
                    positions={[
                      purchases.hubOrganizationGeo,
                      purchases.farmNameGeo,
                    ]}
                    pathOptions={{ color: purchaseGradient(800) }}
                  />
                ))}
              </Fragment>
            )}
          </MapContainer>
        </Grid>
      </Grid>
    </div>
  );
};

export default CustomMap;
