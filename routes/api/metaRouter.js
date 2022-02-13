// роутинг управления мета-объектом
const {Router} = require("express");
const metaController = require("../../controllers/api/metaController");

const router = Router();

// получить мета-объект (управление функциями сайта)
router.get("/", metaController.getMeta);

// флаг почты
router.post("/setEmails", metaController.setEmail);

// флаг логгера
router.post("/setLog", metaController.setLog);

// флаг бэкапа
router.post("/setBackup", metaController.setBackup);


module.exports = router;