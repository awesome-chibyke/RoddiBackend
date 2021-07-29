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

router.get("/", async (req, res) => {
    var io = req.app.get('socketio');
    io.emit('tweet', 'it has really worked');
    return res.json('it worked')
});

//return the user object
router.get("/get_settings", async (req, res) => {
    SettingsController.selectSettings(req, res);
});

module.exports = router;
//selectAllPrivileges