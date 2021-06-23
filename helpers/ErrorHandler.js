const ErrorHandler = (error) => {
  return error.message + " " + error.stack;
};

module.exports = ErrorHandler;
