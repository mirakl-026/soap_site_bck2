const StaticPageService = require("../../services/mongodb/staticPageService");
const LoggerService = require("../../services/loggerService");


module.exports.getContentByName = async function (req, res) {
    try {
        const contentHtml = await StaticPageService.readStaticPageContentByName(req.params.name);
        return res.status(200).json({
            content: contentHtml
        });
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/staticPage/getContent/:name[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.setContent = async function (req, res) {
    try {
        const result = await StaticPageService.editStaticPageContent(req.body.pageName, req.body.content);

        LoggerService.serverLoggerWrite("info", `api/staticPage/setContent/[POST] - staticPage ${req.body.pageName} changed;`);
        return res.status(200).json(result);

    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/staticPage/setContent/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}