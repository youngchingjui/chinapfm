const fs = require("fs");
const { AsyncParser } = require("json2csv");
const { TEMP_FOLDER, HEADER_FIELDS } = require("../lib/constants");
const { parseBankTxns } = require("../parse/banks/bank");
const {
  convertToZipFile,
  convertToTempFile,
  convertJSONtoCSV,
} = require("../parse/helper");
const { parseAlipayTxns } = require("../parse/banks/alipay");
const parseWechatTxns = require("../parse/banks/wechat");
const { parseICBCTxns } = require("../parse/banks/icbc");
const { alipay: alipayMerge, wechat: wechatMerge } = require("../parse/merge");

const is_connected = (platformData, bankData) => {
  return platformData.map((aRow) => {
    const relatedRow = bankData.filter(
      (bRow) =>
        bRow.date.toLocaleDateString() == aRow.date.toLocaleDateString() &&
        bRow.amount == aRow.amount
    );
    if (relatedRow.length == 1) {
      return { ...aRow, is_connected: true };
    }
    return aRow;
  });
};

const merge = async (req, res) => {
  const { files, body } = req;

  // Check if `files` exists
  if (!files) {
    errorMsg = "Didn't receive a file";
    console.error(errorMsg);
    res.status(400).send(errorMsg);
  }

  // Check if `body` missing
  if (!body) {
    errorMsg = "No bank selected";
    console.error(errorMsg);
    res.status(400).send(errorMsg);
  }

  const { bank } = body;
  const { wechat, alipay, bankTxns } = files;

  // Check if `bankTxns` missing
  if (!bankTxns) {
    errorMsg = "No bank transactions provided";
    console.error(errorMsg);
    res.status(400).send(errorMsg);
  }

  var bankData, wechatData, alipayData;
  try {
    switch (bank) {
      case "ccb":
        bankData = await parseBankTxns(bankTxns);
        break;
      case "icbc":
        bankData = await parseICBCTxns(bankTxns);
        break;
      default:
        errorMsg = `Incorrect bank provided: ${bank}`;
        console.error(errorMsg);
        res.status(400).send(errorMsg);
    }

    if (wechat) {
      wechatData = await parseWechatTxns(wechat);
    }

    if (alipay) {
      alipayData = await parseAlipayTxns(alipay);
    }
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }

  // Merge txns into bank_txns
  if (alipayData) {
    bankData = alipayMerge(alipayData, bankData);

    // Add "true" to `is_connected` column on alipayData if equivalent txn in `bankData`
    alipayData = is_connected(
      alipayData,
      bankData.filter((v) => v.tag == "支付宝")
    );

    // TODO: ALL BELOW
    // Confirm which alipay txns are linked by adding `true` to `isBankLinked` column

    // Of remaining non-linked bank + alipay data, link txns that might be split into 2+ txns on alipay, but show up as 1 on bank

    // Label linked alipay txns by adding `true` to `isBankLinked` column

    // Of remaining non-linked bank + alipay data, if bank row.amount < alipay row.amount, then link the 2

    // For links where amount don't equal, create a row on alipay with extra amount
  }

  if (wechatData) {
    bankData = wechatMerge(wechatData, bankData);

    wechatData = is_connected(
      wechatData,
      bankData.filter((v) => v.tag == "财付通")
    );
  }

  // Convert cleaned data into temp files
  let bankFile, alipayFile, weChatFile;
  try {
    bankFile = await convertToTempFile(bankData, `./temp/${bank}.csv`);

    if (alipayData) {
      alipayFile = await convertToTempFile(alipayData, "./temp/alipay.csv");
    }
    if (wechatData) {
      weChatFile = await convertToTempFile(wechatData, "./temp/wechatpay.csv");
    }
  } catch (err) {
    console.error(err);
  }

  const [bankCSV, alipayCSV, wechatCSV] = await Promise.all([
    convertJSONtoCSV(bankData),
    convertJSONtoCSV(alipayData),
    convertJSONtoCSV(wechatData),
  ]);

  // TODO: Don't add file if no data
  const { tempFilePath, fileName } = await convertToZipFile([
    { fileName: TEMP_FOLDER + `/${bank}Txns.csv`, fileData: bankCSV },
    { fileName: TEMP_FOLDER + "/alipayTxns.csv", fileData: alipayCSV },
    { fileName: TEMP_FOLDER + "/wechatTxns.csv", fileData: wechatCSV },
  ]);

  // return ZIP file
  // res.attachment();
  // res.download(tempFilePath, fileName);
  res.status(204).send();

  console.log("Sent!");
};

module.exports = {
  merge,
};
