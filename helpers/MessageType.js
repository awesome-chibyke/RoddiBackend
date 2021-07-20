class MessageType{
    returnMessageType(key){
        let messageArray = {
            account_activation:'activate_account',//for account activation
            phone_verification:'phone_verification',//for account activation
            normal:'normal',
            blocked_account:'blocked_account',//for blocked account
            update_profile:'update_profile',//for blocked account
            login_auth_email_phone:'login_auth_email_phone',//for login verification with emial
            login_auth_app:'login_auth_app',//for login with auth app
            forgot_password_auth_app:'forgot_password_auth_app',//trigger forgot password with auth app
            forgot_password_email_auth:'forgot_password_email_auth',//trigger forgot password with email app
            password_change_email_option:'password_change_email_option',//email option for password change
            password_change_auth_option:'password_change_auth_option',//auth option for password change
            cancel_request_to_disble_two_factor:'cancel_request_to_disble_two_factor',//cancel request to disable two factor auth
            phone_number_exists:'phone_number_already_exists',//cancel request to disable two factor auth
            validate_phone_for_two_factor_deactivation:'validate_phone_for_two_factor_deactivation',//cancel request to disable two factor auth
            validate_email_for_two_factor_deactivation:'validate_email_for_two_factor_deactivation',//cancel request to disable two factor auth
        };
        return messageArray[key];
    }
}

module.exports = MessageType;