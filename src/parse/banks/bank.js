const {
  readCSV,
  combineOutflowInflow,
  convertJSONtoCSV,
  saveToFile,
  stripLeadingTags,
} = require("../functions");

const manage_bank_txns = async (bank_upload) => {
  console.log("manage_bank_txns");
  let data;
  try {
    // Read CSV
    data = await readCSV(bank_upload);

    // Manipulate and clean data
    data = combineOutflowInflow(data);
    data = stripLeadingTags(data);

    // Convert back into CSV
    const dataCSV = await convertJSONtoCSV(data);
    const { tempFilePath, fileName } = await saveToFile(dataCSV);
    return { tempFilePath, fileName };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { manage_bank_txns };
