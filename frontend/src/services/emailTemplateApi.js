const API_BASE =
  import.meta.env.VITE_API_URL + "/api";

const getToken = () => {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token") ||
    ""
  );
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };
};

// ============================================================
// GET ALL ACTIVE EMAIL TEMPLATES
// ============================================================

export const getEmailTemplates = async () => {
  const response = await fetch(
    `${API_BASE}/email-templates`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to fetch email templates"
    );
  }

  return data;
};

// ============================================================
// GET ONE EMAIL TEMPLATE
// ============================================================

export const getEmailTemplateById = async (id) => {
  const response = await fetch(
    `${API_BASE}/email-templates/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to fetch email template"
    );
  }

  return data;
};

// ============================================================
// CREATE EMAIL TEMPLATE
// ============================================================

export const createEmailTemplate = async (
  templateData
) => {
  const response = await fetch(
    `${API_BASE}/email-templates`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(templateData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to create email template"
    );
  }

  return data;
};

// ============================================================
// UPDATE EMAIL TEMPLATE
// ============================================================

export const updateEmailTemplate = async (
  id,
  templateData
) => {
  const response = await fetch(
    `${API_BASE}/email-templates/${id}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(templateData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to update email template"
    );
  }

  return data;
};

// ============================================================
// DELETE EMAIL TEMPLATE
// ============================================================

export const deleteEmailTemplate = async (id) => {
  const response = await fetch(
    `${API_BASE}/email-templates/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ||
        "Failed to delete email template"
    );
  }

  return data;
};