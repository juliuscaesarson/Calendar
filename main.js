// Copied from 330 wiki
// For our purposes, we can keep the current month in a variable in the global scope
var currentMonth = new Month(2020, 6); // July 2020
let weekdays = ["S","M","T","W","Th","F","S"];
let months = ["January","February","March","April","May","June","July","August","September","October","November","December"]

// Change the month when the "next" button is pressed
document.getElementById("next").addEventListener("click", function(event){
	currentMonth = currentMonth.nextMonth(); // Previous month would be currentMonth.prevMonth()
	updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
	// alert("The new month is "+currentMonth.month+" "+currentMonth.year);
}, false);

// Change the month when the "prev" button is pressed
document.getElementById("prev").addEventListener("click", function(event){
	currentMonth = currentMonth.prevMonth(); // Previous month would be currentMonth.prevMonth()
	updateCalendar(); // Whenever the month is updated, we'll need to re-render the calendar in HTML
	// alert("The new month is "+currentMonth.month+ " "+currentMonth.year);
}, false);

function listWeeks() {
	let row = document.getElementsByClassName("week");
	for (var i=0; i<row.length;i++) {
		row[i].innerText = weekdays[i];
	}
}

// If page refreshes, this function gets the user_id and token from previous session and keeps user logged in
function sessionAjax() {
    fetch("session_ajax.php", {
            method: 'POST',
            body: JSON.stringify(),
            headers: { 'content-type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                user_id = data.user_id;
				token = data.token;
				user = data.username;
				users = data.array;
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
        })
        .catch(err => console.error(err));
	updateCalendar();
}

// This updateCalendar() function only alerts the dates in the currently specified month.  You need to write
// it to modify the DOM (optionally using jQuery) to display the days and weeks in the current month.
function updateCalendar(){
	// Clears calendar 
	$(".col").empty();
	// Lists the weekdays in the top row of the calendar
	listWeeks();
	// Gets current weeks of the month being displayed
    var weeks = currentMonth.getWeeks();
    document.getElementById("year").innerText = currentMonth.year;
    document.getElementById("month").innerText = months[currentMonth.month];

	// Checks if user is logged in 
	if (token == "" || user_id == "") {
		for(var w in weeks){
			// Gets the date objects in each week
			var days = weeks[w].getDates();
			// days contains normal JavaScript Date objects.
			
			// alert("Week starting on "+days[0]);
			
			for(var d in days){
				// You can see console.log() output in your JavaScript debugging tool, like Firebug,
				// WebWit Inspector, or Dragonfly.
				// console.log(days[d].toISOString());

				// Makes sure all date objects exist before putting into calendar
				if (typeof document.getElementsByClassName("days")[w] == 'undefined') {
					continue
				}
				// Lists the days for each month
				else {
					document.getElementsByClassName("days")[w].children[d].innerHTML = "<strong>" + days[d].toISOString().slice(8,10) + "</strong>";
				}
			}
		}		
	}
	
	else {
		// Send token for validation on server side
		const data = {"token":token};
		fetch("get_events_ajax.php", {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {'content-type':'application/json'}
		})
		.then(response => response.json())
		.then(data => {
			if (data.success) {
				console.log(JSON.stringify(data));
				// Gets the array of events from json 
				let array_events = data.array;
				// Array of dom elements that represent each day of the month
				let row = document.getElementsByClassName("days");
				// list dates
				for(var w in weeks){
					var days = weeks[w].getDates();
					// days contains normal JavaScript Date objects.
					
					// alert("Week starting on "+days[0]);
					
					for(var d in days){
						// You can see console.log() output in your JavaScript debugging tool, like Firebug,
						// WebWit Inspector, or Dragonfly.
						// console.log(days[d].toISOString());

						// Lists the days for each month
						if (typeof row[w] == 'undefined') {
							continue
						}
						else {
							row[w].children[d].innerHTML = "<strong>" + days[d].toISOString().slice(8,10) + "</strong>";
							for (var i = 0; i < array_events.length; i+=5) {
								// Check if the event needs to be printed when month and dates match
								if (array_events[i+2].slice(5,7) == days[d].toISOString().slice(5,7) && array_events[i+2].slice(8,10) == days[d].toISOString().slice(8,10) && array_events[i+2].slice(0,4) == days[d].toISOString().slice(0,4)) {
									// Checks if a tag button is toggled and only shows events with that specific tag
									if (tag == array_events[i+4] && tag == "w") {
										// Temporary dom element that will become each event in the array_events
										let temp = document.createElement("div");
										// Span element that will contain the text of the event title
										let event_node = document.createElement("span");
										// Span element that will contain the time of the event
										let time_node = document.createElement("span");
										// Add class "event" to the temp node
										temp.setAttribute("class","work event");
										// Set the inner text of the span with event title
										event_node.innerText = array_events[i+1];
										// Set the inner text of the span with event time
										time_node.innerText = array_events[i+3].slice(0,5);
										// Append event title to div
										temp.append(event_node);
										// Use Font Awesome icons to create an edit, share, and delete button
										let editbtn = document.createElement("i");
										let delbtn = document.createElement("i");
										let sharebtn = document.createElement("i");
										// Set classes
										editbtn.setAttribute("class","fa fa-edit edit");
										delbtn.setAttribute("class", "fa fa-trash delete");
										sharebtn.setAttribute("class","fa fa-share share");
										// Set data-id for each button as the event's unique id
										editbtn.setAttribute("data-id",array_events[i]);
										delbtn.setAttribute("data-id",array_events[i]);
										sharebtn.setAttribute("data-id",array_events[i]);
										// Append delete icon
										temp.append(delbtn);
										// Append edit icon
										temp.append(editbtn);
										// Append share icon
										temp.append(sharebtn);
										// Append time of event
										temp.append(time_node);
										// Append everything to calendar date
										row[w].children[d].append(temp);
										
									}
									if (tag == array_events[i+4] && tag == "p") {
										// Temporary dom element that will become each event in the array_events
										let temp = document.createElement("div");
										// Span element that will contain the text of the event title
										let event_node = document.createElement("span");
										// Span element that will contain the time of the event
										let time_node = document.createElement("span");
										// Add class "event" to the temp node
										temp.setAttribute("class","personal event");
										// Set the inner text of the span with event title
										event_node.innerText = array_events[i+1];
										// Set the inner text of the span with event time
										time_node.innerText = array_events[i+3].slice(0,5);
										// Append event title to div
										temp.append(event_node);
										// Use Font Awesome icons to create an edit, share, and delete button
										let editbtn = document.createElement("i");
										let delbtn = document.createElement("i");
										let sharebtn = document.createElement("i");
										// Set classes
										editbtn.setAttribute("class","fa fa-edit edit");
										delbtn.setAttribute("class", "fa fa-trash delete");
										sharebtn.setAttribute("class","fa fa-share share");
										// Set data-id for each button as the event's unique id
										editbtn.setAttribute("data-id",array_events[i]);
										delbtn.setAttribute("data-id",array_events[i]);
										sharebtn.setAttribute("data-id",array_events[i]);
										// Append delete icon
										temp.append(delbtn);
										// Append edit icon
										temp.append(editbtn);
										// Append share icon
										temp.append(sharebtn);
										// Append time of event
										temp.append(time_node);
										// Append everything to calendar date
										row[w].children[d].append(temp);
									}
									if (tag == array_events[i+4] && tag == "s") {
										// Temporary dom element that will become each event in the array_events
										let temp = document.createElement("div");
										// Span element that will contain the text of the event title
										let event_node = document.createElement("span");
										// Span element that will contain the time of the event
										let time_node = document.createElement("span");
										// Add class "event" to the temp node
										temp.setAttribute("class","school event");
										// Set the inner text of the span with event title
										event_node.innerText = array_events[i+1];
										// Set the inner text of the span with event time
										time_node.innerText = array_events[i+3].slice(0,5);
										// Append event title to div
										temp.append(event_node);
										// Use Font Awesome icons to create an edit, share, and delete button
										let editbtn = document.createElement("i");
										let delbtn = document.createElement("i");
										let sharebtn = document.createElement("i");
										// Set classes
										editbtn.setAttribute("class","fa fa-edit edit");
										delbtn.setAttribute("class", "fa fa-trash delete");
										sharebtn.setAttribute("class","fa fa-share share");
										// Set data-id for each button as the event's unique id
										editbtn.setAttribute("data-id",array_events[i]);
										delbtn.setAttribute("data-id",array_events[i]);
										sharebtn.setAttribute("data-id",array_events[i]);
										// Append delete icon
										temp.append(delbtn);
										// Append edit icon
										temp.append(editbtn);
										// Append share icon
										temp.append(sharebtn);
										// Append time of event
										temp.append(time_node);
										// Append everything to calendar date
										row[w].children[d].append(temp);
									}
									if (typeof tag == 'null' || tag == "") {
										// Temporary dom element that will become each event in the array_events
										let temp = document.createElement("div");
										// Span element that will contain the text of the event title
										let event_node = document.createElement("span");
										// Span element that will contain the time of the event
										let time_node = document.createElement("span");
										// Add class "event" and tag to the temp node 
										switch (array_events[i+4]) {
											case "w":
												temp.setAttribute("class","work event");
												break;
											case "p":
												temp.setAttribute("class","personal event");
												break;
											case "s":
												temp.setAttribute("class","school event");
												break;
										}
										// Set the inner text of the span with event title
										event_node.innerText = array_events[i+1];
										// Set the inner text of the span with event time
										time_node.innerText = array_events[i+3].slice(0,5);
										// Append event title to div
										temp.append(event_node);
										// Use Font Awesome icons to create an edit, share, and delete button
										let editbtn = document.createElement("i");
										let delbtn = document.createElement("i");
										let sharebtn = document.createElement("i");
										// Set classes
										editbtn.setAttribute("class","fa fa-edit edit");
										delbtn.setAttribute("class", "fa fa-trash delete");
										sharebtn.setAttribute("class","fa fa-share share");
										// Set data-id for each button as the event's unique id
										editbtn.setAttribute("data-id",array_events[i]);
										delbtn.setAttribute("data-id",array_events[i]);
										sharebtn.setAttribute("data-id",array_events[i]);
										// Append delete icon
										temp.append(delbtn);
										// Append edit icon
										temp.append(editbtn);
										// Append share icon
										temp.append(sharebtn);
										// Append time of event
										temp.append(time_node);
										// Append everything to calendar date
										row[w].children[d].append(temp);
									}
									else {
										continue;
									}
									
									
									
								}
							}
						}
					}
				}
				// After all events have been displayed, select all icons for edit and delete for each event
				let editbutts = document.querySelectorAll(".fa-edit");
				let delbutts = document.querySelectorAll(".fa-trash");
				let sharebutts = document.querySelectorAll(".fa-share");
				// Loop through each icon and add event listeners to each icon
				for (i = 0; i < editbutts.length; i++) {
					editbutts[i].addEventListener("click", openForm, false);
					delbutts[i].addEventListener("click", delAjax, false);
					sharebutts[i].addEventListener("click",openForm, false);
				}

			}
		})
		.catch(err => console.error(err));

	}
}

// Copied from 330 wiki
(function () {
	"use strict";

	/* Date.prototype.deltaDays(n)
	 * 
	 * Returns a Date object n days in the future.
	 */
	Date.prototype.deltaDays = function (n) {
		// relies on the Date object to automatically wrap between months for us
		return new Date(this.getFullYear(), this.getMonth(), this.getDate() + n);
	};

	/* Date.prototype.getSunday()
	 * 
	 * Returns the Sunday nearest in the past to this date (inclusive)
	 */
	Date.prototype.getSunday = function () {
		return this.deltaDays(-1 * this.getDay());
	};
}());

/** Week
 * 
 * Represents a week.
 * 
 * Functions (Methods):
 *	.nextWeek() returns a Week object sequentially in the future
 *	.prevWeek() returns a Week object sequentially in the past
 *	.contains(date) returns true if this week's sunday is the same
 *		as date's sunday; false otherwise
 *	.getDates() returns an Array containing 7 Date objects, each representing
 *		one of the seven days in this month
 */
function Week(initial_d) {
	"use strict";

	this.sunday = initial_d.getSunday();
		
	
	this.nextWeek = function () {
		return new Week(this.sunday.deltaDays(7));
	};
	
	this.prevWeek = function () {
		return new Week(this.sunday.deltaDays(-7));
	};
	
	this.contains = function (d) {
		return (this.sunday.valueOf() === d.getSunday().valueOf());
	};
	
	this.getDates = function () {
		var dates = [];
		for(var i=0; i<7; i++){
			dates.push(this.sunday.deltaDays(i));
		}
		return dates;
	};
}

/** Month
 * 
 * Represents a month.
 * 
 * Properties:
 *	.year == the year associated with the month
 *	.month == the month number (January = 0)
 * 
 * Functions (Methods):
 *	.nextMonth() returns a Month object sequentially in the future
 *	.prevMonth() returns a Month object sequentially in the past
 *	.getDateObject(d) returns a Date object representing the date
 *		d in the month
 *	.getWeeks() returns an Array containing all weeks spanned by the
 *		month; the weeks are represented as Week objects
 */
function Month(year, month) {
	"use strict";
	
	this.year = year;
	this.month = month;
	
	this.nextMonth = function () {
		return new Month( year + Math.floor((month+1)/12), (month+1) % 12);
	};
	
	this.prevMonth = function () {
		return new Month( year + Math.floor((month-1)/12), (month+11) % 12);
	};
	
	this.getDateObject = function(d) {
		return new Date(this.year, this.month, d);
	};
	
	this.getWeeks = function () {
		var firstDay = this.getDateObject(1);
		var lastDay = this.nextMonth().getDateObject(0);
		
		var weeks = [];
		var currweek = new Week(firstDay);
		weeks.push(currweek);
		while(!currweek.contains(lastDay)){
			currweek = currweek.nextWeek();
			weeks.push(currweek);
		}
		
		return weeks;
	};
}

document.addEventListener("DOMContentLoaded", sessionAjax, false);
