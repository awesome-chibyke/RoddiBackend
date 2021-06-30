class AccountVerificationLevels {
    constructor (){
        //verification levels
        this.account_activation_verification_level = 10;
        this.profile_update_verification_level = 20;
        this.phone_verification_level = 20;
        this.face_verification_level = 20;
        this.id_verification_level = 30;


        //upload status for id
        this.id_upload_pending = 'under_review';
        this.id_upload_confirmed = 'confirmed';
        this.id_upload_declined = 'declined';

        //upload status for id
        this.id_face_pending = 'under_review';
        this.id_face_confirmed = 'confirmed';
        this.id_face_declined = 'declined';
    }
}
module.exports = AccountVerificationLevels;