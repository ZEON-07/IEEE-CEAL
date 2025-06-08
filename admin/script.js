const sheetUploadAPI = 'https://script.google.com/macros/s/AKfycbzwYBil0NmjIJeXtrDOQbmEZiqm7yJGtCcsxas-e4DwMYEHrpsS_r3RFZToJ8bwr5WwmA/exec';
const roles = ["Chairperson", "Vice Chair", "Mentor", "Advisor"];
const societies = ["IEEE CEAL", "IEEE PROFESSIONAL", "CS"];
const people = [];
let uploadedPhotoUrl = '';
let uniqueid = '';

const loginBox = document.getElementById('loginBox');
const loginPassword = document.getElementById('loginPassword');
const loginError = document.getElementById('loginError');
const loadingPopup = document.getElementById('loadingPopup');

document.addEventListener("DOMContentLoaded", function () {
    const cache = localStorage.getItem('adminAuth');
    let autoLoggedIn = false;
    if (cache) {
        const { uniqueid: cachedId, timestamp } = JSON.parse(cache);
        if (Date.now() - timestamp < 10 * 60 * 1000 && cachedId) {
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
    FillDropdown('roleDropdown', roles);
    FillDropdown('societyDropdown', societies);
    showSection('subNavExecom', 'execom-upload');
    updateUploadBtnVisibility();
});

document.getElementById('loginBtn').onclick = async () => {
    const password = loginPassword.value;
    if (!password) {
        loginError.textContent = "Enter password";
        loginError.style.display = 'block';
        return;
    }
    try {
        const res = await fetch(sheetUploadAPI, {
            method: 'POST',
            body: JSON.stringify({ action: "AuthenticatePassword", password: password }),
            headers: { 'Content-Type': 'text/plain' }
        });
        const data = await res.json();
        if (data.status === 'success' && data.uniqueid) {
            uniqueid = data.uniqueid;
            localStorage.setItem('adminAuth', JSON.stringify({
                uniqueid,
                timestamp: Date.now()
            }));
            loginBox.style.display = 'none';
            document.body.querySelectorAll('body > *:not(#loginBox)').forEach(el => el.style.display = '');
            showSection('subNavExecom', 'execom-upload');
            updateUploadBtnVisibility();
        } else {
            loginError.textContent = "Wrong password";
            loginError.style.display = 'block';
        }
    } catch (err) {
        loginError.textContent = err.message;
        loginError.style.display = 'block';
    }
};

function FillDropdown(id, arr) {
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

function showSection(subNavId, sectionId) {
    ['subNavExecom', 'subNavEvent', 'subNavGallery'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    document.getElementById(subNavId).classList.add('active');
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (sectionId === 'execom-edit') LoadExecomEdit();
}
document.getElementById('execomTab').onclick = () => showSection('subNavExecom', 'execom-upload');
document.getElementById('eventTab').onclick = () => showSection('subNavEvent', 'event-upload');
document.getElementById('galleryTab').onclick = () => showSection('subNavGallery', 'gallery-upload');

document.getElementById('execomUploadTab').onclick = () => showSection('subNavExecom', 'execom-upload');
document.getElementById('execomEditTab').onclick = () => showSection('subNavExecom', 'execom-edit');
document.getElementById('execomDeleteTab').onclick = () => showSection('subNavExecom', 'execom-delete');

document.getElementById('eventUploadTab').onclick = () => showSection('subNavEvent', 'event-upload');
document.getElementById('eventEditTab').onclick = () => showSection('subNavEvent', 'event-edit');
document.getElementById('eventDeleteTab').onclick = () => showSection('subNavEvent', 'event-delete');

document.getElementById('galleryUploadTab').onclick = () => showSection('subNavGallery', 'gallery-upload');

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

document.getElementById('uploadBtn').onclick = async () => {
    document.querySelectorAll('input, button, select').forEach(el => el.disabled = true);
    loadingPopup.style.display = 'flex';
    const year = getYear();
    const dataToUpload = {
        action: "FreshUpload",
        uniqueid: uniqueid,
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
async function LoadExecomEdit() {
    if (!uniqueid) {
        alert("login with password");
        return;
    }
    try {
        let res = await fetch(`${sheetUploadAPI}?uniqueid=${uniqueid}&edityear=2025`);
        let data = await res.json();
        if (!data || !data.people) return;
        CreateEditForms(data.people, data.year);
    } catch (err) {
        alert(`error\n${err.message}`);
    }
}

function CreateEditForms(peopleArr, year) {
    const insertdiv = document.getElementById('execom-edit');
    insertdiv.innerHTML = '';
    peopleArr.forEach((person, idx) => {
        const form = document.createElement('form');
        form.className = 'edit-person-form';
        form.onsubmit = e => e.preventDefault();

        // Build role and society dropdowns
        const roleOptions = roles.map(role => `<option value="${role}"${role === person.role ? ' selected' : ''}>${role}</option>`).join('');
        const societyOptions = societies.map(soc => `<option value="${soc}"${soc === person.society ? ' selected' : ''}>${soc}</option>`).join('');

        form.innerHTML = `
            <input type="text" name="name" value="${person.name}" placeholder="Name">
            <select name="role">${roleOptions}</select>
            <select name="society">${societyOptions}</select>
            <input type="email" name="email" value="${person.email || ''}" placeholder="Email">
            <input type="text" name="linkedin" value="${person.linkedin || ''}" placeholder="LinkedIn">
            <input type="text" name="instagram" value="${person.instagram || ''}" placeholder="Instagram">
            <button type="button" class="edit-upload-btn">Upload</button>
            <span class="edit-status"></span>
        `;

        form.querySelector('.edit-upload-btn').onclick = async () => {
            const personData = {
                name: form.name.value.trim(),
                role: form.role.value,
                society: form.society.value,
                photo: form.photo.value.trim(),
                email: form.email.value.trim(),
                linkedin: form.linkedin.value.trim(),
                instagram: form.instagram.value.trim()
            };
            const statusSpan = form.querySelector('.edit-status');
            statusSpan.textContent = 'Uploading';
            statusSpan.style.color = '#555';
            const dataToUpload = {
                action: "EditExecom",
                uniqueid: uniqueid,
                year: year,
                person: personData
            };
            try {
                const res = await fetch(sheetUploadAPI, {
                    method: 'POST',
                    body: JSON.stringify(dataToUpload),
                    headers: { 'Content-Type': 'text/plain' }
                });
                const result = await res.json();
                if (result.status === 'success') {
                    statusSpan.textContent = 'Saved';
                    statusSpan.style.color = 'green';
                } else {
                    statusSpan.textContent = 'Failed';
                    statusSpan.style.color = 'red';
                }
            } catch (err) {
                statusSpan.textContent = 'Error';
                statusSpan.style.color = 'red';
            }
        };

        insertdiv.appendChild(form);
    });
}