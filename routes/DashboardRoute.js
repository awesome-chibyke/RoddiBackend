var express = require("express");
let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();
let Authentication = require("../helpers/AuthenticateLogin");

//validation helper
const validator = require("../helpers/validator");

var router = express.Router();

router.use(
  express.urlencoded({
    extended: true,
  })
);

//const verifyToken = Authentication.authenticateLogin(req, res, next);
const verifyToken = (req, res, next) => {
  //function that returns the token in the request
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];

    req.token = bearerToken;

    next();
  }

  responseObject.setStatus(false);
  responseObject.setMessage({
    general_error: ["Token was not supplied, please login"],
  });
  responseObject.setMesageType("logout");
  responseObject.sendToView();
};

router.get("/", verifyToken, async (req, res) => {
  try {
    const loggedInUser = await Authentication(req);
    //get the dashboard details and sendto the view
    delete loggedInUser.user.password;
    responseObject.setStatus(true);
    responseObject.setMessage("Details have been returned successfully");
    responseObject.setData({ user: loggedInUser.user });
    responseObject.setMesageType("logged_in");
    res.json(responseObject.sendToView());
  } catch (e) {
    responseObject.setStatus(false);
    responseObject.setMessage({
      general_error: [e.message + " " + e.stack],
    });
    responseObject.setMesageType("logout");
    res.json(responseObject.sendToView());
  }
});

module.exports = router;
