class AccountVerificationLevels {
    constructor (){
        //verification levels
        this.account_activation_verification_level = 10;
        this.phone_verification_level = 20;
        this.profile_update_verification_level = 20;
        this.face_verification_level = 20;
        this.id_verification_level = 30;

        //verification steps
        this.account_activation_verification_step = 'account_activation';
        this.phone_verification_step = 'phone_verification';
        this.profile_update_verification_step = 'profile_update';
        this.face_verification_step = 'face_verification';
        this.id_verification_step = 'id_verification';

        this.verificationSteps = ['none', this.account_activation_verification_step, this.phone_verification_step, this.profile_update_verification_step,  this.face_verification_step, this.id_verification_step];

        this.verifiation_details = {
            account_activation_verification_level:this.account_activation_verification_level,
            phone_verification_level:this.phone_verification_level,
            profile_update_verification_level:this.profile_update_verification_level,
            face_verification_level:this.face_verification_level,
            id_verification_level:this.id_verification_level,
            verification_steps:this.verificationSteps,
            // verification_steps:this.verificationStatus
        }


        //upload status for id upload
        this.id_upload_pending = 'under_review';
        this.id_upload_confirmed = 'confirmed';
        this.id_upload_declined = 'declined';

        //upload status for face upload
        this.id_face_pending = 'under_review';
        this.id_face_confirmed = 'confirmed';
        this.id_face_declined = 'declined';
    }

    //check user verification step
    //with userobject, get the user current verification status
    //move up by one in the step array
    checkUserVerificationStep(userObject){
        if(this.verificationSteps.includes(userObject.account_verification_step)){
            let key = this.verificationSteps.indexOf(userObject.account_verification_step);
            let newKey = parseFloat(key) + parseFloat(1);
            let lastKey = parseFloat(this.verificationSteps.length) - parseFloat(1);
            if(newKey > lastKey){
                newKey = lastKey;
            }
            return this.verificationSteps[newKey];
        }
        return false;
    }
}
module.exports = AccountVerificationLevels;