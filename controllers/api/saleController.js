const SaleService = require("../../services/mongodb/saleService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");


module.exports.createSale = async function (req, res) {
    try {
        let { saleType, saleValue, saleName, saleDescription } = req.body;

        const candidate = {
            saleType: saleType,
            saleValue: saleValue,
            saleName: saleName,
            saleDescription: saleDescription
        };

        const result = await SaleService.createSale(candidate);

        LoggerService.serverLoggerWrite("info", `api/sale/[POST] - sale ${saleName} created;`);
        res.status(201).json(SaleService.createSaleViewModel(result));

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/product/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.readAllSales = async function (req, res) {
    try {
        const sales = await SaleService.readAllSales();

        let salesVM = [];
        for (let sale of sales) {
            salesVM.push(SaleService.createSaleViewModel(sale));
        }
        res.status(200).json(salesVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/sale/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.readSaleById = async function (req, res) {
    try {
        const sale = await SaleService.readSale(req.params.id);
        const saleViewModel = SaleService.createSaleViewModel(sale);
        res.status(200).json(saleViewModel);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/sale/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.updateSale = async function (req, res) {
    try {
        let { _id, saleType, saleValue, saleName, saleDescription } = req.body;

        const candidate = {
            _id: _id,
            saleType: saleType,
            saleValue: saleValue,
            saleName: saleName,
            saleDescription: saleDescription
        };

        const result = await SaleService.updateSale(candidate);

        LoggerService.serverLoggerWrite("info", `api/sale/edit/[POST] - sale ${_id} updated;`);
        res.status(201).json(SaleService.createSaleViewModel(result));

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/sale/edit/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.deleteSale = async function (req, res) {
    try {
        const sale = await SaleService.readSale(req.body._id);
        if (sale) {
            await DeleteService.addEntityToDeleted("sale", sale);

            const result = await SaleService.deleteSale(req.body._id);
            if (result) {
                LoggerService.serverLoggerWrite("info", `api/sale/delete/[POST] - sale ${req.body._id} deleted!;`);
                res.status(200).json({ deletedId: req.body._id });
            } else {
                res.status(200).json({message:`cant delete sale ${req.body._id}`})
            }
        } else {
            LoggerService.serverLoggerWrite("info", `api/sale/delete/[POST] - sale ${req.body._id} NOT deleted!;`);
            res.status(200).json({
                message: "no sale"
            });

        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/sale/delete/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}