var express = require("express");
let SettingsController = require("../controllers/SettingsController");
const verifyToken = require("../helpers/CheckTokenExistense");

SettingsController = new SettingsController();
// Call Express
var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

router.put("/", verifyToken, async (req, res) => {
  SettingsController.editSettings(req, res);
});
module.exports = router;