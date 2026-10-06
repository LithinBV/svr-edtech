// =====================================================
// WHATSAPP API SERVICE
// =====================================================
//
// Normal WhatsApp flow:
//
// React App
//     ↓
// Backend API
//     ↓
// Prepare / store message
//     ↓
// Open normal WhatsApp
//     ↓
// Executive manually presses SEND
//
// No Meta WhatsApp API is used.
// =====================================================


// =====================================================
// API BASE URL
// =====================================================

const API_BASE_URL =
  (import.meta.env.VITE_API_URL || "http://localhost:3000")
    .replace(/\/$/, "") + "/api";


// =====================================================
// COMMON REQUEST HELPER
// =====================================================

const request = async (
    endpoint,
    options = {}
) => {

    // =================================================
    // GET AUTH TOKEN
    // =================================================

    const token =
        localStorage.getItem("accessToken") ||
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("superAdminToken") ||
        localStorage.getItem("executiveToken") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("authToken");


    // =================================================
    // BUILD HEADERS
    // =================================================

    const headers = {
        "Content-Type": "application/json",

        ...(options.headers || {}),
    };


    // =================================================
    // ADD JWT AUTHORIZATION
    // =================================================

    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }


    // =================================================
    // SEND REQUEST
    // =================================================

    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,

            credentials: "include",

            headers,
        }
    );


    // =================================================
    // READ RESPONSE
    // =================================================

    let data;

    try {

        data = await response.json();

    } catch (error) {

        data = {
            success: false,
            message: "Invalid server response.",
        };

    }


    // =================================================
    // AUTH FAILURE
    // =================================================

    if (response.status === 401) {

        console.error(
            "WhatsApp API authentication failed:",
            data?.message
        );

        throw new Error(
            data?.message ||
            "Access denied. Please login."
        );
    }


    // =================================================
    // OTHER API ERRORS
    // =================================================

    if (!response.ok) {

        throw new Error(
            data?.message ||
            `Request failed with status ${response.status}`
        );
    }


    // =================================================
    // RETURN DATA
    // =================================================

    return data;
};


// =====================================================
// GET ALL WHATSAPP TEMPLATES
// =====================================================
//
// GET /api/whatsapp/templates
//
// Returns active templates.
// =====================================================

export const getWhatsAppTemplates = async () => {

    return await request(
        "/whatsapp/templates",
        {
            method: "GET",
        }
    );

};


// =====================================================
// GET ONE WHATSAPP TEMPLATE
// =====================================================
//
// GET /api/whatsapp/templates/:id
// =====================================================

export const getWhatsAppTemplate = async (
    templateId
) => {

    if (!templateId) {

        throw new Error(
            "WhatsApp template ID is required."
        );

    }


    return await request(
        `/whatsapp/templates/${templateId}`,
        {
            method: "GET",
        }
    );

};


// =====================================================
// CREATE WHATSAPP TEMPLATE
// =====================================================
//
// POST /api/whatsapp/templates
//
// Example:
//
// {
//     name: "Welcome Lead",
//     description: "Welcome message",
//     message: "Hello {{leadName}}, welcome to SVR-EDTECH.",
//     category: "WELCOME"
// }
// =====================================================

export const createWhatsAppTemplate = async (
    templateData
) => {

    if (!templateData) {

        throw new Error(
            "Template data is required."
        );

    }


    return await request(
        "/whatsapp/templates",
        {
            method: "POST",

            body: JSON.stringify(
                templateData
            ),
        }
    );

};


// =====================================================
// UPDATE WHATSAPP TEMPLATE
// =====================================================
//
// PUT /api/whatsapp/templates/:id
// =====================================================

export const updateWhatsAppTemplate = async (
    templateId,
    templateData
) => {

    if (!templateId) {

        throw new Error(
            "WhatsApp template ID is required."
        );

    }


    if (!templateData) {

        throw new Error(
            "Template data is required."
        );

    }


    return await request(
        `/whatsapp/templates/${templateId}`,
        {
            method: "PUT",

            body: JSON.stringify(
                templateData
            ),
        }
    );

};


// =====================================================
// DELETE WHATSAPP TEMPLATE
// =====================================================
//
// DELETE /api/whatsapp/templates/:id
//
// Backend performs a soft delete/deactivation.
// =====================================================

export const deleteWhatsAppTemplate = async (
    templateId
) => {

    if (!templateId) {

        throw new Error(
            "WhatsApp template ID is required."
        );

    }


    return await request(
        `/whatsapp/templates/${templateId}`,
        {
            method: "DELETE",
        }
    );

};


// =====================================================
// LOG WHATSAPP OPEN
// =====================================================
//
// POST /api/whatsapp/open
//
// IMPORTANT:
//
// This does NOT send a WhatsApp message.
//
// It records that the user prepared/opened
// the message in the application.
//
// The actual message is sent manually inside
// normal WhatsApp.
// =====================================================

export const logWhatsAppOpen = async (
    data
) => {

    if (!data) {

        throw new Error(
            "WhatsApp activity data is required."
        );

    }


    return await request(
        "/whatsapp/open",
        {
            method: "POST",

            body: JSON.stringify(
                data
            ),
        }
    );

};


// =====================================================
// GET WHATSAPP HISTORY FOR LEAD
// =====================================================
//
// GET /api/whatsapp/lead/:leadId
// =====================================================

export const getWhatsAppHistory = async (
    leadId
) => {

    if (!leadId) {

        throw new Error(
            "Lead ID is required."
        );

    }


    return await request(
        `/whatsapp/lead/${leadId}`,
        {
            method: "GET",
        }
    );

};


// =====================================================
// REPLACE TEMPLATE VARIABLES
// =====================================================
//
// Supported variables:
//
// {{name}}
// {{leadName}}
// {{leadEmail}}
// {{email}}
// {{phone}}
// {{phoneNumber}}
// {{course}}
// {{courseName}}
// {{executive}}
// {{agentName}}
// {{company}}
// {{companyName}}
// =====================================================

export const replaceWhatsAppVariables = (
    message,
    data = {}
) => {

    if (!message) {

        return "";

    }


    const values = {

        // ---------------------------------------------
        // NAME
        // ---------------------------------------------

        name:
            data.name ||
            data.leadName ||
            "",


        leadName:
            data.leadName ||
            data.name ||
            "",


        // ---------------------------------------------
        // EMAIL
        // ---------------------------------------------

        leadEmail:
            data.leadEmail ||
            data.email ||
            "",


        email:
            data.email ||
            data.leadEmail ||
            "",


        // ---------------------------------------------
        // PHONE
        // ---------------------------------------------

        phone:
            data.phone ||
            data.phoneNumber ||
            "",


        phoneNumber:
            data.phoneNumber ||
            data.phone ||
            "",


        // ---------------------------------------------
        // COURSE
        // ---------------------------------------------

        course:
            data.course ||
            data.courseName ||
            "",


        courseName:
            data.courseName ||
            data.course ||
            "",


        // ---------------------------------------------
        // EXECUTIVE
        // ---------------------------------------------

        executive:
            data.executive ||
            data.agentName ||
            "",


        agentName:
            data.agentName ||
            data.executive ||
            "",


        // ---------------------------------------------
        // COMPANY
        // ---------------------------------------------

        company:
            data.company ||
            data.companyName ||
            "SVR-EDTECH",


        companyName:
            data.companyName ||
            data.company ||
            "SVR-EDTECH",

    };


    // =================================================
    // REPLACE VARIABLES
    // =================================================

    let result = String(message);


    Object.entries(values).forEach(
        ([key, value]) => {

            const regex =
                new RegExp(
                    `{{\\s*${key}\\s*}}`,
                    "gi"
                );


            result = result.replace(
                regex,
                String(value ?? "")
            );

        }
    );


    return result;
};


// =====================================================
// CLEAN WHATSAPP PHONE NUMBER
// =====================================================
//
// WhatsApp wa.me requires an international number.
//
// Example:
//
// 9876543210
//
// becomes:
//
// 919876543210
//
// If the number already contains 91,
// we don't add it again.
// =====================================================

export const cleanWhatsAppPhone = (
    phoneNumber,
    defaultCountryCode = "91"
) => {

    if (!phoneNumber) {

        throw new Error(
            "Lead phone number is required."
        );

    }


    // =================================================
    // CONVERT TO STRING
    // =================================================

    let phone =
        String(phoneNumber)
            .trim();


    // =================================================
    // REMOVE SPACES / SYMBOLS
    // =================================================

    phone =
        phone.replace(
            /[^0-9+]/g,
            ""
        );


    // =================================================
    // REMOVE LEADING +
    // =================================================

    if (
        phone.startsWith("+")
    ) {

        phone =
            phone.substring(1);

    }


    // =================================================
    // REMOVE 00 INTERNATIONAL PREFIX
    // =================================================

    if (
        phone.startsWith("00")
    ) {

        phone =
            phone.substring(2);

    }


    // =================================================
    // INDIAN NUMBER
    // =================================================

    if (
        defaultCountryCode === "91" &&
        phone.length === 10
    ) {

        phone =
            defaultCountryCode +
            phone;

    }


    // =================================================
    // BASIC VALIDATION
    // =================================================

    if (
        phone.length < 10
    ) {

        throw new Error(
            "Invalid WhatsApp phone number."
        );

    }


    return phone;
};


// =====================================================
// BUILD NORMAL WHATSAPP URL
// =====================================================
//
// This opens:
//
// https://wa.me/LEAD_NUMBER?text=MESSAGE
//
// IMPORTANT:
//
// The LEAD'S number goes here.
//
// NOT the company's WhatsApp number.
//
// The user's WhatsApp account will be the
// account from which the message is actually sent.
// =====================================================

export const buildWhatsAppUrl = (
    phoneNumber,
    message
) => {

    const phone =
        cleanWhatsAppPhone(
            phoneNumber
        );


    const encodedMessage =
        encodeURIComponent(
            message || ""
        );


    return (
        `https://wa.me/${phone}` +
        `?text=${encodedMessage}`
    );

};


// =====================================================
// OPEN NORMAL WHATSAPP
// =====================================================
//
// Desktop:
//
// Opens WhatsApp Web.
//
// Mobile:
//
// Browser/device can redirect to WhatsApp.
// =====================================================

export const openWhatsApp = (
    phoneNumber,
    message
) => {

    const url =
        buildWhatsAppUrl(
            phoneNumber,
            message
        );


    const newWindow =
        window.open(
            url,
            "_blank",
            "noopener,noreferrer"
        );


    // =================================================
    // POPUP BLOCKER FALLBACK
    // =================================================

    if (!newWindow) {

        window.location.href =
            url;

    }


    return url;
};


// =====================================================
// PREPARE + OPEN WHATSAPP
// =====================================================
//
// Process:
//
// 1. Replace template variables
// 2. Build WhatsApp URL
// 3. Tell backend to store activity
// 4. Open normal WhatsApp
//
// IMPORTANT:
//
// Backend activity means OPENED/PREPARED.
// It does NOT mean WhatsApp SEND was pressed.
// =====================================================

export const prepareAndOpenWhatsApp = async ({
    leadId,
    phoneNumber,
    message,
    templateName = null,
    templateId = null,
    lead = {},
    agent = {},
}) => {

    // =================================================
    // VALIDATE LEAD ID
    // =================================================

    if (!leadId) {

        throw new Error(
            "Lead ID is required."
        );

    }


    // =================================================
    // VALIDATE PHONE
    // =================================================

    if (!phoneNumber) {

        throw new Error(
            "Lead phone number is required."
        );

    }


    // =================================================
    // VALIDATE MESSAGE
    // =================================================

    if (!message) {

        throw new Error(
            "WhatsApp message cannot be empty."
        );

    }


    // =================================================
    // REPLACE TEMPLATE VARIABLES
    // =================================================

    const finalMessage =
        replaceWhatsAppVariables(
            message,
            {

                ...lead,

                leadName:
                    lead.leadName ||
                    lead.name ||
                    "",

                leadEmail:
                    lead.leadEmail ||
                    lead.email ||
                    "",

                phoneNumber:
                    lead.phoneNumber ||
                    lead.phone ||
                    phoneNumber,

                agentName:
                    agent.agentName ||
                    agent.name ||
                    "",

                executive:
                    agent.agentName ||
                    agent.name ||
                    "",

            }
        );


    // =================================================
    // STORE ACTIVITY IN BACKEND
    // =================================================

    let historyResponse = null;


    try {

        historyResponse =
            await logWhatsAppOpen({

                leadId,

                phoneNumber,

                message:
                    finalMessage,

                templateName,

                templateId,

            });

    } catch (error) {

        console.error(
            "Failed to store WhatsApp activity:",
            error
        );

        // ---------------------------------------------
        // IMPORTANT
        // ---------------------------------------------
        //
        // We DO NOT open WhatsApp if the backend
        // rejected the request.
        //
        // This prevents unauthorized users from
        // bypassing backend permission checks.
        //
        // ---------------------------------------------

        throw error;
    }


    // =================================================
    // OPEN NORMAL WHATSAPP
    // =================================================

    const whatsappUrl =
        openWhatsApp(
            phoneNumber,
            finalMessage
        );


    // =================================================
    // RETURN RESULT
    // =================================================

    return {

        success: true,

        message:
            finalMessage,

        whatsappUrl,

        history:
            historyResponse,

    };

};


// =====================================================
// DEFAULT EXPORT
// =====================================================

const whatsappApi = {

    getWhatsAppTemplates,

    getWhatsAppTemplate,

    createWhatsAppTemplate,

    updateWhatsAppTemplate,

    deleteWhatsAppTemplate,

    logWhatsAppOpen,

    getWhatsAppHistory,

    replaceWhatsAppVariables,

    cleanWhatsAppPhone,

    buildWhatsAppUrl,

    openWhatsApp,

    prepareAndOpenWhatsApp,

};


export default whatsappApi;