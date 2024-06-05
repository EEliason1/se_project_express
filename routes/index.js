const router = require("express").Router();
const userRouter = require("./users.js");
const clothingItemsRouter = require("./clothingItems.js");

router.use("/users", userRouter);
router.use("/items", clothingItemsRouter);

module.exports = router;