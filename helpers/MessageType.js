class MessageType{
    returnMessageType(key){
        let messageArray = {
            account_activation:'activate_account',//for account activation
            normal:'normal',
            blocked_account:'blocked_account',//for blocked account
            update_profile:'update_profile'//for blocked account
        };
        return messageArray[key];
    }
}

module.exports = MessageType;