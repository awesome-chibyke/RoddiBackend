const bcrypt = require("bcrypt");
const saltRounds = 10;

class PasswordHasher {
  hashPassword(myPlaintextPassword) {
    return new Promise(function (resolve, reject) {
      bcrypt.genSalt(saltRounds).then((salt) => {
        bcrypt
          .hash(myPlaintextPassword, salt)
          .then((hash) => {
            resolve(hash);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  comparePassword(loginPasswordString, hashFromDb) {
    return new Promise(function (resolve, reject) {
      bcrypt.compare(loginPasswordString, hashFromDb).then((result) => {
        //console.log(result);
        // This will be either true or false, based on if the string
        // matches or not.
        resolve(result);
      });
    });
  }
}

module.exports = PasswordHasher;
