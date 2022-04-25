const fs = require("fs");
const { AsyncParser } = require("json2csv");
const { TEMP_FOLDER, HEADER_FIELDS } = require("../lib/constants");
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
  const { files, body } = req;

  // Check if `files` exists
  if (!files) {
    errorMsg = "Didn't receive a file";
    console.error(errorMsg);
    res.status(400).send(errorMsg);
  }

  const { fileUpload } = files;
  const { bank } = body;

  switch (bank) {
    case "ccb":
      // Read and clean bank data
      try {
        const txnData = await parseBankTxns(fileUpload);

        // Save as file
        const fileName = "ccb.csv";
        const tempFilePath = `./temp/${fileName}`;
        await convertToTempFile(txnData, tempFilePath);

        // Send the file
        res.attachment();
        res.download(tempFilePath, fileName);
        break;
      } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
        break;
      }

    case "alipay":
      // Read and clean Alipay data
      try {
        const txnData = await parseAlipayTxns(fileUpload);

        // Save as file
        const fileName = "alipay.csv";
        const tempFilePath = `./temp/${fileName}`;
        await convertToTempFile(txnData, tempFilePath);

        // Send the file
        res.attachment();
        res.download(tempFilePath, fileName);
        break;
      } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
        break;
      }

    case "wechat":
      // Read and clean WeChat pay data
      try {
        const txnData = await parseWechatTxns(fileUpload);

        // Save as file
        const fileName = "wechat.csv";
        const tempFilePath = `./temp/${fileName}`;
        await convertToTempFile(txnData, tempFilePath);

        // Send the file
        res.attachment();
        res.download(tempFilePath, fileName);
        break;
      } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
        break;
      }

    default:
      const errorMsg = "Didn't receive file from existing bank options";
      console.error(errorMsg);
      res.status(400).send();
  }

  //   // Merge txns into bank_txns
  //   if (alipayData && bankData) {
  //     bankData = merge.alipay(alipayData, bankData);
  //     // TODO: ALL BELOW
  //     // Confirm which alipay txns are linked by adding `true` to `isBankLinked` column

  //     // Of remaining non-linked bank + alipay data, link txns that might be split into 2+ txns on alipay, but show up as 1 on bank

  //     // Label linked alipay txns by adding `true` to `isBankLinked` column

  //     // Of remaining non-linked bank + alipay data, if bank row.amount < alipay row.amount, then link the 2

  //     // For links where amount don't equal, create a row on alipay with extra amount
  //   }

  //   if (wechatData && bankData) {
  //     bankData = merge.wechat(wechatData, bankData);
  //   }

  //   // Convert cleaned data into temp files
  //   let bankFile, alipayFile, weChatFile;
  //   try {
  //     if (bankData) {
  //       bankFile = await convertToTempFile(bankData, "./temp/ccb.csv");
  //     }
  //     if (alipayData) {
  //       alipayFile = await convertToTempFile(alipayData, "./temp/alipay.csv");
  //     }
  //     if (wechatData) {
  //       weChatFile = await convertToTempFile(wechatData, "./temp/wechatpay.csv");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }

  //   const [bankCSV, alipayCSV, wechatCSV] = await Promise.all([
  //     convertJSONtoCSV(bankData),
  //     convertJSONtoCSV(alipayData),
  //     convertJSONtoCSV(wechatData),
  //   ]);

  //   // TODO: Don't add file if no data
  //   const { tempFilePath, fileName } = await convertToZipFile([
  //     { fileName: TEMP_FOLDER + "/bankTxns.csv", fileData: bankCSV },
  //     { fileName: TEMP_FOLDER + "/alipayTxns.csv", fileData: alipayCSV },
  //     { fileName: TEMP_FOLDER + "/wechatTxns.csv", fileData: wechatCSV },
  //   ]);

  //   // return ZIP file
  //   // res.attachment();
  //   // res.download(tempFilePath, fileName);
  //   res.status(204).send();

  //   console.log("Sent!");
};

module.exports = {
  upload,
};
