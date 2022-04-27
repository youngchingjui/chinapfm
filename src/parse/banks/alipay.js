const fs = require("fs");
const iconv = require("iconv-lite");
const csvParser = require("csv-parser");
const { pipeline, Transform } = require("stream");
const { headerMappings } = require("../../mappings/header");

const csvParserOptions = {
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
};

const alipayTransformFunction = (chunk, encoding, callback) => {
  const { amount, date, 资金状态 } = chunk;

  // Convert amount to number
  var newAmount = parseFloat(amount);

  // If "资金状态" is not "已收入", then make `amount` negative
  if (资金状态 != "已收入") {
    newAmount = -newAmount;
  }

  // Convert `date` to actual date
  const newDate = new Date(date);

  // Remove rows without data in `date`
  if (date) {
    callback(null, { ...chunk, date: newDate, amount: newAmount });
  } else {
    callback();
  }
};

const parseAlipayTxns = async (alipayUpload) => {
  // Receives alipay file upload
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format

  // Note: Could not refactor some functions to make this more readable.
  // Event listener leakage occurs when functions are called outside of this function's scope
  console.log("parseAlipayTxns");

  return await new Promise((resolve, reject) => {
    // Save final rows to `result` and resolve with result if successful
    const result = [];

    // Create read stream
    const readStream = fs.createReadStream(alipayUpload.tempFilePath);

    // Create decoding converter stream
    const converterStream = iconv.decodeStream("GB18030");

    // Create csv parser transform
    const csvParserTransform = csvParser(csvParserOptions).on(
      "headers",
      (headers) => {
        // Check if all required headers are included
        const missingHeaders = Object.values(headerMappings.alipay).filter(
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

    // Create alipay-specific transforms
    const alipayTransform = new Transform({ objectMode: true }).on(
      "data",
      (data) => {
        result.push(data);
      }
    );
    alipayTransform._transform = alipayTransformFunction;

    // Pipe all the streams together, and return results
    pipeline(
      readStream,
      converterStream,
      csvParserTransform,
      alipayTransform,
      (err) => {
        if (err) {
          reject(Error(err));
        }
        resolve(result);
      }
    );
  });
};

module.exports = { parseAlipayTxns };
