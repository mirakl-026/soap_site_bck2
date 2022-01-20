const {Router} = require('express');
const BackupService = require("../services/backupService");
const LoggerService = require("../services/loggerService");
const adm_auth = require("../middleware/checkAdmMW");

const router = Router();

router.get("/download", adm_auth, async (req, res) => {
    try {
        res.download(BackupService.bcPath);
    } catch (e) {
        LoggerService.serverLoggerWrite( "error", `backup/download/[GET] - ${e.message};`);
        res.status(500).json({ message: "Server error" });
    }
})

module.exports = router;