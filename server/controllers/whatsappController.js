const WhatsAppTemplate = require("../models/WhatsAppTemplate");
const WhatsAppMessage = require("../models/WhatsAppMessage");

// =====================================================
// GET ALL ACTIVE WHATSAPP TEMPLATES
// GET /api/whatsapp/templates
// =====================================================

const getTemplates = async (req, res) => {
  try {
    const { category } = req.query;

    const query = {
      isActive: true,
    };

    if (category) {
      query.category = category;
    }

    const templates = await WhatsAppTemplate.find(query)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .sort({
        category: 1,
        name: 1,
      });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error(
      "GET WHATSAPP TEMPLATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp templates",
      error: error.message,
    });
  }
};

// =====================================================
// GET SINGLE WHATSAPP TEMPLATE
// GET /api/whatsapp/templates/:id
// =====================================================

const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await WhatsAppTemplate.findOne({
      _id: id,
      isActive: true,
    })
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp template not found",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error(
      "GET WHATSAPP TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp template",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE WHATSAPP TEMPLATE
// POST /api/whatsapp/templates
// =====================================================

const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      message,
      category,
    } = req.body;

    // -----------------------------------------------
    // VALIDATE NAME
    // -----------------------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Template name is required",
      });
    }

    // -----------------------------------------------
    // VALIDATE MESSAGE
    // -----------------------------------------------

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Template message is required",
      });
    }

    // -----------------------------------------------
    // CHECK DUPLICATE TEMPLATE
    // -----------------------------------------------

    const existingTemplate =
      await WhatsAppTemplate.findOne({
        name: name.trim(),
      });

    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message:
          "A WhatsApp template with this name already exists",
      });
    }

    // -----------------------------------------------
    // LOGGED-IN USER
    // -----------------------------------------------

    const userId =
      req.user?.userId ||
      req.user?._id ||
      null;

    // -----------------------------------------------
    // CREATE TEMPLATE
    // -----------------------------------------------

    const template =
      await WhatsAppTemplate.create({
        name: name.trim(),

        description:
          description?.trim() || "",

        message: message.trim(),

        category:
          category || "GENERAL",

        isActive: true,

        createdBy: userId,

        updatedBy: userId,
      });

    return res.status(201).json({
      success: true,
      message:
        "WhatsApp template created successfully",

      template,
    });
  } catch (error) {
    console.error(
      "CREATE WHATSAPP TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create WhatsApp template",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE WHATSAPP TEMPLATE
// PUT /api/whatsapp/templates/:id
// =====================================================

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      message,
      category,
      isActive,
    } = req.body;

    const template =
      await WhatsAppTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message:
          "WhatsApp template not found",
      });
    }

    // -----------------------------------------------
    // UPDATE NAME
    // -----------------------------------------------

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message:
            "Template name cannot be empty",
        });
      }

      const duplicate =
        await WhatsAppTemplate.findOne({
          name: trimmedName,
          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "Another template with this name already exists",
        });
      }

      template.name = trimmedName;
    }

    // -----------------------------------------------
    // UPDATE DESCRIPTION
    // -----------------------------------------------

    if (description !== undefined) {
      template.description =
        description.trim();
    }

    // -----------------------------------------------
    // UPDATE MESSAGE
    // -----------------------------------------------

    if (message !== undefined) {
      if (!message.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Template message cannot be empty",
        });
      }

      template.message =
        message.trim();
    }

    // -----------------------------------------------
    // UPDATE CATEGORY
    // -----------------------------------------------

    if (category !== undefined) {
      template.category = category;
    }

    // -----------------------------------------------
    // UPDATE ACTIVE STATUS
    // -----------------------------------------------

    if (isActive !== undefined) {
      template.isActive =
        Boolean(isActive);
    }

    // -----------------------------------------------
    // UPDATED BY
    // -----------------------------------------------

    template.updatedBy =
      req.user?.userId ||
      req.user?._id ||
      null;

    await template.save();

    return res.status(200).json({
      success: true,
      message:
        "WhatsApp template updated successfully",

      template,
    });
  } catch (error) {
    console.error(
      "UPDATE WHATSAPP TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update WhatsApp template",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE / DEACTIVATE TEMPLATE
// DELETE /api/whatsapp/templates/:id
// =====================================================

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template =
      await WhatsAppTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message:
          "WhatsApp template not found",
      });
    }

    // Soft delete
    template.isActive = false;

    template.updatedBy =
      req.user?.userId ||
      req.user?._id ||
      null;

    await template.save();

    return res.status(200).json({
      success: true,
      message:
        "WhatsApp template deactivated successfully",
    });
  } catch (error) {
    console.error(
      "DELETE WHATSAPP TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate WhatsApp template",
      error: error.message,
    });
  }
};

// =====================================================
// LOG WHATSAPP OPEN
//
// POST /api/whatsapp/open
//
// IMPORTANT:
// This does NOT send a WhatsApp message.
//
// It only records that the executive clicked the
// WhatsApp action and our application opened WhatsApp.
// =====================================================

const logWhatsAppOpen = async (req, res) => {
  try {
    const {
      leadId,
      phoneNumber,
      message,
      templateName,
      templateId,
    } = req.body;

    // -----------------------------------------------
    // VALIDATE LEAD
    // -----------------------------------------------

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "leadId is required",
      });
    }

    // -----------------------------------------------
    // VALIDATE PHONE
    // -----------------------------------------------

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "phoneNumber is required",
      });
    }

    // -----------------------------------------------
    // VALIDATE MESSAGE
    // -----------------------------------------------

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    // -----------------------------------------------
    // GET LOGGED-IN USER
    // -----------------------------------------------

    const agentId =
      req.user?.userId ||
      req.user?._id;

    if (!agentId) {
      return res.status(401).json({
        success: false,
        message:
          "Authenticated user not found",
      });
    }

    // -----------------------------------------------
    // SAVE WHATSAPP HISTORY
    // -----------------------------------------------

    const whatsappMessage =
      await WhatsAppMessage.create({
        leadId,

        agentId,

        phoneNumber:
          String(phoneNumber).trim(),

        message:
          String(message).trim(),

        templateName:
          templateName || null,

        templateId:
          templateId || null,

        direction: "OUTBOUND",

        status: "OPENED",

        openedAt: new Date(),
      });

    return res.status(201).json({
      success: true,

      message:
        "WhatsApp activity recorded successfully",

      whatsappMessage,
    });
  } catch (error) {
    console.error(
      "LOG WHATSAPP OPEN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to record WhatsApp activity",
      error: error.message,
    });
  }
};

// =====================================================
// GET WHATSAPP HISTORY FOR A LEAD
//
// GET /api/whatsapp/lead/:leadId
// =====================================================

const getHistory = async (req, res) => {
  try {
    const { leadId } = req.params;

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "leadId is required",
      });
    }

    const messages =
      await WhatsAppMessage.find({
        leadId,
      })
        .populate(
          "agentId",
          "name email role"
        )
        .populate(
          "templateId",
          "name category"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,

      count: messages.length,

      messages,
    });
  } catch (error) {
    console.error(
      "GET WHATSAPP HISTORY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch WhatsApp history",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,

  logWhatsAppOpen,
  getHistory,
};