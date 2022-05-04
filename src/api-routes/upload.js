const { parseBankTxns } = require("../parse/banks/bank");
const { parseAlipayTxns } = require("../parse/banks/alipay");
const parseWechatTxns = require("../parse/banks/wechat");
const { parseICBCTxns } = require("../parse/banks/icbc");
const { convertToTempFile } = require("../parse/helper");

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

    case "icbc":
      try {
        const txnData = await parseICBCTxns(fileUpload);

        // Save as file
        const fileName = "icbc.csv";
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
};

module.exports = {
  upload,
};
