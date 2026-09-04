// ==========================================
// INSTITUTIONS PAGE
// ==========================================


// ==========================================
// ELEMENTS
// ==========================================

const loadingMessage =
    document.getElementById("loadingMessage");

const errorMessage =
    document.getElementById("errorMessage");

const emptyMessage =
    document.getElementById("emptyMessage");

const noSearchResults =
    document.getElementById("noSearchResults");

const institutionsContainer =
    document.getElementById("institutionsContainer");

const searchInput =
    document.getElementById("searchInput");

const totalInstitutions =
    document.getElementById("totalInstitutions");

const recentlyAdded =
    document.getElementById("recentlyAdded");

const recentlyAddedText =
    document.getElementById("recentlyAddedText");


// ==========================================
// DATA
// ==========================================

let allInstitutions = [];


// ==========================================
// CHECK AUTHENTICATION
// ==========================================

const token =
    localStorage.getItem("token");

const userType =
    localStorage.getItem("userType");


if (
    !token ||
    userType !== "SUPER_ADMIN"
) {

    window.location.replace(
        "/pages/login.html"
    );

}


// ==========================================
// LOAD INSTITUTIONS
// ==========================================

async function loadInstitutions() {

    try {

        loadingMessage.classList.remove("hidden");

        errorMessage.classList.add("hidden");

        emptyMessage.classList.add("hidden");

        noSearchResults.classList.add("hidden");

        institutionsContainer.innerHTML = "";


        // ==========================================
        // API REQUEST
        // ==========================================

        const response =
            await fetch(
                "/api/institutions",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        // ==========================================
        // AUTH ERROR
        // ==========================================

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            localStorage.removeItem("token");

            localStorage.removeItem("userType");

            localStorage.removeItem("role");

            window.location.replace(
                "/pages/login.html"
            );

            return;

        }


        // ==========================================
        // OTHER ERROR
        // ==========================================

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load institutions."
            );

        }


        // ==========================================
        // GET DATA
        // ==========================================

        allInstitutions =
            Array.isArray(data.institutions)
                ? data.institutions
                : [];


        // ==========================================
        // UPDATE COUNTS
        // ==========================================

        updateStatistics();


        // ==========================================
        // EMPTY DATABASE
        // ==========================================

        if (
            allInstitutions.length === 0
        ) {

            loadingMessage.classList.add(
                "hidden"
            );

            emptyMessage.classList.remove(
                "hidden"
            );

            return;

        }


        // ==========================================
        // DISPLAY INSTITUTIONS
        // ==========================================

        displayInstitutions(
            allInstitutions
        );


    } catch (error) {

        console.error(
            "Load institutions error:",
            error
        );


        loadingMessage.classList.add(
            "hidden"
        );


        errorMessage.textContent =
            error.message ||
            "Unable to load institutions.";


        errorMessage.classList.remove(
            "hidden"
        );


    } finally {

        loadingMessage.classList.add(
            "hidden"
        );

    }

}


// ==========================================
// UPDATE STATISTICS
// ==========================================

function updateStatistics() {

    // ==========================================
    // TOTAL
    // ==========================================

    const total =
        allInstitutions.length;


    totalInstitutions.textContent =
        total;


    // ==========================================
    // CURRENT MONTH
    // ==========================================

    const now =
        new Date();


    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


    // ==========================================
    // COUNT INSTITUTIONS CREATED THIS MONTH
    // ==========================================

    const recentCount =
        allInstitutions.filter(
            institution => {

                if (
                    !institution.createdAt
                ) {

                    return false;

                }


                const createdDate =
                    new Date(
                        institution.createdAt
                    );


                return (
                    createdDate.getFullYear()
                    === currentYear
                    &&
                    createdDate.getMonth()
                    === currentMonth
                );

            }
        ).length;


    recentlyAdded.textContent =
        recentCount;


    // ==========================================
    // MONTH NAME
    // ==========================================

    const monthName =
        now.toLocaleString(
            "en-US",
            {
                month: "long"
            }
        );


    recentlyAddedText.textContent =
        `Created in ${monthName}`;

}


// ==========================================
// DISPLAY INSTITUTIONS
// ==========================================

function displayInstitutions(
    institutions
) {

    institutionsContainer.innerHTML = "";

    noSearchResults.classList.add(
        "hidden"
    );


    // ==========================================
    // NO RESULTS
    // ==========================================

    if (
        institutions.length === 0
    ) {

        noSearchResults.classList.remove(
            "hidden"
        );

        return;

    }


    // ==========================================
    // CREATE CARDS
    // ==========================================

    institutions.forEach(
        (institution, index) => {

            const card =
                createInstitutionCard(
                    institution,
                    index
                );


            institutionsContainer.appendChild(
                card
            );

        }
    );

}


// ==========================================
// CREATE INSTITUTION CARD
// ==========================================

function createInstitutionCard(
    institution,
    index
) {

    const card =
        document.createElement("div");


    card.className =
        "bg-white rounded-2xl border border-gray-100 " +
        "shadow-sm p-6 hover:shadow-lg " +
        "transition duration-200";


    // ==========================================
    // ADMIN
    // ==========================================

    let adminUsername =
        "Not assigned";


    if (
        institution.institutionAdminId &&
        typeof institution.institutionAdminId
            === "object"
    ) {

        adminUsername =
            institution
                .institutionAdminId
                .username ||
            "Not assigned";

    }


    // ==========================================
    // CREATED DATE
    // ==========================================

    const createdDate =
        formatDate(
            institution.createdAt
        );


    // ==========================================
    // ICON
    // ==========================================

    const iconColors = [
        "bg-indigo-50 text-indigo-600",
        "bg-green-50 text-green-600",
        "bg-blue-50 text-blue-600"
    ];


    const iconColor =
        iconColors[
            index % iconColors.length
        ];


    // ==========================================
    // HTML
    // ==========================================

    card.innerHTML = `

        <div class="flex items-start justify-between">

            <div
                class="w-14 h-14 rounded-2xl
                ${iconColor}
                flex items-center justify-center
                text-2xl"
            >

                🏫

            </div>

        </div>


        <div class="mt-5">

            <p class="text-sm text-gray-400">
                Institution ${index + 1}
            </p>

            <h3
                class="mt-1 text-xl font-bold
                text-[#14213d] break-words"
            >
                ${escapeHTML(
                    institution.name ||
                    "Unnamed Institution"
                )}
            </h3>

        </div>


        <div
            class="mt-5 pt-5 border-t
            border-gray-100 space-y-4"
        >


            <!-- STATE -->

            <div
                class="flex items-center
                justify-between gap-4"
            >

                <div
                    class="flex items-center gap-3
                    text-gray-500"
                >

                    <span class="text-blue-500">
                        ◉
                    </span>

                    <span class="text-sm">
                        State
                    </span>

                </div>

                <span
                    class="text-sm font-medium
                    text-gray-700 text-right"
                >
                    ${escapeHTML(
                        institution.state ||
                        "Not available"
                    )}
                </span>

            </div>


            <!-- REGION -->

            <div
                class="flex items-center
                justify-between gap-4"
            >

                <div
                    class="flex items-center gap-3
                    text-gray-500"
                >

                    <span class="text-blue-500">
                        ◉
                    </span>

                    <span class="text-sm">
                        Region
                    </span>

                </div>

                <span
                    class="text-sm font-medium
                    text-gray-700 text-right"
                >
                    ${escapeHTML(
                        institution.region ||
                        "Not available"
                    )}
                </span>

            </div>


            <!-- ADMIN USERNAME -->

            <div
                class="flex items-center
                justify-between gap-4"
            >

                <div
                    class="flex items-center gap-3
                    text-gray-500"
                >

                    <span class="text-blue-500">
                        ♙
                    </span>

                    <span class="text-sm">
                        Admin Username
                    </span>

                </div>

                <span
                    class="text-sm font-medium
                    text-gray-700 text-right
                    break-all"
                >
                    ${escapeHTML(
                        adminUsername
                    )}
                </span>

            </div>


            <!-- CREATED DATE -->

            <div
                class="flex items-center
                justify-between gap-4"
            >

                <div
                    class="flex items-center gap-3
                    text-gray-500"
                >

                    <span class="text-blue-500">
                        📅
                    </span>

                    <span class="text-sm">
                        Created on
                    </span>

                </div>

                <span
                    class="text-sm font-medium
                    text-gray-700 text-right"
                >
                    ${createdDate}
                </span>

            </div>

        </div>


        <!-- VIEW DETAILS -->

        <div
            class="mt-5 pt-4 border-t
            border-gray-100"
        >

            <button
                type="button"
                class="text-[#2945db]
                font-semibold text-sm
                hover:underline"
                onclick="viewInstitution('${institution._id}')"
            >

                View Details →

            </button>

        </div>

    `;


    return card;

}


// ==========================================
// SEARCH
// ==========================================

searchInput.addEventListener(
    "input",
    function () {

        const searchTerm =
            this.value
                .trim()
                .toLowerCase();


        // ==========================================
        // SHOW EVERYTHING
        // ==========================================

        if (!searchTerm) {

            displayInstitutions(
                allInstitutions
            );

            return;

        }


        // ==========================================
        // FILTER
        // ==========================================

        const filteredInstitutions =
            allInstitutions.filter(
                institution => {

                    const name =
                        institution.name ||
                        "";

                    const state =
                        institution.state ||
                        "";

                    const region =
                        institution.region ||
                        "";

                    let username =
                        "";


                    if (
                        institution
                            .institutionAdminId &&
                        typeof institution
                            .institutionAdminId
                            === "object"
                    ) {

                        username =
                            institution
                                .institutionAdminId
                                .username ||
                            "";

                    }


                    const searchableText =
                        `
                        ${name}
                        ${state}
                        ${region}
                        ${username}
                        `.toLowerCase();


                    return searchableText.includes(
                        searchTerm
                    );

                }
            );


        displayInstitutions(
            filteredInstitutions
        );

    }
);


// ==========================================
// FORMAT DATE
// ==========================================

function formatDate(
    dateValue
) {

    if (!dateValue) {

        return "Not available";

    }


    const date =
        new Date(dateValue);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Not available";

    }


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// ==========================================
// VIEW DETAILS
// ==========================================

function viewInstitution(
    institutionId
) {

    /*
        Details page will be added later.

        For now, we don't redirect anywhere
        because the details page does not exist yet.
    */

    console.log(
        "Institution selected:",
        institutionId
    );

}


// ==========================================
// START
// ==========================================

loadInstitutions();