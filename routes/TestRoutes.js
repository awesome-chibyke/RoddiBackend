var express = require("express");
//let responseObject = require("../controllers/ViewController");
let PrivilegeController = require("../controllers/AdminControllers/PrivilegeController");

// Instantiate Functions
//responseObject = new responseObject();
PrivilegeController = new PrivilegeController();
// Call Express
var router = express.Router();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//return the user object
router.get("/get_privileges", async (req, res) => {
    PrivilegeController.selectAllPrivileges(req, res);
});

module.exports = router;

//selectAllPrivileges