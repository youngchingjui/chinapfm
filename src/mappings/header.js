const headerMappings = {
  ccb: {
    交易日期: "date",
    支出: "outflow",
    收入: "inflow",
    对方户名: "payee",
    交易地点: "notes",
  },
  alipay: {
    交易创建时间: "date",
    交易对方: "payee",
    商品名称: "notes",
    "金额（元）": "amount",
  },
  wechat: {
    交易时间: "date",
    交易对方: "payee",
    商品: "notes",
    "金额(元)": "amount",
  },
  icbc: {
    交易日期: "date",
    对方户名: "payee",
    交易场所: "notes",
    "记账金额(收入)": "inflow",
    "记账金额(支出)": "outflow",
  },
};

module.exports = { headerMappings };
