import React from "react";
import * as XLSX from "xlsx";
import { Download, FileSpreadsheet } from "lucide-react";

// ============================================================
// DEMO EXCEL TEMPLATE
// ============================================================

const DownloadDemoExcel = () => {
    // ========================================================
    // DOWNLOAD DEMO EXCEL
    // ========================================================

    const handleDownload = () => {
        // ----------------------------------------------------
        // SAMPLE LEAD DATA
        // ----------------------------------------------------

        const demoData = [
            {
                name: "Aarav Nair",
                email: "aarav.nair01@example.com",
                contact: "9876501201",
                gender: "Male",
                state: "Karnataka",
                district: "Bengaluru Urban",
                collegeName: "Eastview Institute of Technology",
                department: "Computer Science",
                ugYearOfPassout: "2025",
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
                collegeName: "Mysuru College of Engineering",
                department: "Information Science",
                ugYearOfPassout: "2024",
                pgYearOfPassout: "2026",
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
                collegeName: "Chennai Technical College",
                department: "Electronics and Communication",
                ugYearOfPassout: "2025",
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
                collegeName: "Pune Management Institute",
                department: "Business Administration",
                ugYearOfPassout: "2023",
                pgYearOfPassout: "2025",
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
                collegeName: "Kerala Institute of Commerce",
                department: "Commerce",
                ugYearOfPassout: "2025",
                pgYearOfPassout: "",
                leadSource: "Inbound",
                leadType: "Non-IT",
                programInterest: "DM",
            },
        ];

        // ----------------------------------------------------
        // CREATE WORKBOOK
        // ----------------------------------------------------

        const workbook = XLSX.utils.book_new();

        // ====================================================
        // SHEET 1 - LEAD DATA
        // ====================================================

        const leadWorksheet =
            XLSX.utils.json_to_sheet(demoData);

        // Column widths
        leadWorksheet["!cols"] = [
            { wch: 22 }, // name
            { wch: 32 }, // email
            { wch: 16 }, // contact
            { wch: 18 }, // gender
            { wch: 18 }, // state
            { wch: 20 }, // district
            { wch: 35 }, // collegeName
            { wch: 35 }, // department
            { wch: 20 }, // ugYearOfPassout
            { wch: 20 }, // pgYearOfPassout
            { wch: 22 }, // leadSource
            { wch: 15 }, // leadType
            { wch: 22 }, // programInterest
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            leadWorksheet,
            "Lead Data"
        );

        // ====================================================
        // SHEET 2 - INSTRUCTIONS
        // ====================================================

        const instructions = [
            {
                Field: "name",
                Requirement: "Required",
                Description: "Full name of the student",
                AllowedValues: "",
            },
            {
                Field: "email",
                Requirement: "Required",
                Description: "Valid email address",
                AllowedValues: "",
            },
            {
                Field: "contact",
                Requirement: "Required",
                Description: "Student contact number",
                AllowedValues: "10 to 15 digits",
            },
            {
                Field: "gender",
                Requirement: "Required",
                Description: "Gender of the student",
                AllowedValues:
                    "Male, Female, Other, Prefer not to say",
            },
            {
                Field: "state",
                Requirement: "Required",
                Description: "State",
                AllowedValues: "",
            },
            {
                Field: "district",
                Requirement: "Required",
                Description: "District",
                AllowedValues: "",
            },
            {
                Field: "collegeName",
                Requirement: "Required",
                Description: "College / Institution name",
                AllowedValues: "",
            },
            {
                Field: "department",
                Requirement: "Required",
                Description: "Department / Branch",
                AllowedValues: "",
            },
            {
                Field: "ugYearOfPassout",
                Requirement: "Required",
                Description: "UG year of passout",
                AllowedValues: "Example: 2025",
            },
            {
                Field: "pgYearOfPassout",
                Requirement: "Optional",
                Description: "PG year of passout",
                AllowedValues: "Example: 2026",
            },
            {
                Field: "leadSource",
                Requirement: "Required",
                Description: "Source from where the lead came",
                AllowedValues:
                    "FB / Meta, College campaign, LinkedIn, Referral, Inbound",
            },
            {
                Field: "leadType",
                Requirement: "Required",
                Description: "Type of lead",
                AllowedValues: "IT, Non-IT",
            },
            {
                Field: "programInterest",
                Requirement: "Required",
                Description: "Program the student is interested in",
                AllowedValues:
                    "IT: Full Stack, Data Analysis, Data Science | Non-IT: HR, DM",
            },
        ];

        const instructionWorksheet =
            XLSX.utils.json_to_sheet(instructions);

        instructionWorksheet["!cols"] = [
            { wch: 24 },
            { wch: 16 },
            { wch: 42 },
            { wch: 75 },
        ];

        XLSX.utils.book_append_sheet(
            workbook,
            instructionWorksheet,
            "Instructions"
        );

        // ====================================================
        // DOWNLOAD
        // ====================================================

        XLSX.writeFile(
            workbook,
            "SVR_EDTECH_Lead_Upload_Template.xlsx"
        );
    };

    // ========================================================
    // UI
    // ========================================================

    return (
        <div className="border-t border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                {/* LEFT SIDE */}
                <div className="flex items-start gap-4">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <FileSpreadsheet
                            size={23}
                            className="text-blue-600"
                        />
                    </div>

                    <div>
                        <h3 className="text-base font-bold text-slate-900">
                            Excel File Requirements
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            Use the demo template to prepare your
                            lead data correctly before uploading.
                        </p>

                        {/* REQUIRED */}
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-800">
                                Required fields
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
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
                                    "Lead Type",
                                    "Program Interest",
                                ].map((field) => (
                                    <span
                                        key={field}
                                        className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
                                    >
                                        {field}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* OPTIONAL */}
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-800">
                                Optional field
                            </p>

                            <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                                PG Year of Passout
                            </span>
                        </div>

                        {/* PROGRAM RULES */}
                        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-sm font-semibold text-blue-900">
                                Lead Type & Program
                            </p>

                            <div className="mt-2 space-y-1 text-xs text-blue-800">
                                <p>
                                    <strong>IT:</strong>{" "}
                                    Full Stack, Data Analysis,
                                    Data Science
                                </p>

                                <p>
                                    <strong>Non-IT:</strong>{" "}
                                    HR, DM
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DOWNLOAD BUTTON */}
                <div className="shrink-0 lg:pl-5">
                    <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] lg:w-auto"
                    >
                        <Download size={18} />

                        Download Demo Excel
                    </button>

                    <p className="mt-2 text-center text-xs text-slate-500">
                        Includes sample data + instructions
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DownloadDemoExcel;