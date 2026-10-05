const WhatsAppTemplate = require("../models/WhatsAppTemplate");

// =====================================================
// GET ALL ACTIVE WHATSAPP TEMPLATES
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
      .sort({ category: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: templates.length,
      templates,
    });
  } catch (error) {
    console.error("GET WHATSAPP TEMPLATES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp templates",
      error: error.message,
    });
  }
};


// =====================================================
// GET SINGLE TEMPLATE
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
    console.error("GET WHATSAPP TEMPLATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp template",
      error: error.message,
    });
  }
};


// =====================================================
// CREATE TEMPLATE
// =====================================================
const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      message,
      providerTemplateName,
      category,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Template name is required",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Template message is required",
      });
    }

    // Check duplicate template name
    const existingTemplate = await WhatsAppTemplate.findOne({
      name: name.trim(),
    });

    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: "A WhatsApp template with this name already exists",
      });
    }

    const template = await WhatsAppTemplate.create({
      name: name.trim(),
      description: description?.trim() || "",
      message: message.trim(),
      providerTemplateName:
        providerTemplateName?.trim() || null,
      category: category || "GENERAL",
      isActive: true,
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    return res.status(201).json({
      success: true,
      message: "WhatsApp template created successfully",
      template,
    });
  } catch (error) {
    console.error("CREATE WHATSAPP TEMPLATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create WhatsApp template",
      error: error.message,
    });
  }
};


// =====================================================
// UPDATE TEMPLATE
// =====================================================
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      message,
      providerTemplateName,
      category,
      isActive,
    } = req.body;

    const template = await WhatsAppTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp template not found",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Template name cannot be empty",
        });
      }

      const duplicate = await WhatsAppTemplate.findOne({
        name: trimmedName,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Another template with this name already exists",
        });
      }

      template.name = trimmedName;
    }

    if (description !== undefined) {
      template.description = description.trim();
    }

    if (message !== undefined) {
      if (!message.trim()) {
        return res.status(400).json({
          success: false,
          message: "Template message cannot be empty",
        });
      }

      template.message = message.trim();
    }

    if (providerTemplateName !== undefined) {
      template.providerTemplateName =
        providerTemplateName?.trim() || null;
    }

    if (category !== undefined) {
      template.category = category;
    }

    if (isActive !== undefined) {
      template.isActive = Boolean(isActive);
    }

    template.updatedBy = req.user?._id || null;

    await template.save();

    return res.status(200).json({
      success: true,
      message: "WhatsApp template updated successfully",
      template,
    });
  } catch (error) {
    console.error("UPDATE WHATSAPP TEMPLATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update WhatsApp template",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE / DEACTIVATE TEMPLATE
// =====================================================
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await WhatsAppTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp template not found",
      });
    }

    // Soft delete
    template.isActive = false;
    template.updatedBy = req.user?._id || null;

    await template.save();

    return res.status(200).json({
      success: true,
      message: "WhatsApp template deactivated successfully",
    });
  } catch (error) {
    console.error("DELETE WHATSAPP TEMPLATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate WhatsApp template",
      error: error.message,
    });
  }
};


module.exports = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
};