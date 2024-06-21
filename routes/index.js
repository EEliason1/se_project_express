const router = require("express").Router();
const userRouter = require("./users");
const clothingItemsRouter = require("./clothingItems");
const { NO_RES_ERROR_CODE } = require("../utils/errors");
const { createUser, login } = require("../controllers/users");

router.post("/signin", login);
router.post("/signup", createUser);
router.use("/users", userRouter);
router.use("/items", clothingItemsRouter);

router.use((req, res) =>
  res.status(NO_RES_ERROR_CODE).send({ message: "Page does not exist." })
);

module.exports = router;
