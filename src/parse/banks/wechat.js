const fs = require("fs");
const transforms = require("../../transforms");
const csvParsers = require("../csv");

const parseWechatTxns = async (wechat_upload) => {
  // Receives wechat file upload
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format
  console.log("parseWechatTxns");

  const result = [];
  return await new Promise((resolve, reject) => {
    fs.createReadStream(wechat_upload.tempFilePath)
      .pipe(csvParsers.wechat)
      .pipe(transforms.wechat)
      .on("data", (data) => {
        result.push(data);
      })
      .on("end", () => {
        console.log("Finished processing WeChat Pay data");
        resolve(result);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

module.exports = parseWechatTxns;
