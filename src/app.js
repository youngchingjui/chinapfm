const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const { manage_bank_txns } = require("./parse/banks/bank");
const { manage_wechat_txns } = require("./parse/banks/wechat");
const { manage_alipay_txns } = require("./parse/banks/alipay");

const app = express();

const PORT = 3000;

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));
app.use(fileUpload({ debug: false, useTempFiles: true, tempFileDir: "/tmp/" }));

app.get("", (req, res) => {
  res.send("Welcome");
});

app.post("/bank", async (req, res) => {
  try {
    const { tempFilePath, fileName } = await manage_bank_txns(
      req.files.bank_upload
    );
    res.attachment();
    res.download(tempFilePath, fileName);
  } catch (err) {
    console.error(err);
  }
});

app.post("/alipay", (req, res) => {
  const { files } = req;
  const { alipay_upload } = files;

  const alipay_download = manage_alipay_txns(alipay_upload);

  // Return the CSV files
  res.attachment();
  res.download(alipay_upload.tempFilePath, alipay_upload.name);
});

app.post("/wechat", (req, res) => {
  const { files } = req;
  const { wechat_upload } = files;

  const wechat_download = manage_wechat_txns(wechat_upload);

  // Return the CSV files
  res.attachment();
  res.download(wechat_upload.tempFilePath, wechat_upload.name);
});

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
