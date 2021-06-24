class MessageType{
    returnMessageType(key){
        let messageArray = {
            account_activation:'activate_account',//for account activation
            normal:'normal',
            blocked_account:'blocked_account',//for blocked account
            update_profile:'update_profile',//for blocked account
            login_auth_email_phone:'login_auth_email_phone',//for blocked account
            login_auth_app:'login_auth_app',//for blocked account
        };
        return messageArray[key];
    }
}

module.exports = MessageType;