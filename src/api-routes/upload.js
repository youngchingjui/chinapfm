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
  const { files, body } = req;
  const { fileUpload } = files;
  const { bank } = body;

  switch (bank) {
    case "ccb":
      // Read and clean bank data
      try {
        const txnData = await parseBankTxns(fileUpload);

        // Save as file
        const { tempFilePath, fileName } = await convertToTempFile(
          txnData,
          "./temp/ccb.csv"
        );

        // Send the file
        res.attachment();
        res.download(tempFilePath, fileName);
        break;
      } catch (err) {
        console.error(err);
      }

    case "alipay":
      // Read and clean Alipay data
      try {
        const txnData = await parseAlipayTxns(fileUpload);

        // Save as file
        const { tempFilePath, fileName } = await convertToTempFile(
          txnData,
          "./temp/alipay.csv"
        );

        // Send the file
        res.attachment();
        res.download(tempFilePath, fileName);
        break;
      } catch (err) {
        console.error(err);
      }

    case "wechat":
      // Read and clean WeChat pay data
      try {
        const txnData = await parseWechatTxns(fileUpload);

        // Save as file
        const { tempFilePath, fileName } = await convertToTempFile(
          txnData,
          "./temp/wechatpay.csv"
        );

        // Send the file
        res.attachment();
        res.download(tempFilePath, fileName);
        break;
      } catch (err) {
        console.error(err);
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
