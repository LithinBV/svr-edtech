import React, {
    useMemo,
} from "react";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";


const Pagination = ({
    page = 1,

    total = 0,

    totalPages = 1,

    itemsPerPage = 50,

    onPageChange,

    itemLabel = "items",

}) => {


    // ============================================================
    // NOTHING TO PAGINATE
    // ============================================================

    if (
        total === 0
    ) {

        return null;

    }


    // ============================================================
    // PAGE NUMBERS
    // ============================================================

    const pageNumbers =
        useMemo(
            () => {

                if (
                    totalPages <= 1
                ) {

                    return [];

                }


                const pages = [];


                const maxVisiblePages =
                    5;


                let startPage =
                    Math.max(
                        1,
                        page - 2
                    );


                let endPage =
                    Math.min(
                        totalPages,
                        startPage +
                            maxVisiblePages -
                            1
                    );


                // -----------------------------------------------
                // Keep 5 page numbers visible when possible.
                // -----------------------------------------------

                if (
                    endPage -
                        startPage +
                        1 <
                    maxVisiblePages
                ) {

                    startPage =
                        Math.max(
                            1,
                            endPage -
                                maxVisiblePages +
                                1
                        );

                }


                for (
                    let i =
                        startPage;

                    i <=
                    endPage;

                    i++
                ) {

                    pages.push(
                        i
                    );

                }


                return pages;

            },
            [
                page,
                totalPages,
            ]
        );


    // ============================================================
    // RESULT RANGE
    // ============================================================

    const startIndex =
        (
            page - 1
        ) *
            itemsPerPage +
        1;


    const endIndex =
        Math.min(
            page *
                itemsPerPage,
            total
        );


    // ============================================================
    // PAGE CHANGE
    // ============================================================

    const changePage =
        (
            pageNumber
        ) => {

            if (
                pageNumber < 1 ||
                pageNumber > totalPages
            ) {

                return;

            }


            if (
                typeof onPageChange ===
                "function"
            ) {

                onPageChange(
                    pageNumber
                );

            }

        };


    // ============================================================
    // COMPONENT
    // ============================================================

    return (

        <div
            className="
                mt-5
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                py-4
                shadow-sm

                sm:flex-row
                sm:items-center
                sm:justify-between
            "
        >

            {/* =====================================================
                RESULT INFORMATION
            ===================================================== */}

            <div
                className="
                    text-sm
                    text-slate-500
                "
            >

                Showing{" "}

                <span
                    className="
                        font-semibold
                        text-slate-800
                    "
                >
                    {startIndex}
                </span>

                {" – "}

                <span
                    className="
                        font-semibold
                        text-slate-800
                    "
                >
                    {endIndex}
                </span>

                {" of "}

                <span
                    className="
                        font-semibold
                        text-slate-800
                    "
                >
                    {total}
                </span>

                {" "}

                {itemLabel}

            </div>


            {/* =====================================================
                PAGINATION CONTROLS
            ===================================================== */}

            {totalPages > 1 && (

                <div
                    className="
                        flex
                        items-center
                        gap-1.5
                        overflow-x-auto
                    "
                >

                    {/* =================================================
                        PREVIOUS
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() =>
                            changePage(
                                page - 1
                            )
                        }
                        disabled={
                            page === 1
                        }
                        className="
                            inline-flex
                            h-9
                            items-center
                            gap-1
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-semibold
                            text-slate-700
                            transition

                            hover:border-[#F6C945]
                            hover:bg-[#F6C945]/10

                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >

                        <ChevronLeft
                            size={16}
                        />

                        Previous

                    </button>


                    {/* =================================================
                        PAGE NUMBERS
                    ================================================= */}

                    {pageNumbers.map(
                        (
                            pageNumber
                        ) => (

                            <button
                                key={
                                    pageNumber
                                }
                                type="button"
                                onClick={() =>
                                    changePage(
                                        pageNumber
                                    )
                                }
                                className={`
                                    inline-flex
                                    h-9
                                    min-w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    px-3
                                    text-sm
                                    font-bold
                                    transition

                                    ${
                                        pageNumber ===
                                        page
                                            ? "bg-[#102236] text-white shadow-sm"
                                            : "border border-slate-200 bg-white text-slate-700 hover:border-[#F6C945] hover:bg-[#F6C945]/10"
                                    }
                                `}
                            >

                                {
                                    pageNumber
                                }

                            </button>

                        )
                    )}


                    {/* =================================================
                        NEXT
                    ================================================= */}

                    <button
                        type="button"
                        onClick={() =>
                            changePage(
                                page + 1
                            )
                        }
                        disabled={
                            page ===
                            totalPages
                        }
                        className="
                            inline-flex
                            h-9
                            items-center
                            gap-1
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            text-sm
                            font-semibold
                            text-slate-700
                            transition

                            hover:border-[#F6C945]
                            hover:bg-[#F6C945]/10

                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >

                        Next

                        <ChevronRight
                            size={16}
                        />

                    </button>

                </div>

            )}

        </div>

    );

};


export default Pagination;