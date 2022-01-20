// роутинг управления складом
const {Router} = require("express");
const StockService = require("../../services/mongodb/stockService");
//const MetaService = require("../../services/mongodb/metaService");
const LoggerService = require("../../services/loggerService");

const adm_auth = require("../../middleware/checkAdmMW");

const router = Router();


/*
// создаём объект логгера
let stockLogger = LoggerService.createCustomLogger("/logs/stock.log");

// функция записи в этот логгер
function stockLoggerWrite (type, message) {
    try {
        // Логгер будет записывать только если в meta isLog установлено true
        if (MetaService.isLog()) {
            if (type === "info")
                stockLogger.info(message);
            else if (type === "error")
                stockLogger.error(message);
        }
    } catch (e) {
        console.log(e);
    }
}
*/

// получить всё что есть
router.get("/", adm_auth, async (req, res) => {
    try {
        const stock = await StockService.readStock();
        res.status(200).json(StockService.createStockViewModel(stock));
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// получить склад по конкретному товару
router.get("/:id", adm_auth, async (req, res) => {
   try {
        const result = await StockService.readStockProduct(req.params.id);
        res.status(200).json(result);
   } catch (e) {
       LoggerService.serverLoggerWrite( "error",`api/stock/:id[GET] - ${e.message};`);
       res.status(500).json({
           message: "server error:" + e.message
       });
   }
});


// установить значение для товара
router.post("/setProduct", adm_auth, async (req, res) => {
    try {
        const {id, value} = req.body;
        const result = await StockService.setStock(id, parseInt(value));
        LoggerService.serverLoggerWrite( "info",`api/stock/setProduct/[POST] - stock [${id} - ${value}];`);
        res.status(200).json(result);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/setProduct/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// сброс значения для товара
router.post("/resetProduct/:id", adm_auth, async (req, res) => {
    try {
        const result = await StockService.setStock(req.params.id, 0);
        LoggerService.serverLoggerWrite( "info",`api/stock/setProduct/[POST] - stock [${req.params.id} - ${0}];`);
        res.status(200).json(result);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/resetProduct/:id[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// увеличить на 1
router.post("/incrementProduct/:id", adm_auth, async (req, res) => {
    try {
        await StockService.increaseStockBy1(req.params.id);
        LoggerService.serverLoggerWrite( "info",`api/stock/setProduct/[POST] - stock [${req.params.id} - +1];`);
        res.status(200).json({});
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/incrementProduct/:id[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// увеличить на значение
router.post("/increaseProduct", adm_auth, async (req, res) => {
    try {
        const {id, value} = req.body;
        await StockService.increaseStockByValue(id, parseInt(value));
        LoggerService.serverLoggerWrite( "info",`api/stock/setProduct/[POST] - stock [${req.params.id} - +${value}];`);
        res.status(200).json({});
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/increaseProduct/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// уменьшить на 1
router.post("/decrementProduct/:id", adm_auth, async (req, res) => {
    try {
        await StockService.decreaseStockBy1(req.params.id);
        LoggerService.serverLoggerWrite( "info",`api/stock/setProduct/[POST] - stock [${req.params.id} - -1];`);
        res.status(200).json({});
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/decrementProduct/:id[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// уменьшить на значение
router.post("/decreaseProduct", adm_auth, async (req, res) => {
    try {
        const {id, value} = req.body;
        await StockService.decreaseStockByValue(id, parseInt(value));
        LoggerService.serverLoggerWrite( "info",`api/stock/setProduct/[POST] - stock [${req.params.id} - -${value}];`);
        res.status(200).json({});
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/decreaseProduct/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


module.exports = router;