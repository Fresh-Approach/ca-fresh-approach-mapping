import React, { useState, useEffect, useMemo, Fragment } from "react";
import { makeStyles } from "@material-ui/core/styles";
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
import { getMapIcon } from "./utils";

const URL = "/.netlify/functions/locations";

const LocationTypes = {
  FARM: "Farm",
  AGGREGATING_FARM: "Aggregating Farm",
  HUB: "Hub",
  FOOD_DISTRIBUTION_ORG: "Food Distribution Org",
  DISTRIBUTOR: "Distributor",
};

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

const position = [37.77191462466318, -122.4291251170002];

const CustomMap = ({ token, removeToken }) => {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [distributions, setDistributions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [isHeatmap, toggleHeatmap] = useState(false);
  const [showPurchases, setShowPurchases] = useState(true);
  const [showDistributions, setShowDistributions] = useState(true);

  async function fetchData() {
    const { locations, distributions, purchases, error } = await fetch(URL, {
      headers: { Authorization: token },
    }).then((res) => res.json());

    if (error) {
      return removeToken();
    }

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
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <Filter
            className={classes.paper}
            isHeatmap={isHeatmap}
            toggleHeatmap={toggleHeatmap}
            showDistributions={showDistributions}
            setShowDistributions={setShowDistributions}
            showPurchases={showPurchases}
            setShowPurchases={setShowPurchases}
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
                      icon={getMapIcon(item.category)}
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
                        {item.category.join(", ")}
                      </Popup>
                    </Marker>
                  );
                })}
                {showDistributions &&
                  selectedDistributions.map(
                    ({ id, hubGeo, distributionSiteGeo, boxes }) => (
                      <Polyline
                        key={id}
                        positions={[hubGeo, distributionSiteGeo]}
                        pathOptions={{ color: distributionGradient(boxes) }}
                      />
                    )
                  )}
                {showPurchases &&
                  selectedPurchases.map((purchases) => (
                    <Polyline
                      key={purchases.id}
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
