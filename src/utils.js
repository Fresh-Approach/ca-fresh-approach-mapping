export const GOOGLE_CLIENT_ACCESS_TOKEN = "google_client_access_token";

const LOCATION_COLORS = {
  Farm: "#009688",
  Hub: "#9500ae",
  "Aggregating Farm": "#ff3d00",
  "Food Distribution Org": "#ffea00",
  Distributor: "#2979ff",
};

/*
Gets map icons using location types.
*/
export function getMapIcon(locationTypes) {
  return L.divIcon({
    html: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    ${locationTypes
      .map((type, i) => {
        const size = (locationTypes.length - i) * 20;
        return `<circle cx="${50}" cy="${50}" r="${size}" fill=${
          LOCATION_COLORS[type]
        } />`;
      })
      .join()}
    </svg>`,
  });
}
