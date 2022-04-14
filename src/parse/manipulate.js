const { fillPayeeFromNotes, fillPayeeBank } = require("./helper");

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

const stripLeadingTags = (row, tag) => {
  // Removes `tag` from `payee` and `notes` columns.
  // Add to new `tags` column
  // Note: Sometimes leading tags appear twice. We remove both
  // TODO: Remove "消费-" from `payee`, leave it in `notes`

  let updatedPayee = row.payee;
  let updatedNotes = row.notes;
  let updatedTag = row.tag;

  if (updatedPayee.startsWith(tag)) {
    updatedTag = tag;
    updatedPayee = updatedPayee.replace(tag + "-", "");

    if (updatedPayee.startsWith(tag)) {
      updatedPayee = updatedPayee.replace(tag + "-", "");
    }
  }

  if (updatedNotes.startsWith(tag)) {
    updatedTag = tag;
    updatedNotes = updatedNotes.replace(tag + "-", "");

    if (updatedNotes.startsWith(tag)) {
      updatedNotes = updatedNotes.replace(tag + "-", "");
    }
  }

  return { ...row, payee: updatedPayee, notes: updatedNotes, tag: updatedTag };
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
