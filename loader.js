const API_URL = 'https://script.google.com/macros/s/AKfycbzwYBil0NmjIJeXtrDOQbmEZiqm7yJGtCcsxas-e4DwMYEHrpsS_r3RFZToJ8bwr5WwmA/exec';
document.addEventListener("DOMContentLoaded", () => {
  // Load navbar from site root
  fetch("/nav-bar.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("NavBar").innerHTML = data;

      const navContainer = document.querySelector(".nav-container");
      const scrollThreshold = 50;
      window.addEventListener("scroll", () => {
        if (window.scrollY > scrollThreshold) {
          navContainer.classList.add("scrolled");
        } else {
          navContainer.classList.remove("scrolled");
        }
      });
    });

  // Load footer from site root
  fetch("/footer.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("Footer").innerHTML = data;

      const yearSpan = document.getElementById("yr");
      if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
      }
    });
  // to load list in navbar
  FetchAllYears();
});
async function FetchAllYears() {
  let res = await fetch(`${API_URL}?allyears`);
  let data = await res.json();
  if (!data || !data.allyears) {
    return;
  }
  AddOptions(data.allyears)
}
function AddOptions(years) {
  const Dropdown = document.getElementById('execom_dropdown');
  Dropdown.innerHTML = '';
  if (years == null) {
    const list = document.createElement('li');
    list.innerHTML = `No Execom loaded`;
    Dropdown.appendChild(list);
  }
  years.forEach(year => {
    const list = document.createElement('li');
    list.innerHTML = `Execom ${year}`;
    list.onclick = () => {
      window.location.href = `execom/index.html?year=${year}`;
    };
    Dropdown.appendChild(list);
  });
}

