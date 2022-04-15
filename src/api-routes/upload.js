const { TEMP_FOLDER } = require("../lib/constants");
const { parseBankTxns } = require("../parse/banks/bank");
const { mergeAlipayData, mergeWeChatData } = require("../parse/merge");
const {
  convertToZipFile,
  convertToTempFile,
  convertJSONtoCSV,
} = require("../parse/helper");
const { parseAlipayTxns } = require("../parse/banks/alipay");
const parseWechatTxns = require("../parse/banks/wechat");
const merge = require("../parse/merge");

const upload = async (req, res) => {
  const { files } = req;
  const { bankUpload, alipayUpload, wechatUpload } = files;

  let bankData, alipayData, wechatData;

  // Read and clean bank data
  if (bankUpload) {
    try {
      bankData = await parseBankTxns(bankUpload);
    } catch (err) {
      console.error(err);
    }
  }

  // Read and clean Alipay data
  if (alipayUpload) {
    try {
      alipayData = await parseAlipayTxns(alipayUpload);
    } catch (err) {
      console.error(err);
    }
  }

  // Read and clean WeChat pay data
  if (wechatUpload) {
    try {
      wechatData = await parseWechatTxns(wechatUpload);
    } catch (err) {
      console.error(err);
    }
  }

  // Merge txns into bank_txns
  if (alipayData && bankData) {
    bankData = merge.alipay(alipayData, bankData);
    // TODO: ALL BELOW
    // Confirm which alipay txns are linked by adding `true` to `isBankLinked` column

    // Of remaining non-linked bank + alipay data, link txns that might be split into 2+ txns on alipay, but show up as 1 on bank

    // Label linked alipay txns by adding `true` to `isBankLinked` column

    // Of remaining non-linked bank + alipay data, if bank row.amount < alipay row.amount, then link the 2

    // For links where amount don't equal, create a row on alipay with extra amount
  }

  if (wechatData && bankData) {
    bankData = merge.wechat(wechatData, bankData);
  }

  // Convert cleaned data into temp files
  let bankFile, alipayFile, weChatFile;
  try {
    if (bankData) {
      bankFile = await convertToTempFile(bankData, "./temp/ccb.csv");
    }
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
    { fileName: TEMP_FOLDER + "/bankTxns.csv", fileData: bankCSV },
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
  upload,
};
