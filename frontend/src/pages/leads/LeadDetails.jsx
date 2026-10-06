import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LeadInformation from "../../components/leads/LeadInformation";
import LeadManagement from "../../components/leads/LeadManagement";
import DetailField from "../../components/leads/DetailField";

import {
    LEAD_STATUSES,
    REMARK_OPTIONS,
    LATEST_REMARK_OPTIONS,
} from "../../constants/leadOptions";

const API_BASE =
  import.meta.env.VITE_API_URL + "/api";

const LeadDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // =========================================================
    // LEAD STATE
    // =========================================================

    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================================================
    // UPDATE STATE
    // =========================================================

    const [updatingField, setUpdatingField] = useState("");
    const [updateError, setUpdateError] = useState("");
    const [updateSuccess, setUpdateSuccess] = useState("");

    // =========================================================
    // REMARK STATE
    // =========================================================

    const [pendingRemarks, setPendingRemarks] = useState("");
    const [pendingLatestRemark, setPendingLatestRemark] =
        useState("");
    const [savingRemarks, setSavingRemarks] = useState(false);

    // =========================================================
    // FOLLOW-UP STATE
    // =========================================================

    const [nextUpdateDate, setNextUpdateDate] = useState("");
    const [nextUpdateTime, setNextUpdateTime] = useState("");
    const [savingFollowUp, setSavingFollowUp] = useState(false);
    const [completingFollowUp, setCompletingFollowUp] =
        useState(false);

    // =========================================================
    // NOTES STATE
    // =========================================================

    const [notes, setNotes] = useState([]);
    const [noteText, setNoteText] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [addingNote, setAddingNote] = useState(false);
    const [noteError, setNoteError] = useState("");

    // =========================================================
    // HISTORY STATE
    // =========================================================

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");
    const [expandedHistoryGroups, setExpandedHistoryGroups] = useState({});

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        if (!id) {
            setError("Lead ID is missing.");
            setLoading(false);
            return;
        }

        fetchLead();
        fetchNotes();
        fetchHistory();
    }, [id]);

    // =========================================================
    // RESPONSE PARSER
    // =========================================================

    const parseResponse = async (response) => {
        const text = await response.text();

        if (!text) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error(
                text || `Request failed with status ${response.status}`
            );
        }
    };

    // =========================================================
    // AUTH
    // =========================================================

    const getToken = () => {
        return (
            localStorage.getItem("accessToken") ||
            localStorage.getItem("token")
        );
    };

    const handleUnauthorized = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userType");
        localStorage.removeItem("institutionId");

        navigate("/login");
    };

    // =========================================================
    // FETCH LEAD
    // =========================================================

    const fetchLead = async () => {
        try {
            setLoading(true);
            setError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/leads/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const data = await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch lead."
                );
            }

            const loadedLead = data.lead || data;

            setLead(loadedLead);

            setPendingRemarks(
                loadedLead.remarks || ""
            );

            setPendingLatestRemark(
                loadedLead.latestRemark || ""
            );
        } catch (err) {
            console.error("Fetch lead error:", err);

            setError(
                err.message ||
                    "Something went wrong while loading the lead."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
// FETCH NOTES
// =========================================================

const fetchNotes = async () => {
    try {
        setNotesLoading(true);
        setNoteError("");

        const token = getToken();

        if (!token) {
            navigate("/login");
            return;
        }

        const response = await fetch(
            `${API_BASE}/lead-notes/${id}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = await parseResponse(response);

        if (response.status === 401) {
            handleUnauthorized();
            return;
        }

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to fetch notes."
            );
        }

        const fetchedNotes = Array.isArray(data.notes)
            ? data.notes
            : [];

        // Keep all notes in state.
        // The Notes section will display only the latest one,
        // while History can continue showing all activities.
        setNotes(fetchedNotes);

    } catch (err) {
        console.error("Fetch notes error:", err);

        setNoteError(
            err.message || "Failed to load notes."
        );
    } finally {
        setNotesLoading(false);
    }
};
    // =========================================================
    // ADD NOTE
    // =========================================================

    const handleAddNote = async () => {
        if (!noteText.trim()) {
            setNoteError("Please enter a note.");
            return;
        }

        try {
            setAddingNote(true);
            setNoteError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/lead-notes/${id}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        note: noteText.trim(),
                    }),
                }
            );

            const data = await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add note."
                );
            }

            if (data.note) {
                setNotes((previousNotes) => [
                    data.note,
                    ...previousNotes,
                ]);
            }

            setNoteText("");

            await fetchHistory();
        } catch (err) {
            console.error("Add note error:", err);

            setNoteError(
                err.message || "Failed to add note."
            );
        } finally {
            setAddingNote(false);
        }
    };

    // =========================================================
    // UPDATE LEAD FIELD
    // =========================================================

    const handleLeadFieldUpdate = async (
        field,
        value
    ) => {
        if (!lead) {
            return;
        }

        const currentValue = lead[field] ?? null;

        if (currentValue === value) {
            return;
        }

        try {
            setUpdatingField(field);
            setUpdateError("");
            setUpdateSuccess("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/leads/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        [field]: value,
                    }),
                }
            );

            const data = await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        `Failed to update ${field}.`
                );
            }

            setLead(
                data.lead || {
                    ...lead,
                    [field]: value,
                }
            );

            setUpdateSuccess(
                field === "status"
                    ? "Lead status updated."
                    : field === "remarks"
                    ? "Remark updated."
                    : "Latest remark updated."
            );

            await fetchHistory();

            setTimeout(() => {
                setUpdateSuccess("");
            }, 2500);
        } catch (err) {
            console.error(
                `Update ${field} error:`,
                err
            );

            setUpdateError(
                err.message ||
                    `Failed to update ${field}.`
            );
        } finally {
            setUpdatingField("");
        }
    };

    // =========================================================
    // SAVE REMARKS
    // =========================================================

    const handleSaveRemarks = async () => {
        if (!lead) {
            return;
        }

        const currentRemarks =
            lead.remarks || "";

        const currentLatestRemark =
            lead.latestRemark || "";

        const remarksChanged =
            pendingRemarks !== currentRemarks;

        const latestRemarkChanged =
            pendingLatestRemark !==
            currentLatestRemark;

        if (
            !remarksChanged &&
            !latestRemarkChanged
        ) {
            return;
        }

        try {
            setSavingRemarks(true);
            setUpdateError("");
            setUpdateSuccess("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const requestBody = {};

            if (remarksChanged) {
                requestBody.remarks =
                    pendingRemarks || null;
            }

            if (latestRemarkChanged) {
                requestBody.latestRemark =
                    pendingLatestRemark || null;
            }

            const response = await fetch(
                `${API_BASE}/leads/${id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify(
                        requestBody
                    ),
                }
            );

            const data =
                await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save remarks."
                );
            }

            const updatedLead =
                data.lead || {
                    ...lead,
                    ...(remarksChanged && {
                        remarks:
                            pendingRemarks || null,
                    }),
                    ...(latestRemarkChanged && {
                        latestRemark:
                            pendingLatestRemark ||
                            null,
                    }),
                };

            setLead(updatedLead);

            setPendingRemarks(
                updatedLead.remarks || ""
            );

            setPendingLatestRemark(
                updatedLead.latestRemark || ""
            );

            setUpdateSuccess(
                "Remarks updated successfully."
            );

            await fetchHistory();

            setTimeout(() => {
                setUpdateSuccess("");
            }, 2500);
        } catch (err) {
            console.error(
                "Save remarks error:",
                err
            );

            setUpdateError(
                err.message ||
                    "Failed to save remarks."
            );
        } finally {
            setSavingRemarks(false);
        }
    };

    // =========================================================
    // SAVE NEXT FOLLOW-UP
    // =========================================================

    const handleSaveFollowUp = async () => {
        // Prevent duplicate requests when Save is clicked twice quickly.
        if (savingFollowUp) {
            return;
        }

        if (!nextUpdateDate) {
            setUpdateError(
                "Please select a follow-up date."
            );
            return;
        }

        if (!nextUpdateTime) {
            setUpdateError(
                "Please select a follow-up time."
            );
            return;
        }

        try {
            setSavingFollowUp(true);
            setUpdateError("");
            setUpdateSuccess("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const localDateTime = new Date(
                `${nextUpdateDate}T${nextUpdateTime}`
            );

            if (
                Number.isNaN(
                    localDateTime.getTime()
                )
            ) {
                throw new Error(
                    "Invalid follow-up date or time."
                );
            }

            const followUpAt =
                localDateTime.toISOString();

            const response = await fetch(
                `${API_BASE}/leads/${id}/follow-up`,
                {
                    method: "PUT",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        followUpAt,
                    }),
                }
            );

            const data =
                await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to save follow-up."
                );
            }

            const updatedLead = {
                ...lead,
                ...(data.lead || {}),
                // Always keep the newly saved follow-up date.
                followUpAt,
            };

            setLead(updatedLead);

            setUpdateSuccess(
                "Next follow-up scheduled successfully."
            );

            setNextUpdateDate("");
            setNextUpdateTime("");

            await fetchHistory();

            setTimeout(() => {
                setUpdateSuccess("");
            }, 2500);
        } catch (err) {
            console.error(
                "Save follow-up error:",
                err
            );

            setUpdateError(
                err.message ||
                    "Failed to save follow-up."
            );
        } finally {
            setSavingFollowUp(false);
        }
    };

    // =========================================================
    // COMPLETE FOLLOW-UP
    // =========================================================

    const handleCompleteFollowUp = async () => {
        if (!lead?.followUpAt) {
            return;
        }

        try {
            setCompletingFollowUp(true);
            setUpdateError("");
            setUpdateSuccess("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/leads/${id}/complete-follow-up`,
                {
                    method: "PUT",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data =
                await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to complete follow-up."
                );
            }

            setLead(
                data.lead || {
                    ...lead,
                    followUpCompleted: true,
                    followUpCompletedAt:
                        new Date().toISOString(),
                }
            );

            setUpdateSuccess(
                "Follow-up marked as completed."
            );

            await fetchHistory();

            setTimeout(() => {
                setUpdateSuccess("");
            }, 2500);
        } catch (err) {
            console.error(
                "Complete follow-up error:",
                err
            );

            setUpdateError(
                err.message ||
                    "Failed to complete follow-up."
            );
        } finally {
            setCompletingFollowUp(false);
        }
    };

    // =========================================================
    // CLEAR FOLLOW-UP
    // =========================================================

    const handleClearFollowUp = async () => {
        try {
            setSavingFollowUp(true);
            setUpdateError("");
            setUpdateSuccess("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/leads/${id}/follow-up`,
                {
                    method: "PUT",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        followUpAt: null,
                    }),
                }
            );

            const data =
                await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to clear follow-up."
                );
            }

            setLead(
                data.lead || {
                    ...lead,
                    followUpAt: null,
                    followUpCompleted: false,
                    followUpCompletedAt: null,
                    followUpCompletedBy: null,
                    followUpStatus: "NONE",
                }
            );

            setNextUpdateDate("");
            setNextUpdateTime("");

            setUpdateSuccess(
                "Follow-up cleared."
            );

            await fetchHistory();

            setTimeout(() => {
                setUpdateSuccess("");
            }, 2500);
        } catch (err) {
            console.error(
                "Clear follow-up error:",
                err
            );

            setUpdateError(
                err.message ||
                    "Failed to clear follow-up."
            );
        } finally {
            setSavingFollowUp(false);
        }
    };

    // =========================================================
    // INITIALIZE DATE/TIME
    // =========================================================

    useEffect(() => {
        if (!lead?.followUpAt) {
            setNextUpdateDate("");
            setNextUpdateTime("");
            return;
        }

        if (
            nextUpdateDate ||
            nextUpdateTime
        ) {
            return;
        }

        const date = new Date(
            lead.followUpAt
        );

        if (Number.isNaN(date.getTime())) {
            return;
        }

        const year =
            date.getFullYear();

        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        const hours = String(
            date.getHours()
        ).padStart(2, "0");

        const minutes = String(
            date.getMinutes()
        ).padStart(2, "0");

        setNextUpdateDate(
            `${year}-${month}-${day}`
        );

        setNextUpdateTime(
            `${hours}:${minutes}`
        );
    }, [lead?.followUpAt]);

    // =========================================================
    // FOLLOW-UP STATUS
    // =========================================================

    const getFollowUpStatus = () => {
        return (
            lead?.followUpStatus ||
            "NONE"
        );
    };

    const getFollowUpStatusStyle = () => {
        switch (getFollowUpStatus()) {
            case "TODAY":
                return {
                    label: "Today",
                    className:
                        "border-orange-200 bg-orange-50 text-orange-700",
                    dot: "bg-orange-500",
                };

            case "UPCOMING":
                return {
                    label: "Upcoming",
                    className:
                        "border-blue-200 bg-blue-50 text-blue-700",
                    dot: "bg-blue-500",
                };

            case "MISSED":
                return {
                    label: "Missed",
                    className:
                        "border-red-200 bg-red-50 text-red-700",
                    dot: "bg-red-500",
                };

            case "COMPLETED":
                return {
                    label: "Completed",
                    className:
                        "border-green-200 bg-green-50 text-green-700",
                    dot: "bg-green-500",
                };

            default:
                return {
                    label: "No Follow-up",
                    className:
                        "border-slate-200 bg-slate-50 text-slate-500",
                    dot: "bg-slate-400",
                };
        }
    };

    // =========================================================
    // FETCH HISTORY
    // =========================================================

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const token = getToken();

            if (!token) {
                navigate("/login");
                return;
            }

            const response = await fetch(
                `${API_BASE}/lead-history/${id}`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json",
                    },
                }
            );

            const data =
                await parseResponse(response);

            if (response.status === 401) {
                handleUnauthorized();
                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to fetch lead history."
                );
            }

            setHistory(
                Array.isArray(data.history)
                    ? data.history
                    : []
            );
        } catch (err) {
            console.error(
                "Fetch history error:",
                err
            );

            setHistoryError(
                err.message ||
                    "Failed to load lead history."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    // =========================================================
    // FORMAT DATE
    // =========================================================

    const formatDate = (date) => {
        if (!date) {
            return "Not set";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Not set";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const formatHistoryDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =========================================================
    // 7-DAY HISTORY GROUPS
    // =========================================================

    const getHistoryDateOnly = (date) => {
        if (!date) return null;
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return null;
        return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    };

    const formatHistoryGroupDate = (date) => {
        if (!date) return "";
        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getSevenDayHistoryGroups = (items) => {
        if (!Array.isArray(items) || items.length === 0) return [];

        const sortedItems = [...items]
            .filter((item) => getHistoryDateOnly(item.createdAt || item.timestamp))
            .sort((a, b) =>
                new Date(b.createdAt || b.timestamp).getTime() -
                new Date(a.createdAt || a.timestamp).getTime()
            );

        if (sortedItems.length === 0) return [];

        const newestDate = getHistoryDateOnly(
            sortedItems[0].createdAt || sortedItems[0].timestamp
        );
        const groups = [];

        sortedItems.forEach((item) => {
            const itemDate = getHistoryDateOnly(item.createdAt || item.timestamp);
            const differenceInDays = Math.floor(
                (newestDate.getTime() - itemDate.getTime()) /
                    (1000 * 60 * 60 * 24)
            );
            const groupIndex = Math.floor(differenceInDays / 7);

            if (!groups[groupIndex]) {
                const groupEnd = new Date(newestDate);
                groupEnd.setDate(groupEnd.getDate() - groupIndex * 7);
                const groupStart = new Date(groupEnd);
                groupStart.setDate(groupStart.getDate() - 6);

                groups[groupIndex] = {
                    id: `history-${groupIndex}`,
                    startDate: groupStart,
                    endDate: groupEnd,
                    items: [],
                };
            }

            groups[groupIndex].items.push(item);
        });

        return groups.filter(Boolean);
    };

    // =========================================================
    // FORMAT LABEL
    // =========================================================

    const formatLabel = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Not set";
        }

        const labels = {
            NEW: "New",
            COLD: "Cold",
            WARM: "Warm",
            HOT: "Hot",
            RNR: "RNR",
            CALLBACK: "Callback",
            INTERESTED: "Interested",
            NOT_INTERESTED:
                "Not Interested",
            SWITCHED_OFF:
                "Switched Off",
            WRONG_NUMBER:
                "Wrong Number",
            INVALID_LEAD:
                "Invalid Lead",
            WALKING_IN:
                "Walking In",
            ENROLLED:
                "Enrolled",
        };

        return labels[value] || value;
    };

    // =========================================================
    // STATUS STYLE
    // =========================================================

    const getStatusStyle = (status) => {
        switch (status) {
            case "NEW":
                return {
                    badge:
                        "bg-blue-50 text-blue-700 border-blue-200",
                    dot: "bg-blue-500",
                };

            case "COLD":
                return {
                    badge:
                        "bg-slate-50 text-slate-700 border-slate-200",
                    dot: "bg-slate-500",
                };

            case "WARM":
                return {
                    badge:
                        "bg-yellow-50 text-yellow-700 border-yellow-200",
                    dot: "bg-yellow-500",
                };

            case "HOT":
                return {
                    badge:
                        "bg-orange-50 text-orange-700 border-orange-200",
                    dot: "bg-orange-500",
                };

            default:
                return {
                    badge:
                        "bg-gray-50 text-gray-700 border-gray-200",
                    dot: "bg-gray-500",
                };
        }
    };

    // =========================================================
    // REMARK STYLE
    // =========================================================

    const getRemarkStyle = (remark) => {
        switch (remark) {
            case "INTERESTED":
                return "bg-green-50 text-green-700 border-green-200";

            case "NOT_INTERESTED":
                return "bg-red-50 text-red-700 border-red-200";

            case "CALLBACK":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";

            case "RNR":
                return "bg-slate-50 text-slate-700 border-slate-200";

            case "SWITCHED_OFF":
                return "bg-gray-50 text-gray-700 border-gray-200";

            case "WRONG_NUMBER":
                return "bg-red-50 text-red-700 border-red-200";

            case "INVALID_LEAD":
                return "bg-red-50 text-red-700 border-red-200";

            case "WALKING_IN":
                return "bg-purple-50 text-purple-700 border-purple-200";

            case "ENROLLED":
                return "bg-green-50 text-green-700 border-green-200";

            default:
                return "bg-slate-50 text-slate-600 border-slate-200";
        }
    };

    // =========================================================
    // HISTORY HELPERS
    // =========================================================

    const getHistoryTitle = (item) => {
        switch (item.action) {
            case "LEAD_CREATED":
                return "Lead created";

            case "STATUS_CHANGED":
                return "Status changed";

            case "REMARK_CHANGED":
                return "Remark changed";

            case "LATEST_REMARK_CHANGED":
                return "Latest remark changed";

            case "DETAIL_UPDATED":
                return "Lead details updated";

            case "NOTE_ADDED":
                return "Note added";

            case "OWNER_CHANGED":
                return "Lead owner changed";

            case "FOLLOW_UP_CHANGED":
                return "Follow-up changed";

            default:
                return item.action
                    ? item.action
                          .replaceAll("_", " ")
                          .toLowerCase()
                          .replace(
                              /\b\w/g,
                              (char) =>
                                  char.toUpperCase()
                          )
                    : "Lead updated";
        }
    };

    const getFieldLabel = (field) => {
        const labels = {
            name: "Full Name",
            email: "Email",
            contact: "Contact Number",
            gender: "Gender",
            state: "State",
            district: "District",
            collegeName:
                "College / Institution",
            department: "Department",
            ugYearOfPassout:
                "UG Year of Passout",
            pgYearOfPassout:
                "PG Year of Passout",
            leadOwner: "Lead Owner",
            leadSource: "Lead Source",
            leadType: "Lead Type",
            programInterest:
                "Program Interest",
            status: "Status",
            remarks: "Remark",
            latestRemark:
                "Latest Remark",
            followUpAt:
                "Follow-up Date",
            note: "Note",
        };

        return (
            labels[field] ||
            field ||
            "Details"
        );
    };

    const formatHistoryValue = (value) => {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "Not set";
        }

        if (
            typeof value === "object"
        ) {
            if (value.name) {
                return value.name;
            }

            if (value.email) {
                return value.email;
            }

            return JSON.stringify(value);
        }

        return formatLabel(
            String(value)
        );
    };

    const getHistoryIcon = (action) => {
        switch (action) {
            case "LEAD_CREATED":
                return "+";

            case "STATUS_CHANGED":
                return "↻";

            case "REMARK_CHANGED":
                return "◆";

            case "LATEST_REMARK_CHANGED":
                return "★";

            case "NOTE_ADDED":
                return "✎";

            case "OWNER_CHANGED":
                return "♙";

            case "FOLLOW_UP_CHANGED":
                return "◷";

            default:
                return "•";
        }
    };

    const historyGroups = getSevenDayHistoryGroups(history);

    useEffect(() => {
        if (historyGroups.length === 0) return;
        setExpandedHistoryGroups((previous) => {
            if (Object.keys(previous).length > 0) return previous;
            return { [historyGroups[0].id]: true };
        });
    }, [history]);

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC] p-4 sm:p-6">
                <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                    <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#102236]" />

                    <p className="text-sm font-medium text-slate-500">
                        Loading lead details...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] p-4 sm:p-6">
                <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl font-bold text-red-500">
                            !
                        </div>

                        <h2 className="mb-2 text-xl font-bold text-[#102236]">
                            Unable to load lead
                        </h2>

                        <p className="mb-6 text-sm leading-6 text-slate-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="rounded-xl bg-[#102236] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1A344D]"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================
    // LEAD NOT FOUND
    // =========================================================

    if (!lead) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] p-4 sm:p-6">
                <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center">
                    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                        <h2 className="mb-3 text-xl font-bold text-[#102236]">
                            Lead not found
                        </h2>

                        <p className="mb-6 text-sm text-slate-500">
                            The requested lead could not be found.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate(-1)
                            }
                            className="rounded-xl bg-[#102236] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1A344D]"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const statusStyle =
        getStatusStyle(lead.status);

    const followUpStyle =
        getFollowUpStatusStyle();

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            <div className="px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
                <div className="mx-auto max-w-7xl">

                    {/* =================================================
                        BANNER
                    ================================================= */}

                    <section className="relative mb-5 overflow-hidden rounded-2xl bg-[#102236] shadow-[0_12px_35px_rgba(16,34,54,0.14)]">

                        {/* Decorative shapes */}
                        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-[#F6C945]/10" />

                        <div className="pointer-events-none absolute -bottom-20 right-20 h-48 w-48 rounded-full border border-[#F6C945]/10" />

                        <div className="pointer-events-none absolute left-1/2 top-0 h-px w-40 bg-[#F6C945]/30" />

                        <div className="relative z-10 p-4 sm:p-6 lg:p-7">

                            {/* BACK BUTTON */}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate(-1)
                                }
                                className="
                                    mb-5
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    border
                                    border-white/10
                                    bg-white/10
                                    px-3.5
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-white
                                    backdrop-blur-sm
                                    transition-all
                                    duration-200
                                    hover:border-[#F6C945]/40
                                    hover:bg-[#F6C945]
                                    hover:text-[#102236]
                                    active:scale-[0.98]
                                "
                            >
                                <span className="text-lg leading-none">
                                    ←
                                </span>

                                Back to Leads
                            </button>

                            {/* BANNER CONTENT */}

                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                                    {/* Avatar */}

                                    <div className="
                                        flex
                                        h-12
                                        w-12
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#F6C945]
                                        text-lg
                                        font-extrabold
                                        text-[#102236]
                                        shadow-lg
                                        sm:h-16
                                        sm:w-16
                                        sm:text-2xl
                                    ">
                                        {lead.name
                                            ? lead.name
                                                  .charAt(0)
                                                  .toUpperCase()
                                            : "L"}
                                    </div>

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h1 className="max-w-full truncate text-xl font-bold tracking-tight text-white sm:text-2xl lg:text-3xl">
                                                {lead.name ||
                                                    "Lead Details"}
                                            </h1>

                                            <span
                                                className={`
                                                    inline-flex
                                                    shrink-0
                                                    items-center
                                                    gap-1.5
                                                    rounded-full
                                                    border
                                                    px-2.5
                                                    py-1
                                                    text-[10px]
                                                    font-bold
                                                    sm:text-xs
                                                    ${statusStyle.badge}
                                                `}
                                            >
                                                <span
                                                    className={`
                                                        h-1.5
                                                        w-1.5
                                                        rounded-full
                                                        ${statusStyle.dot}
                                                    `}
                                                />

                                                {formatLabel(
                                                    lead.status ||
                                                        "NEW"
                                                )}
                                            </span>

                                        </div>

                                        <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                                            Lead details and activity
                                        </p>

                                    </div>
                                </div>


                            </div>
                        </div>
                    </section>

                    {/* =================================================
                        UPDATE MESSAGE
                    ================================================= */}

                    {(updateSuccess ||
                        updateError) && (
                        <div
                            className={`
                                mb-5
                                rounded-xl
                                border
                                px-4
                                py-3
                                text-sm
                                font-medium
                                ${
                                    updateError
                                        ? "border-red-200 bg-red-50 text-red-600"
                                        : "border-green-200 bg-green-50 text-green-700"
                                }
                            `}
                        >
                            {updateError ||
                                updateSuccess}
                        </div>
                    )}

                    {/* =================================================
                        LEAD INFORMATION + QUICK SUMMARY
                    ================================================= */}

                    <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">

                        {/* LEAD INFORMATION */}

                        <div className="min-w-0">
                            <LeadInformation
                                lead={lead}
                            />
                        </div>

                        {/* QUICK SUMMARY */}

                        <section className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,34,54,0.06)]">

                            <div className="border-b border-slate-100 px-5 py-5">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945]">
                                        ✓
                                    </div>

                                    <div>
                                        <h2 className="text-base font-bold text-[#102236]">
                                            Lead Summary
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            Current lead information
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <div className="space-y-3 p-5">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Status
                                    </p>

                                    <span
                                        className={`
                                            inline-flex
                                            items-center
                                            gap-2
                                            rounded-full
                                            border
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-bold
                                            ${statusStyle.badge}
                                        `}
                                    >
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                                        />

                                        {formatLabel(
                                            lead.status ||
                                                "NEW"
                                        )}
                                    </span>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Latest Remark
                                    </p>

                                    <span
                                        className={`
                                            inline-flex
                                            rounded-full
                                            border
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-bold
                                            ${getRemarkStyle(
                                                lead.latestRemark
                                            )}
                                        `}
                                    >
                                        {formatLabel(
                                            lead.latestRemark
                                        )}
                                    </span>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Lead Owner
                                    </p>

                                    <p className="break-words text-sm font-semibold text-[#102236]">
                                        {lead.leadOwner
                                            ?.name ||
                                            lead.leadOwner
                                                ?.email ||
                                            lead.leadOwner ||
                                            "-"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Last Updated
                                    </p>

                                    <p className="text-sm font-semibold text-[#102236]">
                                        {formatDate(
                                            lead.updatedAt
                                        )}
                                    </p>
                                </div>

                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        EDUCATION + LOCATION
                    ================================================= */}

                    <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

                        {/* EDUCATION */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,34,54,0.06)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945]">
                                        🎓
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-[#102236]">
                                            Education Details
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Academic information of the lead.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">

                                <DetailField
                                    label="College / Institution"
                                    value={
                                        lead.collegeName
                                    }
                                />

                                <DetailField
                                    label="Department"
                                    value={
                                        lead.department
                                    }
                                />

                                <DetailField
                                    label="UG Year of Passout"
                                    value={
                                        lead.ugYearOfPassout
                                    }
                                />

                                <DetailField
                                    label="PG Year of Passout"
                                    value={
                                        lead.pgYearOfPassout
                                    }
                                />

                            </div>
                        </section>

                        {/* LOCATION */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,34,54,0.06)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945]">
                                        📍
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-[#102236]">
                                            Location
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Location information of the lead.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">

                                <DetailField
                                    label="State"
                                    value={
                                        lead.state
                                    }
                                />

                                <DetailField
                                    label="District"
                                    value={
                                        lead.district
                                    }
                                />

                            </div>
                        </section>
                    </div>

                    {/* =================================================
                        FOLLOW-UP
                    ================================================= */}

                    <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,34,54,0.06)]">

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#102236] text-[#F6C945]">
                                        ◷
                                    </div>

                                    <div>
                                        <h2 className="text-lg font-bold text-[#102236]">
                                            Follow-up
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Manage the next action for this lead.
                                        </p>
                                    </div>

                                </div>

                                <span
                                    className={`
                                        inline-flex
                                        w-fit
                                        items-center
                                        gap-2
                                        rounded-full
                                        border
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        ${followUpStyle.className}
                                    `}
                                >
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${followUpStyle.dot}`}
                                    />

                                    {followUpStyle.label}
                                </span>

                            </div>
                        </div>

                        <div className="p-5 sm:p-6">

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Current Follow-up
                                    </p>

                                    <p className="text-sm font-semibold leading-6 text-[#102236]">
                                        {lead.followUpAt
                                            ? formatDate(
                                                  lead.followUpAt
                                              )
                                            : "No follow-up scheduled"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Completed
                                    </p>

                                    <p className="text-sm font-semibold text-[#102236]">
                                        {lead.followUpCompleted
                                            ? "Yes"
                                            : "No"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Completed At
                                    </p>

                                    <p className="text-sm font-semibold leading-6 text-[#102236]">
                                        {lead.followUpCompletedAt
                                            ? formatDate(
                                                  lead.followUpCompletedAt
                                              )
                                            : "Not completed"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                        Completed By
                                    </p>

                                    <p className="break-words text-sm font-semibold text-[#102236]">
                                        {lead.followUpCompletedBy
                                            ?.name ||
                                            lead.followUpCompletedBy
                                                ?.email ||
                                            "—"}
                                    </p>
                                </div>

                            </div>

                            {lead.followUpAt &&
                                lead.followUpCompleted !==
                                    true &&
                                lead.latestRemark !==
                                    "ENROLLED" &&
                                lead.latestRemark !==
                                    "NOT_INTERESTED" && (
                                    <div className="mt-5 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={
                                                handleCompleteFollowUp
                                            }
                                            disabled={
                                                completingFollowUp
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-green-200
                                                bg-green-50
                                                px-5
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-green-700
                                                transition
                                                hover:bg-green-100
                                                sm:w-auto
                                                disabled:cursor-not-allowed
                                                disabled:opacity-60
                                            "
                                        >
                                            {completingFollowUp
                                                ? "Completing..."
                                                : "✓ Mark Follow-up Completed"}
                                        </button>
                                    </div>
                                )}
                        </div>

                        {/* NEXT FOLLOW-UP */}

                        <div className="border-t border-slate-100 p-5 sm:p-6">

                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-[#102236]">
                                    Set Next Update
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                    Choose when the next action should be performed.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Next Update Date
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            nextUpdateDate
                                        }
                                        onChange={(e) => {
                                            setNextUpdateDate(
                                                e.target.value
                                            );
                                            setUpdateError(
                                                ""
                                            );
                                        }}
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split(
                                                    "T"
                                                )[0]
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            font-medium
                                            text-slate-800
                                            outline-none
                                            transition
                                            focus:border-[#F6C945]
                                            focus:ring-4
                                            focus:ring-[#F6C945]/20
                                        "
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                                        Next Update Time
                                    </label>

                                    <input
                                        type="time"
                                        value={
                                            nextUpdateTime
                                        }
                                        onChange={(e) => {
                                            setNextUpdateTime(
                                                e.target.value
                                            );
                                            setUpdateError(
                                                ""
                                            );
                                        }}
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            font-medium
                                            text-slate-800
                                            outline-none
                                            transition
                                            focus:border-[#F6C945]
                                            focus:ring-4
                                            focus:ring-[#F6C945]/20
                                        "
                                    />
                                </div>

                                <div className="flex items-end">
                                    <button
                                        type="button"
                                        onClick={
                                            handleSaveFollowUp
                                        }
                                        disabled={
                                            savingFollowUp ||
                                            !nextUpdateDate ||
                                            !nextUpdateTime
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            bg-[#102236]
                                            px-5
                                            py-3
                                            text-sm
                                            font-semibold
                                            text-white
                                            shadow-sm
                                            transition
                                            hover:bg-[#1A344D]
                                            disabled:cursor-not-allowed
                                            disabled:bg-slate-300
                                        "
                                    >
                                        {savingFollowUp
                                            ? "Saving..."
                                            : "Save Next Update"}
                                    </button>
                                </div>

                            </div>
                            {lead.followUpAt && (
                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={handleClearFollowUp}
                                        disabled={savingFollowUp}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:text-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        {savingFollowUp ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                                                Clearing...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-base leading-none">×</span>
                                                Clear Current Follow-up
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* =================================================
                        LEAD MANAGEMENT
                    ================================================= */}

                    <LeadManagement
                        lead={lead}
                        updatingField={
                            updatingField
                        }
                        savingRemarks={
                            savingRemarks
                        }
                        pendingRemarks={
                            pendingRemarks
                        }
                        pendingLatestRemark={
                            pendingLatestRemark
                        }
                        setPendingRemarks={
                            setPendingRemarks
                        }
                        setPendingLatestRemark={
                            setPendingLatestRemark
                        }
                        handleLeadFieldUpdate={
                            handleLeadFieldUpdate
                        }
                        handleSaveRemarks={
                            handleSaveRemarks
                        }
                        getRemarkStyle={
                            getRemarkStyle
                        }
                        formatLabel={
                            formatLabel
                        }
                        leadStatuses={
                            LEAD_STATUSES
                        }
                        remarkOptions={
                            REMARK_OPTIONS
                        }
                        latestRemarkOptions={
                            LATEST_REMARK_OPTIONS
                        }
                    />

                    {/* =================================================
    NOTES
================================================= */}

<section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,34,54,0.06)]">

    {/* =================================================
        NOTES HEADER
    ================================================= */}

    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

        <div className="flex items-center justify-between gap-4">

            <div>
                <h2 className="text-lg font-bold text-[#102236]">
                    Notes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Add detailed information about conversations with this lead.
                </p>
            </div>

            <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#F6C945]/20 px-3 text-sm font-bold text-[#102236]">
                {notes.length}
            </div>

        </div>

    </div>


    {/* =================================================
        NOTES CONTENT
    ================================================= */}

    <div className="p-5 sm:p-6">

        {/* =================================================
            WRITE NEW NOTE
        ================================================= */}

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

            <textarea
                value={noteText}
                onChange={(e) => {
                    setNoteText(e.target.value);

                    if (noteError) {
                        setNoteError("");
                    }
                }}
                placeholder="Write a detailed note about this lead..."
                maxLength={5000}
                rows={4}
                className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    py-3
                    text-sm
                    text-slate-800
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#F6C945]
                    focus:ring-4
                    focus:ring-[#F6C945]/20
                "
            />

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <span className="text-xs font-medium text-slate-400">
                    {noteText.length}
                    /5000 characters
                </span>

                <button
                    type="button"
                    onClick={handleAddNote}
                    disabled={
                        addingNote ||
                        !noteText.trim()
                    }
                    className="
                        w-full
                        rounded-xl
                        bg-[#102236]
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-[#1A344D]
                        disabled:cursor-not-allowed
                        disabled:bg-slate-300
                        sm:w-auto
                    "
                >
                    {addingNote
                        ? "Adding..."
                        : "Add Note"}
                </button>

            </div>

        </div>


        {/* =================================================
            NOTE ERROR
        ================================================= */}

        {noteError && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {noteError}
            </div>
        )}


        {/* =================================================
            LATEST NOTE
        ================================================= */}

        <div className="mt-5">

            {notesLoading ? (

                <div className="py-8 text-center text-sm text-slate-400">
                    Loading latest note...
                </div>

            ) : notes.length === 0 ? (

                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">

                    <div className="mb-2 text-2xl text-slate-300">
                        ✎
                    </div>

                    <p className="text-sm font-medium text-slate-500">
                        No notes added yet.
                    </p>

                </div>

            ) : (

                <div className="space-y-3">

                    {(() => {

                        const latestNote = [...notes].sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )[0];

                        return (

                            <div
                                key={
                                    latestNote._id ||
                                    latestNote.id ||
                                    "latest-note"
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    p-4
                                    transition
                                    hover:border-slate-300
                                    hover:shadow-sm
                                "
                            >

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                    <div className="flex-1">

                                        {/* Latest Note Label */}

                                        <div className="mb-2 flex items-center gap-2">

                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#102236] text-sm text-[#F6C945]">
                                                ✎
                                            </div>

                                            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                                Latest Note
                                            </span>

                                        </div>


                                        {/* Note Content */}

                                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                            {latestNote.note ||
                                                latestNote.text ||
                                                latestNote.content ||
                                                "-"}
                                        </p>

                                    </div>


                                    {/* Note Date */}

                                    <span className="shrink-0 text-[11px] font-medium text-slate-400">
                                        {formatDate(
                                            latestNote.createdAt
                                        )}
                                    </span>

                                </div>


                                {/* Created By */}

                                {(latestNote.createdBy?.name ||
                                    latestNote.createdByName) && (

                                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs font-medium text-slate-400">

                                        Added by{" "}

                                        <span className="font-semibold text-slate-600">
                                            {latestNote.createdBy?.name ||
                                                latestNote.createdByName}
                                        </span>

                                    </div>

                                )}

                            </div>

                        );

                    })()}

                </div>

            )}

        </div>

    </div>

</section>
                    {/* =================================================
                        HISTORY
                    ================================================= */}

                    <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgba(16,34,54,0.06)]">

                        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                            <div className="flex items-center justify-between gap-4">

                                <div>
                                    <h2 className="text-lg font-bold text-[#102236]">
                                        Activity History
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Track changes and actions performed on this lead.
                                    </p>
                                </div>

                                <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#F6C945]/20 px-3 text-sm font-bold text-[#102236]">
                                    {history.length}
                                </div>

                            </div>
                        </div>

                        <div className="p-5 sm:p-6">

                            {historyLoading ? (
                                <div className="py-10 text-center text-sm text-slate-400">
                                    Loading activity history...
                                </div>
                            ) : historyError ? (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                                    {historyError}
                                </div>
                            ) : history.length === 0 ? (
                                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                                    <div className="mb-2 text-2xl text-slate-300">
                                        ◷
                                    </div>

                                    <p className="text-sm font-medium text-slate-500">
                                        No activity history available.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {historyGroups.map((group) => {
                                        const isExpanded = expandedHistoryGroups[group.id] === true;

                                        return (
                                            <div key={group.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setExpandedHistoryGroups((previous) => ({
                                                            ...previous,
                                                            [group.id]: !previous[group.id],
                                                        }))
                                                    }
                                                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
                                                >
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${isExpanded ? "bg-[#102236] text-[#F6C945]" : "bg-slate-100 text-slate-500"}`}>
                                                            {isExpanded ? "▼" : "▶"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h3 className="truncate text-sm font-bold text-[#102236]">
                                                                {formatHistoryGroupDate(group.startDate)} – {formatHistoryGroupDate(group.endDate)}
                                                            </h3>
                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                {group.items.length} {group.items.length === 1 ? "activity" : "activities"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 rounded-full bg-[#F6C945]/20 px-3 py-1 text-xs font-bold text-[#102236]">
                                                        {group.items.length}
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="border-t border-slate-100 bg-slate-50/40 p-4 sm:p-5">
                                                        <div className="relative">
                                                            <div className="absolute bottom-4 left-[17px] top-4 hidden w-px bg-slate-200 sm:block" />
                                                            <div className="space-y-4">
                                                                {group.items.map((item, index) => (
                                                                    <div key={item._id || item.id || index} className="relative flex gap-3">
                                                                        <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F6C945]/30 bg-[#102236] text-sm font-bold text-[#F6C945]">
                                                                            {getHistoryIcon(item.action)}
                                                                        </div>
                                                                        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white p-4">
                                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                                <div>
                                                                                    <h3 className="text-sm font-bold text-[#102236]">{getHistoryTitle(item)}</h3>
                                                                                    {item.user?.name && (
                                                                                        <p className="mt-1 text-xs text-slate-400">
                                                                                            By <span className="font-semibold text-slate-600">{item.user.name}</span>
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <span className="shrink-0 text-[11px] font-medium text-slate-400">
                                                                                    {formatHistoryDate(item.createdAt || item.timestamp)}
                                                                                </span>
                                                                            </div>

                                                                            {item.field && (
                                                                                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                                                                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">{getFieldLabel(item.field)}</p>
                                                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                                                        <div>
                                                                                            <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">Previous</p>
                                                                                            <p className="break-words text-sm font-medium text-slate-600">{formatHistoryValue(item.oldValue)}</p>
                                                                                        </div>
                                                                                        <div>
                                                                                            <p className="mb-1 text-[10px] font-semibold uppercase text-slate-400">New</p>
                                                                                            <p className="break-words text-sm font-semibold text-[#102236]">{formatHistoryValue(item.newValue)}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}

                                                                            {item.note && (
                                                                                <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                                                                                    <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{item.note}</p>
                                                                                </div>
                                                                            )}

                                                                            {item.description && (
                                                                                <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{item.description}</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
};

export default LeadDetails;