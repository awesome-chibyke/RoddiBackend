const express = require("express");
const dotenv = require("dotenv");
// Load env vars
dotenv.config({ path: "./config/config.env" });
const http = require('http');//for socket.io

//routes area
const login = require("./routes/Login");
const register = require("./routes/registerRoute");
const home = require("./routes/DashboardRoute");
const edit = require("./routes/userRoutes");
const phoneVerificationRoute = require("./routes/phoneVerificationRoute");
const resendActivationEmailRoute = require("./routes/resendActivationEmailRoute");
const IdUploadRoute = require("./routes/IdUploadRoute");
const ForgetPasswordRoute = require("./routes/ForgetPasswordRoute");
const TwoFactorSetupRoutes = require("./routes/TwoFactorSetupRoutes");


const AdminUserRoute = require("./routes/AdminUserRoute");
const TestRoutes = require("./routes/TestRoutes");
const roleManagementRoutes = require("./routes/roleManagementRoutes");


const SettingsRoutes = require("./routes/SettingsRoute");
var device = require("express-device");

//require cors
var cors = require("cors");

const app = express();
const port = 3400;

const server = http.createServer(app);//start up socket.io
const { Server } = require("socket.io");
const io = new Server(server);

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
app.use("/phone", phoneVerificationRoute);
app.use("/activation", resendActivationEmailRoute);
app.use("/activate_account", resendActivationEmailRoute);
app.use("/identity_management", IdUploadRoute);
app.use("/forgot-password", ForgetPasswordRoute);//forgot password routes
app.use("/two_factor", TwoFactorSetupRoutes);//two factor routes
app.use("/tester", TestRoutes);//two factor routes
app.use("/settings", SettingsRoutes);


//admin routes
app.use("/users", AdminUserRoute);//two factor routes
app.use("/roles_management", roleManagementRoutes);//two factor routes

io.on('connection', (socket) => {
  console.log('a user connected');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

server.listen(3000, () => {
  console.log('listening on *:4000');
});
