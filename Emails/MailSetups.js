const MailSetups = (receiverEmail, subject, emailTemplate, settingsDetails) => {
  return {
    //from: '"Fred Foo 👻" <foo@example.com>', // sender address
    from: `'"${settingsDetails.site_name}👻" <${settingsDetails.email1}>'`,
    to: receiverEmail, // list of receivers
    subject: subject, // Subject line
    text: "", // plain text body
    html: emailTemplate, // html body
  };
};

module.exports = MailSetups;
