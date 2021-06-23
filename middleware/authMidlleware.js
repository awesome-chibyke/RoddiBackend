let responseObject = require("../controllers/ViewController");
responseObject = new responseObject();

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

  module.exports = verifyToken;