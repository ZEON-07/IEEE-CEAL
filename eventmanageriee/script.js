
let allEventsData = []; //global variable to store all events data
async function fetchData() {
    let result = await fetch(`./ieee.json`); //async function is used to wait until the data is fetched
    let data = await result.json(); //it will convert the fetched data into json 
    allEventsData = data.events; //store the events array from the fetched data into the global variable
    datesorting(); //it will call the datesorting function to attach event listeners to the buttons
    createcard(data.events);   //it will call the createcard function with the events array from the fetched data which only send events
} //replication of cards and injecting data into cards 
function createcard(events){ 
const cardContainer = document.getElementById('card-container'); // Get the container element where cards will be added
cardContainer.innerHTML = ''; // Clear any existing content in the container
events.forEach(event => {  //Foreach loop to iterate through each event in the events array
    const card = document.createElement('div'); // Create a new div element for the card
    card.className = 'card'; // Set the class name for styling
    let cstr =""
    event.coordinators.forEach(coordinator => {
        cstr+=`<div class="detailsrow"><h2>coordinator:</h2><p>${coordinator.coordinator_name}</p></div>
        <div class="detailsrow"><h2>coordinator Number:</h2><p>${coordinator.coordinator_number}</p></div>
        `
        console.log(cstr);
    });
    let clubsstr =""
    event.clubs.forEach(club => {
        clubsstr+=`<div class="detailsrow"><h2>club:</h2><p>${club.club_name}</p></div>`
    }
    )
    card.innerHTML = `
        <div class="imageslid"><img src="${event.image_name}" alt=""></div>
        <div class="name"><h1 id="event-head">${event.name}</h1></div>
        <div class="deatails">
            <div class="detailsrow"><h2>venue:</h2><p>${event.venue}</p></div>
            <div class="detailsrow"><h2>eventdetails:</h2><p>${event.eventName}</p></div>
            <div class="detailsrow"><h2>date:</h2><p>${event.dateandtime}</p></div>
            <div class="detailsrow"><h2>fee:</h2><p>${event.fee}</p></div>
            ${cstr}
            ${clubsstr}

        </div>
        <div class="buttons">
            <a target="_blank" href="${event.link}" class="register-btn">Register</a>
        </div>
    `; // Set the inner HTML of the card with event 
    cardContainer.appendChild(card); // Append the card to the container
});
observeCards();
}

function observeCards() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target); // Animate only once
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => observer.observe(card));
}

function datesorting() {
    document.querySelector('.all-events').addEventListener('click', () => {
        createcard(allEventsData);
        setActiveButton('.all-events');
    });

    document.querySelector('.upcoming-events').addEventListener('click', () => {
        const currentDate = new Date();
        const upcoming = allEventsData.filter(e => new Date(e.dateandtime) > currentDate);
        createcard(upcoming);
        setActiveButton('.upcoming-events');
    });

    document.querySelector('.past-events').addEventListener('click', () => {
        const currentDate = new Date();
        const past = allEventsData.filter(e => new Date(e.dateandtime) < currentDate);
        createcard(past);
        setActiveButton('.past-events');
    });
}

function setActiveButton(selector) {
    document.querySelectorAll('.nav-buttons button').forEach(b => b.classList.remove('active'));
    document.querySelector(selector).classList.add('active');
}

document.addEventListener('DOMContentLoaded', fetchData); // Event listener to call fetchData when the DOM is fully loaded 
