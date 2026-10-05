const LeadHistory = require("../models/leadHistory");

/**
 * Create a permanent history record for a lead.
 */
const createLeadHistory = async ({
    leadId,
    action,
    changedBy,
    field = null,
    oldValue = null,
    newValue = null
}) => {
    try {
        await LeadHistory.create({
            lead: leadId,
            action,
            changedBy,
            field,
            oldValue,
            newValue
        });
    } catch (error) {
        console.error("Lead history error:", error.message);
    }
};

module.exports = {
    createLeadHistory
};