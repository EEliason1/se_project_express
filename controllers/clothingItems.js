const Item = require("../models/clothingItem.js");

const getItems = (req, res) => {
  Item.find({})
    .then((items) => res.status(200).send(items))
    .catch((err) => {
      console.error(err);
      return res.status(500).send({ message: err.message });
    });
};

const createItem = (req, res) => {
  console.log(req.user._id);
  // const owner = req.user._id;

  const { name, weather, imageUrl, owner } = req.body;

  Item.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(201).send({data: item});
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: err.message });
      }
      return res.status(500).send({ message: err.message });
    });
};

const deleteItem = (req, res) => {
  // const { name, avatar } = req.body;
  // User.create({ name, avatar })
  //   .then((user) => {
  //     res.status(201).send(user);
  //   })
  //   .catch((err) => {
  //     console.error(err);
  //     if (err.name === "ValidationError") {
  //       return res.status(400).send({ message: err.message });
  //     }
  //     return res.status(500).send({ message: err.message });
  //   });
};

module.exports = { getItems, createItem, deleteItem };
