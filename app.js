const express = require("express");
const dotenv = require("dotenv");
// Load env vars
dotenv.config({ path: "./config/config.env" });

//routes area
const login = require("./routes/Login");
const register = require("./routes/registerRoute");
const home = require("./routes/DashboardRoute");
const edit = require("./routes/userRoutes");
const verify = require("./routes/verificationRoute");
const resendActivationEmailRoute = require("./routes/resendActivationEmailRoute");

//require cors
var cors = require("cors");

const app = express();
const port = 3400;

app.use(cors());

app.use(express.static("files"));

app.use("/login", login);
app.use("/register", register);
app.use("/home", home);
app.use("/edit", edit); //house the edit user route, the account activation route for users, the activation of two factor auth
app.use("/verify", verify);
app.use("/activation", resendActivationEmailRoute);
app.use("/activate_account", resendActivationEmailRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
