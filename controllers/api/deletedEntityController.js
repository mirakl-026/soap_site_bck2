const DeleteService = require("../../services/mongodb/deletedEntityService");
const LoggerService = require("../../services/loggerService");
const SearchService = require("../../services/mongodb/searchService");
const CollectionService = require("../../services/mongodb/collectionService");


module.exports.readAllDE_asEntities = async function (req, res) {
    try {
        const des = await DeleteService.readAllDeletedEntities();
        let desVM = [];
        for (let de of des) {
            desVM.push(DeleteService.createDeletedEntityViewModel(de));
        }
        return res.status(200).json(desVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/readAll/[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.readAllDE_asObjects = async function (req, res) {
    try {
        const des = await DeleteService.readAllDeletedEntities();
        let desVM = [];
        for (let de of des) {
            desVM.push(DeleteService.createDeletedEntityObjectViewModel(de));
        }
        return res.status(200).json(desVM);

    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/readAll/[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.recoverDE_byEid = async function (req, res) {
    try {
        const result = await DeleteService.recoverDeletedEntity(req.body._id);

        // обновляем поля products в коллекциях
        await CollectionService.refreshProductsInCollections();

        // обновление поисковой информации
        await SearchService.refreshSearchData();

        await CollectionService.updateCollectionsChilds();

        if (result) {
            if (!result.message) {
                return res.status(200).json({status: "entity recovered"});
            } else {
                return res.status(200).json(result);
            }
        } else {
            return res.status(200).json({message:"recover - no result"});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/recoverByEid/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.recoverDE_byOid = async function (req, res) {
    try {
        const result = await DeleteService.recoverDeletedEntityByObjectId(req.body.deletedObjectId);

        // обновляем поля products в коллекциях
        await CollectionService.refreshProductsInCollections();

        // обновление поисковой информации
        await SearchService.refreshSearchData();

        await CollectionService.updateCollectionsChilds();

        if (result) {
            if (!result.message) {
                return res.status(200).json({status: "entity recovered"});
            } else {
                return res.status(200).json(result);
            }
        } else {
            return res.status(200).json({message:"recover - no result"});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/recoverByOid/[POST] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.findDE_byOid = async function (req, res) {
    try {
        const result = await DeleteService.findInDeletedByObjectId(req.params.id);
        if (result) {
            return res.status(200).json(DeleteService.createDeletedEntityObjectViewModel(result));
        } else {
            return res.status(200).json({});
        }
    } catch (e) {
        LoggerService.serverLoggerWrite("error", `api/deletedEntity/find/object/:id[GET] - ${e.message};`);
        return res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.findDE_byEid = async function (req, res) {
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
}


module.exports.delete = async function (req, res) {
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
}
