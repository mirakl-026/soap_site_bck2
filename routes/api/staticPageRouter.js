// роуты связанные с контентом на страницах:
//  about, delivery, contacts, partnership, qasection, sertificates
// чтение - без требований, изменение - только админ
const {Router} = require("express");
const StaticPageService = require("../../services/mongodb/staticPageService");
//const MetaService = require("../../services/mongodb/metaService");
const LoggerService = require("../../services/loggerService");

const adm_auth = require("../../middleware/checkAdmMW");

const router = Router();

/*
// создаём объект логгера
let staticPageLogger = LoggerService.createCustomLogger("/logs/staticPage.log");

// функция записи в этот логгер
function staticPageLoggerWrite (type, message) {
    try {
        // Логгер будет записывать только если в meta isLog установлено true
        if (MetaService.isLog()) {
            if (type === "info")
                staticPageLogger.info(message);
            else if (type === "error")
                staticPageLogger.error(message);
        }
    } catch (e) {
        console.log(e);
    }
}
*/



// чтение
router.get("/getContent/:name", async (req, res) => {
    try {
        const contentHtml = await StaticPageService.readStaticPageContentByName(req.params.name);
        res.status(200).json({
            content: contentHtml
        });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/staticPage/getContent/:name[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

// изменение
router.post("/setContent", adm_auth, async (req, res) => {
    try {
        const result = await StaticPageService.editStaticPageContent(req.body.pageName, req.body.content);

        LoggerService.serverLoggerWrite("info", `api/staticPage/setContent/[POST] - staticPage ${req.body.pageName} changed;`);
        res.status(200).json(result);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/staticPage/setContent/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


module.exports = router;
