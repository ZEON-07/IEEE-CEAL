const sheetUploadAPI = 'https://script.google.com/macros/s/AKfycbzwYBil0NmjIJeXtrDOQbmEZiqm7yJGtCcsxas-e4DwMYEHrpsS_r3RFZToJ8bwr5WwmA/exec';
const roles = ["Chairperson", "Vice Chair", "Mentor", "Advisor"];
const societies = ["IEEE CEAL", "IEEE PROFESSIONAL", "CS"];
const people = [];
let uploadedPhotoUrl = '';
let adminName = '';
let uniqueid = '';

const loginBox = document.getElementById('loginBox');
const loginName = document.getElementById('loginName');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loadingPopup = document.getElementById('loadingPopup');

document.addEventListener("DOMContentLoaded", function () {
    const cache = localStorage.getItem('adminAuth');
    let autoLoggedIn = false;
    if (cache) {
        const { adminName: cachedName, uniqueid: cachedId, timestamp } = JSON.parse(cache);
        if (Date.now() - timestamp < 10 * 60 * 1000 && cachedName && cachedId) { // 10 minutes
            adminName = cachedName;
            uniqueid = cachedId;
            loginBox.style.display = 'none';
            document.body.querySelectorAll('body > *:not(#loginBox)').forEach(el => el.style.display = '');
            autoLoggedIn = true;
        } else {
            localStorage.removeItem('adminAuth');
        }
    }
    if (!autoLoggedIn) {
        document.body.querySelectorAll('body > *:not(#loginBox)').forEach(el => el.style.display = 'none');
        loginBox.style.display = 'flex';
    }
    populateDropdown('roleDropdown', roles);
    populateDropdown('societyDropdown', societies);
});
document.getElementById('loginBtn').onclick = async () => {
    const name = loginName.value.trim();
    const password = loginPassword.value;
    if (!name || !password) {
        loginError.textContent = "Enter both name and password";
        loginError.style.display = 'block';
        return;
    }
    try {
        const res = await fetch(sheetUploadAPI, {
            method: 'POST',
            body: JSON.stringify({ action: "AuthenticatePassword", password }),
            headers: { 'Content-Type': 'text/plain' }
        });
        const data = await res.json();
        if (data.status === 'success' && data.uniqueid) {
            adminName = name;
            uniqueid = data.uniqueid;
            localStorage.setItem('adminAuth', JSON.stringify({
                adminName,
                uniqueid,
                timestamp: Date.now()
            }));
            loginBox.style.display = 'none';
            document.body.querySelectorAll('body > *:not(#loginBox)').forEach(el => el.style.display = '');
        } else {
            loginError.textContent = "Wrong password or name";
            loginError.style.display = 'block';
        }
    } catch (err) {
        loginError.textContent = err.message;
        loginError.style.display = 'block';
    }
};
function populateDropdown(id, arr) {
    const sel = document.getElementById(id);
    sel.innerHTML = `<option value="">Select ${id.replace('Dropdown', '')}</option>`;
    arr.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        sel.appendChild(opt);
    });
}
function updateUploadBtnVisibility() {
    document.getElementById('uploadBtn').style.display = people.length > 0 ? 'block' : 'none';
}

const mainTabs = document.querySelectorAll('.main-tab');
const subNavs = {
    execom: document.getElementById('subNavExecom'),
    event: document.getElementById('subNavEvent'),
    gallery: document.getElementById('subNavGallery')
};
const sections = document.querySelectorAll('.section');
const subTabs = document.querySelectorAll('.sub-tab');

function showSection(main, sub) {
    Object.values(subNavs).forEach(nav => nav.classList.remove('active'));
    if (subNavs[main]) subNavs[main].classList.add('active');

    sections.forEach(sec => sec.classList.remove('active'));
    const sectionId = `${main}-${sub}`;
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');

    mainTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.tab === main));
    subTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.section === sectionId));
}

mainTabs.forEach(tab => {
    tab.onclick = () => {
        let main = tab.dataset.tab;
        let sub = 'upload'; // default sub-section
        showSection(main, sub);
    };
});

subTabs.forEach(tab => {
    tab.onclick = () => {
        const [main, sub] = tab.dataset.section.split('-');
        showSection(main, sub);
    };
});

showSection('execom', 'upload');
updateUploadBtnVisibility();

function getYear() {
    return document.getElementById('staticYear').value.trim();
}

document.getElementById('addBtn').onclick = () => {
    const person = {
        name: document.getElementById('name').value.trim(),
        role: document.getElementById('roleDropdown').value,
        society: document.getElementById('societyDropdown').value,
        photo: uploadedPhotoUrl,
        email: document.getElementById('email').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        instagram: document.getElementById('instagram').value.trim()
    };
    if (!person.name || !person.role) {
        alert('Name and Role are required');
        return;
    }
    people.push(person);
    const li = document.createElement('li');
    li.textContent = `${person.name} (${person.role})`;
    document.getElementById('peopleList').appendChild(li);

    document.getElementById('execomForm').reset();
    uploadedPhotoUrl = '';
    updateUploadBtnVisibility();
};

const photoInput = document.getElementById('photo');
const previewDiv = document.getElementById('preview');
const imgUploadBtn = document.getElementById('imguploadBtn');

let selectedFile = null;

photoInput.onchange = function () {
    previewDiv.innerHTML = '';
    selectedFile = this.files[0] || null;
    if (!selectedFile) return;

    const img = document.createElement('img');
    img.style.maxWidth = '120px';
    img.style.margin = '10px 0';
    img.style.borderRadius = '6px';

    const reader = new FileReader();
    reader.onload = e => {
        img.src = e.target.result;
        previewDiv.appendChild(img);
    };
    reader.readAsDataURL(selectedFile);

    const status = document.createElement('div');
    status.id = 'photoStatus';
    status.style.fontSize = '0.95rem';
    status.style.margin = '6px 0 0 0';
    status.style.color = '#555';
    status.textContent = '';
    previewDiv.appendChild(status);
};

imgUploadBtn.onclick = async function () {
    previewDiv.querySelector('#photoStatus')?.remove();
    const status = document.createElement('div');
    status.id = 'photoStatus';
    status.style.fontSize = '0.95rem';
    status.style.margin = '6px 0 0 0';
    status.style.color = '#555';
    previewDiv.appendChild(status);

    uploadedPhotoUrl = '';
    if (!selectedFile) {
        status.textContent = 'No image selected';
        status.style.color = 'red';
        return;
    }

    status.textContent = 'Uploading image...';
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "execom");
    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dmiwesddu/upload", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        if (data.secure_url) {
            uploadedPhotoUrl = data.secure_url;
            status.textContent = 'Image uploaded';
            status.style.color = 'green';
            const img = previewDiv.querySelector('img');
            if (img) img.src = uploadedPhotoUrl;
        } else {
            status.textContent = 'Upload failed';
            status.style.color = 'red';
            alert("Upload failed: " + JSON.stringify(data));
        }
    } catch (err) {
        status.textContent = 'Upload error';
        status.style.color = 'red';
        alert("Error: " + err.message);
    }
};
async function GetUploadToken() {
    const dataToUpload = {
        action: 'PostRequest',
        name: adminName,
        uniqueid: uniqueid
    };
    try {
        const res = await fetch(sheetUploadAPI, {
            method: 'POST',
            body: JSON.stringify(dataToUpload),
            headers: { 'Content-Type': 'text/plain' }
        });
        const result = await res.json();
        if (result.status === 'success' && result.uploadtoken) {
            return result.uploadtoken;
        } else {
            alert('Upload token error: ' + (result.message || 'Unknown error'));
            return null;
        }
    } catch (err) {
        alert('Upload error: ' + err.message);
        return null;
    }
}
document.getElementById('uploadBtn').onclick = async () => {
    document.querySelectorAll('input, button, select').forEach(el => el.disabled = true);
    loadingPopup.style.display = 'flex';
    const year = getYear();
    const token = await GetUploadToken();
    if (token == null) {
        loadingPopup.style.display = 'none';
        document.querySelectorAll('input, button, select').forEach(el => el.disabled = false);
        return;
    }
    const dataToUpload = {
        action: "FreshUpload",
        name: adminName,
        uploadtoken: token,
        year,
        people: people.map(({ name, role, society, photo, email, linkedin, instagram }) => ({
            name, role, society, photo, email, linkedin, instagram
        }))
    };
    try {
        const res = await fetch(sheetUploadAPI, {
            method: 'POST',
            body: JSON.stringify(dataToUpload),
            headers: { 'Content-Type': 'text/plain' }
        });
        const result = await res.json();
        alert(result.status === 'success' ? 'Data uploaded to sheet!' : 'Upload failed: ' + (result.message || 'Unknown error'));
    } catch (err) {
        alert('Upload error: ' + err.message);
    }
    loadingPopup.style.display = 'none';
    document.querySelectorAll('input, button, select').forEach(el => el.disabled = false);
    resetPeopleList();
    updateUploadBtnVisibility();
};

function resetPeopleList() {
    people.length = 0;
    document.getElementById('peopleList').innerHTML = '';
    updateUploadBtnVisibility();
}