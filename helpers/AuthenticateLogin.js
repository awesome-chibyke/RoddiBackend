const jwt = require("jsonwebtoken");
let responseObject = require("../controllers/ViewController");
let ErrorMessages = require("../helpers/ErrorMessages");
let User = require("../model/User");
let LoginAuthModel = require("../model/LoginAuthModel");
let PasswordHasher = require("../helpers/PasswordHasher");
User = new User();
LoginAuthModel = new LoginAuthModel();
responseObject = new responseObject();
ErrorMessages = new ErrorMessages();
PasswordHasher = new PasswordHasher();

const verifyToken = async (req) => {
  return new Promise(function (resolve, reject) {
    jwt.verify(req.token, "secretkey", async (err, authData) => {
      if (err) {
        reject(err);
      } else {
        //first  select frm the login auth table
        const selectedToken = await LoginAuthModel.selectAllLoginAuthWhere([
          ['user_unique_id', '=', authData.user.unique_id],['logged_out', '=', 'none']
        ]);
        let PassStatus = false;
        if(selectedToken.length > 0){
          for(let i in selectedToken){//loop through the array of token object and check which one match
            if( await PasswordHasher.comparePassword(req.token, selectedToken[i].token_secret) === true ) {
              PassStatus = true;
              break;
            }
          }
        }

        if (PassStatus === false) {
          let message = ErrorMessages.ErrorMessageObjects.authentication_failed
          reject(message);
        }
        resolve(authData);
      }
    });

  });
};

////router.use("/post", verifyToken);
module.exports = verifyToken;
