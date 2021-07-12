var express = require("express");
var app = express();
var router = express.Router();

let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();

const verifyToken = require("../helpers/CheckTokenExistense");//middleware that detects the token and passes to req

var DbActions = require("../model/DbActions");
DbActions = new DbActions();

var RolesController = require("../controllers/AdminControllers/RolesController");
var TypeOfUserController = require("../controllers/AdminControllers/TypeOfUserController");
var PrivilegeController = require("../controllers/AdminControllers/PrivilegeController");
RolesController = new RolesController();
TypeOfUserController = new TypeOfUserController();
PrivilegeController = new PrivilegeController();

router.use(
    express.urlencoded({
        extended: true,
    })
);

//add new role to the role table
router.post("/add_new_role", verifyToken, async (req, res) => {
    RolesController.storeRoles(req, res);
});

//get all the available roles
router.get("/get_roles",verifyToken,
    async (req, res) => {
        RolesController.selectAllRoles(req, res);
    }
);

//add new type of users
router.post("/add_new_type_of_user", verifyToken, async (req, res) => {
    TypeOfUserController.storeTypeOfUsers(req, res);
});

//get all the available type of users
router.get("/display_privileges", verifyToken, async (req, res) => {
    PrivilegeController.getAllPrivileges(req, res);
});

//get all the available type of users
router.post("/save_privileges", verifyToken, async (req, res) => {
    PrivilegeController.storePrivilege(req, res);
});
module.exports = router;