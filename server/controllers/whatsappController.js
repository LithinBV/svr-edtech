const mongoose = require("mongoose");
const WhatsAppTemplate = require("../models/WhatsAppTemplate");
const WhatsAppMessage = require("../models/WhatsAppMessage");

// Access Lead model safely without recompiling or altering Lead.js
const getLeadModel = () => {
  return mongoose.models.Lead || mongoose.model("Lead");
};

// Check if user has Admin/Manager level privileges across all leads
const hasElevatedPrivileges = (user) => {
  if (!user) return false;
  const role = String(user.role || user.userRole || user.type || "").trim().toLowerCase();
  return (
    role === "admin" ||
    role === "manager" ||
    role === "superadmin" ||
    role === "super_admin" ||
    role.includes("admin") ||
    role.includes("manager")
  );
};

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
    console.error("GET WHATSAPP TEMPLATES ERROR:", error);

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
    console.error("GET WHATSAPP TEMPLATE ERROR:", error);

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
      providerTemplateName,
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

    const existingTemplate = await WhatsAppTemplate.findOne({
      name: name.trim(),
    });

    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message: "A WhatsApp template with this name already exists",
      });
    }

    const userId = req.user?.userId || req.user?._id || null;

    const template = await WhatsAppTemplate.create({
      name: name.trim(),
      description: description?.trim() || "",
      message: message.trim(),
      category: category || "GENERAL",
      providerTemplateName: providerTemplateName?.trim() || null,
      isActive: true,
      createdBy: userId,
      updatedBy: userId,
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
      providerTemplateName,
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

    if (category !== undefined) {
      template.category = category;
    }

    if (providerTemplateName !== undefined) {
      template.providerTemplateName = providerTemplateName?.trim() || null;
    }

    if (isActive !== undefined) {
      template.isActive = Boolean(isActive);
    }

    template.updatedBy = req.user?.userId || req.user?._id || null;
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
// DELETE /api/whatsapp/templates/:id
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

    template.isActive = false;
    template.updatedBy = req.user?.userId || req.user?._id || null;
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

// =====================================================
// LOG WHATSAPP OPEN
// POST /api/whatsapp/open
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

    if (!leadId) {
      return res.status(400).json({
        success: false,
        message: "leadId is required",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "phoneNumber is required",
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    const currentUserId = String(req.user?._id || req.user?.id || req.user?.userId || "");
    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found",
      });
    }

    const isElevated = hasElevatedPrivileges(req.user);

    const Lead = getLeadModel();
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Admins & Managers can message any lead
    // Regular executives must be the assigned leadOwner
    if (!isElevated) {
      const leadOwnerId = lead.leadOwner ? String(lead.leadOwner._id || lead.leadOwner) : null;
      const isOwner = leadOwnerId && leadOwnerId === currentUserId;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You are not assigned to this lead.",
        });
      }
    }

    const whatsappMessage = await WhatsAppMessage.create({
      leadId,
      agentId: currentUserId,
      phoneNumber: String(phoneNumber).trim(),
      message: String(message).trim(),
      templateName: templateName || null,
      templateId: templateId || null,
      direction: "OUTBOUND",
      status: "OPENED",
      openedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "WhatsApp activity recorded successfully",
      whatsappMessage,
    });
  } catch (error) {
    console.error("LOG WHATSAPP OPEN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to record WhatsApp activity",
      error: error.message,
    });
  }
};

// =====================================================
// GET WHATSAPP HISTORY FOR A LEAD
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

    const currentUserId = String(req.user?._id || req.user?.id || req.user?.userId || "");
    const isElevated = hasElevatedPrivileges(req.user);

    const Lead = getLeadModel();
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // Admins & Managers can view any lead history
    // Regular executives must be the assigned leadOwner
    if (!isElevated) {
      const leadOwnerId = lead.leadOwner ? String(lead.leadOwner._id || lead.leadOwner) : null;
      const isOwner = leadOwnerId && leadOwnerId === currentUserId;

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view chat history for this lead.",
        });
      }
    }

    // Sort ascending (createdAt: 1) so chat timeline renders oldest-to-newest
    const messages = await WhatsAppMessage.find({ leadId })
      .populate("agentId", "name email role")
      .populate("templateId", "name category")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      leadOwner: lead.leadOwner,
      messages,
    });
  } catch (error) {
    console.error("GET WHATSAPP HISTORY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch WhatsApp history",
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