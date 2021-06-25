var express = require("express");
let responseObject = require("../controllers/ViewController");
let IdentityUploadController = require("../controllers/IdentityUploadController");
const verifyToken = require("../helpers/CheckTokenExistense");
const validator = require("../helpers/validator");
const {storage, fileFilter, limits} = require('../helpers/FileUploadHelpers')
let multer = require("multer");

// Instantiate Functions
IdentityUploadController = new IdentityUploadController();

// Call Express
var router = express.Router();

router.use(
    express.urlencoded({
        extended: true,
    })
);

let maxSize = 2000000;

//bring in multer for the upload of the id document
var upload = multer({ storage: storage('./files/government_id/'), fileFilter:fileFilter(['png', 'jpg', 'jpeg', 'gif']), limits: { fileSize: maxSize } });

router.route("/upload_id_card")
/* replace foo-bar with your form field-name verifyToken */
    .post(verifyToken, upload.single("upload_id_card"), function(req, res){
        IdentityUploadController.uploadIdCard(req, res);
    }, (error, req, res, next) => {

        res.status(400).send({ error: error.message });
        responseObject.setMessage({
            general_error: [error.message],
        });
        res.json(responseObject.sendToView());

    })

router.use(function (err, req, res, next) {
    //console.error(err.stack);
    responseObject.setStatus(false);
    responseObject.setMessage({
        general_error: ["Token was not supplied, please login"],
    });
});

module.exports = router;
