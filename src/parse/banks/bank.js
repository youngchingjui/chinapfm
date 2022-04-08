const {
  readCSV,
  combineOutflowInflow,
  convertJSONtoCSV,
  saveToFile,
  stripLeadingTags,
  fillMissingPayee,
  updateNotes,
  removeDuplicateNotes,
  replaceNotesWith摘要,
  removeEmptyRows,
} = require("../functions");

const parse_bank_txns = async (bank_upload) => {
  console.log("parse_bank_txns");
  let data;
  try {
    // Read CSV
    data = await readCSV(bank_upload);

    // Manipulate and clean data
    data = data.map((v) => {
      let row;
      row = combineOutflowInflow(v);
      row = stripLeadingTags(row);
      row = fillMissingPayee(row);
      row = removeDuplicateNotes(row);
      row = replaceNotesWith摘要(row);
      row = updateNotes(row);
      row = removeEmptyRows(row);
      return row;
    });

    // TODO: (BIG) Bring in Alipay and WeChat pay txn data to inform notes on bank txns

    // Convert back into CSV
    const dataCSV = await convertJSONtoCSV(data);
    const { tempFilePath, fileName } = await saveToFile(dataCSV);
    return { tempFilePath, fileName };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { parse_bank_txns };
