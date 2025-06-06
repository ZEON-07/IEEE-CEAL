document.addEventListener("DOMContentLoaded", function () {
    const year = new URLSearchParams(window.location.search).get("year") || new Date().getFullYear();
    fetchPeopleByYear(year);
});

async function fetchPeopleByYear(year) {
    let res = await fetch(`${API_URL}?year=${year}`);
    let data = await res.json();

    // Adjusted for new JSON structure
    if (!data || !data.heading || !data.heading.Society) {
        alert("This year details not updated yet");
        return;
    }
    CreateSocietySections(data.heading.Society);
}

function CreateSocietySections(societies) {
    const teamDiv = document.getElementById('team');
    teamDiv.innerHTML = '';

    // Get society names in the order they appear in the JSON
    Object.keys(societies).forEach(societyName => {
        // Create society header
        const societyHeader = document.createElement('h1');
        societyHeader.className = 'society-header';
        societyHeader.textContent = societyName;
        teamDiv.appendChild(societyHeader);

        // Create a container for this society's people
        const societyContainer = document.createElement('div');
        societyContainer.className = 'society-container';

        societies[societyName].forEach((person, idx) => {
            const card = document.createElement('div');
            card.className = 'person-card';
            card.style.setProperty('--card-delay', `${idx * 0.08}s`);
            card.innerHTML = `
                <img class="person-photo" src="${person.photo_url}" alt="${person.name || ''}" />
                <div class="person-name">${person.name || ''}</div>
                <div class="person-society">${person.society || ''}</div>
                <div class="person-role">${person.role || ''}</div>
                <div class="person-contact">
                    ${person.email ? `<a href="mailto:${person.email}" target="_blank" title="Mail"><i class="fa-solid fa-envelope"></i></a>` : ''}
                    ${person.linkedin ? `<a href="https://linkedin.com/in/${person.linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>` : ''}
                    ${person.instagram ? `<a href="https://instagram.com/${person.instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>` : ''}
                </div>
            `;
            societyContainer.appendChild(card);
        });

        teamDiv.appendChild(societyContainer);
    });
}