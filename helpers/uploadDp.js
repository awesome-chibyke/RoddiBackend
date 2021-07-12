//const IncomingForm = require('formidable').IncomingForm;
const path = require("path");
const multer = require("multer");
const {fileFilter, limits} = require('./FileUploadHelpers');
let UploadUserFaceController = require("../controllers/UploadUserFaceController");

// Instantiate Functions
UploadUserFaceController = new UploadUserFaceController();
//IdentityUploadController = new IdentityUploadController();

const storage = multer.diskStorage({
    destination: "./files/faceUploads/",
    fileFilter:fileFilter(['png', 'jpg', 'jpeg', 'gif']),
    filename: function(req, file, cb){
        cb(null, file.originalname.replace(/\s/g, '').replace(path.extname(file.originalname), '') + Date.now() + path.extname(file.originalname));
    }
});

const uploadForPost = multer({
    storage: storage,
    limits:{fileSize: 5000000},
}).single("upload_face_id");

module.exports = function uploadFile(req, res) {

    //allow everyone in
    res.header('Access-Control-Allow-Origin', '*');
    uploadForPost(req, res, async (err) => {

        console.log('file upload error ', err);
        if (err)
            res.status(200).send({
                status:false,
                message: 'an error occurred while uploading the file'
            });
        else
        //returns the filename and file details
            await UploadUserFaceController.uploadFaceCard(req, res);
            /*res.status(200).send({
                status:true,
                data: req.file
            })*/
    })
};