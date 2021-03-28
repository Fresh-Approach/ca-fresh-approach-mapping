require("dotenv").config();

const fetch = require("node-fetch");
const camelCase = require("lodash.camelcase");

const SHEETS_URI = "https://sheets.googleapis.com/v4/spreadsheets/";
const { SPREADSHEET_ID } = process.env;

function getLocationHash([columns, ...values]) {
  const locationHashByName = {};
  const keys = columns.map((column) => camelCase(column));
  let index = 0;

  // A while loop is used because we don't need to iterate through all rows.
  while (values[index] && values[index][1]) {
    const row = values[index];
    const [category, locationName] = row;

    if (locationHashByName[locationName]) {
      locationHashByName[locationName].category.push(category);
    } else {
      const newLocation = { id: index };
      keys.forEach((columnHeader, i) => {
        if (columnHeader === "geocode" && row[i]) {
          newLocation[columnHeader] = row[i].split(", ");
        } else if (columnHeader === "category") {
          newLocation[columnHeader] = [row[i]];
        } else if (
          ["bipocOwned", "womanOwned", "certifiedOrganic"].includes(
            columnHeader
          )
        ) {
          newLocation[columnHeader] = row[i] === "TRUE";
        } else {
          newLocation[columnHeader] = row[i] === "" ? null : row[i];
        }
      });
      locationHashByName[locationName] = newLocation;
    }
    index++;
  }

  return locationHashByName;
}

function mapSheetsResponse([columns, ...values]) {
  const resultList = [];
  let index = 0;
  const keys = columns.map((column) => camelCase(column));
  while (values[index] && values[index][1]) {
    const row = values[index];
    const obj = {};
    keys.forEach((columnHeader, i) => {
      obj[columnHeader] = row[i] === "" ? null : row[i];
    });

    resultList.push(obj);
    index++;
  }

  return resultList;
}

function matchDistributionNames(distributions, locationHash) {
  return distributions.map(({ hub, distributionSite, ...rest }) => ({
    hubId: (locationHash[hub] || {}).id,
    hubGeo: (locationHash[hub] || {}).geocode,
    distributionSiteId: (locationHash[distributionSite] || {}).id,
    distributionSiteGeo: (locationHash[distributionSite] || {}).geocode,
    bipocOwned: (locationHash[distributionSite] || {}).bipocOwned,
    womanOwned: (locationHash[distributionSite] || {}).womanOwned,
    certifiedOrganic: (locationHash[distributionSite] || {}).certifiedOrganic,
    hub,
    distributionSite,
    ...rest,
  }));
}

function matchPurchasesNames(purchases, locationHash) {
  return purchases.map(({ hubOrganization, farmName, ...rest }) => ({
    hubOrganizationId: (locationHash[hubOrganization] || {}).id,
    hubOrganizationGeo: (locationHash[hubOrganization] || {}).geocode,
    farmNameId: (locationHash[farmName] || {}).id,
    farmNameGeo: (locationHash[farmName] || {}).geocode,
    bipocOwned: (locationHash[farmName] || {}).bipocOwned,
    womanOwned: (locationHash[farmName] || {}).womanOwned,
    certifiedOrganic: (locationHash[farmName] || {}).certifiedOrganic,
    hubOrganization,
    farmName,
    ...rest,
  }));
}

exports.handler = async function (event, context) {
  const [addresses, distributions, purchases] = await Promise.all(
    ["Addresses", "Distributions", "Purchases"].map(
      async (sheetName) =>
        await fetch(
          `${SHEETS_URI}${SPREADSHEET_ID}/values/${sheetName}!A:J?access_token=${event.headers.authorization}`
        ).then((res) => res.json())
    )
  );

  if (addresses.error) {
    return {
      statusCode: addresses.error.code,
      body: JSON.stringify({ error: addresses.error.message }),
    };
  }

  const parsedLocationHash = getLocationHash(addresses.values);

  const newDistributions = matchDistributionNames(
    mapSheetsResponse(distributions.values),
    parsedLocationHash
  );

  const newPurchases = matchPurchasesNames(
    mapSheetsResponse(purchases.values),
    parsedLocationHash
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      locations: Object.values(parsedLocationHash),
      distributions: newDistributions,
      purchases: newPurchases,
    }),
  };
};
