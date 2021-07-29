var express = require("express");
let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();
const verifyToken = require("../helpers/CheckTokenExistense");

//validation helper
const validator = require("../helpers/validator");

let LogoutController = require("../controllers/LogoutController");
LogoutController = new LogoutController();

var router = express.Router();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//validation ends
router.get("/", verifyToken, async (req, res) => {
    await LogoutController.logout(req, res);
});

module.exports = router;
