const mongoose = require("mongoose");
const user = require("./user.js");

const clothingSchema = new mongoose.Schema({
  name: {
    required: true,
    type: String,
    minlength: 2,
    maxlength: 30,
  },
  weather: {
    required: true,
    type: String,
    enum: ["hot", "warm", "cold"],
  },
  imageUrl: {
    required: true,
    type: String,
    validate: {
      validator(value) {
        return validator.isURL(value);
      },
      message: "You must enter a valid URL",
    },
  },
  owner: {
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
    default: ""
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

modules.exports = mongoose.model("clothing", clothingSchema);