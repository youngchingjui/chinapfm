const fs = require("fs");
const csvParser = require("csv-parser");
const { pipeline, Transform } = require("stream");
const { headerMappings } = require("../../mappings/header");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(customParseFormat);

const csvParserOptions = {
  skipLines: 6,
  mapHeaders: ({ header }) => {
    var newHeader = header;

    // Remove trailing spaces
    newHeader = newHeader.replace(/\s+$/, "");

    // Replace certain headers
    if (newHeader in headerMappings.icbc) {
      return headerMappings.icbc[newHeader];
    }
    return newHeader;
  },
  mapValues: ({ value }) => value.replace(/\s+$/, ""),
};

const icbcTransformFunction = (chunk, encoding, callback) => {
  const { date, outflow, inflow, 摘要, notes, payee, 余额 } = chunk;

  var newNotes = notes;
  var newPayee = payee;
  var newTag, newDate;

  // Remove empty rows (checks if `余额` is empty)
  if (!余额) {
    callback();
    return;
  }

  // set date as Date object
  newDate = dayjs(date, "YYYY-MM-DD").toDate();

  // If `摘要` == "他行汇入", copy `摘要` into `notes`
  if (摘要 == "他行汇入") {
    newNotes = "他行汇入";
  }

  // If `摘要` == "利息", set `payee` to "工商银行"
  if (摘要 == "利息") {
    newPayee = "工商银行";
  }

  // If `notes` starts with "京东支付-", "支付宝-", "美团-", "财付通-" tags, remove tag, and add "京东支付" to `tags` column
  const tags = ["京东支付", "支付宝", "美团", "财付通"];
  for (const tag of tags) {
    if (notes.startsWith(`${tag}-`)) {
      newTag = tag;
      newNotes = notes.replace(`${tag}-`, "");
    }
  }

  // if `tag` is "美团", swap `notes` with `payee`
  if (newTag == "美团") {
    const interimValue = newPayee;
    newPayee = newNotes;
    newNotes = interimValue;
  }

  // Combine inflow and outflow rows
  if (outflow) {
    // Note: Regex removes comma separators
    newAmount = -parseFloat(outflow.replace(/,/g, ""));
  } else if (inflow) {
    newAmount = parseFloat(inflow.replace(/,/g, ""));
  } else {
    console.warn("Did not receive outflow or inflow, amount is set to 0");
    newAmount = 0;
  }

  callback(null, {
    ...chunk,
    notes: newNotes,
    payee: newPayee,
    tag: newTag,
    amount: newAmount,
    date: newDate,
  });
};

const parseICBCTxns = async (upload) => {
  // Receives ICBC file upload
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format

  // Note: Could not refactor some functions to make this more readable.
  // Event listener leakage occurs when functions are called outside of this function's scope
  console.log("parseICBCTxns");

  return await new Promise((resolve, reject) => {
    // Save finalized rows to `result` and resolve with result if successful
    const result = [];

    // Create read stream
    const readStream = fs.createReadStream(upload.tempFilePath);

    // Create csv parser transform
    const csvParserTransform = csvParser(csvParserOptions).on(
      "headers",
      (headers) => {
        // Check if all required headers are included
        // If missing at least 1 header, then CSV likely not right format. Reject
        const missingHeaders = Object.values(headerMappings.icbc).filter(
          (e) => {
            if (!headers.includes(e)) {
              return e;
            }
          }
        );

        if (missingHeaders.length > 0)
          csvParserTransform.destroy(
            Error(`Missing some headers: ${missingHeaders}`)
          );
      }
    );

    // Create ICBC-specific transforms
    const icbcTransform = new Transform({ objectMode: true }).on(
      "data",
      (data) => {
        result.push(data);
      }
    );
    icbcTransform._transform = icbcTransformFunction;

    // Pipe all the streams together, and return results
    pipeline(readStream, csvParserTransform, icbcTransform, (err) => {
      if (err) {
        reject(Error(err));
      }
      resolve(result);
    });
  });
};

module.exports = { parseICBCTxns };
