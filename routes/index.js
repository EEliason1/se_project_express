const router = require("express").Router();
const userRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");
const { NO_RES_ERROR_CODE } = require("../utils/errors");

router.use("/users", userRouter);
router.use("/items", clothingItemsRouter);

router.use((req, res) => {
  return res.status(NO_RES_ERROR_CODE).send({ message: err.message });
});

module.exports = router;