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

alipay.on("headers", (headers) => {
  // Check if all required headers are included
  const missingHeaders = Object.values(headerMappings.alipay).filter((e) => {
    if (!headers.includes(e)) {
      return e;
    }
  });

  if (missingHeaders.length > 0)
    alipay.destroy(Error(`Missing some headers: ${missingHeaders}`));
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

wechat.on("headers", (headers) => {
  // Check if all required headers are included
  const missingHeaders = Object.values(headerMappings.wechat).filter((e) => {
    if (!headers.includes(e)) {
      return e;
    }
  });

  if (missingHeaders.length > 0)
    wechat.destroy(Error(`Missing some headers: ${missingHeaders}`));
});

const csvParsers = { alipay, wechat };
module.exports = csvParsers;
