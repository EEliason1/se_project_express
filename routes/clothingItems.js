const router = require("express").Router();
const auth = require("../middlewares/auth");
const {
  getItems,
  createItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const { validateCardBody, validateId } = require("../middlewares/validation");

router.get("/", getItems);
router.post("/", validateCardBody, validateId, auth, createItem);
router.delete("/:itemId", validateId, auth, deleteItem);
router.put("/:itemId/likes", validateId, auth, likeItem);
router.delete("/:itemId/likes", validateId, auth, dislikeItem);

module.exports = router;
