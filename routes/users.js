const router = require("express").Router();
const auth = require("../middlewares/auth");
const { getCurrentUser, updateUser } = require("../controllers/users");
const { validateId } = require("../middlewares/validation");

router.get("/me", validateId, auth, getCurrentUser);
router.patch("/me", validateId, auth, updateUser);

module.exports = router;
