const path = require("path");
const express = require("express");
const fileUpload = require("express-fileupload");
const { upload } = require("./parse/functions");

const app = express();

const PORT = 3000;

const publicDirectory = path.join(__dirname, "../public");
app.use(express.static(publicDirectory));
app.use(fileUpload({ debug: false, useTempFiles: true, tempFileDir: "/tmp/" }));

app.get("", (req, res) => {
  res.send("Welcome");
});

app.post("/upload", upload);

app.listen(PORT, () => {
  console.log(`Server is up on port ${PORT}`);
});
