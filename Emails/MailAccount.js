"use strict";
const nodemailer = require("nodemailer");

// let mailDetails = {
//   from: '"Fred Foo 👻" <foo@example.com>', // sender address
//   to: "bar@example.com, baz@example.com", // list of receivers
//   subject: "Hello ✔", // Subject line
//   text: "Hello world?", // plain text body
//   html: "<b>Hello world?</b>", // html body
// }; the parameter below will look like this

// async..await is not allowed in global scope, must use a wrapper
async function mailler(mailDetails = {}) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service:'gmail',//gmail, SendGrid
    auth: {
      user:'realtestzer13@gmail.com',
      pass:'biggerguy',
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail(mailDetails);

  //console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  return {
    status: true,
    message: "Message sent: %s " + info.messageId,
    data: "Preview URL: %s " + nodemailer.getTestMessageUrl(info),
  };
}

mailler().catch((error) => {
  return {
    status: false,
    message: error.message,
    data: [],
  };
});

module.exports = mailler;
