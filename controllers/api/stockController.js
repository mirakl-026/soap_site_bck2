const StockService = require("../../services/mongodb/stockService");
const LoggerService = require("../../services/loggerService");


module.exports.readStock = async function (req, res) {
    try {
        const stock = await StockService.readStock();
        res.status(200).json(StockService.createStockViewModel(stock));
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.readProductId = async function (req, res) {
    try {
        const result = await StockService.readStockProduct(req.params.id);
        res.status(200).json(result);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error",`api/stock/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.setProduct = async function (req, res) {
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
}


module.exports.resetProductById = async function (req, res) {
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
}


module.exports.incrementProduct = async function (req, res) {
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
}


module.exports.increaseProduct = async function (req, res) {
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
}


module.exports.decrementProduct = async function (req, res) {
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
}


module.exports.decreaseProduct = async function (req, res) {
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
}


