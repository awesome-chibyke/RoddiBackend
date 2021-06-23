class ViewController {
  constructor() {
    this.status = true;
    this.message = "";
    this.message_type = "normal";
    this.data = [];
  }
  setStatus(status = true) {
    this.status = status;
  }

  setMessage(message = "") {
    this.message = message;
  }

  setMesageType(message_type = "") {
    this.message_type = message_type;
  }

  setData(data = "") {
    this.data = data;
  }

  sendToView() {
    return {
      status: this.status,
      message: this.message,
      message_type: this.message_type,
      data: this.data,
    };
  }
}

module.exports = ViewController;
