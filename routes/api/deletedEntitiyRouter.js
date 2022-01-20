// Роуты коллекций
const {Router} = require("express");
const DeleteService = require("../../services/mongodb/deletedEntityService");
const LoggerService = require("../../services/loggerService");
const SearchService = require("../../services/mongodb/searchService");
const CollectionService = require("../../services/mongodb/collectionService");

const adm_auth = require("../../middleware/checkAdmMW");


const router = Router();


router.get("/readAll/asEntities", adm_auth, async (req, res) => {
    try {
        const des = await DeleteService.readAllDeletedEntities();
        let desVM = [];
        for (let de of des) {
            desVM.push(DeleteService.createDeletedEntityViewModel(de));
        }
        res.status(200).json(desVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/readAll/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.get("/readAll/asObjects", adm_auth, async (req, res) => {
    try {
        const des = await DeleteService.readAllDeletedEntities();
        let desVM = [];
        for (let de of des) {
            desVM.push(DeleteService.createDeletedEntityObjectViewModel(de));
        }
        res.status(200).json(desVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/readAll/[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/recoverByEid", adm_auth, async (req, res) => {
    try {
        const result = await DeleteService.recoverDeletedEntity(req.body._id);

        // обновляем поля products в коллекциях
        await CollectionService.refreshProductsInCollections();

        // обновление поисковой информации
        await SearchService.refreshSearchData();

        await CollectionService.updateCollectionsChilds();

        if (result) {
            if (!result.message) {
                res.status(200).json({status: "entity recovered"});
            } else {
                res.status(200).json(result);
            }
        } else {
            res.status(200).json({message:"recover - no result"});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/recoverByEid/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/recoverByOid", adm_auth, async (req, res) => {
    try {
        const result = await DeleteService.recoverDeletedEntityByObjectId(req.body.deletedObjectId);

        // обновляем поля products в коллекциях
        await CollectionService.refreshProductsInCollections();

        // обновление поисковой информации
        await SearchService.refreshSearchData();

        await CollectionService.updateCollectionsChilds();

        if (result) {
            if (!result.message) {
                res.status(200).json({status: "entity recovered"});
            } else {
                res.status(200).json(result);
            }
        } else {
            res.status(200).json({message:"recover - no result"});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/recoverByOid/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.get("/find/object/:id", adm_auth, async (req, res) => {
    try {
        const result = await DeleteService.findInDeletedByObjectId(req.params.id);
        if (result) {
            res.status(200).json(DeleteService.createDeletedEntityObjectViewModel(result));
        } else {
            res.status(200).json({});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/find/object/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.get("/find/entity/:id", adm_auth, async (req, res) => {
    try {
        const result = await DeleteService.findInDeletedByEntityId(req.params.id);
        if (result) {
            res.status(200).json(DeleteService.createDeletedEntityViewModel(result));
        } else {
            res.status(200).json({});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/find/entity/:id[GET] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});

router.post("/delete", adm_auth, async (req, res) => {
    try {
        const result = await DeleteService.deleteEntityById(req.body._id);
        if (result) {
            res.status(200).json({status:"deleted"});
        } else {
            res.status(200).json({message:"no delete"});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/delete/[POST] - ${e.message};`);
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


module.exports = router;