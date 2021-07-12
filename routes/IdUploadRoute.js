var express = require("express");
let responseObject = require("../controllers/ViewController");
let IdentityUploadController = require("../controllers/IdentityUploadController");
const verifyToken = require("../helpers/CheckTokenExistense");
//const {storage, fileFilter, limits} = require('../helpers/FileUploadHelpers');
const uploadFile = require('../helpers/uploadDp');
const uploadId = require('../helpers/uploadId');
let multer = require("multer");
let UploadUserFaceController = require("../controllers/UploadUserFaceController");

// Call Express
var router = express.Router();

router.use(
    express.urlencoded({
        extended: true,
    })
);

responseObject = new responseObject();

// Instantiate Functions
UploadUserFaceController = new UploadUserFaceController();
IdentityUploadController = new IdentityUploadController();

router.route("/upload_id_card")
/* replace foo-bar with your form field-name verifyToken */
    .post(verifyToken, uploadId, function(req, res){
        //return res.json(req.file);
    }, (error, req, res, next) => {

        res.status(400).send({ error: error.message });
        responseObject.setMessage({
            general_error: [error.message],
        });
        res.json(responseObject.sendToView());

    });

router.route("/upload_face_id")
/* replace foo-bar with your form field-name verifyToken */
    .post(verifyToken, uploadFile, function(req, res){
        //return res.json(req.file);
    }, (error, req, res, next) => {

        res.status(400).send({ error: error.message });
        responseObject.setMessage({
            general_error: [error.message],
        });
        res.json(responseObject.sendToView());

    });

router.use(function (err, req, res, next) {
    //console.error(err.stack);
    responseObject.setStatus(false);
    responseObject.setMessage({
        general_error: ["Token was not supplied, please login"],
    });
});

module.exports = router;