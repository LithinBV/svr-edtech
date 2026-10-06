import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    CheckCircle,
    ChevronDown,
    FileSpreadsheet,
    RefreshCw,
    Search,
    Upload,
    XCircle,
} from "lucide-react";

import * as XLSX from "xlsx";


const API_URL = import.meta.env.VITE_API_URL;


/* =========================================================
   AUTH
========================================================= */

const getToken = () =>
    localStorage.getItem("managerToken") ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("authToken");


/* =========================================================
   HELPERS
========================================================= */

const getExecutiveId = (executive) =>
    executive?._id || executive?.id;

const getExecutiveName = (executive) =>
    executive?.name ||
    executive?.fullName ||
    executive?.email ||
    "Unnamed Executive";


const getManagerId = (manager) =>
    manager?._id || manager?.id;

const getManagerName = (manager) =>
    manager?.name ||
    manager?.fullName ||
    manager?.email ||
    "Unnamed Manager";


const normalizeHeader = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");


/* =========================================================
   EXCEL HEADER ALIASES
========================================================= */

const headerAliases = {
    name: [
        "name",
        "fullname",
        "studentname",
        "leadname",
    ],

    email: [
        "email",
        "emailid",
        "emailaddress",
    ],

    contact: [
        "contact",
        "phone",
        "phonenumber",
        "mobile",
        "mobilenumber",
    ],

    gender: [
        "gender",
        "sex",
    ],

    state: [
        "state",
    ],

    district: [
        "district",
    ],

    collegeName: [
        "collegename",
        "college",
        "institution",
        "institutionname",
    ],

    department: [
        "department",
        "branch",
        "course",
        "stream",
    ],

    ugYearOfPassout: [
        "ugyearofpassout",
        "ugpassoutyear",
        "ugyear",
        "ugyearofpassing",
    ],

    pgYearOfPassout: [
        "pgyearofpassout",
        "pgpassoutyear",
        "pgyear",
        "pgyearofpassing",
    ],

    leadSource: [
        "leadsource",
        "source",
    ],

    leadType: [
        "leadtype",
        "type",
    ],

    programInterest: [
        "programinterest",
        "program",
        "programname",
        "interest",
    ],
};


/* =========================================================
   FIND EXCEL COLUMN
========================================================= */

const findColumn = (row, field) => {
    const aliases = headerAliases[field] || [];

    const keys = Object.keys(row || {});

    const matchedKey = keys.find((key) =>
        aliases.includes(
            normalizeHeader(key)
        )
    );

    return matchedKey
        ? row[matchedKey]
        : "";
};


/* =========================================================
   NORMALIZE EXCEL ROW
========================================================= */

const normalizeRow = (row) => ({
    name: String(
        findColumn(row, "name") || ""
    ).trim(),

    email: String(
        findColumn(row, "email") || ""
    ).trim(),

    contact: String(
        findColumn(row, "contact") || ""
    ).trim(),

    gender: String(
        findColumn(row, "gender") || ""
    ).trim(),

    state: String(
        findColumn(row, "state") || ""
    ).trim(),

    district: String(
        findColumn(row, "district") || ""
    ).trim(),

    collegeName: String(
        findColumn(row, "collegeName") || ""
    ).trim(),

    department: String(
        findColumn(row, "department") || ""
    ).trim(),

    ugYearOfPassout: String(
        findColumn(
            row,
            "ugYearOfPassout"
        ) || ""
    ).trim(),

    pgYearOfPassout: String(
        findColumn(
            row,
            "pgYearOfPassout"
        ) || ""
    ).trim(),

    leadSource: String(
        findColumn(
            row,
            "leadSource"
        ) || ""
    ).trim(),

    leadType: String(
        findColumn(
            row,
            "leadType"
        ) || ""
    ).trim(),

    programInterest: String(
        findColumn(
            row,
            "programInterest"
        ) || ""
    ).trim(),
});


/* =========================================================
   VALIDATION
========================================================= */

const validateRow = (row) => {
    const requiredFields = [
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

    for (const field of requiredFields) {
        if (
            !String(
                row[field] || ""
            ).trim()
        ) {
            return `${field} is required`;
        }
    }

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            row.email
        )
    ) {
        return "Invalid email";
    }

    const contactDigits = String(
        row.contact || ""
    ).replace(/\D/g, "");

    if (
        contactDigits.length < 10
    ) {
        return "Contact must contain at least 10 digits";
    }

    const leadType = String(
        row.leadType || ""
    )
        .trim()
        .toUpperCase();

    if (
        leadType !== "IT" &&
        leadType !== "NON-IT"
    ) {
        return "Lead Type must be IT or Non-IT";
    }

    const program = String(
        row.programInterest || ""
    )
        .trim()
        .toLowerCase();

    const itPrograms = [
        "full stack",
        "data analysis",
        "data science",
    ];

    const nonItPrograms = [
        "hr",
        "dm",
    ];

    if (
        leadType === "IT" &&
        !itPrograms.includes(program)
    ) {
        return "Invalid program for IT lead";
    }

    if (
        leadType === "NON-IT" &&
        !nonItPrograms.includes(program)
    ) {
        return "Invalid program for Non-IT lead";
    }

    return "";
};


/* =========================================================
   COMPONENT
========================================================= */

function ManagerBulkUpload() {

    const fileInputRef =
        useRef(null);


    const [rows, setRows] =
        useState([]);


    const [selectedIds, setSelectedIds] =
        useState([]);


    /* =====================================================
       EXECUTIVES
    ===================================================== */

    const [executives, setExecutives] =
        useState([]);

    const [selectedExecutiveId, setSelectedExecutiveId] =
        useState("");

    const [loadingExecutives, setLoadingExecutives] =
        useState(false);


    /* =====================================================
       MANAGERS
    ===================================================== */

    const [managers, setManagers] =
        useState([]);

    const [selectedManagerId, setSelectedManagerId] =
        useState("");

    const [loadingManagers, setLoadingManagers] =
        useState(false);


    /* =====================================================
       GENERAL
    ===================================================== */

    const [search, setSearch] =
        useState("");

    // UI-only pagination
    const ITEMS_PER_PAGE = 50;

    const [page, setPage] =
        useState(1);

    // Custom selection count
    const [selectCount, setSelectCount] =
        useState("");

    const [processingFile, setProcessingFile] =
        useState(false);

    const [assigning, setAssigning] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [fileName, setFileName] =
        useState("");

    const [uploaded, setUploaded] =
        useState(false);

    const [failedRows, setFailedRows] =
        useState([]);


    /* =====================================================
       DROPDOWNS
    ===================================================== */

    const [showExecutiveDropdown, setShowExecutiveDropdown] =
        useState(false);

    const [showManagerDropdown, setShowManagerDropdown] =
        useState(false);


    /* =========================================================
       AUTH HEADERS
    ========================================================= */

    const getAuthHeaders = () => {

        const token =
            getToken();

        return {
            "Content-Type":
                "application/json",

            ...(token
                ? {
                      Authorization:
                          `Bearer ${token}`,
                  }
                : {}),
        };
    };


    /* =========================================================
       FETCH EXECUTIVES
    ========================================================= */

    const fetchExecutives =
        async () => {

            try {

                setLoadingExecutives(
                    true
                );

                const response =
                    await fetch(
                        `${API_URL}/api/manager/leads/executives`,
                        {
                            method:
                                "GET",

                            headers:
                                getAuthHeaders(),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (
                    !response.ok
                ) {
                    throw new Error(
                        data.message ||
                            "Failed to load executives."
                    );
                }

                const list =
                    Array.isArray(
                        data.executives
                    )
                        ? data.executives
                        : Array.isArray(
                              data.data
                          )
                        ? data.data
                        : [];

                setExecutives(
                    list
                );

            } catch (err) {

                console.error(
                    "Executive fetch error:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to load executives."
                );

            } finally {

                setLoadingExecutives(
                    false
                );
            }
        };


    /* =========================================================
       FETCH MANAGERS
    ========================================================= */

    const fetchManagers =
        async () => {

            try {

                setLoadingManagers(
                    true
                );

                const response =
                    await fetch(
                        `${API_URL}/api/manager/leads/managers`,
                        {
                            method:
                                "GET",

                            headers:
                                getAuthHeaders(),
                        }
                    );

                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );

                if (
                    !response.ok
                ) {
                    throw new Error(
                        data.message ||
                            "Failed to load managers."
                    );
                }

                const list =
                    Array.isArray(
                        data.managers
                    )
                        ? data.managers
                        : Array.isArray(
                              data.data
                          )
                        ? data.data
                        : [];

                setManagers(
                    list
                );

            } catch (err) {

                console.error(
                    "Manager fetch error:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to load managers."
                );

            } finally {

                setLoadingManagers(
                    false
                );
            }
        };


    /* =========================================================
       INITIAL LOAD
    ========================================================= */

    useEffect(() => {

        fetchExecutives();

        fetchManagers();

    }, []);


    /* =========================================================
       EXCEL FILE CHANGE
    ========================================================= */

    const handleFileChange =
        async (event) => {

            const file =
                event.target.files?.[0];

            if (!file) {
                return;
            }

            setError("");

            setSuccess("");

            setFailedRows([]);

            setSelectedIds([]);

            setSelectCount("");

            setSelectedExecutiveId("");

            setSelectedManagerId("");

            setShowExecutiveDropdown(
                false
            );

            setShowManagerDropdown(
                false
            );

            setRows([]);

            setUploaded(false);

            setFileName(
                file.name
            );

            try {

                setProcessingFile(
                    true
                );

                const buffer =
                    await file.arrayBuffer();

                const workbook =
                    XLSX.read(
                        buffer,
                        {
                            type:
                                "array",
                        }
                    );

                if (
                    !workbook.SheetNames ||
                    workbook.SheetNames.length ===
                        0
                ) {
                    throw new Error(
                        "The Excel file does not contain any sheet."
                    );
                }

                const firstSheet =
                    workbook.Sheets[
                        workbook.SheetNames[0]
                    ];

                const rawRows =
                    XLSX.utils.sheet_to_json(
                        firstSheet,
                        {
                            defval:
                                "",
                            raw:
                                false,
                        }
                    );

                if (
                    !rawRows ||
                    rawRows.length ===
                        0
                ) {
                    throw new Error(
                        "The Excel file does not contain any lead data."
                    );
                }

                const normalizedRows =
                    rawRows.map(
                        (
                            row,
                            index
                        ) => {

                            const normalized =
                                normalizeRow(
                                    row
                                );

                            return {
                                ...normalized,

                                _tempId:
                                    `row-${index}-${Date.now()}-${Math.random()
                                        .toString(
                                            36
                                        )
                                        .slice(
                                            2
                                        )}`,

                                _rowNumber:
                                    index +
                                    2,

                                _validationError:
                                    validateRow(
                                        normalized
                                    ),
                            };
                        }
                    );

                setRows(
                    normalizedRows
                );

                setUploaded(
                    true
                );

                const invalidCount =
                    normalizedRows.filter(
                        (row) =>
                            row._validationError
                    ).length;

                if (
                    invalidCount >
                    0
                ) {

                    setError(
                        `${invalidCount} row${
                            invalidCount ===
                            1
                                ? ""
                                : "s"
                        } have validation errors.`
                    );

                } else {

                    setSuccess(
                        `${normalizedRows.length} leads loaded successfully.`
                    );
                }

            } catch (err) {

                console.error(
                    "Excel processing error:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to read the Excel file."
                );

                setRows([]);

                setUploaded(
                    false
                );

            } finally {

                setProcessingFile(
                    false
                );

                if (
                    fileInputRef.current
                ) {
                    fileInputRef.current.value =
                        "";
                }
            }
        };


    /* =========================================================
       FILTERED ROWS
    ========================================================= */

    const filteredRows =
        useMemo(() => {

            const value =
                search
                    .trim()
                    .toLowerCase();

            if (!value) {
                return rows;
            }

            return rows.filter(
                (row) =>
                    String(
                        row.name ||
                            ""
                    )
                        .toLowerCase()
                        .includes(
                            value
                        ) ||

                    String(
                        row.email ||
                            ""
                    )
                        .toLowerCase()
                        .includes(
                            value
                        ) ||

                    String(
                        row.contact ||
                            ""
                    )
                        .toLowerCase()
                        .includes(
                            value
                        ) ||

                    String(
                        row.collegeName ||
                            ""
                    )
                        .toLowerCase()
                        .includes(
                            value
                        )
            );

        }, [
            rows,
            search,
        ]);


    /* =========================================================
       UI PAGINATION
    ========================================================= */

    const totalFilteredRows =
        filteredRows.length;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalFilteredRows /
                    ITEMS_PER_PAGE
            )
        );

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        if (page > totalPages) {
            setPage(totalPages);
        }
    }, [
        page,
        totalPages,
    ]);

    const paginatedRows =
        useMemo(() => {
            const start =
                (page - 1) *
                ITEMS_PER_PAGE;

            return filteredRows.slice(
                start,
                start + ITEMS_PER_PAGE
            );
        }, [
            filteredRows,
            page,
        ]);


    /* =========================================================
       VALID ROWS
    ========================================================= */

    const validRows =
        useMemo(
            () =>
                rows.filter(
                    (row) =>
                        !row._validationError
                ),
            [rows]
        );


    /* =========================================================
       SELECTED ROWS
    ========================================================= */

    const selectedRows =
        useMemo(
            () =>
                rows.filter(
                    (row) =>
                        selectedIds.some(
                            (id) =>
                                String(
                                    id
                                ) ===
                                String(
                                    row._tempId
                                )
                        )
                ),
            [
                rows,
                selectedIds,
            ]
        );


    const selectedInvalidRows =
        selectedRows.filter(
            (row) =>
                row._validationError
        );


    /* =========================================================
       SELECTABLE FILTERED ROWS
    ========================================================= */

    const selectableFilteredRows =
        filteredRows.filter(
            (row) =>
                !row._validationError
        );


    const allFilteredSelected =
        selectableFilteredRows.length >
            0 &&
        selectableFilteredRows.every(
            (row) =>
                selectedIds.some(
                    (id) =>
                        String(id) ===
                        String(
                            row._tempId
                        )
                )
        );


    /* =========================================================
       SELECTED EXECUTIVE
    ========================================================= */

    const selectedExecutive =
        executives.find(
            (executive) =>
                String(
                    getExecutiveId(
                        executive
                    )
                ) ===
                String(
                    selectedExecutiveId
                )
        );


    /* =========================================================
       SELECTED MANAGER
    ========================================================= */

    const selectedManager =
        managers.find(
            (manager) =>
                String(
                    getManagerId(
                        manager
                    )
                ) ===
                String(
                    selectedManagerId
                )
        );


    /* =========================================================
       SELECTED OWNER
    ========================================================= */

    const selectedOwnerId =
        selectedManagerId ||
        selectedExecutiveId;


    const selectedOwnerName =
        selectedManagerId
            ? getManagerName(
                  selectedManager
              )
            : getExecutiveName(
                  selectedExecutive
              );


    /* =========================================================
       TOGGLE ROW
    ========================================================= */

    const toggleRow =
        (rowId) => {

            setSelectedIds(
                (previous) => {

                    const exists =
                        previous.some(
                            (id) =>
                                String(
                                    id
                                ) ===
                                String(
                                    rowId
                                )
                        );

                    if (
                        exists
                    ) {

                        return previous.filter(
                            (id) =>
                                String(
                                    id
                                ) !==
                                String(
                                    rowId
                                )
                        );
                    }

                    return [
                        ...previous,
                        rowId,
                    ];
                }
            );
        };


    /* =========================================================
       SELECT / DESELECT ALL
    ========================================================= */

    const toggleSelectAll =
        () => {

            const ids =
                selectableFilteredRows
                    .map(
                        (row) =>
                            row._tempId
                    )
                    .filter(
                        Boolean
                    );

            const allSelected =
                ids.length >
                    0 &&
                ids.every(
                    (id) =>
                        selectedIds.some(
                            (
                                selectedId
                            ) =>
                                String(
                                    selectedId
                                ) ===
                                String(
                                    id
                                )
                        )
                );

            if (
                allSelected
            ) {

                setSelectedIds(
                    (previous) =>
                        previous.filter(
                            (id) =>
                                !ids.some(
                                    (
                                        filteredId
                                    ) =>
                                        String(
                                            filteredId
                                        ) ===
                                        String(
                                            id
                                        )
                                )
                        )
                );

            } else {

                setSelectedIds(
                    (previous) => [
                        ...new Set([
                            ...previous,
                            ...ids,
                        ]),
                    ]
                );
            }
        };


    /* =========================================================
       CUSTOM COUNT SELECTION
    ========================================================= */

    const selectFirstN =
        (value = selectCount) => {

            const requestedCount =
                Math.max(
                    0,
                    Math.floor(
                        Number(value) || 0
                    )
                );

            const safeCount =
                Math.min(
                    requestedCount,
                    selectableFilteredRows.length
                );

            const ids =
                selectableFilteredRows
                    .slice(
                        0,
                        safeCount
                    )
                    .map(
                        (row) =>
                            row._tempId
                    )
                    .filter(
                        Boolean
                    );

            setSelectedIds(ids);

            setSelectCount(
                requestedCount > 0
                    ? String(safeCount)
                    : ""
            );

            setPage(1);
        };


    /* =========================================================
       CLEAR SELECTION
    ========================================================= */


    const clearSelection =
        () => {

            setSelectedIds([]);

            setSelectCount("");

            setSelectedExecutiveId(
                ""
            );

            setSelectedManagerId(
                ""
            );

            setShowExecutiveDropdown(
                false
            );

            setShowManagerDropdown(
                false
            );

            setError("");

            setSuccess("");
        };


    /* =========================================================
       CLEAR FILE
    ========================================================= */

    const clearFile =
        () => {

            setRows([]);

            setSelectedIds([]);

            setSelectedExecutiveId(
                ""
            );

            setSelectedManagerId(
                ""
            );

            setFileName("");

            setUploaded(
                false
            );

            setFailedRows([]);

            setError("");

            setSuccess("");

            setSearch("");

            setShowExecutiveDropdown(
                false
            );

            setShowManagerDropdown(
                false
            );

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }
        };


    /* =========================================================
       ASSIGN / BULK UPLOAD
    ========================================================= */

    const handleAssign =
        async () => {

            setError("");

            setSuccess("");

            if (
                selectedIds.length ===
                0
            ) {
                setError(
                    "Please select at least one lead."
                );
                return;
            }

            if (
                selectedInvalidRows.length >
                0
            ) {
                setError(
                    "Please remove leads with validation errors from your selection."
                );
                return;
            }

            if (
                !selectedOwnerId
            ) {
                setError(
                    "Please select a manager or executive."
                );
                return;
            }

            try {

                setAssigning(
                    true
                );

                const selectedLeadRows =
                    selectedRows.map(
                        (row) => {

                            const {
                                _tempId,
                                _rowNumber,
                                _validationError,
                                ...leadData
                            } = row;

                            return leadData;
                        }
                    );


                const response =
                    await fetch(
                        `${API_URL}/api/manager/leads/bulk-upload`,
                        {
                            method:
                                "POST",

                            headers:
                                getAuthHeaders(),

                            body:
                                JSON.stringify(
                                    {
                                        rows:
                                            selectedLeadRows,

                                        /*
                                         * Backend expects
                                         * leadOwner.
                                         *
                                         * This can be:
                                         * - another manager
                                         * - an executive
                                         */
                                        leadOwner:
                                            selectedOwnerId,
                                    }
                                ),
                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => ({})
                        );


                if (
                    !response.ok
                ) {
                    throw new Error(
                        data.message ||
                            "Failed to assign leads."
                    );
                }


                const assignedCount =
                    Number(
                        data.successCount ??
                            data.assignedCount ??
                            selectedLeadRows.length
                    );


                const failed =
                    Array.isArray(
                        data.failedRows
                    )
                        ? data.failedRows
                        : [];


                setSuccess(
                    `${assignedCount} lead${
                        assignedCount ===
                        1
                            ? ""
                            : "s"
                    } assigned successfully to ${selectedOwnerName}.`
                );


                if (
                    failed.length >
                    0
                ) {

                    setFailedRows(
                        failed
                    );

                } else {

                    setFailedRows(
                        []
                    );
                }


                const selectedTempIds =
                    new Set(
                        selectedIds.map(
                            String
                        )
                    );


                setRows(
                    (previous) =>
                        previous.filter(
                            (row) =>
                                !selectedTempIds.has(
                                    String(
                                        row._tempId
                                    )
                                )
                        )
                );


                setSelectedIds([]);

                setSelectedExecutiveId(
                    ""
                );

                setSelectedManagerId(
                    ""
                );

                setShowExecutiveDropdown(
                    false
                );

                setShowManagerDropdown(
                    false
                );

            } catch (err) {

                console.error(
                    "Assignment error:",
                    err
                );

                setError(
                    err.message ||
                        "Failed to assign leads."
                );

            } finally {

                setAssigning(
                    false
                );
            }
        };


    /* =========================================================
       DOWNLOAD DEMO EXCEL
    ========================================================= */

    const downloadDemo =
        () => {

            const demoRows = [

                {
                    Name:
                        "Rahul Kumar",

                    Email:
                        "rahul.demo@example.com",

                    Contact:
                        "9876543210",

                    Gender:
                        "Male",

                    State:
                        "Karnataka",

                    District:
                        "Hassan",

                    CollegeName:
                        "Demo Engineering College",

                    Department:
                        "Computer Science",

                    UGYearOfPassout:
                        "2025",

                    PGYearOfPassout:
                        "",

                    LeadSource:
                        "Referral",

                    LeadType:
                        "IT",

                    ProgramInterest:
                        "Full Stack",
                },

                {
                    Name:
                        "Priya Sharma",

                    Email:
                        "priya.demo@example.com",

                    Contact:
                        "9876543211",

                    Gender:
                        "Female",

                    State:
                        "Karnataka",

                    District:
                        "Bengaluru",

                    CollegeName:
                        "Demo College",

                    Department:
                        "Electronics",

                    UGYearOfPassout:
                        "2025",

                    PGYearOfPassout:
                        "",

                    LeadSource:
                        "LinkedIn",

                    LeadType:
                        "IT",

                    ProgramInterest:
                        "Data Analysis",
                },

                {
                    Name:
                        "Arun Kumar",

                    Email:
                        "arun.demo@example.com",

                    Contact:
                        "9876543212",

                    Gender:
                        "Male",

                    State:
                        "Karnataka",

                    District:
                        "Mysuru",

                    CollegeName:
                        "Demo Arts College",

                    Department:
                        "Commerce",

                    UGYearOfPassout:
                        "2024",

                    PGYearOfPassout:
                        "",

                    LeadSource:
                        "Inbound",

                    LeadType:
                        "Non-IT",

                    ProgramInterest:
                        "HR",
                },
            ];


            const instructions = [

                {
                    Field:
                        "Name",

                    Required:
                        "Yes",

                    Description:
                        "Lead full name",
                },

                {
                    Field:
                        "Email",

                    Required:
                        "Yes",

                    Description:
                        "Valid email address",
                },

                {
                    Field:
                        "Contact",

                    Required:
                        "Yes",

                    Description:
                        "At least 10 digits",
                },

                {
                    Field:
                        "Gender",

                    Required:
                        "Yes",

                    Description:
                        "Gender of the lead",
                },

                {
                    Field:
                        "State",

                    Required:
                        "Yes",

                    Description:
                        "State",
                },

                {
                    Field:
                        "District",

                    Required:
                        "Yes",

                    Description:
                        "District",
                },

                {
                    Field:
                        "CollegeName",

                    Required:
                        "Yes",

                    Description:
                        "College/institution name",
                },

                {
                    Field:
                        "Department",

                    Required:
                        "Yes",

                    Description:
                        "Department or branch",
                },

                {
                    Field:
                        "UGYearOfPassout",

                    Required:
                        "Yes",

                    Description:
                        "UG passing year",
                },

                {
                    Field:
                        "PGYearOfPassout",

                    Required:
                        "No",

                    Description:
                        "PG passing year",
                },

                {
                    Field:
                        "LeadSource",

                    Required:
                        "Yes",

                    Description:
                        "FB / Meta, College campaign, LinkedIn, Referral, Inbound",
                },

                {
                    Field:
                        "LeadType",

                    Required:
                        "Yes",

                    Description:
                        "IT or Non-IT",
                },

                {
                    Field:
                        "ProgramInterest",

                    Required:
                        "Yes",

                    Description:
                        "IT: Full Stack, Data Analysis, Data Science | Non-IT: HR, DM",
                },
            ];


            const workbook =
                XLSX.utils.book_new();


            const leadSheet =
                XLSX.utils.json_to_sheet(
                    demoRows
                );


            const instructionSheet =
                XLSX.utils.json_to_sheet(
                    instructions
                );


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
                "Manager_Bulk_Upload_Demo.xlsx"
            );
        };


    /* =========================================================
       UPLOAD SELECTED
    ========================================================= */

    const handleUploadSelected =
        async () => {

            setError("");

            setSuccess("");

            if (
                !rows.length
            ) {
                setError(
                    "Please upload an Excel file first."
                );
                return;
            }

            const invalidRows =
                rows.filter(
                    (row) =>
                        row._validationError
                );

            if (
                invalidRows.length >
                0
            ) {
                setError(
                    `Please fix ${invalidRows.length} invalid row${
                        invalidRows.length ===
                        1
                            ? ""
                            : "s"
                    } before uploading.`
                );
                return;
            }

            if (
                selectedIds.length ===
                0
            ) {
                setError(
                    "Please select at least one lead."
                );
                return;
            }

            if (
                !selectedOwnerId
            ) {
                setError(
                    "Please select a manager or executive."
                );
                return;
            }

            await handleAssign();
        };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="min-h-screen bg-[#f5f7fb] text-slate-800">

            <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">


                {/* =====================================================
                    HEADER
                ====================================================== */}

                <div className="mb-6">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#102236] shadow-sm">

                                <FileSpreadsheet
                                    size={23}
                                    className="text-white"
                                />

                            </div>


                            <div>

                                <div className="flex items-center gap-2">

                                    <h1 className="text-xl font-bold tracking-tight text-[#102236] sm:text-2xl">
                                        Bulk Upload Leads
                                    </h1>

                                    {uploaded && (

                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                                            {rows.length} Leads
                                        </span>

                                    )}

                                </div>


                                <p className="mt-1 text-sm text-slate-500">
                                    Upload leads and assign them to a manager or executive.
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"
                            onClick={
                                downloadDemo
                            }
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#102236] shadow-sm transition hover:border-[#102236] hover:bg-slate-50"
                        >

                            <FileSpreadsheet
                                size={17}
                            />

                            Download Demo Excel

                        </button>

                    </div>

                </div>


                {/* =====================================================
                    ALERTS
                ====================================================== */}

                {error && (

                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700 shadow-sm">

                        <XCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <span className="font-medium">
                            {error}
                        </span>

                    </div>

                )}


                {success && (

                    <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700 shadow-sm">

                        <CheckCircle
                            size={19}
                            className="mt-0.5 shrink-0"
                        />

                        <span className="font-medium">
                            {success}
                        </span>

                    </div>

                )}


                {/* =====================================================
                    EMPTY UPLOAD STATE
                ====================================================== */}

                {!uploaded && (

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                        <div className="bg-[#102236] px-5 py-4 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">

                                    <Upload
                                        size={18}
                                        className="text-white"
                                    />

                                </div>


                                <div>

                                    <h2 className="text-sm font-bold text-white">
                                        Import Leads
                                    </h2>

                                    <p className="text-xs text-slate-300">
                                        Upload an Excel file to begin.
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="p-5 sm:p-8">

                            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-[#f8fafc] px-5 py-12 text-center transition hover:border-blue-300 hover:bg-blue-50/30">

                                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#102236] shadow-lg">

                                    <Upload
                                        size={28}
                                        className="text-white"
                                    />

                                </div>


                                <h2 className="text-lg font-bold text-[#102236]">
                                    Upload Lead Excel File
                                </h2>


                                <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                    Upload your Excel file containing the leads you want to add and assign.
                                </p>


                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        processingFile
                                    }
                                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#102236] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#19334d] disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {processingFile ? (

                                        <>

                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Reading Excel...

                                        </>

                                    ) : (

                                        <>

                                            <Upload
                                                size={17}
                                            />

                                            Choose Excel File

                                        </>

                                    )}

                                </button>


                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={
                                        handleFileChange
                                    }
                                    className="hidden"
                                />


                                <div className="mx-auto mt-7 flex max-w-4xl flex-wrap justify-center gap-2">

                                    {[
                                        "Name",
                                        "Email",
                                        "Contact",
                                        "Gender",
                                        "State",
                                        "District",
                                        "College",
                                        "Department",
                                        "UG Year",
                                        "Lead Source",
                                        "Lead Type",
                                        "Program",
                                    ].map(
                                        (
                                            field
                                        ) => (

                                            <span
                                                key={
                                                    field
                                                }
                                                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 shadow-sm"
                                            >
                                                {
                                                    field
                                                }
                                            </span>

                                        )
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>

                )}


                {/* =====================================================
                    UPLOADED CONTENT
                ====================================================== */}

                {uploaded && (

                    <>

                        {/* =================================================
                            STAT CARDS
                        ================================================== */}

                        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Total Leads
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#102236]">
                                    {rows.length}
                                </p>

                            </div>


                            <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-sm">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
                                    Selected
                                </p>

                                <p className="mt-2 text-2xl font-bold text-blue-700">
                                    {selectedIds.length}
                                </p>

                            </div>


                            <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                    Valid Leads
                                </p>

                                <p className="mt-2 text-2xl font-bold text-emerald-700">
                                    {validRows.length}
                                </p>

                            </div>


                            <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">

                                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                                    Remaining
                                </p>

                                <p className="mt-2 text-2xl font-bold text-amber-700">
                                    {Math.max(
                                        0,
                                        rows.length -
                                            selectedIds.length
                                    )}
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            MAIN CARD
                        ================================================== */}

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                            {/* =================================================
                                CARD HEADER
                            ================================================== */}

                            <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

                                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                                    <div className="min-w-0">

                                        <div className="flex items-center gap-2">

                                            <FileSpreadsheet
                                                size={18}
                                                className="shrink-0 text-[#102236]"
                                            />

                                            <h2 className="truncate text-base font-bold text-[#102236]">
                                                {fileName}
                                            </h2>

                                        </div>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Select leads and assign them to a manager or executive.
                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={
                                            clearFile
                                        }
                                        disabled={
                                            assigning
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    >

                                        <XCircle
                                            size={15}
                                        />

                                        Remove File

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                FILTER / ACTION BAR
                            ================================================== */}

                            <div className="border-b border-slate-200 bg-[#f8fafc] px-5 py-4 sm:px-6">


                                {/* Search */}

                                <div className="mb-4">

                                    <div className="relative w-full max-w-xl">

                                        <Search
                                            size={17}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            type="text"
                                            value={
                                                search
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSearch(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Search name, email, contact or college..."
                                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#102236] focus:ring-2 focus:ring-[#102236]/10"
                                        />

                                    </div>

                                </div>


                                {/* =================================================
                                    CONTROLS
                                ================================================== */}

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[150px_190px_minmax(220px,1fr)_minmax(220px,1fr)_auto_auto]">


                                    {/* Selected */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Selected Leads
                                        </label>

                                        <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[#102236] shadow-sm">
                                            {selectedIds.length} selected
                                        </div>

                                    </div>


                                    {/* =================================================
                                        CUSTOM COUNT SELECTION
                                    ================================================== */}

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Select Leads
                                        </label>

                                        <div className="flex h-[42px] gap-2">

                                            <input
                                                type="number"
                                                min="0"
                                                max={selectableFilteredRows.length}
                                                value={selectCount}
                                                onChange={(event) => {
                                                    const value =
                                                        event.target.value;

                                                    setSelectCount(
                                                        value
                                                    );

                                                    if (
                                                        value === ""
                                                    ) {
                                                        setSelectedIds([]);
                                                        return;
                                                    }

                                                    const numericValue =
                                                        Number(value);

                                                    if (
                                                        Number.isFinite(
                                                            numericValue
                                                        ) &&
                                                        numericValue >= 0
                                                    ) {
                                                        selectFirstN(
                                                            numericValue
                                                        );
                                                    }
                                                }}
                                                onKeyDown={(event) => {
                                                    if (
                                                        event.key ===
                                                        "Enter"
                                                    ) {
                                                        selectFirstN();
                                                    }
                                                }}
                                                placeholder="50"
                                                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[#102236] shadow-sm outline-none focus:border-[#102236] focus:ring-2 focus:ring-[#102236]/10"
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectFirstN()
                                                }
                                                disabled={
                                                    assigning ||
                                                    selectableFilteredRows.length ===
                                                        0 ||
                                                    !selectCount
                                                }
                                                className="shrink-0 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Select
                                            </button>

                                        </div>

                                    </div>


                                    {/* =================================================
                                        MANAGER DROPDOWN
                                    ================================================== */}

                                    <div className="relative">

                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Assign To Manager
                                        </label>


                                        <button
                                            type="button"
                                            onClick={() => {

                                                setShowManagerDropdown(
                                                    (
                                                        previous
                                                    ) =>
                                                        !previous
                                                );

                                                setShowExecutiveDropdown(
                                                    false
                                                );
                                            }}
                                            disabled={
                                                loadingManagers ||
                                                assigning
                                            }
                                            className="flex h-[42px] w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            <span className="truncate">

                                                {selectedManager

                                                    ? getManagerName(
                                                          selectedManager
                                                      )

                                                    : loadingManagers

                                                    ? "Loading managers..."

                                                    : "Select Manager (Optional)"}

                                            </span>


                                            <ChevronDown
                                                size={17}
                                                className={`shrink-0 transition ${
                                                    showManagerDropdown
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />

                                        </button>


                                        {showManagerDropdown &&
                                            !loadingManagers && (

                                                <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                                                    {managers.length ===
                                                    0 ? (

                                                        <div className="px-3 py-5 text-center text-sm text-slate-500">
                                                            No other active managers found.
                                                        </div>

                                                    ) : (

                                                        managers.map(
                                                            (
                                                                manager
                                                            ) => {

                                                                const id =
                                                                    getManagerId(
                                                                        manager
                                                                    );

                                                                const selected =
                                                                    String(
                                                                        id
                                                                    ) ===
                                                                    String(
                                                                        selectedManagerId
                                                                    );


                                                                return (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            id
                                                                        }
                                                                        onClick={() => {

                                                                            setSelectedManagerId(
                                                                                id
                                                                            );

                                                                            /*
                                                                             * Manager and executive
                                                                             * assignment are mutually
                                                                             * exclusive.
                                                                             */

                                                                            setSelectedExecutiveId(
                                                                                ""
                                                                            );

                                                                            setShowManagerDropdown(
                                                                                false
                                                                            );

                                                                            setShowExecutiveDropdown(
                                                                                false
                                                                            );
                                                                        }}
                                                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                                            selected
                                                                                ? "bg-[#102236] text-white"
                                                                                : "text-slate-700 hover:bg-slate-50"
                                                                        }`}
                                                                    >

                                                                        <span className="truncate">
                                                                            {getManagerName(
                                                                                manager
                                                                            )}
                                                                        </span>


                                                                        {selected && (

                                                                            <CheckCircle
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />

                                                                        )}

                                                                    </button>

                                                                );
                                                            }
                                                        )

                                                    )}

                                                </div>

                                            )}

                                    </div>


                                    {/* =================================================
                                        EXECUTIVE DROPDOWN
                                    ================================================== */}

                                    <div className="relative">

                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Assign To Executive
                                        </label>


                                        <button
                                            type="button"
                                            onClick={() => {

                                                setShowExecutiveDropdown(
                                                    (
                                                        previous
                                                    ) =>
                                                        !previous
                                                );

                                                setShowManagerDropdown(
                                                    false
                                                );
                                            }}
                                            disabled={
                                                loadingExecutives ||
                                                assigning
                                            }
                                            className="flex h-[42px] w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm font-semibold text-slate-700 shadow-sm outline-none transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            <span className="truncate">

                                                {selectedExecutive

                                                    ? getExecutiveName(
                                                          selectedExecutive
                                                      )

                                                    : loadingExecutives

                                                    ? "Loading executives..."

                                                    : "Select Executive (Optional)"}

                                            </span>


                                            <ChevronDown
                                                size={17}
                                                className={`shrink-0 transition ${
                                                    showExecutiveDropdown
                                                        ? "rotate-180"
                                                        : ""
                                                }`}
                                            />

                                        </button>


                                        {showExecutiveDropdown &&
                                            !loadingExecutives && (

                                                <div className="absolute left-0 right-0 z-50 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">

                                                    {executives.length ===
                                                    0 ? (

                                                        <div className="px-3 py-5 text-center text-sm text-slate-500">
                                                            No executives found.
                                                        </div>

                                                    ) : (

                                                        executives.map(
                                                            (
                                                                executive
                                                            ) => {

                                                                const id =
                                                                    getExecutiveId(
                                                                        executive
                                                                    );

                                                                const selected =
                                                                    String(
                                                                        id
                                                                    ) ===
                                                                    String(
                                                                        selectedExecutiveId
                                                                    );


                                                                return (

                                                                    <button
                                                                        type="button"
                                                                        key={
                                                                            id
                                                                        }
                                                                        onClick={() => {

                                                                            setSelectedExecutiveId(
                                                                                id
                                                                            );

                                                                            /*
                                                                             * Manager and executive
                                                                             * assignment are mutually
                                                                             * exclusive.
                                                                             */

                                                                            setSelectedManagerId(
                                                                                ""
                                                                            );

                                                                            setShowExecutiveDropdown(
                                                                                false
                                                                            );

                                                                            setShowManagerDropdown(
                                                                                false
                                                                            );
                                                                        }}
                                                                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                                                                            selected
                                                                                ? "bg-[#102236] text-white"
                                                                                : "text-slate-700 hover:bg-slate-50"
                                                                        }`}
                                                                    >

                                                                        <span className="truncate">
                                                                            {getExecutiveName(
                                                                                executive
                                                                            )}
                                                                        </span>


                                                                        {selected && (

                                                                            <CheckCircle
                                                                                size={
                                                                                    16
                                                                                }
                                                                            />

                                                                        )}

                                                                    </button>

                                                                );
                                                            }
                                                        )

                                                    )}

                                                </div>

                                            )}

                                    </div>


                                    {/* =================================================
                                        UPLOAD
                                    ================================================== */}

                                    <button
                                        type="button"
                                        onClick={
                                            handleUploadSelected
                                        }
                                        disabled={
                                            assigning ||
                                            selectedIds.length ===
                                                0 ||
                                            !selectedOwnerId
                                        }
                                        className="mt-auto inline-flex h-[42px] items-center justify-center gap-2 rounded-lg bg-[#102236] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#19334d] disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {assigning ? (

                                            <>

                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />

                                                Uploading...

                                            </>

                                        ) : (

                                            <>

                                                <Upload
                                                    size={16}
                                                />

                                                Upload Selected

                                            </>

                                        )}

                                    </button>


                                    {/* =================================================
                                        CLEAR
                                    ================================================== */}

                                    {selectedIds.length >
                                    0 ? (

                                        <button
                                            type="button"
                                            onClick={
                                                clearSelection
                                            }
                                            disabled={
                                                assigning
                                            }
                                            className="mt-auto inline-flex h-[42px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                        >
                                            Clear Selection
                                        </button>

                                    ) : (

                                        <div />

                                    )}

                                </div>

                            </div>


                            {/* =================================================
                                TABLE
                            ================================================== */}

                            <div className="overflow-x-auto">

                                {rows.length ===
                                0 ? (

                                    <div className="p-14 text-center">

                                        <FileSpreadsheet
                                            size={34}
                                            className="mx-auto text-slate-300"
                                        />

                                        <p className="mt-3 text-sm font-bold text-slate-700">
                                            No leads loaded
                                        </p>

                                    </div>

                                ) : filteredRows.length ===
                                  0 ? (

                                    <div className="p-14 text-center text-sm text-slate-500">
                                        No leads match your search.
                                    </div>

                                ) : (

                                    <table className="min-w-[1250px] w-full">

                                        <thead className="bg-[#102236]">

                                            <tr>

                                                <th className="w-12 px-4 py-3 text-center">

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            allFilteredSelected
                                                        }
                                                        onChange={
                                                            toggleSelectAll
                                                        }
                                                        className="h-4 w-4 rounded border-white/30"
                                                    />

                                                </th>


                                                {[
                                                    "#",
                                                    "Name",
                                                    "Email",
                                                    "Contact",
                                                    "College",
                                                    "Program",
                                                    "Type",
                                                    "Source",
                                                    "Status",
                                                ].map(
                                                    (
                                                        heading
                                                    ) => (

                                                        <th
                                                            key={
                                                                heading
                                                            }
                                                            className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-300"
                                                        >
                                                            {
                                                                heading
                                                            }
                                                        </th>

                                                    )
                                                )}

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {paginatedRows.map(
                                                (
                                                    row
                                                ) => {

                                                    const id =
                                                        row._tempId;

                                                    const selected =
                                                        selectedIds.some(
                                                            (
                                                                selectedId
                                                            ) =>
                                                                String(
                                                                    selectedId
                                                                ) ===
                                                                String(
                                                                    id
                                                                )
                                                        );

                                                    const invalid =
                                                        Boolean(
                                                            row._validationError
                                                        );


                                                    return (

                                                        <tr
                                                            key={
                                                                id
                                                            }
                                                            className={`border-b border-slate-100 transition ${
                                                                invalid
                                                                    ? "bg-red-50/50"
                                                                    : selected
                                                                    ? "bg-blue-50/70"
                                                                    : "bg-white hover:bg-slate-50"
                                                            }`}
                                                        >

                                                            <td className="px-4 py-3 text-center">

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        selected
                                                                    }
                                                                    disabled={
                                                                        invalid
                                                                    }
                                                                    onChange={() =>
                                                                        toggleRow(
                                                                            id
                                                                        )
                                                                    }
                                                                    className="h-4 w-4 rounded border-slate-300 text-[#102236] focus:ring-[#102236]"
                                                                />

                                                            </td>


                                                            <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                                                                {
                                                                    row._rowNumber
                                                                }
                                                            </td>


                                                            <td className="px-4 py-3">

                                                                <div className="max-w-[200px] truncate text-sm font-bold text-[#102236]">
                                                                    {row.name ||
                                                                        "-"}
                                                                </div>


                                                                {invalid && (

                                                                    <div className="mt-1 max-w-[220px] text-[11px] font-medium leading-4 text-red-600">
                                                                        {
                                                                            row._validationError
                                                                        }
                                                                    </div>

                                                                )}

                                                            </td>


                                                            <td className="px-4 py-3">

                                                                <div className="max-w-[230px] truncate text-xs text-slate-600">
                                                                    {row.email ||
                                                                        "-"}
                                                                </div>

                                                            </td>


                                                            <td className="px-4 py-3 text-xs text-slate-600">
                                                                {row.contact ||
                                                                    "-"}
                                                            </td>


                                                            <td className="px-4 py-3">

                                                                <div className="max-w-[220px] truncate text-xs text-slate-600">
                                                                    {row.collegeName ||
                                                                        "-"}
                                                                </div>

                                                            </td>


                                                            <td className="px-4 py-3">

                                                                <div className="max-w-[170px] truncate text-xs font-medium text-slate-600">
                                                                    {row.programInterest ||
                                                                        "-"}
                                                                </div>

                                                            </td>


                                                            <td className="px-4 py-3">

                                                                <span
                                                                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                                                        String(
                                                                            row.leadType ||
                                                                                ""
                                                                        ).toUpperCase() ===
                                                                        "IT"
                                                                            ? "bg-blue-50 text-blue-700"
                                                                            : "bg-purple-50 text-purple-700"
                                                                    }`}
                                                                >
                                                                    {row.leadType ||
                                                                        "-"}
                                                                </span>

                                                            </td>


                                                            <td className="px-4 py-3">

                                                                <div className="max-w-[150px] truncate text-xs text-slate-600">
                                                                    {row.leadSource ||
                                                                        "-"}
                                                                </div>

                                                            </td>


                                                            <td className="px-4 py-3">

                                                                {invalid ? (

                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">

                                                                        <XCircle
                                                                            size={
                                                                                13
                                                                            }
                                                                        />

                                                                        Invalid

                                                                    </span>

                                                                ) : (

                                                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">

                                                                        <CheckCircle
                                                                            size={
                                                                                13
                                                                            }
                                                                        />

                                                                        Ready

                                                                    </span>

                                                                )}

                                                            </td>

                                                        </tr>

                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                )}

                            </div>


                            {/* =================================================
                                PAGINATION
                                UI ONLY — ALL ROWS ARE ALREADY IN MEMORY
                            ================================================== */}

                            {filteredRows.length > 0 && (

                                <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                                    <p className="text-xs font-medium text-slate-500">
                                        Showing{" "}
                                        <span className="font-bold text-[#102236]">
                                            {(page - 1) *
                                                ITEMS_PER_PAGE +
                                                1}
                                        </span>
                                        {" – "}
                                        <span className="font-bold text-[#102236]">
                                            {Math.min(
                                                page *
                                                    ITEMS_PER_PAGE,
                                                filteredRows.length
                                            )}
                                        </span>
                                        {" of "}
                                        <span className="font-bold text-[#102236]">
                                            {filteredRows.length}
                                        </span>{" "}
                                        leads
                                    </p>

                                    <div className="flex items-center gap-1.5 overflow-x-auto">

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    (currentPage) =>
                                                        Math.max(
                                                            1,
                                                            currentPage - 1
                                                        )
                                                )
                                            }
                                            disabled={page === 1}
                                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[#FECA42] hover:bg-[#FECA42]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            ‹ Previous
                                        </button>

                                        {Array.from(
                                            {
                                                length:
                                                    totalPages,
                                            },
                                            (_, index) =>
                                                index + 1
                                        )
                                            .slice(
                                                Math.max(
                                                    0,
                                                    page - 3
                                                ),
                                                Math.max(
                                                    0,
                                                    page - 3
                                                ) + 5
                                            )
                                            .map(
                                                (pageNumber) => (
                                                    <button
                                                        key={
                                                            pageNumber
                                                        }
                                                        type="button"
                                                        onClick={() =>
                                                            setPage(
                                                                pageNumber
                                                            )
                                                        }
                                                        className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-xs font-bold transition ${
                                                            pageNumber ===
                                                            page
                                                                ? "bg-[#102236] text-white shadow-sm"
                                                                : "border border-slate-200 bg-white text-slate-700 hover:border-[#FECA42] hover:bg-[#FECA42]/10"
                                                        }`}
                                                    >
                                                        {
                                                            pageNumber
                                                        }
                                                    </button>
                                                )
                                            )}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPage(
                                                    (currentPage) =>
                                                        Math.min(
                                                            totalPages,
                                                            currentPage + 1
                                                        )
                                                )
                                            }
                                            disabled={
                                                page ===
                                                totalPages
                                            }
                                            className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-[#FECA42] hover:bg-[#FECA42]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next ›
                                        </button>

                                    </div>

                                </div>
                            )}


                            {/* =================================================
                                TABLE FOOTER
                            ================================================== */}

                            {rows.length >
                                0 && (

                                <div className="border-t border-slate-200 bg-[#f8fafc] px-5 py-3.5 sm:px-6">

                                    <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                                        <p>

                                            Showing{" "}

                                            <span className="font-bold text-[#102236]">
                                                {(page - 1) *
                                                    ITEMS_PER_PAGE +
                                                    1}
                                            </span>

                                            {" – "}

                                            <span className="font-bold text-[#102236]">
                                                {Math.min(
                                                    page *
                                                        ITEMS_PER_PAGE,
                                                    filteredRows.length
                                                )}
                                            </span>

                                            {" "}of{" "}

                                            <span className="font-bold text-[#102236]">
                                                {
                                                    filteredRows.length
                                                }
                                            </span>

                                            {" "}leads

                                        </p>


                                        <p>

                                            <span className="font-bold text-blue-600">
                                                {
                                                    selectedIds.length
                                                }
                                            </span>

                                            {" "}selected

                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>


                        {/* =================================================
                            FAILED LEADS
                        ================================================== */}

                        {failedRows.length >
                            0 && (

                            <div className="mt-5 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">

                                <div className="flex items-center gap-3 border-b border-red-100 bg-red-50 px-5 py-4">

                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">

                                        <XCircle
                                            size={18}
                                            className="text-red-600"
                                        />

                                    </div>


                                    <div>

                                        <h3 className="text-sm font-bold text-red-800">
                                            Failed Leads
                                        </h3>

                                        <p className="mt-0.5 text-xs text-red-600">
                                            These leads were not uploaded.
                                        </p>

                                    </div>


                                    <span className="ml-auto rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-bold text-red-700">
                                        {
                                            failedRows.length
                                        }
                                    </span>

                                </div>


                                <div className="overflow-x-auto">

                                    <table className="min-w-[700px] w-full">

                                        <thead className="bg-red-50/50">

                                            <tr>

                                                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-red-700">
                                                    Row
                                                </th>

                                                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-red-700">
                                                    Name
                                                </th>

                                                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-red-700">
                                                    Email
                                                </th>

                                                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-red-700">
                                                    Reason
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {failedRows.map(
                                                (
                                                    item,
                                                    index
                                                ) => {

                                                    const failedRow =
                                                        item?.row &&
                                                        typeof item.row ===
                                                            "object"
                                                            ? item.row
                                                            : {};


                                                    return (

                                                        <tr
                                                            key={
                                                                index
                                                            }
                                                            className="border-b border-red-100 last:border-0"
                                                        >

                                                            <td className="px-4 py-3 text-xs font-semibold text-red-700">
                                                                {
                                                                    item?.rowNumber ??
                                                                    index +
                                                                        1
                                                                }
                                                            </td>


                                                            <td className="px-4 py-3 text-xs font-semibold text-red-800">
                                                                {
                                                                    item?.name ||
                                                                    failedRow?.name ||
                                                                    "-"
                                                                }
                                                            </td>


                                                            <td className="px-4 py-3 text-xs text-red-800">
                                                                {
                                                                    item?.email ||
                                                                    failedRow?.email ||
                                                                    "-"
                                                                }
                                                            </td>


                                                            <td className="px-4 py-3 text-xs text-red-700">
                                                                {
                                                                    item?.reason ||
                                                                    item?.message ||
                                                                    "Failed"
                                                                }
                                                            </td>

                                                        </tr>

                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        )}

                    </>

                )}

            </div>

        </div>
    );
}


export default ManagerBulkUpload;