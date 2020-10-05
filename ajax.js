let user_id = ""; // Global variables for security and user authorization
let token = "";
let users = []; // List of users 
let tag = "";
let user = ""; // Currently logged in username


function loginAjax(event) {
    // Abort controller to abort fetch if user inputs nothing
    let controller = new AbortController();
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    // Makes sure user did not just input empty values before logging in
    if (username == "" || password == "") {
        alert("Please enter both username and password!");
        controller.abort();
        return;
    }

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username.toLowerCase(), 'password': password };

    fetch("login_ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log("You've been logged in!");
                user_id = data.user_id;
                token = data.token;
                user = data.username;
                users = data.array;
                // Reset calendar to show events associated with logged in user
                updateCalendar();
                // Change buttons to perform logout and add event functions
                document.getElementById("login").innerHTML = "Logout";
                document.getElementById("register").innerHTML = "Add Event";
                // Adding event listeners
                document.getElementById("login").removeEventListener("click", loginAjax, false);
                document.getElementById("login").addEventListener("click", logoutAjax, false);
                document.getElementById("register").removeEventListener("click", registerAjax, false);
                document.getElementById("register").addEventListener("click", openForm, false);
                document.getElementById("username").setAttribute("type","hidden");
                document.getElementById("password").setAttribute("type","hidden");
                
            }
            else {
                alert("Error:" + data.message);
            }
        })
        .catch(err => console.error(err));
    
}

function logoutAjax(event) {
    fetch("logout_ajax.php", {
        method: 'POST',
        body: JSON.stringify(),
        headers: {'content-type':'application/json'}
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("You have logged out!");
            // Set token to null
            token = "";
            user_id = "";
            users = [];
            user = "";
            closeForm(event);
            updateCalendar();
            // Change buttons back to perform login and register functions
            document.getElementById("register").innerHTML = "Register";
            document.getElementById("login").innerHTML = "Login";
            // Add event listeners
            document.getElementById("login").removeEventListener("click", logoutAjax, false);
            document.getElementById("login").addEventListener("click", loginAjax, false);
            document.getElementById("username").setAttribute("type","text");
            document.getElementById("password").setAttribute("type","password");
            document.getElementById("register").removeEventListener("click", openForm, false);
            document.getElementById("register").addEventListener("click", registerAjax, false);

        }
    })
    
    
}

// Registers new users and returns to login page with empty calendar
function registerAjax(event) {
    let controller = new AbortController();
    const username = document.getElementById("username").value; // Get the username from the form
    const password = document.getElementById("password").value; // Get the password from the form

    if (username == "" || password == "") {
        alert("Please enter both username and password!");
        controller.abort();
        return;
    }

    // Make sure username doesn't already exist
    if (username.toLowerCase() in users) {
        alert("Username already exists!");
        controller.abort();
        return;
    }

    // Make a URL-encoded string for passing POST data:
    const data = { 'username': username.toLowerCase(), 'password': password };

    fetch("register_ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("User has been registered!");
                console.log(JSON.stringify(data));
            }
        })
        .catch(err => console.error(err));
    
}

// Popup form functions from https://www.w3schools.com/howto/howto_js_popup_form.asp
function addAjax(event) {
    event.preventDefault();
    let controller = new AbortController();
    const title = document.getElementById("addtitle").value; 
    const date = document.getElementById("adddate").value; 
    const time = document.getElementById("addtime").value;
    const work = document.getElementsByName("addtag")[0];
    const personal = document.getElementsByName("addtag")[1];
    const school = document.getElementsByName("addtag")[2];
    let t = "";

    // Makes sure all fields are filled before proceeding
    if (typeof title == 'null' || typeof date == 'null' || typeof time == 'null' || title == "" || date == "" || time == "" || !(work.checked || personal.checked || school.checked)) {
        alert("Please fill out all fields!");
        controller.abort();
        return;
    }

    // Gets value of the checked radio button
    if (work.checked) {
        t = work.value;
    }
    if (personal.checked) {
        t = personal.value;
    }
    if (school.checked) {
        t = school.value;
    }

    // Make a URL-encoded string for passing POST data:
    const data = {'token':token,'title': title, 'date': date, 'time': time, 'tag': t};

    fetch("add_event_ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Event added!");
                console.log(JSON.stringify(data));
                // Refresh calendar with new events
                updateCalendar();
            }
            else {
                alert("Couldn't add event: " + data.message);
            }
        })
        .catch(err => console.error(err));

    // Hide add event form 
    closeForm(event);
}

// Function to unhide a hidden form to add or edit events code from https://www.w3schools.com/howto/howto_js_popup_form.asp
function openForm(event) {
    // If user clicks on the add event button, add event form will show up
    if (event.target.id == "register") {
        document.getElementById("addForm").classList.remove("hidden");
        document.getElementById("cancelbtn").addEventListener("click", closeForm, false);
        document.getElementById("addbtn").addEventListener("click", addAjax, false);
    }
    // If user clicks on the edit event icon, edit event form will show up
    if (event.target.classList.contains("edit")) {
        document.getElementById("editForm").classList.remove("hidden");
        // Set data-id attribute with the event_id
        document.getElementById("editbtn").setAttribute("data-id", event.target.dataset.id)
        document.getElementById("editbtn").addEventListener("click", editAjax, false);
        document.getElementById("cancelbtn2").addEventListener("click", closeForm, false);
    }
    // If user clicks on the share event icon...
    if (event.target.classList.contains("share")) {
        document.getElementById("shareForm").classList.remove("hidden");
        // Set data-id attribute with the event_id
        document.getElementById("sharebtn").setAttribute("data-id", event.target.dataset.id)
        document.getElementById("sharebtn").addEventListener("click", shareAjax, false);
        document.getElementById("cancelbtn3").addEventListener("click", closeForm, false);
        // Code to display usernames in a dropdown menu when sharing events from https://stackoverflow.com/questions/170986/what-is-the-best-way-to-add-options-to-a-select-from-as-a-javascript-object-with
        for (key in users) {
            if (key != user) {
                $('#user-options').append('<option value="' + users[key] + '">' + key + '</option>');
            }
            else {
                continue;
            }
        }
    }
}

function closeForm(event) {
    // If user clicks on the cancel button in the add event form or successfully adds an event, removes event listeners
    if (event.target.id == "cancelbtn" || event.target.id == "addbtn" || event.target.id == "") {
        // document.getElementById("addForm").classList.add("hidden");
        document.getElementById("addbtn").removeEventListener("click", addAjax, false);
        document.getElementById("cancelbtn").removeEventListener("click", closeForm, false);
    }
    // If user clicks on the cancel button in the edit event form or successfully edits an event, removes event listeners
    if (event.target.id == "cancelbtn2" || event.target.id == "editbtn") {
        // document.getElementById("editForm").classList.add("hidden");
        document.getElementById("editbtn").removeEventListener("click", editAjax, false);
        document.getElementById("cancelbtn2").removeEventListener("click", closeForm, false);

    }
    else {
        
        document.getElementById("sharebtn").removeEventListener("click", shareAjax, false);
        document.getElementById("cancelbtn3").removeEventListener("click", closeForm, false);
        // Removes usernames from dropdown menu
        document.getElementById("user-options").innerHTML = "";
    }
    // Hides all forms regardless of whats clicked
    document.getElementById("shareForm").classList.add("hidden");
    document.getElementById("addForm").classList.add("hidden");
    document.getElementById("editForm").classList.add("hidden");
    
}

function editAjax(event) {
    event.preventDefault();
    // This is the unique event id that will be used to identify which event to edit
    const event_id = event.target.dataset.id;
    // console.log (event_id);
    let controller = new AbortController();
    const title = document.getElementById("edittitle").value; 
    const date = document.getElementById("editdate").value; 
    const time = document.getElementById("edittime").value;
    const work = document.getElementsByName("edittag")[0];
    const personal = document.getElementsByName("edittag")[1];
    const school = document.getElementsByName("edittag")[2];
    let t = "";

    // Makes sure all fields are filled before proceeding
    if (typeof title == 'null' || typeof date == 'null' || typeof time == 'null' || title == "" || date == "" || time == "" || !(work.checked || personal.checked || school.checked)) {
        alert("Please fill out all fields!");
        controller.abort();
        return;
    }

    // Gets value of the checked radio button
    if (work.checked) {
        t = work.value;
    }
    if (personal.checked) {
        t = personal.value;
    }
    if (school.checked) {
        t = school.value;
    }

    // Make a URL-encoded string for passing POST data:
    const data = {'token':token, 'event_id': event_id, 'title': title, 'date': date, 'time': time, 'tag': t};

    fetch("edit_event_ajax.php", {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Event edited!");
                console.log(JSON.stringify(data));
                updateCalendar();
            }
            else {
                alert("Couldn't edit event: " + data.message);
            }
        })
        .catch(err => console.error(err));

    closeForm(event);

}

function delAjax(event) {
    event.preventDefault();
    // This is the unique event id that will be used to identify which event to delete
    const event_id = event.target.dataset.id;
    const data = {'event_id': event_id, 'token': token};
    
    fetch("del_event_ajax.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Event deleted!");
            console.log(JSON.stringify(data));
            updateCalendar();
        }
        else {
            alert("Couldn't delete event: " + data.message);
        }
    })
    .catch(err => console.error(err));

}
function shareAjax(event) {
    event.preventDefault();
    // This is the unique event id that will be used to identify which event to delete
    const event_id = event.target.dataset.id;
    // Get value of selected option code from https://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
    let temp = document.getElementById("user-options");
    var user_id = temp.options[temp.selectedIndex].value;
    const data = {'event_id': event_id, 'token': token, "user_id": user_id};
    
    fetch("share_event_ajax.php", {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'content-type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Event shared!");
            console.log(JSON.stringify(data));
            updateCalendar();
        }
        else {
            alert("Couldn't share event: " + data.message);
        }
    })
    .catch(err => console.error(err));

    closeForm(event);
}

// Function that toggles the button's active class so the calendar will only display tagged events
function toggleTag(event) {
    let classlist = event.target.classList;
    // If class is already selected and user wants to disable tagged viewing
    if (classlist.contains("active")) {
        classlist.remove("active");
        // Reset global variable 
        tag = "";
    }
    // Removes active classes from other buttons and adds it to the selected tag button
    else {
        let tagbutts = document.getElementsByClassName("tag");
        for (i=0; i<tagbutts.length; i++) {
            tagbutts[i].classList.remove("active");
        }
        classlist.add("active");
        // Set global variable to know which tagged events to get
        tag = event.target.value;
    }
    updateCalendar();
}

// Event listeners for the login page before any user logs in
document.getElementById("login").addEventListener("click", loginAjax, false); // Bind the AJAX call to button click
document.getElementById("register").addEventListener("click",registerAjax, false);

// Event listeners for toggling tag buttons
let tagslist = document.getElementsByClassName("tag");
for (i=0; i<tagslist.length; i++) {
    tagslist[i].addEventListener("click",toggleTag, false);
}
