require("dotenv").config();

const fetch = require("node-fetch");
const camelCase = require("lodash.camelcase");

const SheetNames = {
  ADDRESSES: "Addresses",
  DISTRIBUTIONS: "Distributions",
  FARM_PURCHASES: "Farm Purchases",
};

const { SPREADSHEET_ID } = process.env;

function parseSpreadsheet([columns, ...values], hashLocation) {
  const locationHashByName = {};
  const locationList = [];
  const keys = columns.map((column) => camelCase(column));
  let index = 0;

  // Find row name, hack, gotta formalize
  while (values[index] && values[index][1]) {
    let obj = { id: index };
    row = values[index];

    keys.forEach((columnHeader, index) => {
      if (columnHeader === "geocode" && row[index]) {
        obj[columnHeader] = row[index].split(", ");
      } else {
        obj[columnHeader] = row[index] === "" ? null : row[index];
      }
    });

    locationHashByName[obj.name] = obj;
    locationList.push(obj);
    index++;
  }
  return [locationList, locationHashByName];
}

function matchDistributionNames(distributions, locationHash) {
  return distributions.map(({ hub, distributionSite, ...rest }) => ({
    hubId: (locationHash[hub] || {}).id,
    distributionSiteId: (locationHash[distributionSite] || {}).id,
    hub,
    distributionSite,
    ...rest,
  }));
}

function matchPurchasesNames(purchases, locationHash) {
  return purchases.map(({ hubOrganization, farmName, ...rest }) => ({
    hubOrganizationId: (locationHash[hubOrganization] || {}).id,
    farmNameId: (locationHash[farmName] || {}).id,
    hubOrganization,
    farmName,
    ...rest,
  }));
}

exports.handler = async function (event, context) {
  const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Addresses!A:J`;
  const DIST_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Distributions!A:J`;
  const PURCHASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Purchases!A:J`;

  const spreadsheet = await fetch(
    `${URL}?access_token=${event.headers.authorization}`
  ).then((res) => res.json());
  const result = parseSpreadsheet(spreadsheet.values);

  const distributions = await fetch(
    `${DIST_URL}?access_token=${event.headers.authorization}`
  ).then((res) => res.json());
  const [parsedDistributionSpreadsheet] = parseSpreadsheet(
    distributions.values
  );
  const newDistributions = matchDistributionNames(
    parsedDistributionSpreadsheet,
    result[1]
  );

  const purchases = await fetch(
    `${PURCHASE_URL}?access_token=${event.headers.authorization}`
  ).then((res) => res.json());

  const [parsedPurchaseSpreadsheet] = parseSpreadsheet(purchases.values);
  const newPurchases = matchPurchasesNames(
    parsedPurchaseSpreadsheet,
    result[1]
  );

  return {
    statusCode: 200,
    body: JSON.stringify({
      locations: result[0],
      distributions: newDistributions,
      purchases: newPurchases,
    }),
  };
};
