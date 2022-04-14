const csvParser = require("csv-parser");
const iconv = require("iconv-lite");
const fs = require("fs");
const { headerMappings } = require("../../mappings/header");
const transforms = require("../../transforms");

const parseAlipayTxns = async (alipayUpload) => {
  // Receives alipay file upload
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format
  console.log("parseAlipayTxns");

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

  return await new Promise((resolve, reject) => {
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
};

module.exports = { parseAlipayTxns };
