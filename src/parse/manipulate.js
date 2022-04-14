const {
  removeLeadingTag,
  fillPayeeFromNotes,
  fillPayeeBank,
} = require("./helper");

const combineOutflowInflow = (row) => {
  // Combine outflow and inflow into 1 column, called "amount"

  const outflow = parseFloat(row.outflow);
  const inflow = parseFloat(row.inflow);
  if (outflow > 0) {
    row.amount = -outflow;
  } else if (inflow > 0) {
    row.amount = inflow;
  } else {
    row.amount = 0;
  }
  return row;
};

const stripLeadingTags = (row) => {
  // Remove "支付宝-" or "财付通-" from `payee` and `notes` columns.
  // Add to new `tags` column
  // Note: Sometimes leading tags appear twice. We remove both
  // TODO: Remove "消费-" from `payee`, leave it in `notes`
  // TODO: Somehow all rows are adding 支付宝 tags, figure out why
  const zfbTag = "支付宝-";
  const cftTag = "财付通-";

  const { payee, notes } = row;

  let updatedPayee,
    updatedNotes = null;

  updatedPayee = removeLeadingTag(payee, zfbTag);
  updatedNotes = removeLeadingTag(notes, zfbTag);

  if (updatedPayee || updatedNotes) {
    const updatedTag = zfbTag.replace("-", "");
    return {
      ...row,
      payee: updatedPayee ?? payee,
      notes: updatedNotes ?? notes,
      tag: updatedTag,
    };
  }

  // Check if cft exists in `payee` or `notes`
  updatedPayee = removeLeadingTag(payee, cftTag);
  updatedNotes = removeLeadingTag(notes, cftTag);

  if (updatedPayee || updatedNotes) {
    const updatedTag = cftTag.replace("-", "");
    return {
      ...row,
      payee: updatedPayee ?? payee,
      notes: updatedNotes ?? notes,
      tag: updatedTag,
    };
  }

  return row;
};

const fillMissingPayee = (row) => {
  // Fills in payee column where no data exists
  let updatedRow;
  updatedRow = fillPayeeFromNotes(row);
  updatedRow = fillPayeeBank(updatedRow);
  return updatedRow;
};

const removeDuplicateNotes = (row) => {
  // If text in `payee` and `notes` are the same, remove text in `notes`
  if (row.payee == row.notes) {
    return { ...row, notes: "" };
  }
  return row;
};

const replaceNotesWith摘要 = (row) => {
  // If notes is empty, then replace notes with "ATM存款" (only after notes is copied to payee)
  if (row.notes == "") {
    return { ...row, notes: row.摘要 };
  }
  return row;
};

const updateNotes = (row) => {
  // If `摘要` is not "消费" and `摘要` does not equal `notes`, then append `摘要` text to front of existing notes (after removing tags)
  if (!(row.摘要 == "消费") && !(row.摘要 == row.notes)) {
    return { ...row, notes: row.摘要 + "-" + row.notes };
  }
  return row;
};

const removeEmptyRows = (row) => {
  // Checks if date column is empty. If so, remove row
  if (row.date == "") {
    return null;
  }
  return row;
};

module.exports = {
  combineOutflowInflow,
  stripLeadingTags,
  fillMissingPayee,
  removeDuplicateNotes,
  replaceNotesWith摘要,
  updateNotes,
  removeEmptyRows,
};
