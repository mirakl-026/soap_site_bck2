const SearchService = require("../../services/mongodb/searchService");


module.exports.find = async function (req, res) {
    try {
        let userInput = req.query.userInput;
        const foundedItems = await SearchService.find(userInput);
        res.status(200).json(SearchService.searchResultToJSON(foundedItems));

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.findInNames = async function (req, res) {
    try {
        let userInput = req.query.userInput;
        const foundedItems = await SearchService.findInNames(userInput);
        res.status(200).json(SearchService.searchResultToJSON(foundedItems));

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}


module.exports.update = async function (req, res) {
    try {
        await SearchService.refreshSearchData();
        res.status(200).json({status: "all search data updated"});

    } catch (e) {
        res.status(500).json({
            message: "server error:" + e.message
        });
    }
}