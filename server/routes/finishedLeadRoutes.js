const express = require("express");

const router = express.Router();

const protect =
    require("../middleware/authMiddleware");

const {
    getFinishedLeads
} = require("../controllers/finishedLeadController");


router.get(
    "/",
    protect,
    getFinishedLeads
);


module.exports = router;