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
const IdUploadRoute = require("./routes/IdUploadRoute");
const ForgetPasswordRoute = require("./routes/ForgetPasswordRoute");
var device = require('express-device');

//require cors
var cors = require("cors");

const app = express();
const port = 3400;

app.use(cors());
app.use(device.capture());

app.use(express.static("files"));

// app.use("/", (req, res) => {
//   console.log(req.device);
// });
app.use("/login", login);
app.use("/register", register);
app.use("/home", home);
app.use("/edit", edit); //house the edit user route, the account activation route for users, the activation of two factor auth
app.use("/verify", verify);
app.use("/activation", resendActivationEmailRoute);
app.use("/activate_account", resendActivationEmailRoute);
app.use("/identity_management", IdUploadRoute);
app.use("/forgot-password", ForgetPasswordRoute);//forgot password routes

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
