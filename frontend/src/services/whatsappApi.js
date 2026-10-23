// =====================================================
// WHATSAPP API SERVICE (DOMAIN-INDEPENDENT)
// =====================================================

// Dynamically resolves API root (localhost, VPS, or Vercel)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    // Strip trailing slash if present
    const cleanUrl = envUrl.replace(/\/+$/, "");
    return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
  }
  // Default to relative root (works natively behind reverse proxy / same domain)
  return "/api";
};

const API_BASE_URL = getApiBaseUrl();

// =====================================================
// COMMON REQUEST HELPER
// =====================================================
const request = async (endpoint, options = {}) => {
  const token =
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("adminToken") ||
    localStorage.getItem("superAdminToken") ||
    localStorage.getItem("executiveToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = {
      success: false,
      message: "Invalid JSON response from server.",
    };
  }

  if (response.status === 401) {
    console.error("WhatsApp API auth error:", data?.message);
    throw new Error(data?.message || "Session expired. Please log in again.");
  }

  if (response.status === 403) {
    throw new Error(
      data?.message || "Forbidden: You are not assigned to this lead."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};

// =====================================================
// WHATSAPP TEMPLATES CRUD
// =====================================================

export const getWhatsAppTemplates = async () => {
  return await request("/whatsapp/templates", {
    method: "GET",
  });
};

export const getWhatsAppTemplate = async (templateId) => {
  if (!templateId) throw new Error("WhatsApp template ID is required.");
  return await request(`/whatsapp/templates/${templateId}`, {
    method: "GET",
  });
};

export const createWhatsAppTemplate = async (templateData) => {
  if (!templateData) throw new Error("Template data is required.");
  return await request("/whatsapp/templates", {
    method: "POST",
    body: JSON.stringify(templateData),
  });
};

export const updateWhatsAppTemplate = async (templateId, templateData) => {
  if (!templateId) throw new Error("WhatsApp template ID is required.");
  if (!templateData) throw new Error("Template data is required.");

  return await request(`/whatsapp/templates/${templateId}`, {
    method: "PUT",
    body: JSON.stringify(templateData),
  });
};

export const deleteWhatsAppTemplate = async (templateId) => {
  if (!templateId) throw new Error("WhatsApp template ID is required.");
  return await request(`/whatsapp/templates/${templateId}`, {
    method: "DELETE",
  });
};

// =====================================================
// WHATSAPP LOGGING & HISTORY
// =====================================================

export const logWhatsAppOpen = async (data) => {
  if (!data) throw new Error("WhatsApp activity data is required.");
  return await request("/whatsapp/open", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getWhatsAppHistory = async (leadId) => {
  if (!leadId) throw new Error("Lead ID is required.");
  return await request(`/whatsapp/lead/${leadId}`, {
    method: "GET",
  });
};

// =====================================================
// PHONE & VARIABLE UTILITIES
// =====================================================

export const replaceWhatsAppVariables = (message, data = {}) => {
  if (!message) return "";

  const values = {
    name: data.name || data.leadName || "",
    leadName: data.leadName || data.name || "",
    leadEmail: data.leadEmail || data.email || "",
    email: data.email || data.leadEmail || "",
    phone: data.phone || data.phoneNumber || "",
    phoneNumber: data.phoneNumber || data.phone || "",
    course: data.course || data.courseName || "",
    courseName: data.courseName || data.course || "",
    counsellor: data.executive || data.agentName || "SVR EdTech",
    executive: data.executive || data.agentName || "",
    agentName: data.agentName || data.executive || "",
    company: data.company || data.companyName || "SVR EdTech",
    companyName: data.companyName || data.company || "SVR EdTech",
  };

  let result = String(message);
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    result = result.replace(regex, String(value ?? ""));
  });

  return result;
};

export const cleanWhatsAppPhone = (phoneNumber, defaultCountryCode = "91") => {
  if (!phoneNumber) throw new Error("Lead phone number is required.");

  let phone = String(phoneNumber).trim().replace(/[^0-9+]/g, "");

  if (phone.startsWith("+")) {
    phone = phone.substring(1);
  }
  if (phone.startsWith("00")) {
    phone = phone.substring(2);
  }
  if (defaultCountryCode === "91" && phone.length === 10) {
    phone = defaultCountryCode + phone;
  }

  if (phone.length < 10) {
    throw new Error("Invalid WhatsApp phone number.");
  }

  return phone;
};

export const buildWhatsAppUrl = (phoneNumber, message) => {
  const phone = cleanWhatsAppPhone(phoneNumber);
  const encodedMessage = encodeURIComponent(message || "");
  return `https://wa.me/${phone}?text=${encodedMessage}`;
};

export const openWhatsApp = (phoneNumber, message) => {
  const url = buildWhatsAppUrl(phoneNumber, message);
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");

  if (!newWindow) {
    window.location.href = url;
  }

  return url;
};

export const prepareAndOpenWhatsApp = async ({
  leadId,
  phoneNumber,
  message,
  templateName = null,
  templateId = null,
  lead = {},
  agent = {},
}) => {
  if (!leadId) throw new Error("Lead ID is required.");
  if (!phoneNumber) throw new Error("Lead phone number is required.");
  if (!message) throw new Error("WhatsApp message cannot be empty.");

  const finalMessage = replaceWhatsAppVariables(message, {
    ...lead,
    leadName: lead.leadName || lead.name || "",
    leadEmail: lead.leadEmail || lead.email || "",
    phoneNumber: lead.phoneNumber || lead.phone || phoneNumber,
    agentName: agent.agentName || agent.name || "",
    executive: agent.agentName || agent.name || "",
  });

  // Log intent to MongoDB (Backend validates executive lead ownership)
  const historyResponse = await logWhatsAppOpen({
    leadId,
    phoneNumber,
    message: finalMessage,
    templateName,
    templateId,
  });

  // Open WhatsApp in browser
  const whatsappUrl = openWhatsApp(phoneNumber, finalMessage);

  return {
    success: true,
    message: finalMessage,
    whatsappUrl,
    history: historyResponse,
  };
};

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