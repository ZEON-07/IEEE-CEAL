const API_URL = 'https://script.google.com/macros/s/AKfycbw9MXA3T0vC4bg1Rwqz7DY8xRAEQ8EjaQGLjZR6SEE90QoXvEWEfpsinLvJRUPfrGyaug/exec';


document.addEventListener("DOMContentLoaded", function () {
    const year = new URLSearchParams(window.location.search).get("year") || new Date().getFullYear();
    fetchPeopleByYear(year);
});

async function fetchPeopleByYear(year) {
    let res = await fetch(`${API_URL}?year=${year}`);
    let data = await res.json();

    if (!data || !data.people || !Array.isArray(data.people) || data.people.length === 0) {
        alert("This year details not updated yet")
        return;
    }

    CreateCard(data.people);
}

function CreateCard(people) {
    const teamDiv = document.getElementById('team');
    teamDiv.innerHTML = '';
    people.forEach(person => {
        const card = document.createElement('div');
        card.className = 'person-card';
        card.innerHTML = `
        <img class="person-photo" src="${person.photo_url}" alt="${person.Name || ''}" />
        <div class="person-name">${person.Name || ''}</div>
        <div class="person-society">${person.society || ''}</div>
        <div class="person-role">${person.role || ''}</div>
        <div class="person-contact">
        ${person.email ? `<a href="mailto:${person.email}" target="_blank" title="Mail"><i class="fa-solid fa-envelope"></i></a>` : ''}
        ${person.linkedin ? `<a href="https://linkedin.com/in/${person.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
        ${person.instagram ? `<a href="https://instagram.com/${person.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
    </div>
`;
        teamDiv.appendChild(card);
    });
}
