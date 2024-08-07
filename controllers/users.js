const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  InternalServerError,
  MongooseError,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    next(new MongooseError("Invalid ID"));
  }

  User.findById(_id)
    .orFail()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        next(new BadRequestError("The id string is in an invalid format"));
      }
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      }
      next(new InternalServerError("An error has occurred on the server"));
    });

  return null;
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      next(new ConflictError("A user with that email already exists"));
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
            next(new BadRequestError("Invalid data"));
          }
          if (err.code === 11000) {
            next(new ConflictError("A user with that email already exists"));
          }
          next(new InternalServerError("An error has occurred on the server"));
        });
    });
    return null;
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    next(new BadRequestError("Invalid data"));
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
      console.error(err);
      if (err.message === "Incorrect email or password") {
        next(new UnauthorizedError("Incorrect email or password"));
      }
      next(new InternalServerError("An error has occurred on the server"));
    });
};

const updateUser = (req, res, next) => {
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
        next(new BadRequestError("The id string is in an invalid format"));
      }
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("User not found"));
      }
      next(new InternalServerError("An error has occurred on the server"));
    });
};

module.exports = { createUser, login, getCurrentUser, updateUser };
