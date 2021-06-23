let multer = require("multer");

exports.fileFilter = (arrayOfAcceptedFiles) => {
    return (req, file, cb) => {
        try{
            //console.log(arrayOfAcceptedFiles);
            // The function should call `cb` with a boolean
            // to indicate if the file should be accepted
            let extension = file.mimetype.split('/')[1].toLowerCase();
            if(arrayOfAcceptedFiles.includes(extension)){
                // To reject this file pass `false`, like so:
                cb(null, true)
            }else{
                // To accept the file pass `true`, like so:
                cb(null, false)
            }
        }catch(err){
            // You can always pass an error if something goes wrong:
            cb(new Error('I don\'t have a clue!'));
        }

    }
}

exports.storage = (filePath = './files/government_id/')  => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, filePath)
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            cb(null, file.fieldname + '-' + uniqueSuffix+'.'+file.mimetype.split('/')[1].toLowerCase())
        }
    })
}