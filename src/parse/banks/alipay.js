const { readCSV } = require("../helper");

const parseAlipayTxns = async (alipayData) => {
  // Receives alipay data in JSON format
  // Manipulates and cleans data as per business logic
  // Returns cleaned data in JSON format
  console.log("parseAlipayTxns");
  console.log(alipayData);

  let data = alipayData;
  try {
    // Read CSV
    data = await readCSV(data);

    // Manipulate and clean data

    data = data.map((v) => {
      let row = v;
      return row;
    });
  } catch (err) {
    console.error(err);
  }

  return data;
};

module.exports = { parseAlipayTxns };
