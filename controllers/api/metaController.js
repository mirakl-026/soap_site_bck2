const MetaService = require("../../services/mongodb/metaService");


module.exports.getMeta = async function (req, res) {
    try {
        const meta = await MetaService.getMetaDataFromDB();
        res.status(200).json(MetaService.createMetaDbViewModel(meta));

    } catch (e) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports.setEmail = async function (req, res) {
    try {
        const {emailsFlag} = req.body;

        let boolEmailsFlag = emailsFlag === "True";

        let meta = await MetaService.getMetaDataFromDB();
        if (meta) {
            meta.isEmails = boolEmailsFlag;
            await meta.save();
            const result = await MetaService.refreshMetaVars();
            if (result) {
                res.status(200).json({
                    message: "meta vars [emails] changed"
                });
            } else {
                res.status(200).json({
                    message: "meta vars [emails] not changed"
                });
            }
        } else {
            res.status(200).json({
                message: "no meta-object in db"
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports.setLog = async function (req, res) {
    try {
        const {logFlag} = req.body;

        let boolLogFlag = logFlag === "True";

        let meta = await MetaService.getMetaDataFromDB();
        if (meta) {
            meta.isLog = boolLogFlag;
            await meta.save();
            const result = await MetaService.refreshMetaVars();
            if (result) {
                res.status(200).json({
                    message: "meta vars [log] changed"
                });
            } else {
                res.status(200).json({
                    message: "meta vars [log] not changed"
                });
            }
        } else {
            res.status(200).json({
                message: "no meta-object in db"
            });
        }

    } catch (e) {
        res.status(500).json({
            message: "Server error"
        });
    }
}

module.exports.setBackup = async function (req, res) {
    try {
        const {backupFlag} = req.body;

        let boolBackupFlag = backupFlag === "True";

        let meta = await MetaService.getMetaDataFromDB();
        if (meta) {
            meta.isBackup = boolBackupFlag;
            await meta.save();
            const result = await MetaService.refreshMetaVars();
            if (result) {
                res.status(200).json({
                    message: "meta vars [backup] changed"
                });
            } else {
                res.status(200).json({
                    message: "meta vars [backup] not changed"
                });
            }
        } else {
            res.status(200).json({
                message: "no meta-object in db"
            });
        }

    } catch (e) {
        res.status(500).json({
            message: "Server error"
        });
    }
}