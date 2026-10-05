import {
    useEffect,
    useMemo,
    useState,
} from "react";


const usePagination = (
    items = [],
    itemsPerPage = 50
) => {

    // ============================================================
    // CURRENT PAGE
    // ============================================================

    const [page, setPage] =
        useState(1);


    // ============================================================
    // TOTAL ITEMS
    // ============================================================

    const total =
        Array.isArray(items)
            ? items.length
            : 0;


    // ============================================================
    // TOTAL PAGES
    // ============================================================

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                total /
                itemsPerPage
            )
        );


    // ============================================================
    // RESET TO PAGE 1
    //
    // Whenever the filtered dataset changes,
    // start from page 1.
    // ============================================================

    useEffect(
        () => {

            setPage(1);

        },
        [items]
    );


    // ============================================================
    // PAGE SAFETY
    //
    // Example:
    // User is on page 5.
    // Filter reduces data to 2 pages.
    //
    // Automatically move to page 2.
    // ============================================================

    useEffect(
        () => {

            if (
                page > totalPages
            ) {

                setPage(
                    totalPages
                );

            }

        },
        [
            page,
            totalPages,
        ]
    );


    // ============================================================
    // PAGINATED ITEMS
    //
    // ONLY THESE ITEMS ARE SENT TO THE TABLE.
    // ============================================================

    const paginatedItems =
        useMemo(
            () => {

                if (
                    !Array.isArray(
                        items
                    )
                ) {

                    return [];

                }


                const start =
                    (
                        page - 1
                    ) *
                    itemsPerPage;


                const end =
                    start +
                    itemsPerPage;


                return items.slice(
                    start,
                    end
                );

            },
            [
                items,
                page,
                itemsPerPage,
            ]
        );


    // ============================================================
    // GO TO SPECIFIC PAGE
    // ============================================================

    const goToPage =
        (
            pageNumber
        ) => {

            const nextPage =
                Number(
                    pageNumber
                );


            if (
                Number.isNaN(
                    nextPage
                )
            ) {

                return;

            }


            if (
                nextPage < 1
            ) {

                return;

            }


            if (
                nextPage > totalPages
            ) {

                return;

            }


            setPage(
                nextPage
            );

        };


    // ============================================================
    // NEXT PAGE
    // ============================================================

    const nextPage =
        () => {

            setPage(
                (
                    currentPage
                ) =>
                    Math.min(
                        totalPages,
                        currentPage + 1
                    )
            );

        };


    // ============================================================
    // PREVIOUS PAGE
    // ============================================================

    const previousPage =
        () => {

            setPage(
                (
                    currentPage
                ) =>
                    Math.max(
                        1,
                        currentPage - 1
                    )
            );

        };


    // ============================================================
    // FIRST PAGE
    // ============================================================

    const firstPage =
        () => {

            setPage(1);

        };


    // ============================================================
    // LAST PAGE
    // ============================================================

    const lastPage =
        () => {

            setPage(
                totalPages
            );

        };


    // ============================================================
    // RESULT RANGE
    //
    // Example:
    // Page 2, 50 per page
    // → 51 - 100
    // ============================================================

    const startIndex =
        total === 0
            ? 0
            : (
                page - 1
            ) *
                itemsPerPage +
                1;


    const endIndex =
        total === 0
            ? 0
            : Math.min(
                page *
                    itemsPerPage,
                total
            );


    // ============================================================
    // RETURN
    // ============================================================

    return {

        // Current page
        page,

        setPage,

        // Number of records
        total,

        // Number of pages
        totalPages,

        // 50 records for current page
        paginatedItems,

        // Navigation
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,

        // Configuration
        itemsPerPage,

        // Display range
        startIndex,
        endIndex,

    };

};


export default usePagination;