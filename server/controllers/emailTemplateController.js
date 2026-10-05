const EmailTemplate = require("../models/EmailTemplate");

/**
 * =====================================================
 * GET ALL EMAIL TEMPLATES
 *
 * GET /api/email-templates
 * =====================================================
 */
const getTemplates = async (req, res) => {
  try {
    const templates = await EmailTemplate.find({
      isActive: true,
    })
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
      "GET EMAIL TEMPLATES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch email templates",
    });
  }
};


/**
 * =====================================================
 * GET SINGLE EMAIL TEMPLATE
 *
 * GET /api/email-templates/:id
 * =====================================================
 */
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Template ID is required",
      });
    }

    const template =
      await EmailTemplate.findById(id)
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "updatedBy",
          "name email role"
        );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Email template not found",
      });
    }

    return res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    console.error(
      "GET EMAIL TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch email template",
    });
  }
};


/**
 * =====================================================
 * CREATE EMAIL TEMPLATE
 *
 * POST /api/email-templates
 * =====================================================
 */
const createTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subject,
      message,
      htmlMessage,
      isActive,
    } = req.body;


    /**
     * Validate name
     */
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Template name is required",
      });
    }


    /**
     * Validate subject
     */
    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Email subject is required",
      });
    }


    /**
     * Validate message
     */
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Email message is required",
      });
    }


    /**
     * Check duplicate name
     */
    const existingTemplate =
      await EmailTemplate.findOne({
        name: name.trim(),
      });

    if (existingTemplate) {
      return res.status(409).json({
        success: false,
        message:
          "An email template with this name already exists",
      });
    }


    /**
     * Logged-in user
     *
     * JWT contains:
     *
     * {
     *   userId,
     *   userType
     * }
     */
    const userId = req.user?.userId || null;


    /**
     * Create template
     */
    const template =
      await EmailTemplate.create({
        name: name.trim(),

        description:
          description?.trim() || "",

        category:
          category || "GENERAL",

        subject:
          subject.trim(),

        message:
          message.trim(),

        htmlMessage:
          htmlMessage || null,

        isActive:
          typeof isActive === "boolean"
            ? isActive
            : true,

        createdBy: userId,

        updatedBy: userId,
      });


    /**
     * Return populated template
     */
    const populatedTemplate =
      await EmailTemplate.findById(
        template._id
      )
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "updatedBy",
          "name email role"
        );


    return res.status(201).json({
      success: true,
      message:
        "Email template created successfully",
      template:
        populatedTemplate,
    });

  } catch (error) {

    console.error(
      "CREATE EMAIL TEMPLATE ERROR:",
      error
    );


    /**
     * Handle Mongo duplicate key
     */
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An email template with this name already exists",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create email template",
    });
  }
};


/**
 * =====================================================
 * UPDATE EMAIL TEMPLATE
 *
 * PUT /api/email-templates/:id
 * =====================================================
 */
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Template ID is required",
      });
    }


    const {
      name,
      description,
      category,
      subject,
      message,
      htmlMessage,
      isActive,
    } = req.body;


    const template =
      await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message:
          "Email template not found",
      });
    }


    /**
     * Check duplicate name
     */
    if (
      name &&
      name.trim() !== template.name
    ) {

      const duplicate =
        await EmailTemplate.findOne({
          name: name.trim(),
          _id: {
            $ne: id,
          },
        });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message:
            "An email template with this name already exists",
        });
      }
    }


    /**
     * Update fields only when supplied
     */
    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Template name cannot be empty",
        });
      }

      template.name =
        name.trim();
    }


    if (description !== undefined) {
      template.description =
        description.trim();
    }


    if (category !== undefined) {
      template.category =
        category;
    }


    if (subject !== undefined) {
      if (!subject.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Email subject cannot be empty",
        });
      }

      template.subject =
        subject.trim();
    }


    if (message !== undefined) {
      if (!message.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Email message cannot be empty",
        });
      }

      template.message =
        message.trim();
    }


    if (htmlMessage !== undefined) {
      template.htmlMessage =
        htmlMessage || null;
    }


    if (isActive !== undefined) {
      template.isActive =
        Boolean(isActive);
    }


    /**
     * Logged-in user
     */
    const userId =
      req.user?.userId || null;

    template.updatedBy =
      userId;


    await template.save();


    /**
     * Populate response
     */
    const updatedTemplate =
      await EmailTemplate.findById(
        template._id
      )
        .populate(
          "createdBy",
          "name email role"
        )
        .populate(
          "updatedBy",
          "name email role"
        );


    return res.status(200).json({
      success: true,
      message:
        "Email template updated successfully",
      template:
        updatedTemplate,
    });

  } catch (error) {

    console.error(
      "UPDATE EMAIL TEMPLATE ERROR:",
      error
    );


    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An email template with this name already exists",
      });
    }


    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to update email template",
    });
  }
};


/**
 * =====================================================
 * DELETE EMAIL TEMPLATE
 *
 * DELETE /api/email-templates/:id
 * =====================================================
 *
 * We use soft delete instead of actually deleting
 * the document.
 */
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message:
          "Template ID is required",
      });
    }


    const template =
      await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message:
          "Email template not found",
      });
    }


    template.isActive = false;

    template.updatedBy =
      req.user?.userId || null;

    await template.save();


    return res.status(200).json({
      success: true,
      message:
        "Email template deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE EMAIL TEMPLATE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to delete email template",
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