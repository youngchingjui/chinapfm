const iconv = require("iconv-lite");
const fs = require("fs");
const transforms = require("../../transforms");
const csvParsers = require("../csv");

const parseAlipayTxns = async (alipayUpload) => {
  // Receives alipay file upload
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format
  console.log("parseAlipayTxns");

  const converterStream = iconv.decodeStream("GB18030");

  return await new Promise((resolve, reject) => {
    // Reject if any transforms have errors
    csvParsers.alipay.on("error", (err) => {
      reject(err);
    });

    transforms.alipay.on("error", (err) => {
      reject(err);
    });

    const result = [];
    fs.createReadStream(alipayUpload.tempFilePath)
      .pipe(converterStream)
      .pipe(csvParsers.alipay)
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
};

module.exports = { parseAlipayTxns };
