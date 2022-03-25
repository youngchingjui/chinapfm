const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const { manage_bank_txns } = require("./parse/bank");
const { manage_wechat_txns } = require("./parse/wechat");
const { manage_alipay_txns } = require("./parse/alipay");

const app = express();

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));
app.use(fileUpload({ debug: false, useTempFiles: true, tempFileDir: "/tmp/" }));

app.get("", (req, res) => {
  res.send("Welcome");
});

app.post(
  "/merge",
  ({ files: { alipay_upload, wechat_upload, bank_upload } }, res) => {
    manage_bank_txns(bank_upload);
    manage_wechat_txns(wechat_upload);
    manage_alipay_txns(alipay_upload);

    res.attachment();
    res.download(alipay_upload.tempFilePath, alipay_upload.name);
  }
);

app.listen(3000, () => {
  console.log("Server is up on port 3000");
});
