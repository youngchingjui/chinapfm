const csvParser = require("csv-parser");
const { parseAsync } = require("json2csv");
const fs = require("fs");
const { headerMappings } = require("../mappings/header");

const TEMP_FILE_PATH = "./bank_txns.csv";
const FILE_NAME = "bank_txns.csv";
const HEADER_FIELDS = ["date", "payee", "amount", "notes", "tag"];

const combineOutflowInflow = (row) => {
  console.log("combineOutflowInflow");
  // Combine outflow and inflow into 1 column, called "amount"

  const outflow = parseFloat(row.outflow);
  const inflow = parseFloat(row.inflow);
  if (outflow > 0) {
    row.amount = -outflow;
  } else if (inflow > 0) {
    row.amount = inflow;
  } else {
    row.amount = 0;
  }
  return row;
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

const stripLeadingTags = (row) => {
  // Remove "支付宝-" or "财付通-" from `payee` and `notes` columns.
  // Add to new `tags` column
  // Note: Sometimes leading tags appear twice. We remove both
  // TODO: Remove "消费-" from `payee`, leave it in `notes`
  const zfbTag = "支付宝-";
  const cftTag = "财付通-";

  const { payee, notes } = row;

  let updatedPayee,
    updatedNotes = null;

  updatedPayee = removeLeadingTag(payee, zfbTag);
  updatedNotes = removeLeadingTag(notes, zfbTag);

  if (updatedPayee || updatedNotes) {
    const updatedTag = zfbTag.replace("-", "");
    return {
      ...row,
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
      ...row,
      payee: updatedPayee ?? payee,
      notes: updatedNotes ?? notes,
      tag: updatedTag,
    };
  }

  return row;
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

const fillMissingPayee = (row) => {
  // Fills in payee column where no data exists
  let updatedRow;
  updatedRow = fillPayeeFromNotes(row);
  updatedRow = fillPayeeBank(updatedRow);
  return updatedRow;
};

const fillPayeeFromNotes = (row) => {
  // If `payee` is missing text, fill in with text from `notes`
  if (row.payee == "") {
    return { ...row, payee: row.notes };
  }
  return row;
};

const fillPayeeBank = (row) => {
  // If both `payee` and `notes` are missing in text and `摘要` column is `利息存入`, then fill `payee` as "中国建设银行股份有限公司上海分行运行中心" and `notes` as "利息存入"

  if (row.payee == "" && row.notes == "" && row.摘要 == "利息存入") {
    return {
      ...row,
      payee: "中国建设银行股份有限公司上海分行运行中心",
      notes: "利息存入",
    };
  }
  return row;
};

const replaceNotesWith摘要 = (row) => {
  // If notes is empty, then replace notes with "ATM存款" (only after notes is copied to payee)
  if (row.notes == "") {
    return { ...row, notes: row.摘要 };
  }
  return row;
};

const updateNotes = (row) => {
  // If `摘要` is not "消费" and `摘要` does not equal `notes`, then append `摘要` text to front of existing notes (after removing tags)
  console.log(row.摘要, row.notes, row.摘要 !== row.notes);
  if (!(row.摘要 == "消费") && !(row.摘要 == row.notes)) {
    return { ...row, notes: row.摘要 + "-" + row.notes };
  }
  return row;
};

const removeDuplicateNotes = (row) => {
  // TODO: If text in `payee` and `notes` are the same, remove text in `notes`
  if (row.payee == row.notes) {
    return { ...row, notes: "" };
  }
  return row;
};

module.exports = {
  combineOutflowInflow,
  readCSV,
  convertJSONtoCSV,
  saveToFile,
  stripLeadingTags,
  fillMissingPayee,
  updateNotes,
  removeDuplicateNotes,
  replaceNotesWith摘要,
};
