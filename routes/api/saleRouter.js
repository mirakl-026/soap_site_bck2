// роутер управления скидками
const {Router} = require("express");
const SaleService = require("../../services/mongodb/saleService");
//const MetaService = require("../../services/mongodb/metaService");
const LoggerService = require("../../services/loggerService");
const DeleteService = require("../../services/mongodb/deletedEntityService");

const adm_auth = require("../../middleware/checkAdmMW");

const router = Router();

/*
// создаём объект логгера
let saleLogger = LoggerService.createCustomLogger("/logs/sale.log");

// функция записи в этот логгер
function saleLoggerWrite (type, message) {
    try {
        // Логгер будет записывать только если в meta isLog установлено true
        if (MetaService.isLog()) {
            if (type === "info")
                saleLogger.info(message);
            else if (type === "error")
                saleLogger.error(message);
        }
    } catch (e) {
        console.log(e);
    }
}
*/

// REST
// POST - CREATE
router.post("/", adm_auth, async (req, res) => {
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
});

// GET - READ
router.get("/", async (req, res) => {
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
});

router.get("/:id", async (req, res) => {
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
});


// PUT - UPDATE
router.post("/edit", adm_auth, async (req, res) => {
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
});


// DELETE - DELETE
router.post("/delete", adm_auth, async (req, res) => {
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
});



module.exports = router;