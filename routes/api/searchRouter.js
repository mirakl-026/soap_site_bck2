const express = require("express");
const searchController = require("../../controllers/api/searchController");


const router = express.Router();

//
router.get("/find", searchController.find);

//
router.get("/findInNames", searchController.findInNames);

// явное обновление поисковой информации
router.post("/update", searchController.update);


module.exports = router;