const sheetUploadAPI = 'https://script.google.com/macros/s/AKfycbw9MXA3T0vC4bg1Rwqz7DY8xRAEQ8EjaQGLjZR6SEE90QoXvEWEfpsinLvJRUPfrGyaug/exec';
const people = [];
let uploadedPhotoUrl = '';

const formSection = document.getElementById('formSection');
const yearInput = document.getElementById('yearInput');
const yearSection = document.getElementById('yearSection');

document.getElementById('setYearBtn').onclick = () => {
    year = yearInput.value.trim();
    if (!year || isNaN(year)) return alert('Enter a valid year');
    formSection.style.display = 'flex';
    yearSection.style.display = 'none';
};

const roleSelect = document.getElementById('roleSelect');
const customRole = document.getElementById('customRole');
roleSelect.onchange = () => {
    customRole.style.display = roleSelect.value === 'other' ? 'block' : 'none';
};

const societySelect = document.getElementById('societySelect');
const customSociety = document.getElementById('customSociety');
societySelect.onchange = () => {
    customSociety.style.display = societySelect.value === 'other' ? 'block' : 'none';
};

const photoInput = document.getElementById('photo');
const photoPreview = document.getElementById('photoPreview');

const CLOUD_NAME = "dmiwesddu";
const UPLOAD_PRESET = "execom";

photoInput.onchange = async function () {
    const file = photoInput.files[0];
    if (!file) {
        photoPreview.style.display = 'none';
        uploadedPhotoUrl = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        photoPreview.src = e.target.result;
        photoPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        if (data.secure_url) {
            photoPreview.style.boxShadow = '0 0 10px 2px rgba(0, 85, 164, 0.68)';
            uploadedPhotoUrl = data.secure_url;
        } else {
            alert("Upload failed: " + JSON.stringify(data));
        }
    } catch (err) {
        alert("Error: " + err.message);
    }
}

document.getElementById('addBtn').onclick = () => {
    const person = {
        name: document.getElementById('name').value.trim(),
        role: roleSelect.value === 'other' ? customRole.value.trim() : roleSelect.value,
        society: societySelect.value === 'other' ? customSociety.value.trim() : societySelect.value,
        photo: uploadedPhotoUrl,
        email: document.getElementById('email').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        instagram: document.getElementById('instagram').value.trim()
    };

    if (!person.name || !person.role) {
        alert('Name, Role are required');
        return;
    }
    if (!person.photo) {
        alert('Please upload a photo and wait for it to finish uploading.');
        return;
    }

    people.push(person);

    const li = document.createElement('li');
    li.innerHTML = `<b>${person.name} -> ${person.role}</b><br>`;
    document.getElementById('peopleList').appendChild(li);

    document.getElementById('name').value = '';
    customRole.value = '';
    roleSelect.selectedIndex = 0;
    customRole.style.display = 'none';

    customSociety.value = '';
    societySelect.selectedIndex = 0;
    customSociety.style.display = 'none';

    photoInput.value = '';
    photoPreview.src = '';
    photoPreview.style.display = 'none';
    photoPreview.style.boxShadow = '';
    uploadedPhotoUrl = '';

    document.getElementById('email').value = '';
    document.getElementById('linkedin').value = '';
    document.getElementById('instagram').value = '';

    document.getElementById('uploadBtn').style.display = 'inline-block';
};

document.getElementById('uploadBtn').onclick = async () => {
    const dataToUpload = {
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

    year = '';
    yearInput.value = '';
    people.length = 0;
    document.getElementById('peopleList').innerHTML = '';
    formSection.style.display = 'none';
    document.getElementById('uploadBtn').style.display = 'none';
    yearSection.style.display = 'flex';
};