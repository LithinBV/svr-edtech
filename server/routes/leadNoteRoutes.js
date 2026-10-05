const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getLeadNotes,
    addLeadNote
} = require("../controllers/leadNoteController");


// ==========================================
// GET ALL NOTES FOR A LEAD
// ==========================================

router.get("/:leadId", protect, getLeadNotes);


// ==========================================
// ADD NOTE TO A LEAD
// ==========================================

router.post("/:leadId", protect, addLeadNote);


module.exports = router;