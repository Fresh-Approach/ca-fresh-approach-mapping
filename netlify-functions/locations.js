require("dotenv").config();

const fetch = require("node-fetch");
const camelCase = require("lodash.camelcase");

const SheetNames = {
  ADDRESSES: "Addresses",
  DISTRIBUTIONS: "Distributions",
  FARM_PURCHASES: "Farm Purchases",
};

SPREADSHEET_ID = "14jPlnqsqNTeoQhA1eUWZXSBzajMEpkVpcXyJI_704FI";

function parseSpreadsheet([columns, ...values]) {
  const keys = columns.map((column) => camelCase(column));
  const data = values.map((row, index) => {
    let obj = { id: index };
    keys.forEach((columnHeader, index) => {
      if (columnHeader === "geocode" && row[index]) {
        obj[columnHeader] = row[index].split(", ");
      } else {
        obj[columnHeader] = row[index] === "" ? null : row[index];
      }
    });

    return obj;
  });
  return data;
}

exports.handler = async function (event, context) {
  const URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Addresses!A:J`;

  const spreadsheet = await fetch(
    `${URL}?access_token=${event.headers.authorization}`
  ).then((res) => res.json());

  const result = parseSpreadsheet(spreadsheet.values);

  return {
    statusCode: 200,
    body: JSON.stringify({ locations: result }),
  };
};
