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
        }
    }
}
module.exports = ErrorMessages;