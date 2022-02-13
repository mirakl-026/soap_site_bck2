// роуты
const {Router} = require("express");
const adminPanelController = require("../../controllers/pages/adminPanelController");

const router = Router();

// индекс
router.get("/adminPanel", adminPanelController.adminPanel);

module.exports = router;