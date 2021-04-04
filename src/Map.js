import React, { useMemo } from "react";
import Proptypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import { scaleLinear } from "d3-scale";
import { points, center as turfCenter } from "@turf/turf";

import Nav from "./Nav";
import Filter from "./Filter";
import Heatmap from "./Heatmap";
import { getMapIcon } from "./utils";
import useData from "./use-data";

const useStyles = makeStyles(() => ({
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

const Map = ({ token, removeToken }) => {
  const classes = useStyles();

  const { locations, distributions, purchases } = useData({
    token,
    removeToken,
  });

  const distributionGradient = useMemo(() => {
    let min = 0;
    let max = 0;

    for (let i = 0; i < distributions.length; i += 1) {
      const { boxes } = distributions[i];

      if (boxes < min) {
        min = boxes;
      }

      if (boxes > max) {
        max = boxes;
      }
    }

    return scaleLinear().domain([min, max]).range(["red", "steelblue"]);
  }, [distributions]);

  const purchaseGradient = useMemo(() => {
    let min = 0;
    let max = 0;

    for (let i = 0; i < purchases.length; i += 1) {
      const { june } = purchases[i];
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
  }, [purchases]);

  // todo delete
  const filteredDistributions = useMemo(() => distributions, [distributions]);

  // todo delete
  const filteredPurchases = useMemo(() => purchases, [purchases]);

  const features = points(
    locations.length
      ? locations.map((l) => l.geocode.map((coord) => parseInt(coord, 10)))
      : [[37.77191462466318, -122.4291251170002]] // hardcoded fallback
  );

  const center = turfCenter(features);

  return (
    <div>
      <Nav removeToken={removeToken} />
      <Filter
        locations={locations}
        distributions={distributions}
        purchases={purchases}
        className={classes.paper}
      >
        {({
          filteredLocations,
          isHeatmap,
          showPurchases,
          showDistributions,
        }) => (
          <MapContainer
            center={center.geometry.coordinates}
            zoom={8}
            className={classes.root}
          >
            <TileLayer
              attribution='&copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isHeatmap ? (
              <Heatmap locations={locations} />
            ) : (
              <>
                {filteredLocations.map((item) => (
                  <Marker
                    key={item.id}
                    className={classes.icon}
                    position={item.geocode}
                    icon={getMapIcon(item.category)}
                    style={{ border: 0 }}
                  >
                    <Popup onOpen={() => {}}>
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
                ))}
                {showDistributions &&
                  filteredDistributions.map(
                    ({ id, hubGeo, distributionSiteGeo, boxes }) => (
                      <Polyline
                        key={id}
                        positions={[hubGeo, distributionSiteGeo]}
                        pathOptions={{ color: distributionGradient(boxes) }}
                      />
                    )
                  )}
                {showPurchases &&
                  filteredPurchases.map((purchase) => (
                    <Polyline
                      key={purchases.id}
                      positions={[
                        purchase.hubOrganizationGeo,
                        purchase.farmNameGeo,
                      ]}
                      pathOptions={{ color: purchaseGradient(800) }}
                    />
                  ))}
              </>
            )}
          </MapContainer>
        )}
      </Filter>
    </div>
  );
};

Map.propTypes = {
  token: Proptypes.string.isRequired,
  removeToken: Proptypes.func.isRequired,
};

export default Map;
