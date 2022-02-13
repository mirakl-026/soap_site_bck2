// Роуты коллекций
const {Router} = require("express");
const deController = require("../../controllers/api/deletedEntityController");

const router = Router();


router.get("/readAll/asEntities", deController.readAllDE_asEntities);

router.get("/readAll/asObjects", deController.readAllDE_asObjects);

router.post("/recoverByEid", deController.recoverDE_byEid);

router.post("/recoverByOid", deController.recoverDE_byOid);

router.get("/find/entity/:id", deController.findDE_byEid);

router.get("/find/object/:id", deController.findDE_byOid);

router.post("/delete", deController.delete);


module.exports = router;