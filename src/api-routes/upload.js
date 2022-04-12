const { TEMP_FOLDER } = require("../lib/constants");
const { headerMappings } = require("../mappings/header");
const { parseBankTxns } = require("../parse/banks/bank");
const { mergeAlipayData, mergeWeChatData } = require("../parse/combine");
const {
  convertToZipFile,
  convertToTempFile,
  convertJSONtoCSV,
} = require("../parse/helper");
const fs = require("fs");
const csvParser = require("csv-parser");
const iconv = require("iconv-lite");
const transforms = require("../transforms");

const upload = async (req, res) => {
  const { files } = req;
  const { bankUpload, alipayUpload, wechatUpload } = files;

  let bankData, alipayData, wechatData;

  // Read and clean data
  if (bankUpload) {
    try {
      bankData = await parseBankTxns(bankUpload);
    } catch (err) {
      console.error(err);
    }
  }

  // Read Alipay data
  alipayData = [];
  const converterStream = iconv.decodeStream("GB18030");
  const alipayParser = csvParser({
    skipLines: 4,
    mapHeaders: ({ header }) => {
      var newHeader = header;

      // Remove trailing spaces
      newHeader = newHeader.replace(/\s+$/, "");

      // Replace certain headers
      if (newHeader in headerMappings.alipay) {
        return headerMappings.alipay[newHeader];
      }
      return newHeader;
    },
    mapValues: ({ value }) => value.replace(/\s+$/, ""),
  });

  alipayData = await new Promise((resolve, reject) => {
    const result = [];
    fs.createReadStream(alipayUpload.tempFilePath)
      .pipe(converterStream)
      .pipe(alipayParser)
      .pipe(transforms.alipay)
      .on("data", (data) => {
        result.push(data);
      })
      .on("end", () => {
        console.log("Finished processing Alipay data");
        resolve(result);
      })
      .on("error", (err) => {
        reject(err);
      });
  });

  if (wechatUpload) {
    try {
      wechatData = await parseWechatTxns(wechatUpload);
    } catch (err) {
      console.error(err);
    }
  }

  // Merge txns into bank_txns
  if (alipayData && bankData) {
    bankData = mergeAlipayData(alipayData, bankData);
  }

  if (wechatData && bankData) {
    bankData = mergeWeChatData(wechatData, bankData);
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
