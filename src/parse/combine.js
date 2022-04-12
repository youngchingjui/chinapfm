// All functions to "enhance" data on bank transactions from Alipay and WeChat Pay

// TODO: Replace payee and description from alipay to CCB txns where 支付宝 tag is
// TODO: Some Alipay txns use mix of alipay balance + card on file. These need to be matched by date, and ccb amount must be less than alipay amount. Ultimate, need a manual check on alipay for that txn to see if a portion really was deducted from alipay balance
// TODO: Alipay Taobao items bought together on 1 payment show as 1txn on CCB, but multiple lines on TB. Adding remaining unaccounted amounts for txns on same day often matches. Or playing with different permutations of grouping will add up.
// TODO: If CCB txn details are "edited" by Alipay, add column says "informed by Alipay", set as true

const mergeAlipayData = (alipayData, bankData) => {
  return bankData;
};

const mergeWeChatData = (wechatData, bankData) => {
  return bankData;
};

module.exports = { mergeAlipayData, mergeWeChatData };
