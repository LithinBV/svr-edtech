const API_BASE =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

/**
 * =====================================================
 * AUTH HEADERS
 * =====================================================
 */
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

/**
 * =====================================================
 * HANDLE API RESPONSE
 * =====================================================
 */
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

/**
 * =====================================================
 * SEND EMAIL
 * POST /api/email/send
 * =====================================================
 */
export const sendEmail = async ({
  leadId,
  to,
  cc = null,
  bcc = null,
  subject = "",
  message = "",
  htmlMessage = null,
  templateName = null,
  templateId = null,
}) => {
  const response = await fetch(
    `${API_BASE}/email/send`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        leadId,
        to,
        cc,
        bcc,
        subject,
        message,
        htmlMessage,
        templateName,
        templateId,
      }),
    }
  );

  return handleResponse(response);
};

/**
 * =====================================================
 * GET EMAIL HISTORY
 * GET /api/email/lead/:leadId
 * =====================================================
 */
export const getEmailHistory = async (leadId) => {
  if (!leadId) {
    throw new Error("Lead ID is required");
  }

  const response = await fetch(
    `${API_BASE}/email/lead/${leadId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  return handleResponse(response);
};

/**
 * =====================================================
 * UPDATE EMAIL STATUS
 * PUT /api/email/status
 * =====================================================
 */
export const updateEmailStatus = async ({
  providerMessageId,
  status,
  metadata = {},
}) => {
  if (!providerMessageId) {
    throw new Error(
      "providerMessageId is required"
    );
  }

  if (!status) {
    throw new Error("status is required");
  }

  const response = await fetch(
    `${API_BASE}/email/status`,
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