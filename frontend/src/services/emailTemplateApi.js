// Read dynamically from environment variables
const rawEnvUrl = import.meta.env.VITE_API_URL || "";

// Sanitization:
// 1. Removes any trailing slash (e.g. "https://domain.com/" -> "https://domain.com")
// 2. Removes trailing "/api" if already entered in .env (prevents double /api/api)
// 3. Fallbacks safely to "/api" if VITE_API_URL is missing/empty (works with Vite proxy)
const cleanBaseUrl = rawEnvUrl
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

const API_BASE = cleanBaseUrl ? `${cleanBaseUrl}/api` : "/api";

/*
|--------------------------------------------------------------------------
| Token & Header Helpers
|--------------------------------------------------------------------------
*/
const getTokens = () => {
  const tokens = [
    localStorage.getItem("token"),
    localStorage.getItem("accessToken"),
  ].filter(Boolean);

  return [...new Set(tokens)];
};

const getHeaders = (token) => {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      message: text,
    };
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL EMAIL TEMPLATES
| Route: GET /api/email-templates
|--------------------------------------------------------------------------
*/
export const getEmailTemplates = async () => {
  const tokens = getTokens();
  const tokensToTry = tokens.length > 0 ? tokens : [""];

  let lastResponse = null;
  let lastData = null;

  for (const token of tokensToTry) {
    const response = await fetch(`${API_BASE}/email-templates`, {
      method: "GET",
      headers: getHeaders(token),
      credentials: "include",
    });

    const data = await parseResponse(response);

    lastResponse = response;
    lastData = data;

    if (response.ok) {
      return data;
    }

    if (response.status !== 401) {
      break;
    }
  }

  throw new Error(
    lastData?.message ||
      lastData?.error ||
      `Failed to fetch email templates (${lastResponse?.status || 500})`
  );
};

/*
|--------------------------------------------------------------------------
| GET TEMPLATE BY ID
| Route: GET /api/email-templates/:id
|--------------------------------------------------------------------------
*/
export const getEmailTemplateById = async (id) => {
  if (!id) {
    throw new Error("Template ID is required");
  }

  const tokens = getTokens();
  const tokensToTry = tokens.length > 0 ? tokens : [""];

  let lastResponse = null;
  let lastData = null;

  for (const token of tokensToTry) {
    const response = await fetch(`${API_BASE}/email-templates/${id}`, {
      method: "GET",
      headers: getHeaders(token),
      credentials: "include",
    });

    const data = await parseResponse(response);

    lastResponse = response;
    lastData = data;

    if (response.ok) {
      return data;
    }

    if (response.status !== 401) {
      break;
    }
  }

  throw new Error(
    lastData?.message ||
      lastData?.error ||
      `Failed to fetch email template (${lastResponse?.status || 500})`
  );
};

/*
|--------------------------------------------------------------------------
| CREATE TEMPLATE
| Route: POST /api/email-templates
|--------------------------------------------------------------------------
*/
export const createEmailTemplate = async (templateData) => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const response = await fetch(`${API_BASE}/email-templates`, {
    method: "POST",
    headers: getHeaders(token),
    credentials: "include",
    body: JSON.stringify(templateData),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Failed to create email template"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| UPDATE TEMPLATE
| Route: PUT /api/email-templates/:id
|--------------------------------------------------------------------------
*/
export const updateEmailTemplate = async (id, templateData) => {
  if (!id) {
    throw new Error("Template ID is required");
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const response = await fetch(`${API_BASE}/email-templates/${id}`, {
    method: "PUT",
    headers: getHeaders(token),
    credentials: "include",
    body: JSON.stringify(templateData),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Failed to update email template"
    );
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| DELETE TEMPLATE
| Route: DELETE /api/email-templates/:id
|--------------------------------------------------------------------------
*/
export const deleteEmailTemplate = async (id) => {
  if (!id) {
    throw new Error("Template ID is required");
  }

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    "";

  const response = await fetch(`${API_BASE}/email-templates/${id}`, {
    method: "DELETE",
    headers: getHeaders(token),
    credentials: "include",
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Failed to delete email template"
    );
  }

  return data;
};