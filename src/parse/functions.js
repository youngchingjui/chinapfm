const csvParser = require("csv-parser");
const { parseAsync } = require("json2csv");
const fs = require("fs");
const { headerMappings } = require("../mappings/header");

const TEMP_FILE_PATH = "./bank_txns.csv";
const FILE_NAME = "bank_txns.csv";

const HEADER_FIELDS = ["date", "payee", "amount", "notes", "tag"];

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
    const opts = { fields: HEADER_FIELDS };

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

  // TODO: Save only temporarily, delete after use
  return new Promise((resolve, reject) => {
    fs.writeFile(TEMP_FILE_PATH, dataCSV, {}, (err) => {
      if (err) {
        reject(err);
      }
      resolve({ tempFilePath: TEMP_FILE_PATH, fileName: FILE_NAME });
    });
  });
};

const stripLeadingTags = (data) => {
  // Remove "支付宝-" or "财付通-" from `payee` and `notes` columns.
  // Add to new `tags` column
  // Note: Sometimes leading tags appear twice. We remove both
  const zfbTag = "支付宝-";
  const cftTag = "财付通-";

  return data.map((v, i) => {
    const { payee, notes } = v;

    let updatedPayee,
      updatedNotes = null;

    updatedPayee = removeLeadingTag(payee, zfbTag);
    updatedNotes = removeLeadingTag(notes, zfbTag);

    if (updatedPayee || updatedNotes) {
      const updatedTag = zfbTag.replace("-", "");
      return {
        ...v,
        payee: updatedPayee ?? payee,
        notes: updatedNotes ?? notes,
        tag: updatedTag,
      };
    }

    // Check if cft exists in `payee` or `notes`
    updatedPayee = removeLeadingTag(payee, cftTag);
    updatedNotes = removeLeadingTag(notes, cftTag);

    if (updatedPayee || updatedNotes) {
      const updatedTag = cftTag.replace("-", "");
      return {
        ...v,
        payee: updatedPayee ?? payee,
        notes: updatedNotes ?? notes,
        tag: updatedTag,
      };
    }

    return v;
  });
};

const removeLeadingTag = (text, tag) => {
  let updatedText = null;
  if (text.startsWith(tag)) {
    updatedText = text.replace(tag, "");
    // Sometimes tag appears twice. Remove both times
    if (updatedText.startsWith(tag)) {
      updatedText = updatedText.replace(tag, "");
    }
  }

  return updatedText;
};

module.exports = {
  combineOutflowInflow,
  readCSV,
  convertJSONtoCSV,
  saveToFile,
  stripLeadingTags,
};
