//const IncomingForm = require('formidable').IncomingForm;
const path = require("path");
const multer = require("multer");
const {fileFilter, limits} = require('./FileUploadHelpers');
let IdentityUploadController = require("../controllers/IdentityUploadController");

// Instantiate Functions
IdentityUploadController = new IdentityUploadController();

const storage = multer.diskStorage({
    destination: "./files/uploads/",
    fileFilter:fileFilter(['png', 'jpg', 'jpeg', 'gif']),
    filename: function(req, file, cb){
        cb(null, file.originalname.replace(/\s/g, '').replace(path.extname(file.originalname), '') + Date.now() + path.extname(file.originalname));
    }
});

const uploadForPost = multer({
    storage: storage,
    limits:{fileSize: 5000000},
}).fields([{ name: 'upload_id_card_back', maxCount: 1 }, { name: 'upload_id_card_front', maxCount: 1 }]);

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
        await IdentityUploadController.uploadIdCard(req, res);
        /*res.status(200).send({
            status:true,
            data: req.files
        })*/
    })
};