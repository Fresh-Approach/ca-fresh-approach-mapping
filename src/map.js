import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import Nav from "./nav";

const URL = "/.netlify/functions/tester";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    height: "80vh",
  },
}));
// initial location on map
const position = [37.77191462466318, -122.4291251170002];

const CustomMap = ({ token }) => {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [items, setItems] = useState([]);

  async function fetchData() {
    const data = await fetch(URL, {
      headers: { Authorization: token },
    }).then((res) => res.json());

    const rows = data.locations.filter(({ geocode }) => geocode);

    return setItems(rows);
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <Nav />
      <pre>{JSON.stringify(items)}</pre>
      <MapContainer center={position} zoom={8} className={classes.root}>
        <TileLayer
          attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => (
          <Marker key={item.id} position={item.geocode}>
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
        ))}
      </MapContainer>
    </div>
  );
};

export default CustomMap;
