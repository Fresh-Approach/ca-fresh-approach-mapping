import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";

export default function Heatmap({ locations }) {
  const map = useMap();
  useEffect(() => {
    const points = locations.map(({ geocode }) => {
      return [...geocode, 0.9];
    });

    const heat = L.heatLayer(points, { radius: 100, maxZoom: 13 }).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [locations, map]);

  return null;
}
