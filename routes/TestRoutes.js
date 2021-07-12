var express = require("express");
//let responseObject = require("../controllers/ViewController");
let SettingsController = require("../controllers/SettingsController");

// Instantiate Functions
//responseObject = new responseObject();
SettingsController = new SettingsController();
// Call Express
var router = express.Router();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//return the user object
router.get("/get_settings", async (req, res) => {
    SettingsController.selectSettings(req, res);
});

module.exports = router;

//selectAllPrivileges