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
    // TODO: If `payee` is missing text, fill in with text from `notes`
    // TODO: If both `payee` and `notes` are missing in text and is `摘要` is `利息存入`, then fill `payee` as "中国建设银行股份有限公司上海分行运行中心" and `notes` as "利息存入"
    // TODO: If `摘要` is "ATM存款", then put that in `notes` (only after notes is copied to payee)
    // TODO: If `摘要` is not "消费" and `摘要` does not equal `notes`, then append `摘要` text to front of existing notes (after removing tags)
    // TODO: If text in `payee` and `notes` are the same, remove text in `notes`
    // TODO: Remove "消费-" from `payee`, leave it in `notes`

    // TODO: (BIG) Bring in Alipay and WeChat pay txn data to inform notes on bank txns

    // Convert back into CSV
    const dataCSV = await convertJSONtoCSV(data);
    const { tempFilePath, fileName } = await saveToFile(dataCSV);
    return { tempFilePath, fileName };
  } catch (err) {
    console.error(err);
  }
};

module.exports = { manage_bank_txns };
