// роуты связанные с контентом на страницах:
//  about, delivery, contacts, partnership, qasection, sertificates
// чтение - без требований, изменение - только админ
const {Router} = require("express");
const staticPageController = require("../../controllers/api/staticPageController")

const router = Router();


// чтение
router.get("/getContent/:name", staticPageController.getContentByName);

// изменение
router.post("/setContent", staticPageController.setContent);


module.exports = router;
