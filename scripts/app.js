"use strict";


import {LoadHeader} from "./header.js";
import {Router} from "./router.js";
import {LoadFooter} from "./footer.js";
import {AuthGuard} from "./authguard.js";

const pageTitles = {
    "/": "Home",
    "/home": "Home",
    "/about": "About",
    "/product": "Product",
    "/contact": "Contact",
    "/services": "Services",
    "/contact-list": "Contact List",
    "/edit ": "Edit Contact",
    "/registered": "Register Paged",
    "/login": "Login Page",
    "/register": "Register Page",
    "/404": "Page Not Found",



}

const routes = {
    "/": "views/pages/home.html",
    "/home": "views/pages/home.html",
    "/about": "views/pages/about.html",
    "/contact": "views/pages/contact.html",
    "/login": "views/pages/login.html",
    "/register": "views/pages/register.html",
    "/product": "views/pages/product.html",
    "/contact-list": "views/pages/contact-list.html",
    "/edit": "views/pages/edit.html",
    "/services": "views/pages/services.html",
    "/404": "views/pages/404.html"

};

const router = new Router(routes);

// IIFE - Immediately Invoked Functional Expression

(function () {




    function DisplayLoginPage() {
        console.log("[INFO] DisplayLoginPage called...");

        if(sessionStorage.getItem("user")){
            router.navigate("/contact-list");
            return;
        }

        const messageArea = document.getElementById("messageArea");
        const loginButton = document.getElementById("loginButton");
        const cancelButton = document.getElementById("cancelButton");

        //MessageArea
        messageArea.style.display = "none";

        if(!loginButton){
            console.error("[ERROR] Unable to login button not Found");
        }

        loginButton.addEventListener("click", async(event) => {
            //prevent default form submission
            event.preventDefault();

            //retrieve passed in form parameters
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            try{
                // the await keyword tells JavaScript to pause here(thread) until the fetch request completes

                const response= await fetch("data/users.json");

                if(!response.ok){
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const jsonData = await response.json();
                //console.log("[DEBUG] Fetched JSON Data:", jsonData);
                const users = jsonData.users;

                if(!Array.isArray(users)){
                    throw new Error("[ERROR] Json data does not contain a valid array");
                }
                let success = false;
                let authenticateUser = null;

                for(const user of users){
                    if(user.Username === username && user.Password === password){
                        success = true;
                        authenticateUser = user;
                        break;
                    }
                }

                if(success){
                    sessionStorage.setItem("user", JSON.stringify({
                        DisplayName: authenticateUser.DisplayName,
                        EmailAddress: authenticateUser.EmailAddress,
                        Username: authenticateUser.Username

                    }));

                    messageArea.classList.remove("alert","alert-danger");
                    messageArea.style.display = "none";
                    LoadHeader().then(() => {
                        router.navigate("/contact-list");
                    });

                }else{
                    messageArea.classList.add("alert","alert-danger");
                    messageArea.textContent = "Invalid username or password.please try again";
                    messageArea.style.display = "block";

                    document.getElementById("username").focus();
                    document.getElementById("username").select();

                }
            }catch(error){
                console.error("[ERROR] Login Failed",error);
            }

        });

        cancelButton.addEventListener("click", async(event) => {
            document.getElementById("loginForm").reset();
            router.navigate("/");
        });

    }

    function DisplayRegisterPage() {
        console.log("[INFO] DisplayRegisterPage called...");
    }

    /**
     * Redirect the user back to contact-list.html
     */
    function handleCancelClick() {
        //location.href = "contact-list.html";
        router.navigate("/contact-list");
    }

    /**
     * Handle the process of editing an existing contact
     * @param event
     * @param contact
     * @param page
     */
    function handleEditClick(event, contact, page) {
        // prevent default form submission
        event.preventDefault();
        console.log("[INFO] Edit button clicked");

        if (!validateForm()){
            alert("Invalid data! Please check your inputs");
            return;
        }
        console.log("[INFO] Form validation passed");

        // Retrieve update values from the form fields
        const fullName = document.getElementById("fullName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const emailAddress = document.getElementById("emailAddress").value;

        // Update the contact information
        contact.fullName = fullName;
        contact.contactNumber = contactNumber;
        contact.emailAddress = emailAddress;

        // Save the update contact back to local storage (csv format)
        localStorage.setItem(page, contact.serialize());

        alert("Contact updated successfully!");
        // Redirect to contact list

        router.navigate("/contact-list");
    }

    /**
     * Handles the process of adding a new contact
     * @param event - the event object to prevent default form submission
     */
    function handleAddClick(event) {
        event.preventDefault();

        if (!validateForm()){
            alert("Form contains errors. Please correct them before submitting");
            return;
        }

        const fullName = document.getElementById("fullName").value;
        const contactNumber = document.getElementById("contactNumber").value;
        const emailAddress = document.getElementById("emailAddress").value;

        // Create and save new contact
        AddContact(fullName, contactNumber, emailAddress);

        // Redirect to contact list
        router.navigate("/contact-list");
    }

    function addEventListenerOnce(elementId, event, handler) {

        // retrieve the element from the DOM
        const element = document.getElementById(elementId);

        if(element) {
            element.removeEventListener(event, handler);
            element.addEventListener(event, handler);
        } else {
            console.warn(`[WARN] Element with ID '${elementId}' not found`);
        }
    }

    /**
     * Validate the entire form by checking the validity of each input field
     * @return {boolean} - return true if all fields pass validation, false otherwise
     */
    function validateForm() {
        return(
            validateInput("fullName") &&
            validateInput("contactNumber") &&
            validateInput("emailAddress")
        );
    }

    /**
     * Validates an input field based on predefined validation rules
     * @param fieldId
     * @returns {boolean}
     */
    function validateInput(fieldId) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        const rule = VALIDATION_RULES[fieldId];

        if (!field || !errorElement || !rule) {
            console.warn(`[WARN] Validation rule not found for ${fieldId}`);
            return false;
        }

        if (!field.value.trim()) {
            errorElement.textContent = rule.errorMessage;
            errorElement.style.display = "block";
            return false;
        }

        // Check if the input fails to match the regex pattern
        if (!rule.regex.test(field.value)) {
            errorElement.textContent = rule.errorMessage;
            errorElement.style.display = "block";
            return false;
        }

        // Clear the error message if validation passes
        errorElement.textContent = "";
        errorElement.style.display = "none";
        return true;
    }

    function attachValidationListener() {
        console.log("[INFO] Attaching validation listeners");

        Object.keys(VALIDATION_RULES).forEach((fieldId) => {
            const field = document.getElementById(fieldId);
            if (!fieldId) {
                console.warn(`[WARNING] Field '${fieldId}' not found. Skipping listener attachment.`);
                return;
            }

            // Attach event listener using centralized validation
            addEventListenerOnce(fieldId, "input", () => validateInput(fieldId) );
        });
    }

    /**
     * Centralized validation rules for form input fields
     * @type {{fullName: {regex: RegExp, errorMessage: string}, contactNumber: {regex: RegExp, errorMessage: string},
     * emailAddress: {regex: RegExp, errorMessage: string}}}
     */
    const VALIDATION_RULES = {
        fullName: {
            // Allows for only letters and spaces
            regex: /^[A-Za-z\s]+$/,
            errorMessage: "Full Name must contain only letters and spaces"
        },
        contactNumber: {
            regex: /^\d{3}-\d{3}-\d{4}$/,
            errorMessage: "Contact Number must be a number in the format ###-###-####"
        },
        emailAddress: {
            regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            errorMessage: "Invalid email address format"
        }
    };


    function AddContact(fullName, contactNumber, emailAddress) {
        console.log("[DEBUG] AddContact() triggered...")

        if (!validateForm()){
            alert("Form contains errors. Please correct them before submitting");
            return;
        }

        let contact = new core.Contact(fullName, contactNumber, emailAddress);
        if (contact.serialize()) {
            // The primary key for a contact --> contact_ + date & time
            let key = `contact_${Date.now()}`;
            localStorage.setItem(key, contact.serialize());
        } else {
            console.error("[ERROR] Contact serialization failed");
        }

        //redirects the user after successful
        router.navigate("/contact-list");
    }
    // Asynchronous -> No Waiting / No Block
    // Synchronous  -> Wait / Block
    async function DisplayWeather(){
        const apiKey = "fd1caa0d47be6ab1fa70defe71f7ef3b";

        const city ="Oshawa";
        const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            // NOT 200 OK
            if (!response.ok) {
                throw new Error(
                    "Failed to fetch weather data from openweathermap.org."
                );
            }

            const data = await response.json();
            console.log("Weather API Response", data);

            const weatherDataElement = document.getElementById("weather-data");

            weatherDataElement.innerHTML = `<strong>City:</strong> ${data.name} <br>
                                       <strong>Temperature:</strong> ${data.main.temp} <br>
                                       <strong>Weather:</strong> ${data.weather[0].description}`;
        } catch (error) {
            console.error("Error Fetching Weather Data", error);
            document.getElementById("weather-data").textContent =
                "Unable to contact weather data at this time";
        }
    }

    function DisplayHomePage() {
        console.log("Calling DisplayHomePage()...");

        const main = document.querySelector("main");
        main.innerHTML = "";

        main .insertAdjacentHTML(
            "beforeend",
            `<button id = "AboutUseBtn" class ="btn btn-primary">About us</button>"
            
            <div id = "weather" class="mt-5">
            <h3>Weather information</h3>
            <p id="weather-data">Fetching weather data..</p>
            </div>
            
            <p id="MainParagraph" class="mt-5">This is first paragraph</p>
            <article class="container">
                <p id="ArticleParagraph" class="mt-3">This is my article paragraph</p>
                
            </article>`


        );

        const aboutUsBtn = document.getElementById("AboutUseBtn");
        aboutUsBtn.addEventListener("click", (e) => {
            router.navigate("/about");
        });



        // Add Call to weathermap.org
        DisplayWeather();

        // Add content to the main element in index.html
        // Position , Content
        document
            .querySelector("main")
            .insertAdjacentHTML(
                "beforeend",
                `<p id="mainParagraph" class="mt-3">This is the first paragraph</p>`
            );

        // Add Article with paragraph content into the body in index.html
        document.body.insertAdjacentHTML(
            "beforeend",
            `<article class="container"><p id="ArticleParagraph" class="mt-3">This is my article paragraph</p></article>`
        );
    }

    function DisplayAboutPage() {
        console.log("Calling DisplayAboutPage()...");
    }

    function DisplayProductsPage() {
        console.log("Calling DisplayProductsPage()...");
    }

    function DisplayServicesPage() {
        console.log("Calling DisplayServicesPage()...");
    }

    function DisplayContactPage() {
        console.log("Calling DisplayContactPage()...");
        let sendButton = document.getElementById("sendButton");
        let subscribeCheckbox = document.getElementById("subscribeCheckbox");

        sendButton.addEventListener("click", function(event){
            event.preventDefault();

            if (subscribeCheckbox.checked) {
                AddContact(
                    document.getElementById("fullName").value,
                    document.getElementById("contactNumber").value,
                    document.getElementById("emailAddress").value,
                );

            }

            alert("Form submitted successfully");
        });

        const contactListButton = document.getElementById("showContactList");
        contactListButton.addEventListener("click", function(event){
            event.preventDefault();
            router.navigate("/contact-list");
        });

    }

    function DisplayContactListPage() {
        console.log("Calling DisplayContactListPage()...");

        if (localStorage.length > 0) {
            let contactList = document.getElementById("contactList");
            let data = ""; // Add deserialized data from localStorage

            let keys = Object.keys(localStorage);
            console.log(keys);// Return a string array of keys

            let index = 1;
            for (const key of keys) {

                let contactData = localStorage.getItem(key);

                try {
                    console.log("HERE: " + contactData);
                    let contact = new core.Contact();
                    contact.deserialize(contactData);

                    data += `<tr>
                     <th scope="row" class="text-center">${index}</th>
                     <td>${contact.fullName}</td>
                     <td>${contact.contactNumber}</td>
                     <td>${contact.emailAddress}</td>
                     <td class="text-center">
                      <button value="${key}" class="btn btn-warning btn-sm edit">
                       <i class="fa-solid fa-pen-to-square"></i> Edit
                      </button>
                     </td>
                     <td class="text-center">
                      <button value=${key} class="btn btn-danger btn-sm delete">
                       <i class="fa-solid fa-trash-can"></i> Delete
                      </button>
                     </td>
                     </tr>`;
                    index++;
                } catch (error) {
                    console.log("Error deserializing contact data");
                }
            }
            contactList.innerHTML = data;
        }else{
            console.warn("skipping non-contact key");
        }

        const addButton = document.getElementById("addButton");
        if (addButton) {
            addButton.addEventListener("click", () => {
                router.navigate("/edit#add");
            });
        }

        const deleteButtons = document.querySelectorAll("button.delete");
        deleteButtons.forEach((button) => {
            button.addEventListener("click", function () {

                const contactKey = this.value // get the contact key from the button value
                console.log(`[DEBUG] Deleting Contact ID: ${contactKey}`);

                if(!contactKey.startsWith("contact_")){
                    console.error("[DEBUG] Invalid Contact key format: ",contactKey);
                    return;
                }


                if (confirm("Delete Contact, please confirm?")) {
                    localStorage.removeItem(this.value);
                    DisplayContactListPage();

                }
            });
        });

        const editButtons = document.querySelectorAll("button.edit");
        editButtons.forEach((button) => {
            button.addEventListener("click", function () {
                // Concatenate the value from the edit link to the edit.html#{key}
                router.navigate(`/edit#${this.value}`);
            });
        });
    }

    function DisplayEditPage() {
        console.log("Calling DisplayEditPage()...");

        const page = location.hash.split("#")[2];

        const editButton = document.getElementById("editButton");

        switch (page) {
            case "add":
            {
                // Update Browser Tab
                document.title = "Add Contact";

                // Add Contact
                document.querySelector("main > h1").textContent = "Add Contact";

                if (editButton) {
                    editButton.innerHTML = `<i class="fa-solid fa-user-plus"></i> Add`;
                    editButton.classList.remove("btn-primary");
                    editButton.classList.add("btn-primary");
                }

                addEventListenerOnce("editButton", "click", handleAddClick);
                addEventListenerOnce("cancelButton", "click", handleCancelClick);
            }
                break;

            default:
            {
                // Edit Contact
                const contact = new core.Contact();
                const contactData = localStorage.getItem(page);

                if (contactData) {
                    contact.deserialize(contactData);
                }
                document.getElementById("fullName").value = contact.fullName;
                document.getElementById("contactNumber").value = contact.contactNumber;
                document.getElementById("emailAddress").value = contact.emailAddress;

                if (editButton) {
                    editButton.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit`;
                    editButton.classList.remove("btn-primary");
                    editButton.classList.add("btn-primary");
                }

                addEventListenerOnce("editButton", "click",
                    (event) => handleEditClick(event, contact, page));
                addEventListenerOnce("cancelButton", "click", handleCancelClick);


                break;
            }

        }
    }

    /**
     * Listen for changes and update the navigation links
     */
    document.addEventListener("routeLoaded", (event) => {
        const newPath = event.detail;
        console.log(`[INFO] Route Loaded: ${newPath}`);

        LoadHeader().then(() => {
            handlePageLogic(newPath);
        });
    });


    /**
     * Session expires, redirecting to user to the login page.
     */
    window.addEventListener("sessionExpired", () => {
        console.error("[SESSION] redirecting to login page");
        router.navigate("/login");
    });


    function handlePageLogic(path){
        //Update page title
        document.title = pageTitles[path] || "Untitled Page";


        //Check authentication level for protected pages
        const protectedRoutes = ["/contact-list", "/edit"];
        if(protectedRoutes.includes(path)){
            AuthGuard();  /// redirect user to login page
        }



        switch(path){
            case "/":
            case "/home":
                DisplayHomePage();
                break;
            case "/about":
                DisplayAboutPage();
                break;
            case "/product":
                DisplayProductsPage();
                break;
            case "/services":

                DisplayServicesPage();
                break;
            case "/contact":
                DisplayContactPage();
                attachValidationListener();
                break;
            case "/contact-list":
                DisplayContactListPage();
                break;
            case "/edit":
                DisplayEditPage();
                break;
            case "/login":
                DisplayLoginPage();
                break;
            case "/register":
                DisplayRegisterPage();
                break;
            default:
                console.warn(`[WARNING] No display logic found for ${path}`);

        }


    }


    async function Start() {
        console.log("Starting...");
        console.log(`Current document title: ${document.title}`);

        await LoadHeader();
        await LoadFooter();
        AuthGuard();
        updateActiveNavLink();

        const currentPath = location.hash.slice(1) || "/";
        router.loadRoute(currentPath);

        handlePageLogic(currentPath);


    }
    window.addEventListener("DOMContentLoaded", () => {
        console.log("DOM fully loaded and parsed");
        Start();
    });
})();