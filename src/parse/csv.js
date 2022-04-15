const csvParser = require("csv-parser");
const { headerMappings } = require("../mappings/header");

const alipay = csvParser({
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

const wechat = csvParser({
  skipLines: 16,
  mapHeaders: ({ header }) => {
    if (header in headerMappings.wechat) {
      return headerMappings.wechat[header];
    }
    return header;
  },
});

const csvParsers = { alipay, wechat };
module.exports = csvParsers;
