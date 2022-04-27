const fs = require("fs");
const csvParser = require("csv-parser");
const { Transform, pipeline } = require("stream");
const { headerMappings } = require("../../mappings/header");

const csvParserOptions = {
  skipLines: 16,
  mapHeaders: ({ header }) => {
    if (header in headerMappings.wechat) {
      return headerMappings.wechat[header];
    }
    return header;
  },
};

const weChatTransformFunction = (chunk, encoding, callback) => {
  const { date, amount, notes } = chunk;

  // Convert date to Date object
  const [dateString, timeString] = date.split(" ");
  const [day, month, year] = dateString.split("-");
  const [hour, seconds] = timeString.split(":");
  const newDate = new Date(2000 + Number(year), month - 1, day, hour, seconds);

  // Remove "¥" from `amount` and convert to Number object
  var newAmount = Number(amount.replace("¥", ""));

  // If `收/支` == "支出", make `amount` negative
  if (chunk["收/支"] == "支出") {
    newAmount = -newAmount;
  }

  // If `notes` == "/", copy `交易类型` into `商品`
  var newNotes = notes;
  if (newNotes == "/") {
    newNotes = chunk["交易类型"];
  }

  callback(null, {
    ...chunk,
    date: newDate,
    amount: newAmount,
    notes: newNotes,
  });
};

const parseWechatTxns = async (wechat_upload) => {
  // Receives wechat file upload
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format

  // Note: Could not refactor some functions to make this more readable.
  // Event listener leakage occurs when functions are called outside of this function's scope
  console.log("parseWechatTxns");

  return await new Promise((resolve, reject) => {
    // Save final rows to `result` and resolve with result if successful
    const result = [];

    // Create read stream
    const readStream = fs.createReadStream(wechat_upload.tempFilePath);

    // Create csv parser transform
    const csvParserTransform = csvParser(csvParserOptions).on(
      "headers",
      (headers) => {
        // Check if all required headers are included
        const missingHeaders = Object.values(headerMappings.wechat).filter(
          (e) => {
            if (!headers.includes(e)) {
              return e;
            }
          }
        );

        // If missing at least 1 header, then CSV likely not right format. Reject
        if (missingHeaders.length > 0)
          csvParserTransform.destroy(
            Error(`Missing some headers: ${missingHeaders}`)
          );
      }
    );

    // Create wechat transform
    const wechatTransform = new Transform({ objectMode: true }).on(
      "data",
      (data) => {
        result.push(data);
      }
    );
    wechatTransform._transform = weChatTransformFunction;

    // Pipe all the streams together, and return results
    pipeline(readStream, csvParserTransform, wechatTransform, (err) => {
      if (err) {
        reject(Error(err));
      }
      resolve(result);
    });
  });
};

module.exports = parseWechatTxns;
