const express = require("express");
const SearchService = require("../../services/mongodb/searchService");
const adm_auth = require("../../middleware/checkAdmMW");

const router = express.Router();

router.get("/find", async (req, res) => {
    try {
        let userInput = req.query.userInput;
        const foundedItems = await SearchService.find(userInput);
        res.status(200).json(SearchService.searchResultToJSON(foundedItems));

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


router.get("/findInNames", async (req, res) => {
    try {
        let userInput = req.query.userInput;
        const foundedItems = await SearchService.findInNames(userInput);
        res.status(200).json(SearchService.searchResultToJSON(foundedItems));

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


// явное обновление поисковой информации
router.post("/update", adm_auth, async (req, res) => {
    try {
        await SearchService.refreshSearchData();
        res.status(200).json({status: "all search data updated"});

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
});


module.exports = router;