const jwt = require("jsonwebtoken");
let responseObject = require("../controllers/ViewController");

responseObject = new responseObject();

const verifyToken = async (req) => {
  return new Promise(function (resolve, reject) {
    jwt.verify(req.token, "secretkey", (err, authData) => {
      if (err) {
        reject(err);
      } else {
        resolve(authData);
      }
    });
  });
};

////router.use("/post", verifyToken);
module.exports = verifyToken;
