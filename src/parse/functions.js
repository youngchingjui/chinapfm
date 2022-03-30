const csvParser = require("csv-parser");
const { parseAsync } = require("json2csv");
const fs = require("fs");
const { headerMappings } = require("../mappings/header");

const tempFilePath = "./bank_txns.csv";
const fileName = "bank_txns.csv";

const combineOutflowInflow = (result) => {
  console.log("combineOutflowInflow");
  // Combine outflow and inflow into 1 column, called "amount"
  return result.map((e, i) => {
    const outflow = parseFloat(e.outflow);
    const inflow = parseFloat(e.inflow);
    if (outflow > 0) {
      e.amount = -outflow;
    } else if (inflow > 0) {
      e.amount = inflow;
    } else {
      e.amount = 0;
    }
    return e;
  });
};

const mapHeaders = ({ header }) => {
  // remove trailing spaces
  const formattedHeader = header.replace(/\s+$/, "");

  // translate required headings into English
  if (formattedHeader in headerMappings) {
    return headerMappings[formattedHeader];
  }
  return formattedHeader;
};

const readCSV = (bank_upload) => {
  console.log("readCSV");
  // Reads CSV from filepath
  // Also replaces some headers into English

  const csvParserOptions = {
    skipLines: 5,
    mapHeaders: mapHeaders,
  };

  return new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(bank_upload.tempFilePath).pipe(
      csvParser(csvParserOptions)
        .on("data", (data) => {
          result.push(data);
        })
        .on("end", () => {
          resolve(result);
        })
        .on("error", (err) => {
          reject(err);
        })
    );
  });
};

const convertJSONtoCSV = (data) => {
  // parse JSON back to CSV
  console.log("convertJSONtoCSV");
  return new Promise((resolve, reject) => {
    const fields = ["date", "payee", "amount", "notes"];
    const opts = { fields };

    parseAsync(data, opts)
      .then((csv) => {
        resolve(csv);
      })
      .catch((err) => reject(err));
  });
};

const saveToFile = (dataCSV) => {
  // Write the json results to file
  console.log("saveToFile");

  return new Promise((resolve, reject) => {
    fs.writeFile(tempFilePath, dataCSV, {}, (err) => {
      if (err) {
        reject(err);
      }
      resolve({ tempFilePath, fileName });
    });
  });
};

module.exports = {
  combineOutflowInflow,
  readCSV,
  convertJSONtoCSV,
  saveToFile,
};
