const fs = require("fs");
const csvParser = require("csv-parser");
const { parseAsync } = require("json2csv");
const {
  headerMappings: { ccb },
} = require("../mappings/header");
const { TEMP_FOLDER, FILE_NAME, HEADER_FIELDS } = require("../lib/constants");

const mapHeaders = ({ header }) => {
  // remove trailing spaces
  const formattedHeader = header.replace(/\s+$/, "");

  // translate required headings into English
  if (formattedHeader in ccb) {
    return ccb[formattedHeader];
  }
  return formattedHeader;
};

const readCSV = (bankUpload, options) => {
  console.log("readCSV");
  // Reads CSV from filepath
  // Also replaces some headers into English

  return new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(bankUpload.tempFilePath).pipe(
      csvParser(options)
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

const removeLeadingTag = (text, tag) => {
  if (!text) {
    return text;
  }

  let newText = text;
  if (newText.startsWith(tag)) {
    newText = newText.replace(tag, "");
    // Sometimes tag appears twice. Remove both times
    if (newText.startsWith(tag)) {
      newText = newText.replace(tag, "");
    }
  }

  return newText;
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

const convertToZipFile = async (files) => {
  const JSZip = require("jszip");
  const zip = new JSZip();

  for (const file of files) {
    if (!file) {
      return;
    }
    const { fileName, fileData } = file;
    zip.file(fileName, fileData);
  }

  return new Promise((res, rej) => {
    const zipFileName = "/transactions.zip";
    const zipFilePath = TEMP_FOLDER + zipFileName;
    zip
      .generateNodeStream({ type: "nodebuffer", streamFiles: true })
      .pipe(fs.createWriteStream(zipFilePath))
      .on("finish", () => {
        console.log("finished zipping");
        res({ tempFilePath: zipFilePath, zipFileName });
      });
  });
};

const convertToTempFile = async (data, filePath) => {
  const dataCSV = await convertJSONtoCSV(data);
  const { tempFilePath, fileName } = await saveToFile(dataCSV, filePath);
  return { tempFilePath, fileName };
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

const saveToFile = (dataCSV, filePath) => {
  // Write the json results to file
  console.log("saveToFile");

  // TODO: Save only temporarily, delete after use
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, dataCSV, {}, (err) => {
      if (err) {
        reject(err);
      }
      resolve({ tempFilePath: filePath, fileName: FILE_NAME });
    });
  });
};

module.exports = {
  readCSV,
  removeLeadingTag,
  fillPayeeFromNotes,
  fillPayeeBank,
  convertToZipFile,
  convertToTempFile,
  convertJSONtoCSV,
  saveToFile,
  mapHeaders,
};
