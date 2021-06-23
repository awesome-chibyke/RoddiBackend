const CheckTokenExistense = (req, res, next) => {
  //function that returns the token in the request
  const bearerHeader = req.headers["authorization"];
  if (bearerHeader !== "undefined") {
    //console.log(bearerHeader);
    const bearerToken = bearerHeader.split(" ")[1];

    req.token = bearerToken;

    next();
  } else {
    //throw new Error("Token was not supplied, please login");
    responseObject.setStatus(false);
    responseObject.setMessage({
      general_error: ["Token was not supplied, please logins"],
    });
    responseObject.setMesageType("logout");
    res.json(responseObject.sendToView());
  }
};

module.exports = CheckTokenExistense;
