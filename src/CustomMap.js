import React, { useState, useEffect, useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Flare from "@material-ui/icons/Flare";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Nav from "./nav";

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
    [key]: L.icon({
      iconUrl: imageUrl,
      iconSize: [24, 24],
      // popupAnchor: [0, -15],
    }),
  }),
  {}
);

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "80vh",
  },
}));
// initial location on map
const position = [37.77191462466318, -122.4291251170002];

const CustomMap = ({ token, removeToken }) => {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [distibutions, setDistributions] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  async function fetchData() {
    const { locations, distributions, purchases } = await fetch(URL, {
      headers: { Authorization: token },
    }).then((res) => res.json());
    const rows = locations.filter(({ geocode }) => geocode);
    setItems(rows);
    setDistributions(distributions);
    setPurchases(purchases);
  }

  const selectedDistributions = useMemo(() => {
    console.log("selected Districutions", selectedLocationId);

    return "text";
  }, [selectedLocationId]);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Nav removeToken={removeToken} />
      <pre>{selectedLocationId}</pre>
      <MapContainer center={position} zoom={8} className={classes.root}>
        <TileLayer
          attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => {
          return (
            <Marker
              key={item.id}
              position={item.geocode}
              icon={mapIcons[item.category]}
              eventHandlers={{
                click: () => {
                  setSelectedLocationId(item.id);
                },
              }}
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
      </MapContainer>
    </div>
  );
};

export default CustomMap;
