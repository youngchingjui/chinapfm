const {
  readCSV,
  combineOutflowInflow,
  convertJSONtoCSV,
  saveToFile,
} = require("./functions");

const manage_bank_txns = async (bank_upload) => {
  console.log("manage_bank_txns");
  let data;
  try {
    data = await readCSV(bank_upload);
    data = combineOutflowInflow(data);
    const dataCSV = await convertJSONtoCSV(data);
    const { tempFilePath, fileName } = await saveToFile(dataCSV);
    return { tempFilePath, fileName };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { manage_bank_txns };
