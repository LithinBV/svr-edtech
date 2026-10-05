const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// =====================================================
// AUTH HEADERS
// =====================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};


// =====================================================
// RESPONSE HANDLER
// =====================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );
  }

  return data;
};


// =====================================================
// WHATSAPP
// =====================================================

export const sendWhatsAppMessage = async ({
  leadId,
  phoneNumber,
  message,
  templateName = null,
  templateId = null,
}) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/send`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        leadId,
        phoneNumber,
        message,
        templateName,
        templateId,
      }),
    }
  );

  return handleResponse(response);
};


// =====================================================
// WHATSAPP HISTORY
// =====================================================

export const getWhatsAppHistory = async (leadId) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/lead/${leadId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};


// =====================================================
// COMMON COMMUNICATION HISTORY
// =====================================================

export const getCommunicationHistory = async (
  leadId,
  type = null
) => {
  const url = type
    ? `${API_BASE}/communications/lead/${leadId}/${type}`
    : `${API_BASE}/communications/lead/${leadId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};


// =====================================================
// WHATSAPP TEMPLATES
// =====================================================

export const getWhatsAppTemplates = async (
  category = null
) => {
  const url = category
    ? `${API_BASE}/whatsapp/templates?category=${encodeURIComponent(
        category
      )}`
    : `${API_BASE}/whatsapp/templates`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  return handleResponse(response);
};


// =====================================================
// SINGLE WHATSAPP TEMPLATE
// =====================================================

export const getWhatsAppTemplate = async (
  templateId
) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/templates/${templateId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};


// =====================================================
// CREATE WHATSAPP TEMPLATE
// =====================================================

export const createWhatsAppTemplate = async ({
  name,
  description = "",
  message,
  providerTemplateName = null,
  category = "GENERAL",
}) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/templates`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        description,
        message,
        providerTemplateName,
        category,
      }),
    }
  );

  return handleResponse(response);
};


// =====================================================
// UPDATE WHATSAPP TEMPLATE
// =====================================================

export const updateWhatsAppTemplate = async (
  templateId,
  updates
) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/templates/${templateId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }
  );

  return handleResponse(response);
};


// =====================================================
// DELETE / DEACTIVATE WHATSAPP TEMPLATE
// =====================================================

export const deleteWhatsAppTemplate = async (
  templateId
) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/templates/${templateId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};


// =====================================================
// UPDATE WHATSAPP STATUS
// =====================================================

export const updateWhatsAppStatus = async ({
  providerMessageId,
  status,
  metadata = {},
}) => {
  const response = await fetch(
    `${API_BASE}/whatsapp/status`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        providerMessageId,
        status,
        metadata,
      }),
    }
  );

  return handleResponse(response);
};