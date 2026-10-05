import React from "react";

const AddLeadModal = ({
    show,
    onClose,
    onAddManually,
    onBulkUpload,
}) => {
    if (!show) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Add Leads
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Choose how you want to add leads.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {/* ==========================================
                    OPTIONS
                ========================================== */}

                <div className="space-y-4 px-6 py-6">
                    {/* ======================================
                        MANUAL
                    ====================================== */}

                    <button
                        type="button"
                        onClick={onAddManually}
                        className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                            ＋
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                                Add Lead Manually
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Enter one lead's information using the lead form.
                            </p>
                        </div>

                        <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                            →
                        </span>
                    </button>

                    {/* ======================================
                        BULK UPLOAD
                    ====================================== */}

                    <button
                        type="button"
                        onClick={onBulkUpload}
                        className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-green-200 hover:bg-green-50"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl">
                            ↑
                        </div>

                        <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800 group-hover:text-green-700">
                                Bulk Upload
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                                Upload multiple leads using a CSV or Excel file.
                            </p>
                        </div>

                        <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-green-600">
                            →
                        </span>
                    </button>
                </div>

                {/* ==========================================
                    FOOTER
                ========================================== */}

                <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddLeadModal;