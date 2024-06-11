const bcrypt = require("bcryptjs");
const User = require("../models/user");
const {
  BAD_INPUT_ERROR_CODE,
  NO_RES_ERROR_CODE,
  DEFAULT_ERROR_CODE,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(DEFAULT_ERROR_CODE)
        .send({ message: "An error has occurred on the server." });
    });
};

const getCurrentUser = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .orFail()
    .then((user) => res.send(user))
    .catch((err) => {
      console.error(err);
      console.log(err.name);
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
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt.hash(password, 10).then((hash) => {
    User.create({ name, avatar, email, password: hash })
      .then((user) => {
        const userObj = user.toObject();
        delete userObj.password;
        res.status(201).send(userObj);
      })
      .catch((err) => {
        console.error(err);
        if (err.name === "ValidationError") {
          return res
            .status(BAD_INPUT_ERROR_CODE)
            .send({ message: "Invalid data." });
        }
        if (err.code === 11000) {
          console.error(err);
          return res.status(409).send({ message: "Email already in use." });
        }
        return res
          .status(DEFAULT_ERROR_CODE)
          .send({ message: "An error has occurred on the server." });
      });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      console.log(user);
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
    })
    .catch((err) => {
      res.status(401).send({ message: err.message });
    });
};

const updateUser = (req, res) => {};

module.exports = { getUsers, createUser, login, getCurrentUser, updateUser };
