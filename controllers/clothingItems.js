const Item = require("../models/clothingItem");
const { BadRequestError } = require("../utils/BadRequestError");
const { ForbiddenError } = require("../utils/ForbiddenError");
const { NotFoundError } = require("../utils/NotFoundError");
const { InternalServerError } = require("../utils/InternalServerError");

const getItems = (req, res, next) => {
  Item.find({})
    .then((items) => res.send(items))
    .catch((err) => {
      console.error(err);
      return next(
        new InternalServerError("There was an error loading the items")
      );
    });
};

const createItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;

  Item.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Invalid data"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
    });
};

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;
  const { _id } = req.user;

  console.log(req.params);

  Item.findById(itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== _id) {
        return next(new ForbiddenError("Item does not belong to user"));
      }
      return item.deleteOne().then(() => {
        res.status(200).send({ message: "Item deleted" });
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
    });
};

const likeItem = (req, res, next) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
    });
};

const dislikeItem = (req, res, next) => {
  Item.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => {
      res.send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(
          new BadRequestError("The id string is in an invalid format")
        );
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item not found"));
      }
      return next(
        new InternalServerError("An error has occurred on the server")
      );
    });
};

module.exports = { getItems, createItem, deleteItem, likeItem, dislikeItem };
