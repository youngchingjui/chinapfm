const test = (req, res) => {
  console.log("testing");

  res.status(204).send();
};

module.exports = test;
