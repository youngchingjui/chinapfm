const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");

const app = express();

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));
app.use(fileUpload({ debug: false, useTempFiles: true, tempFileDir: "/tmp/" }));

app.get("", (req, res) => {
  res.send("Welcome");
});

app.post("/merge", (req, res) => {
  res.attachment();
  res.download(
    req.files.alipay_upload.tempFilePath,
    req.files.alipay_upload.name
  );
});

app.listen(3000, () => {
  console.log("Server is up on port 3000");
});
