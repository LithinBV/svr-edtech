const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

/*
|--------------------------------------------------------------------------
| Get available tokens
|--------------------------------------------------------------------------
| We check "token" first because your emailApi.js already uses it.
| If it doesn't exist, we fall back to accessToken.
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
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
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
|--------------------------------------------------------------------------
*/
export const getEmailTemplates = async () => {
  const tokens = getTokens();

  let lastResponse = null;
  let lastData = null;

  /*
  | If token exists, try each available token.
  | This helps if one stored token is expired.
  */
  const tokensToTry = tokens.length > 0 ? tokens : [""];

  for (const token of tokensToTry) {
    const response = await fetch(`${API_BASE}/email-templates`, {
      method: "GET",
      headers: getHeaders(token),
    });

    const data = await parseResponse(response);

    lastResponse = response;
    lastData = data;

    if (response.ok) {
      return data;
    }

    /*
    | Only retry with another token for authentication failure.
    */
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
    const response = await fetch(
      `${API_BASE}/email-templates/${id}`,
      {
        method: "GET",
        headers: getHeaders(token),
      }
    );

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

  const response = await fetch(
    `${API_BASE}/email-templates/${id}`,
    {
      method: "PUT",
      headers: getHeaders(token),
      body: JSON.stringify(templateData),
    }
  );

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

  const response = await fetch(
    `${API_BASE}/email-templates/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(token),
    }
  );

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