const { readCSV, mapHeaders } = require("../helper");
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
    data = await readCSV(bank_upload, {
      skipLines: 3,
      mapHeaders,
    });

    // Manipulate and clean data
    data = data.map((v) => {
      let row = v;
      row = combineOutflowInflow(row);
      row = stripLeadingTags(row);
      row = fillMissingPayee(row);
      row = removeDuplicateNotes(row);
      row = replaceNotesWith摘要(row);
      row = updateNotes(row);
      row = removeEmptyRows(row);

      // Convert date to Date format
      const { date } = row;
      const year = Number(date.substring(0, 4));
      const month = Number(date.substring(4, 6)) - 1;
      const day = Number(date.substring(6));
      row = {
        ...row,
        date: new Date(year, month, day),
      };
      return row;
    });

    return data;
  } catch (err) {
    console.error(err);
  }
};

module.exports = { parseBankTxns };
