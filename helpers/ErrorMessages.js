class ErrorMessages {
    constructor(){
        this.ErrorMessageObjects = {
            invalid_user:"Invalid User details",
            invalid_phone_number:"Invalid Phone Number",
            no_data:"No Data Was returned",
            phone_number_exists:"Phone Number already exists",
            phone_number_does_not_match:"Phone Number does not match with phone number in our record",
            phone_already_verified:"Phone Number has been been already verified",
            authentication_failed:"User Authentication Failed",
            invalid_action:"Invalid User management action",
            document_under_review:'your uploaded document is still under review',
            id_confirmed:'your ID has been confirmed',
            file_upload_failed:'File Upload failed',//for failed file upload
            profile_update_chances:'You have used up your chances for profile, please contact admin for further explanations',//for failed file upload
            type_of_user_exist:'type of user already exist',//for existing type of user
            role_exists:'Role entered already exists',//for existing type of user

        }
    }
}
module.exports = ErrorMessages;