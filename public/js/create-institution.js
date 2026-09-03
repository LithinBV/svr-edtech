// ==========================================
// CREATE INSTITUTION FORM
// ==========================================

const createInstitutionForm =
    document.getElementById("createInstitutionForm");

const institutionMessage =
    document.getElementById("institutionMessage");

const createInstitutionButton =
    document.getElementById("createInstitutionButton");


// ==========================================
// STATE CUSTOM DROPDOWN
// ==========================================

const stateInput =
    document.getElementById("state");

const stateButton =
    document.getElementById("stateButton");

const stateButtonText =
    document.getElementById("stateButtonText");

const stateMenu =
    document.getElementById("stateMenu");

const stateOptions =
    document.getElementById("stateOptions");


// ==========================================
// REGION CUSTOM DROPDOWN
// ==========================================

const regionInput =
    document.getElementById("region");

const regionButton =
    document.getElementById("regionButton");

const regionButtonText =
    document.getElementById("regionButtonText");

const regionMenu =
    document.getElementById("regionMenu");

const regionOptions =
    document.getElementById("regionOptions");


// ==========================================
// STATE DROPDOWN CONTAINER
// ==========================================

const stateDropdownContainer =
    document.getElementById(
        "stateDropdownContainer"
    );


// ==========================================
// REGION DROPDOWN CONTAINER
// ==========================================

const regionDropdownContainer =
    document.getElementById(
        "regionDropdownContainer"
    );


// ==========================================
// CREATE STATE OPTIONS
// ==========================================

indianStates.forEach((state) => {

    const option =
        document.createElement("button");

    option.type = "button";

    option.className =
        "w-full text-left px-4 py-3 " +
        "text-sm text-gray-700 " +
        "hover:bg-gray-100 " +
        "focus:bg-gray-100 " +
        "focus:outline-none " +
        "break-words";

    option.textContent = state;


    // ======================================
    // STATE OPTION CLICK
    // ======================================

    option.addEventListener("click", () => {

        // Save selected state
        stateInput.value = state;


        // Change button text
        stateButtonText.textContent =
            state;

        stateButtonText.classList.remove(
            "text-gray-400"
        );

        stateButtonText.classList.add(
            "text-gray-700"
        );


        // Close state menu
        stateMenu.classList.add(
            "hidden"
        );


        // ==================================
        // RESET REGION
        // ==================================

        regionInput.value = "";

        regionButtonText.textContent =
            "Select Region";

        regionButtonText.classList.remove(
            "text-gray-700"
        );

        regionButtonText.classList.add(
            "text-gray-400"
        );


        // Load regions
        loadRegions(state);

    });

    stateOptions.appendChild(option);

});


// ==========================================
// OPEN STATE DROPDOWN
// ==========================================

stateButton.addEventListener(
    "click",
    () => {

        if (
            stateMenu.classList.contains(
                "hidden"
            )
        ) {

            stateMenu.classList.remove(
                "hidden"
            );

            // Close region dropdown
            regionMenu.classList.add(
                "hidden"
            );

        } else {

            stateMenu.classList.add(
                "hidden"
            );

        }

    }
);


// ==========================================
// LOAD REGIONS
// ==========================================

function loadRegions(state) {

    // Clear old options
    regionOptions.innerHTML = "";


    // Get regions
    const regions =
        indianRegions[state] || [];


    // ======================================
    // NO REGIONS
    // ======================================

    if (regions.length === 0) {

        regionButton.disabled = true;

        regionButtonText.textContent =
            "No regions available";

        regionButtonText.classList.remove(
            "text-gray-700"
        );

        regionButtonText.classList.add(
            "text-gray-400"
        );

        regionButton.classList.add(
            "bg-gray-100"
        );

        return;

    }


    // ======================================
    // ENABLE REGION BUTTON
    // ======================================

    regionButton.disabled = false;

    regionButton.classList.remove(
        "bg-gray-100"
    );


    // ======================================
    // CREATE REGION OPTIONS
    // ======================================

    regions.forEach((region) => {

        const option =
            document.createElement("button");

        option.type = "button";

        option.className =
            "w-full text-left px-4 py-3 " +
            "text-sm text-gray-700 " +
            "hover:bg-gray-100 " +
            "focus:bg-gray-100 " +
            "focus:outline-none " +
            "break-words";

        option.textContent = region;


        // ==================================
        // REGION OPTION CLICK
        // ==================================

        option.addEventListener(
            "click",
            () => {

                // Save selected region
                regionInput.value =
                    region;


                // Change button text
                regionButtonText.textContent =
                    region;

                regionButtonText.classList.remove(
                    "text-gray-400"
                );

                regionButtonText.classList.add(
                    "text-gray-700"
                );


                // Close menu
                regionMenu.classList.add(
                    "hidden"
                );

            }
        );


        regionOptions.appendChild(option);

    });

}


// ==========================================
// OPEN REGION DROPDOWN
// ==========================================

regionButton.addEventListener(
    "click",
    () => {

        if (regionButton.disabled) {
            return;
        }


        if (
            regionMenu.classList.contains(
                "hidden"
            )
        ) {

            regionMenu.classList.remove(
                "hidden"
            );

            // Close state dropdown
            stateMenu.classList.add(
                "hidden"
            );

        } else {

            regionMenu.classList.add(
                "hidden"
            );

        }

    }
);


// ==========================================
// CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener(
    "click",
    (event) => {

        if (
            stateDropdownContainer &&
            !stateDropdownContainer.contains(
                event.target
            )
        ) {

            stateMenu.classList.add(
                "hidden"
            );

        }


        if (
            regionDropdownContainer &&
            !regionDropdownContainer.contains(
                event.target
            )
        ) {

            regionMenu.classList.add(
                "hidden"
            );

        }

    }
);


// ==========================================
// FORM SUBMIT
// ==========================================

createInstitutionForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        // ======================================
        // GET JWT TOKEN
        // ======================================

        const token =
            localStorage.getItem("token");


        console.log(
            "JWT TOKEN EXISTS:",
            !!token
        );


        if (!token) {

            institutionMessage.textContent =
                "Your session has expired. Please login again.";

            institutionMessage.classList.remove(
                "hidden"
            );

            institutionMessage.classList.remove(
                "text-green-600"
            );

            institutionMessage.classList.add(
                "text-red-600"
            );

            return;

        }


        // ======================================
        // GET FORM VALUES
        // ======================================

        const institutionName =
            document
                .getElementById("institutionName")
                .value
                .trim();


        const state =
            stateInput.value;


        const region =
            regionInput.value;


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        // ======================================
        // DEBUG FORM VALUES
        // ======================================

        console.log(
            "INSTITUTION NAME:",
            institutionName
        );

        console.log(
            "STATE:",
            state
        );

        console.log(
            "REGION:",
            region
        );

        console.log(
            "USERNAME:",
            username
        );

        console.log(
            "PASSWORD LENGTH:",
            password.length
        );


        // ======================================
        // VALIDATION
        // ======================================

        if (
            !institutionName ||
            !state ||
            !region ||
            !username ||
            !password
        ) {

            institutionMessage.textContent =
                "Please fill all fields.";

            institutionMessage.classList.remove(
                "hidden"
            );

            institutionMessage.classList.remove(
                "text-green-600"
            );

            institutionMessage.classList.add(
                "text-red-600"
            );

            return;

        }


        // ======================================
        // DISABLE BUTTON
        // ======================================

        createInstitutionButton.disabled =
            true;

        createInstitutionButton.textContent =
            "Creating Institution...";


        // ======================================
        // SEND DATA TO BACKEND
        // ======================================

        try {

            console.log(
                "SENDING REQUEST TO /api/institutions"
            );


            const response =
                await fetch(
                    "/api/institutions",
                    {
                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body: JSON.stringify({

                            institutionName,

                            state,

                            region,

                            username,

                            password

                        })

                    }
                );


            // ==================================
            // DEBUG RESPONSE
            // ==================================

            console.log(
                "RESPONSE STATUS:",
                response.status
            );

            console.log(
                "RESPONSE STATUS TEXT:",
                response.statusText
            );


            // ==================================
            // READ RAW RESPONSE
            // ==================================

            const responseText =
                await response.text();


            console.log(
                "SERVER RESPONSE:",
                responseText
            );


            // ==================================
            // PARSE JSON
            // ==================================

            let data = {};

            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch (jsonError) {

                console.error(
                    "JSON PARSE ERROR:",
                    jsonError
                );

                data = {

                    message:
                        responseText ||
                        "Server returned an invalid response."

                };

            }


            // ==================================
            // HANDLE ERROR
            // ==================================

            if (!response.ok) {

                console.error(
                    "CREATE INSTITUTION FAILED"
                );

                console.error(
                    "STATUS:",
                    response.status
                );

                console.error(
                    "DATA:",
                    data
                );


                institutionMessage.textContent =
                    data.message ||
                    "Failed to create institution.";

                institutionMessage.classList.remove(
                    "hidden"
                );

                institutionMessage.classList.remove(
                    "text-green-600"
                );

                institutionMessage.classList.add(
                    "text-red-600"
                );

                return;

            }


            // ==================================
            // SUCCESS
            // ==================================

            console.log(
                "INSTITUTION CREATED SUCCESSFULLY"
            );

            console.log(
                "DATA:",
                data
            );


            institutionMessage.textContent =
                data.message ||
                "Institution created successfully.";

            institutionMessage.classList.remove(
                "hidden"
            );

            institutionMessage.classList.remove(
                "text-red-600"
            );

            institutionMessage.classList.add(
                "text-green-600"
            );


            // ==================================
            // RESET FORM
            // ==================================

            createInstitutionForm.reset();


            // ==================================
            // RESET STATE
            // ==================================

            stateInput.value = "";

            stateButtonText.textContent =
                "Select State";

            stateButtonText.classList.remove(
                "text-gray-700"
            );

            stateButtonText.classList.add(
                "text-gray-400"
            );


            // ==================================
            // RESET REGION
            // ==================================

            regionInput.value = "";

            regionButtonText.textContent =
                "Select State First";

            regionButtonText.classList.remove(
                "text-gray-700"
            );

            regionButtonText.classList.add(
                "text-gray-400"
            );


            regionButton.disabled =
                true;

            regionButton.classList.add(
                "bg-gray-100"
            );


            // Clear region options
            regionOptions.innerHTML = "";


            // Close dropdowns
            stateMenu.classList.add(
                "hidden"
            );

            regionMenu.classList.add(
                "hidden"
            );


            // ==================================
            // REDIRECT AFTER SUCCESS
            // ==================================

            setTimeout(() => {

                window.location.href =
                    "admin-dashboard.html";

            }, 1500);

        }


        // ======================================
        // SERVER CONNECTION ERROR
        // ======================================

        catch (error) {

            console.error(
                "FETCH ERROR:",
                error
            );


            institutionMessage.textContent =
                "Unable to connect to the server.";

            institutionMessage.classList.remove(
                "hidden"
            );

            institutionMessage.classList.remove(
                "text-green-600"
            );

            institutionMessage.classList.add(
                "text-red-600"
            );

        }


        // ======================================
        // ENABLE BUTTON AGAIN
        // ======================================

        finally {

            createInstitutionButton.disabled =
                false;

            createInstitutionButton.textContent =
                "Create Institution";

        }

    }
);