const { Transform } = require("stream");

const alipay = new Transform({ objectMode: true });
alipay._transform = (chunk, encoding, callback) => {
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
    alipay.push({ ...chunk, date: newDate, amount: newAmount });
  }

  callback();
};

const transforms = { alipay };
module.exports = transforms;
