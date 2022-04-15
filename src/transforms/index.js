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

const wechat = new Transform({ objectMode: true });
wechat._transform = (chunk, encoding, callback) => {
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

  wechat.push({ ...chunk, date: newDate, amount: newAmount, notes: newNotes });
  callback();
};

const transforms = { alipay, wechat };
module.exports = transforms;
