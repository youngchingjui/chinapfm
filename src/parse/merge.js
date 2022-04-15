// These functions "enhance" the data on bank transactions from Alipay and WeChat Pay
// Txns from Alipay and WeChat pay provide more details on individual transactions.
// We add these details to the bank transactions data

// TODO: Some Alipay txns use mix of alipay balance + card on file. These need to be matched by date, and ccb amount must be less than alipay amount. Ultimate, need a manual check on alipay for that txn to see if a portion really was deducted from alipay balance
// TODO: Alipay Taobao items bought together on 1 payment show as 1txn on CCB, but multiple lines on TB. Adding remaining unaccounted amounts for txns on same day often matches. Or playing with different permutations of grouping will add up.
// TODO: Some repeat transactions happen on same day, with same payee + notes, + same amount. Find out how to still merge these txns
const mergeAlipayData = (alipayData, bankData) => {
  // If a transaction on `bankData` has the same date and amount as a txn on `alipayData`
  // and `tag` is `支付宝`, then replace the `payee` and `notes` values with those from `alipayData`.
  // Add `true` to `isBankLinked` column in `alipayData`

  return bankData.map((bRow) => {
    // Only compare rows where `tag` is `支付宝`
    if (bRow.tag != `支付宝`) {
      return bRow;
    }

    // Find matching transactions on `alipayData` by `date` and `amount`
    const matches = alipayData.filter((aRow) => {
      return (
        aRow.date.toLocaleDateString() == bRow.date.toLocaleDateString() &&
        aRow.amount == bRow.amount
      );
    });

    if (matches.length == 0) {
      // Didn't find any matches
      return bRow;
    } else if (matches.length == 1) {
      const aRow = matches[0];

      // Replace bRow `payee` and `notes` from aRow
      return { ...bRow, payee: aRow.payee, notes: aRow.notes, isAlipay: true };
    } else {
      const aRow = matches[0];

      // If all of the items in array have the same payee + notes
      if (
        matches
          .map((v) => aRow.payee == v.payee && aRow.notes == v.notes)
          .every(Boolean)
      ) {
        // Assign `aRow` payee / notes to bRow
        return {
          ...bRow,
          payee: aRow.payee,
          notes: aRow.notes,
          isAlipay: true,
        };
      }

      console.warn(
        "There are 2+ items in alipay data with same date and amount, but different payee or notes",
        JSON.stringify(matches, null, 4)
      );
      return bRow;
    }
  });
};

const mergeWeChatData = (wechatData, bankData) => {
  return bankData;
};

module.exports = { mergeAlipayData, mergeWeChatData };
