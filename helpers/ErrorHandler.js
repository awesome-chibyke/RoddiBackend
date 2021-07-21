const ErrorHandler = (error) => {

  if(process.env.APP_ENV === 'production'){
    return error.message;
  }

  if(process.env.APP_ENV === 'local'){

    return error.message + " " + error.stack;
  }

};
module.exports = ErrorHandler;
