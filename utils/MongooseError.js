class MongooseError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 11000;
  }
}

module.exports = {
  MongooseError,
};
