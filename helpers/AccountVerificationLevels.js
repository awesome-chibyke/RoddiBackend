class AccountVerificationLevels {
    constructor (){
        //verification levels
        this.id_verification_level = 50;
        this.phone_verification_level = 10;
        this.face_verification_level = 40;

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