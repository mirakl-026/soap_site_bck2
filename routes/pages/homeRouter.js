// роуты
const {Router} = require("express");
const homeController = require("../../controllers/pages/homeController");

const router = Router();

// индекс
router.get("/", homeController.index);

module.exports = router;