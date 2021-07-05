const twilio = require("twilio");

exports.SendGenericSms = (settingsDetails, messageBody, userObject) => {
    var accountSid = process.env.TWILIO_ACCOUNT_SID;//twillo accoun details
    var authToken = process.env.TWILIO_AUTH_TOKEN;

    var client = new twilio(accountSid, authToken);

    client.messages
        .create({
            body:messageBody,
            to: userObject.country_code+userObject.phone,
            from:process.env.TWILIO_PHONE_NUMBER,
        })
        .then((message) => {return message; });
}