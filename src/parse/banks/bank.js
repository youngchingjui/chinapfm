const { readCSV } = require("../helper");
const {
  combineOutflowInflow,
  stripLeadingTags,
  fillMissingPayee,
  removeDuplicateNotes,
  replaceNotesWith摘要,
  updateNotes,
  removeEmptyRows,
} = require("../manipulate");

const parseBankTxns = async (bank_upload) => {
  console.log("parseBankTxns");
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

    return data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { parseBankTxns };
