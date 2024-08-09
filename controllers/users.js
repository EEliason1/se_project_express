const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/user");
const { BadRequestError } = require("../utils/BadRequestError");
const { UnauthorizedError } = require("../utils/UnauthorizedError");
const { NotFoundError } = require("../utils/NotFoundError");
const { ConflictError } = require("../utils/ConflictError");
const { InternalServerError } = require("../utils/InternalServerError");
const { JWT_SECRET } = require("../utils/config");

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return next(new BadRequestError("Invalid ID"));
  }

  return User.findById(_id)
    .orFail()
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
    });
};

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  User.findOne({ email }).then((user) => {
    if (user) {
      return next(new ConflictError("A user with that email already exists"));
    }
    return bcrypt.hash(password, 10).then((hash) => {
      User.create({ name, avatar, email, password: hash })
        .then((userNew) => {
          const userObj = userNew.toObject();
          delete userObj.password;
          return res.status(201).send(userObj);
        })
        .catch((err) => {
          console.error(err);
          if (err.name === "ValidationError") {
            return next(new BadRequestError("Invalid data"));
          }
          if (err.code === 11000) {
            return next(
              new ConflictError("A user with that email already exists")
            );
          }
          return next(
            new InternalServerError("An error has occurred on the server")
          );
        });
    });
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!password || !email) {
    return next(new BadRequestError("Invalid data"));
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
        return next(new UnauthorizedError("Incorrect email or password"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
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
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
    });
};

module.exports = { createUser, login, getCurrentUser, updateUser };
