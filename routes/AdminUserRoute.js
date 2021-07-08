var express = require("express");
const verifyToken = require("../helpers/CheckTokenExistense");
const validator = require("../helpers/validator");
let AdminUserController = require("../controllers/AdminControllers/AdminUserController");

// Instantiate Functions
AdminUserController = new AdminUserController();
// Call Express
var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//select all the user on the db
router.get("/all_users/:type_of_user", verifyToken, async (req, res) => {
  await AdminUserController.SelectAllUserForAdminView(req, res);
});

//select one user on the db
router.get("/single_user/:unique_id", verifyToken, async (req, res) => {
  await AdminUserController.SelectOneUserForAdminView(req, res);
});

//select one user on the db
router.get(
  "/delete_user/:unique_id/:type_of_user",
  verifyToken,
  async (req, res) => {
    await AdminUserController.deleteUser(req, res);

  });

//select one user on the db
router.put("/manage_user_account", verifyToken, async (req, res) => {
    await AdminUserController.manageUserAccount(req, res);
});

router.post("/edit_user", verifyToken, async (req, res) => {
  await AdminUserController.edit(req, res);
});

// router.post("/id_upload", verifyToken, async (req, res) => {
//   await AdminUserController.updateIdUploadStatus(req, res);
// });

module.exports = router;
