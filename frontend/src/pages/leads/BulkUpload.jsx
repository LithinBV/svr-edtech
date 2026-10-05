import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle,
    AlertCircle,
    Trash2,
    RefreshCw,
    Download,
} from "lucide-react";

import BulkUpdateLeads from "./BulkUpdateLeads";

const API_URL = import.meta.env.VITE_API_URL || "";

// ============================================================
// AUTH
// ============================================================

const getAuthToken = () => {
    const keys = [
        "token",
        "accessToken",
        "access_token",
        "jwt",
        "authToken",
    ];

    for (const key of keys) {
        const value = localStorage.getItem(key);
        if (value && value.trim()) return value.trim();
    }

    return null;
};

const authenticatedFetch = async (url, options = {}) => {
    const token = getAuthToken();

    const headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "include",
    });
};

// ============================================================
// REQUIRED COLUMNS
// NOTE: Lead Type and Program Interest remain required for
// actual validation/backend upload, but are not displayed in
// the visual "Required fields" section.
// ============================================================

const REQUIRED_COLUMNS = [
    "name",
    "email",
    "contact",
    "gender",
    "state",
    "district",
    "collegeName",
    "department",
    "ugYearOfPassout",
    "leadSource",
    "leadType",
    "programInterest",
];

// ============================================================
// DISPLAY COLUMNS
// ============================================================

const DISPLAY_COLUMNS = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "contact", label: "Contact" },
    { key: "gender", label: "Gender" },
    { key: "state", label: "State" },
    { key: "district", label: "District" },
    { key: "collegeName", label: "College" },
    { key: "department", label: "Department" },
    { key: "ugYearOfPassout", label: "UG Year" },
    { key: "pgYearOfPassout", label: "PG Year" },
    { key: "leadSource", label: "Lead Source" },
    { key: "leadType", label: "Lead Type" },
    { key: "programInterest", label: "Program Interest" },
];

// ============================================================
// HEADER ALIASES
// ============================================================

const ALIASES = {
    name: [
        "name",
        "studentname",
        "student name",
        "full name",
        "fullname",
    ],
    email: [
        "email",
        "emailid",
        "email id",
        "emailaddress",
        "email address",
    ],
    contact: [
        "contact",
        "phone",
        "mobile",
        "mobile number",
        "phone number",
        "contact number",
    ],
    gender: ["gender", "sex"],
    state: ["state"],
    district: ["district"],
    collegeName: [
        "collegename",
        "college name",
        "college",
        "institution",
    ],
    department: [
        "department",
        "dept",
        "branch",
        "stream",
    ],
    ugYearOfPassout: [
        "ugyearofpassout",
        "ug year",
        "ug year of passout",
        "ug passout year",
        "ugyear",
    ],
    pgYearOfPassout: [
        "pgyearofpassout",
        "pg year",
        "pg year of passout",
        "pg passout year",
        "pgyear",
    ],
    leadSource: [
        "leadsource",
        "lead source",
        "source",
    ],
    leadType: [
        "leadtype",
        "lead type",
        "type",
    ],
    programInterest: [
        "programinterest",
        "program interest",
        "program",
        "course",
        "course interest",
    ],
};

// ============================================================
// HELPERS
// ============================================================

const normalizeHeader = (value) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

const findColumnForField = (headers, field) => {
    const aliases = ALIASES[field] || [];

    const normalizedHeaders = headers.map((header) => ({
        original: header,
        normalized: normalizeHeader(header),
    }));

    for (const alias of aliases) {
        const normalizedAlias = normalizeHeader(alias);

        const found = normalizedHeaders.find(
            (item) => item.normalized === normalizedAlias
        );

        if (found) return found.original;
    }

    return null;
};

const cleanValue = (value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
};

const formatCell = (value) => {
    if (value === null || value === undefined) return "";
    return String(value);
};

// ============================================================
// VALIDATION
// ============================================================

const validateRow = (row) => {
    const errors = [];

    const name = cleanValue(row.name);
    const email = cleanValue(row.email);
    const contact = cleanValue(row.contact);
    const gender = cleanValue(row.gender);
    const state = cleanValue(row.state);
    const district = cleanValue(row.district);
    const collegeName = cleanValue(row.collegeName);
    const department = cleanValue(row.department);
    const ugYear = cleanValue(row.ugYearOfPassout);
    const pgYear = cleanValue(row.pgYearOfPassout);
    const leadSource = cleanValue(row.leadSource);
    const leadType = cleanValue(row.leadType);
    const programInterest = cleanValue(row.programInterest);

    if (!name) {
        errors.push("Name is required");
    }

    if (!email) {
        errors.push("Email is required");
    } else {
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            errors.push("Invalid email");
        }
    }

    if (!contact) {
        errors.push("Contact is required");
    } else {
        const digits = contact.replace(/\D/g, "");

        if (digits.length < 10 || digits.length > 15) {
            errors.push(
                "Contact must contain 10 to 15 digits"
            );
        }
    }

    const allowedGender = [
        "Male",
        "Female",
        "Other",
        "Prefer not to say",
    ];

    if (!gender) {
        errors.push("Gender is required");
    } else if (!allowedGender.includes(gender)) {
        errors.push(
            "Gender must be Male, Female, Other, or Prefer not to say"
        );
    }

    if (!state) {
        errors.push("State is required");
    }

    if (!district) {
        errors.push("District is required");
    }

    if (!collegeName) {
        errors.push("College name is required");
    }

    if (!department) {
        errors.push("Department is required");
    }

    if (!ugYear) {
        errors.push(
            "UG year of passout is required"
        );
    } else {
        const year = Number(ugYear);

        if (
            !Number.isInteger(year) ||
            year < 1900 ||
            year > 2100
        ) {
            errors.push(
                "Invalid UG year of passout"
            );
        }
    }

    if (pgYear) {
        const year = Number(pgYear);

        if (
            !Number.isInteger(year) ||
            year < 1900 ||
            year > 2100
        ) {
            errors.push(
                "Invalid PG year of passout"
            );
        }
    }

    const allowedSources = [
        "FB / Meta",
        "College campaign",
        "LinkedIn",
        "Referral",
        "Inbound",
    ];

    if (!leadSource) {
        errors.push("Lead source is required");
    } else if (!allowedSources.includes(leadSource)) {
        errors.push(
            `Invalid lead source. Allowed: ${allowedSources.join(
                ", "
            )}`
        );
    }

    const allowedLeadTypes = ["IT", "Non-IT"];

    if (!leadType) {
        errors.push("Lead type is required");
    } else if (!allowedLeadTypes.includes(leadType)) {
        errors.push(
            "Lead type must be IT or Non-IT"
        );
    }

    const IT_PROGRAMS = [
        "Full Stack",
        "Data Analysis",
        "Data Science",
    ];

    const NON_IT_PROGRAMS = ["HR", "DM"];

    if (!programInterest) {
        errors.push(
            "Program interest is required"
        );
    } else if (leadType === "IT") {
        if (!IT_PROGRAMS.includes(programInterest)) {
            errors.push(
                `Invalid IT program. Allowed: ${IT_PROGRAMS.join(
                    ", "
                )}`
            );
        }
    } else if (leadType === "Non-IT") {
        if (!NON_IT_PROGRAMS.includes(programInterest)) {
            errors.push(
                `Invalid Non-IT program. Allowed: ${NON_IT_PROGRAMS.join(
                    ", "
                )}`
            );
        }
    }

    return errors;
};

// ============================================================
// DOWNLOAD DEMO EXCEL
// ============================================================

const downloadDemoExcel = () => {
    const demoData = [
        {
            name: "Aarav Nair",
            email: "aarav.nair01@example.com",
            contact: "9876501201",
            gender: "Male",
            state: "Karnataka",
            district: "Bengaluru Urban",
            collegeName:
                "Eastview Institute of Technology",
            department: "Computer Science",
            ugYearOfPassout: 2025,
            pgYearOfPassout: "",
            leadSource: "LinkedIn",
            leadType: "IT",
            programInterest: "Full Stack",
        },
        {
            name: "Diya Sharma",
            email: "diya.sharma02@example.com",
            contact: "9876501202",
            gender: "Female",
            state: "Karnataka",
            district: "Mysuru",
            collegeName:
                "Mysuru College of Engineering",
            department: "Information Science",
            ugYearOfPassout: 2024,
            pgYearOfPassout: 2026,
            leadSource: "College campaign",
            leadType: "IT",
            programInterest: "Data Analysis",
        },
        {
            name: "Rohan Mehta",
            email: "rohan.mehta03@example.com",
            contact: "9876501203",
            gender: "Male",
            state: "Tamil Nadu",
            district: "Chennai",
            collegeName:
                "Chennai Technical College",
            department:
                "Electronics and Communication",
            ugYearOfPassout: 2025,
            pgYearOfPassout: "",
            leadSource: "FB / Meta",
            leadType: "IT",
            programInterest: "Data Science",
        },
        {
            name: "Sneha Patil",
            email: "sneha.patil04@example.com",
            contact: "9876501204",
            gender: "Female",
            state: "Maharashtra",
            district: "Pune",
            collegeName:
                "Pune Management Institute",
            department: "Business Administration",
            ugYearOfPassout: 2023,
            pgYearOfPassout: 2025,
            leadSource: "Referral",
            leadType: "Non-IT",
            programInterest: "HR",
        },
        {
            name: "Kiran Das",
            email: "kiran.das05@example.com",
            contact: "9876501205",
            gender: "Male",
            state: "Kerala",
            district: "Ernakulam",
            collegeName:
                "Kerala Institute of Commerce",
            department: "Commerce",
            ugYearOfPassout: 2025,
            pgYearOfPassout: "",
            leadSource: "Inbound",
            leadType: "Non-IT",
            programInterest: "DM",
        },
    ];

    const instructions = [
        {
            Field: "name",
            Requirement: "Required",
            AllowedValues: "Student full name",
        },
        {
            Field: "email",
            Requirement: "Required",
            AllowedValues: "Valid email address",
        },
        {
            Field: "contact",
            Requirement: "Required",
            AllowedValues: "10 to 15 digits",
        },
        {
            Field: "gender",
            Requirement: "Required",
            AllowedValues:
                "Male, Female, Other, Prefer not to say",
        },
        {
            Field: "state",
            Requirement: "Required",
            AllowedValues: "State name",
        },
        {
            Field: "district",
            Requirement: "Required",
            AllowedValues: "District name",
        },
        {
            Field: "collegeName",
            Requirement: "Required",
            AllowedValues: "College / institution name",
        },
        {
            Field: "department",
            Requirement: "Required",
            AllowedValues: "Department / branch",
        },
        {
            Field: "ugYearOfPassout",
            Requirement: "Required",
            AllowedValues: "Year between 1900 and 2100",
        },
        {
            Field: "pgYearOfPassout",
            Requirement: "Optional",
            AllowedValues: "Year between 1900 and 2100",
        },
        {
            Field: "leadSource",
            Requirement: "Required",
            AllowedValues:
                "FB / Meta, College campaign, LinkedIn, Referral, Inbound",
        },
        {
            Field: "leadType",
            Requirement: "Required",
            AllowedValues: "IT, Non-IT",
        },
        {
            Field: "programInterest",
            Requirement: "Required",
            AllowedValues:
                "IT: Full Stack, Data Analysis, Data Science | Non-IT: HR, DM",
        },
    ];

    const workbook = XLSX.utils.book_new();

    const leadSheet =
        XLSX.utils.json_to_sheet(demoData);

    const instructionSheet =
        XLSX.utils.json_to_sheet(instructions);

    leadSheet["!cols"] = [
        { wch: 22 },
        { wch: 34 },
        { wch: 16 },
        { wch: 14 },
        { wch: 18 },
        { wch: 20 },
        { wch: 34 },
        { wch: 32 },
        { wch: 20 },
        { wch: 20 },
        { wch: 22 },
        { wch: 16 },
        { wch: 24 },
    ];

    instructionSheet["!cols"] = [
        { wch: 24 },
        { wch: 18 },
        { wch: 90 },
    ];

    XLSX.utils.book_append_sheet(
        workbook,
        leadSheet,
        "Lead Data"
    );

    XLSX.utils.book_append_sheet(
        workbook,
        instructionSheet,
        "Instructions"
    );

    XLSX.writeFile(
        workbook,
        "SVR_EDTECH_Lead_Upload_Template.xlsx"
    );
};

// ============================================================
// COMPONENT
// ============================================================

const BulkUpload = () => {
    const fileInputRef = useRef(null);

    const [file, setFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [errors, setErrors] = useState([]);
    const [result, setResult] = useState(null);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [dragActive, setDragActive] = useState(false);
    const [sheetName, setSheetName] = useState("");
    const [fileError, setFileError] = useState("");
    const [uploadVersion, setUploadVersion] =
        useState(0);

    // ========================================================
    // RESET
    // ========================================================

    const resetUpload = () => {
        setFile(null);
        setRows([]);
        setErrors([]);
        setResult(null);
        setFileError("");
        setSheetName("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // ========================================================
    // PROCESS FILE
    // ========================================================

    const processFile = async (selectedFile) => {
        if (!selectedFile) return;

        setLoading(true);
        setFileError("");
        setErrors([]);
        setResult(null);
        setRows([]);

        try {
            const fileName =
                selectedFile.name.toLowerCase();

            const allowed =
                fileName.endsWith(".xlsx") ||
                fileName.endsWith(".xls") ||
                fileName.endsWith(".csv");

            if (!allowed) {
                throw new Error(
                    "Please upload an Excel (.xlsx/.xls) or CSV file."
                );
            }

            const buffer =
                await selectedFile.arrayBuffer();

            const workbook = XLSX.read(buffer, {
                type: "array",
                cellDates: true,
            });

            if (
                !workbook.SheetNames ||
                workbook.SheetNames.length === 0
            ) {
                throw new Error(
                    "No worksheet was found."
                );
            }

            const firstSheet =
                workbook.SheetNames[0];

            setSheetName(firstSheet);

            const worksheet =
                workbook.Sheets[firstSheet];

            const rawData =
                XLSX.utils.sheet_to_json(
                    worksheet,
                    {
                        defval: "",
                        raw: false,
                    }
                );

            if (!rawData.length) {
                throw new Error(
                    "The uploaded file is empty."
                );
            }

            const originalHeaders =
                Object.keys(rawData[0]);

            const columnMap = {};

            for (const field of REQUIRED_COLUMNS) {
                const column =
                    findColumnForField(
                        originalHeaders,
                        field
                    );

                if (column) {
                    columnMap[field] = column;
                }
            }

            const missingColumns =
                REQUIRED_COLUMNS.filter(
                    (field) =>
                        !columnMap[field]
                );

            if (missingColumns.length > 0) {
                throw new Error(
                    `Missing required columns: ${missingColumns.join(
                        ", "
                    )}`
                );
            }

            const processedRows = [];
            const validationErrors = [];

            rawData.forEach(
                (originalRow, index) => {
                    const rowNumber = index + 2;

                    const isEmpty =
                        Object.values(
                            originalRow
                        ).every(
                            (value) =>
                                cleanValue(value) ===
                                ""
                        );

                    if (isEmpty) return;

                    const row = {};

                    DISPLAY_COLUMNS.forEach(
                        (column) => {
                            const sourceColumn =
                                columnMap[column.key];

                            row[column.key] =
                                sourceColumn
                                    ? cleanValue(
                                          originalRow[
                                              sourceColumn
                                          ]
                                      )
                                    : "";
                        }
                    );

                    const rowErrors =
                        validateRow(row);

                    row.__rowNumber =
                        rowNumber;

                    row.__errors =
                        rowErrors;

                    row.__valid =
                        rowErrors.length === 0;

                    processedRows.push(row);

                    if (rowErrors.length > 0) {
                        validationErrors.push({
                            rowNumber,
                            errors: rowErrors,
                        });
                    }
                }
            );

            if (processedRows.length === 0) {
                throw new Error(
                    "No valid data rows were found in the file."
                );
            }

            setFile(selectedFile);
            setRows(processedRows);
            setErrors(validationErrors);
        } catch (error) {
            console.error(
                "Bulk file processing error:",
                error
            );

            setFileError(
                error?.message ||
                    "Failed to process the file."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // FILE INPUT
    // ========================================================

    const handleFileChange = (event) => {
        const selectedFile =
            event.target.files?.[0];

        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    // ========================================================
    // DRAG AND DROP
    // ========================================================

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDragActive(false);

        const droppedFile =
            event.dataTransfer.files?.[0];

        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    // ========================================================
    // REMOVE INVALID ROW
    // ========================================================

    const removeRow = (rowNumber) => {
        setRows((previous) =>
            previous.filter(
                (row) =>
                    row.__rowNumber !== rowNumber
            )
        );

        setErrors((previous) =>
            previous.filter(
                (error) =>
                    error.rowNumber !== rowNumber
            )
        );
    };

    // ========================================================
    // UPLOAD
    // ========================================================

    const handleUpload = async () => {
        const validRows = rows.filter(
            (row) => row.__valid
        );

        if (validRows.length === 0) {
            alert(
                "There are no valid rows to upload."
            );
            return;
        }

        setUploading(true);
        setResult(null);
        setFileError("");

        try {
            const uploadRows =
                validRows.map((row) => {
                    const cleanRow = {};

                    DISPLAY_COLUMNS.forEach(
                        (column) => {
                            cleanRow[column.key] =
                                row[column.key] ?? "";
                        }
                    );

                    return cleanRow;
                });

            const token = getAuthToken();

            console.log(
                "Bulk upload auth token:",
                token
                    ? "Token found"
                    : "No localStorage token found"
            );

            console.log(
                "Bulk upload URL:",
                `${API_URL}/api/leads/bulk-upload`
            );

            const response =
                await authenticatedFetch(
                    `${API_URL}/api/leads/bulk-upload`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            rows: uploadRows,
                        }),
                    }
                );

            let data = {};

            const responseText =
                await response.text();

            try {
                data = responseText
                    ? JSON.parse(responseText)
                    : {};
            } catch {
                data = {
                    message: responseText,
                };
            }

            console.log(
                "Bulk upload response:",
                response.status,
                data
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {
                throw new Error(
                    data?.message ||
                        "Access denied. Please login again."
                );
            }

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data?.message ||
                        "Bulk upload failed."
                );
            }

            setResult(data);

            if (
                Array.isArray(data.failedRows) &&
                data.failedRows.length > 0
            ) {
                const failedRowNumbers =
                    new Set(
                        data.failedRows
                            .map(
                                (item) =>
                                    item?.rowNumber
                            )
                            .filter(Boolean)
                    );

                setRows((previous) =>
                    previous.filter(
                        (row) =>
                            failedRowNumbers.has(
                                row.__rowNumber
                            )
                    )
                );

                setErrors((previous) =>
                    previous.filter(
                        (error) =>
                            failedRowNumbers.has(
                                error.rowNumber
                            )
                    )
                );
            } else {
                setRows([]);
                setErrors([]);
            }

            setUploadVersion(
                (previous) =>
                    previous + 1
            );
        } catch (error) {
            console.error(
                "Bulk upload error:",
                error
            );

            setFileError(
                error?.message ||
                    "Bulk upload failed."
            );
        } finally {
            setUploading(false);
        }
    };

    // ========================================================
    // COUNTS
    // ========================================================

    const totalRows = rows.length;

    const validRows = rows.filter(
        (row) => row.__valid
    ).length;

    const invalidRows = rows.filter(
        (row) => !row.__valid
    ).length;

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div className="min-h-full bg-slate-50 p-4 md:p-6">

            {/* HEADER */}

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Bulk Upload Leads
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Upload student leads using an Excel or CSV file.
                </p>
            </div>

            {/* UPLOAD CARD */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-5">
                    <h2 className="text-lg font-bold text-slate-900">
                        Upload File
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Supported formats: .xlsx, .xls and .csv
                    </p>
                </div>

                {/* DROP AREA */}

                <div className="p-5">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() =>
                            fileInputRef.current?.click()
                        }
                        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                            dragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {loading ? (
                            <>
                                <RefreshCw
                                    size={36}
                                    className="mx-auto animate-spin text-blue-500"
                                />

                                <p className="mt-4 font-semibold text-slate-800">
                                    Reading file...
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload
                                    size={36}
                                    className="mx-auto text-slate-400"
                                />

                                <p className="mt-4 font-semibold text-slate-800">
                                    Drop your file here
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    or click to choose a file
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* FILE INFORMATION */}

                {file && (
                    <div className="mx-5 mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">

                            <div className="rounded-lg bg-green-100 p-2">
                                <FileSpreadsheet
                                    size={22}
                                    className="text-green-600"
                                />
                            </div>

                            <div>
                                <p className="font-semibold text-slate-800">
                                    {file.name}
                                </p>

                                <p className="text-xs text-slate-500">
                                    Sheet:{" "}
                                    {sheetName || "First sheet"}
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={resetUpload}
                            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                            <X size={16} />
                            Remove
                        </button>

                    </div>
                )}

                {/* ERROR */}

                {fileError && (
                    <div className="mx-5 mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">

                        <AlertCircle
                            size={20}
                            className="mt-0.5 shrink-0 text-red-600"
                        />

                        <div>
                            <p className="font-semibold text-red-800">
                                Error
                            </p>

                            <p className="mt-1 text-sm text-red-700">
                                {fileError}
                            </p>
                        </div>

                    </div>
                )}

            </div>

            {/* ==================================================
                EXCEL FILE REQUIREMENTS
            ================================================== */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 p-5">

                    <div className="flex items-start gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            <FileSpreadsheet
                                size={21}
                                className="text-slate-600"
                            />
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Excel File Requirements
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Make sure your Excel or CSV file contains the required fields.
                            </p>
                        </div>

                    </div>

                </div>

                <div className="p-5">

                    {/* REQUIRED */}

                    <div>
                        <p className="text-sm font-bold text-slate-800">
                            Required fields
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">

                            {[
                                "Name",
                                "Email",
                                "Contact",
                                "Gender",
                                "State",
                                "District",
                                "College Name",
                                "Department",
                                "UG Year of Passout",
                                "Lead Source",
                            ].map((field) => (
                                <span
                                    key={field}
                                    className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
                                >
                                    {field}
                                </span>
                            ))}

                        </div>
                    </div>

                    {/* OPTIONAL */}

                    <div className="mt-5">

                        <p className="text-sm font-bold text-slate-800">
                            Optional field
                        </p>

                        <div className="mt-3">

                            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                                PG Year of Passout
                            </span>

                        </div>

                    </div>

                    {/* DOWNLOAD */}

                    <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <p className="font-semibold text-slate-800">
                                Need a sample file?
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Download the demo Excel file with sample data and instructions.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={downloadDemoExcel}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                            <Download size={17} />
                            Download Demo Excel
                        </button>

                    </div>

                </div>

            </div>

            {/* SUMMARY */}

            {rows.length > 0 && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">
                            Total Rows
                        </p>

                        <p className="mt-1 text-2xl font-bold text-slate-900">
                            {totalRows}
                        </p>
                    </div>

                    <div className="rounded-xl border border-green-200 bg-green-50 p-5">
                        <p className="text-sm text-green-700">
                            Valid Rows
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-800">
                            {validRows}
                        </p>
                    </div>

                    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                        <p className="text-sm text-red-700">
                            Invalid Rows
                        </p>

                        <p className="mt-1 text-2xl font-bold text-red-800">
                            {invalidRows}
                        </p>
                    </div>

                </div>
            )}

            {/* VALIDATION ERRORS */}

            {errors.length > 0 && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-white shadow-sm">

                    <div className="border-b border-red-100 bg-red-50 p-5">

                        <div className="flex items-center gap-3">

                            <AlertCircle
                                size={22}
                                className="text-red-600"
                            />

                            <div>
                                <h2 className="font-bold text-red-900">
                                    Validation Errors
                                </h2>

                                <p className="text-sm text-red-700">
                                    Fix these rows in your Excel file or remove them from this upload.
                                </p>
                            </div>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-[900px] w-full text-left text-sm">

                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3">
                                        Row
                                    </th>

                                    <th className="px-4 py-3">
                                        Name
                                    </th>

                                    <th className="px-4 py-3">
                                        Email
                                    </th>

                                    <th className="px-4 py-3">
                                        Contact
                                    </th>

                                    <th className="px-4 py-3">
                                        Errors
                                    </th>

                                    <th className="px-4 py-3">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {errors.map((errorItem) => {

                                    const actualRow =
                                        rows.find(
                                            (row) =>
                                                row.__rowNumber ===
                                                errorItem.rowNumber
                                        );

                                    return (
                                        <tr
                                            key={
                                                errorItem.rowNumber
                                            }
                                        >

                                            <td className="px-4 py-3 font-semibold text-slate-700">
                                                {
                                                    errorItem.rowNumber
                                                }
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatCell(
                                                    actualRow?.name
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatCell(
                                                    actualRow?.email
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                {formatCell(
                                                    actualRow?.contact
                                                )}
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="space-y-1">
                                                    {Array.isArray(
                                                        errorItem.errors
                                                    ) &&
                                                        errorItem.errors.map(
                                                            (
                                                                message,
                                                                index
                                                            ) => (
                                                                <p
                                                                    key={
                                                                        index
                                                                    }
                                                                    className="text-xs font-medium text-red-600"
                                                                >
                                                                    •{" "}
                                                                    {
                                                                        message
                                                                    }
                                                                </p>
                                                            )
                                                        )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeRow(
                                                            errorItem.rowNumber
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2
                                                        size={14}
                                                    />
                                                    Remove
                                                </button>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>

                    </div>
                </div>
            )}

            {/* PREVIEW */}

            {rows.length > 0 && (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Lead Preview
                            </h2>

                            <p className="text-sm text-slate-500">
                                Only valid rows will be uploaded.
                            </p>
                        </div>

                        <div className="flex gap-2">

                            <button
                                type="button"
                                onClick={resetUpload}
                                disabled={uploading}
                                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                            >
                                Clear
                            </button>

                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={
                                    uploading ||
                                    validRows === 0
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {uploading ? (
                                    <>
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        Upload {validRows} Leads
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                    <div className="overflow-x-auto">

                        <table className="min-w-[1500px] w-full text-left text-sm">

                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">

                                <tr>

                                    <th className="px-4 py-3">
                                        Row
                                    </th>

                                    {DISPLAY_COLUMNS.map(
                                        (column) => (
                                            <th
                                                key={
                                                    column.key
                                                }
                                                className="px-4 py-3"
                                            >
                                                {
                                                    column.label
                                                }
                                            </th>
                                        )
                                    )}

                                    <th className="px-4 py-3">
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {rows.map((row) => (
                                    <tr
                                        key={
                                            row.__rowNumber
                                        }
                                        className={
                                            row.__valid
                                                ? ""
                                                : "bg-red-50"
                                        }
                                    >

                                        <td className="px-4 py-3 font-semibold text-slate-600">
                                            {
                                                row.__rowNumber
                                            }
                                        </td>

                                        {DISPLAY_COLUMNS.map(
                                            (column) => (
                                                <td
                                                    key={
                                                        column.key
                                                    }
                                                    className="whitespace-nowrap px-4 py-3"
                                                >
                                                    {formatCell(
                                                        row[
                                                            column.key
                                                        ]
                                                    )}
                                                </td>
                                            )
                                        )}

                                        <td className="px-4 py-3">

                                            {row.__valid ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                                    <CheckCircle
                                                        size={14}
                                                    />
                                                    Valid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                                                    <AlertCircle
                                                        size={14}
                                                    />
                                                    Invalid
                                                </span>
                                            )}

                                        </td>

                                    </tr>
                                ))}

                            </tbody>

                        </table>

                    </div>
                </div>
            )}

            {/* SUCCESS */}

            {result && (
                <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">

                    <div className="flex items-start gap-3">

                        <CheckCircle
                            size={24}
                            className="mt-0.5 text-green-600"
                        />

                        <div>

                            <h2 className="font-bold text-green-900">
                                Bulk upload completed
                            </h2>

                            <p className="mt-1 text-sm text-green-700">
                                {result.summary?.uploaded ?? 0}{" "}
                                leads uploaded successfully.
                            </p>

                            {(result.summary?.failed ?? 0) >
                                0 && (
                                <p className="mt-1 text-sm text-red-700">
                                    {result.summary.failed}{" "}
                                    leads failed.
                                </p>
                            )}

                        </div>

                    </div>
                </div>
            )}

            {/* UNASSIGNED BULK LEADS */}

            <div className="mt-6">

                <BulkUpdateLeads
                    refreshKey={uploadVersion}
                />

            </div>

        </div>
    );
};

export default BulkUpload;