const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const {
  BAD_INPUT_ERROR_CODE,
  UNAUTHORIZED_ERROR_CODE,
  NO_RES_ERROR_CODE,
  CONFLICT_ERROR_CODE,
  DEFAULT_ERROR_CODE,
  MONGOOSE_ERROR_CODE,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const getCurrentUser = (req, res) => {
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(BAD_INPUT_ERROR_CODE).send("Invalid ID");
  }

  User.findById(_id)
    .orFail()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return res.status(BAD_INPUT_ERROR_CODE).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NO_RES_ERROR_CODE).send({ message: err.message });
      }
      return res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });

  return null;
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      return res
        .status(CONFLICT_ERROR_CODE)
        .send({ message: "A user with that email already exists." });
    }
    bcrypt.hash(password, 10).then((hash) => {
      User.create({ name, avatar, email, password: hash })
        .then((userNew) => {
          const userObj = userNew.toObject();
          delete userObj.password;
          return res.status(201).send(userObj);
        })
        .catch((err) => {
          console.error(err);
          if (err.name === "ValidationError") {
            return res
              .status(BAD_INPUT_ERROR_CODE)
              .send({ message: "Invalid data." });
          }
          if (err.code === MONGOOSE_ERROR_CODE) {
            return res
              .status(CONFLICT_ERROR_CODE)
              .send({ message: "Email already in use." });
          }
          return res
            .status(DEFAULT_ERROR_CODE)
            .send({ message: "An error has occurred on the server." });
        });
    });
    return null;
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return res.status(BAD_INPUT_ERROR_CODE).send({ message: "Invalid data." });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "7d",
        }),
      });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return res
          .status(UNAUTHORIZED_ERROR_CODE)
          .send({ message: err.message });
      }
      console.log(err);
      return res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const updateUser = (req, res) => {
  const { _id } = req.user;
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    _id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res
          .status(BAD_INPUT_ERROR_CODE)
          .send({ message: "Invalid data." });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(NO_RES_ERROR_CODE).send({ message: err.message });
      }
      return res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

module.exports = { createUser, login, getCurrentUser, updateUser };
