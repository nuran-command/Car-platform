const API_URL = '/api'; 
let token = localStorage.getItem('token');
let isRegister = false;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchCars();
});

function checkAuth() {
    const isLoggedIn = !!token;
    document.getElementById('loginBtn').style.display = isLoggedIn ? 'none' : 'block';
    document.getElementById('addCarBtn').style.display = isLoggedIn ? 'block' : 'none';
    document.getElementById('logoutBtn').style.display = isLoggedIn ? 'block' : 'none';
    
    const myCarsLink = document.getElementById('myCarsLink');
    if (myCarsLink) {
        myCarsLink.parentElement.style.display = isLoggedIn ? 'block' : 'none';
    }
}



// Fetch Cars
async function fetchCars(query = '') {
    const spinner = document.getElementById('loading');
    const grid = document.getElementById('car-grid');
    
    spinner.style.display = 'block';
    grid.innerHTML = '';

    try {
        const res = await fetch(`${API_URL}/cars${query}`);
        const cars = await res.json();
        spinner.style.display = 'none';

        if (cars.length === 0) {
            grid.innerHTML = '<p style="text-align:center; grid-column: 1/-1;">No cars found.</p>';
            return;
        }

        cars.forEach(car => {
            const card = document.createElement('div');
            card.className = 'car-card';
            const imgUrl = car.imageUrl || 'https://static9.depositphotos.com/1579454/1194/i/450/depositphotos_11943255-stock-photo-presentation-of-the-new-car.jpg';
            
            card.innerHTML = `
                <div class="card-image" style="background-image: url('${imgUrl}')"></div>
                <div class="card-details">
                    <h3>${car.brand} ${car.model}</h3>
                    <div class="meta">
                        <span>${car.year}</span>
                        <span>${car.condition || 'Used'}</span>
                    </div>
                    <div class="price">$${car.price.toLocaleString()}</div>
                    <button class="view-btn">VIEW DETAILS</button>
                </div>
            `;
        
            card.querySelector('.view-btn').addEventListener('click', () => showDetails(car));
            grid.appendChild(card);
        });
    } catch (err) {
        spinner.innerHTML = 'Error loading cars.';
        console.error(err);
    }
}

// Auth (Login/Register)
document.getElementById('authForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    
    const endpoint = isRegister ? '/auth/register' : '/auth/login';
    const body = isRegister ? { username, email, password } : { email, password };

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Store both the token and the user's ID
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data._id); // This is key for ownership checks!
            
            token = data.token;
            closeModal('auth-modal');
            checkAuth();
            alert(`Welcome ${data.username || 'User'}!`);
        } else {
            alert(data.message || 'Authentication failed');
        }
    } catch (err) {
        alert('Server error');
    }
});

// Add Car
document.getElementById('addCarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!token) return alert('Please login first');

    const carData = {
        brand: document.getElementById('carBrand').value,
        model: document.getElementById('carModel').value,
        year: Number(document.getElementById('carYear').value),
        price: Number(document.getElementById('carPrice').value),
        imageUrl: document.getElementById('carImage').value,
        condition: document.getElementById('carCondition').value,
        description: document.getElementById('carDesc').value
    };

    try {
        const res = await fetch(`${API_URL}/cars`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(carData)
        });

        if (res.ok) {
            alert('Car added successfully!');
            closeModal('add-car-modal');
            fetchCars();
        } else {
            alert('Failed to add car');
        }
    } catch (err) {
        console.error(err);
    }
});

// --- 3. UI Functions ---

function openModal(id) {
    document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function toggleAuthMode() {
    isRegister = !isRegister;
    document.getElementById('authTitle').innerText = isRegister ? 'Register' : 'Login';
    document.getElementById('usernameField').style.display = isRegister ? 'block' : 'none';
    const switchText = document.querySelector('.switch-auth span');
    switchText.innerText = isRegister ? 'Login here' : 'Register here';
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    token = null;
    checkAuth();
    location.reload();
}

function showDetails(car) {
    const modalBody = document.getElementById('modal-body');
    const currentUserId = localStorage.getItem('userId');
    
    const ownerId = typeof car.owner === 'object' ? car.owner._id : car.owner;
    const isOwner = currentUserId && (String(currentUserId) === String(ownerId));

    const imgUrl = car.imageUrl || 'https://static9.depositphotos.com/1579454/1194/i/450/depositphotos_11943255-stock-photo-presentation-of-the-new-car.jpg';
    
    const specs = car.specs || {};
    const engine = specs.engine_type || specs.engine || "N/A";
    const hp = specs.horsepower_hp || specs.horsepower || "N/A";
    const trans = specs.transmission || "N/A";
    const drive = specs.drive_type || specs.drive || "N/A";
    const fuel = specs.fuel_type || specs.fuel || "N/A";
    const trim = specs.trim_name || specs.trim || "Standard";

    modalBody.innerHTML = `
        <div style="width:100%; height:300px; background:url('${imgUrl}') center/cover; border-radius: 8px; margin-bottom:20px;"></div>
        
        <div class="details-main">
            <h2>${car.brand} ${car.model}</h2>
            <h3 style="color:#ff3333; font-size: 1.8rem; margin: 10px 0;">$${car.price.toLocaleString()}</h3>
            <p><strong>Condition:</strong> ${car.condition} | <strong>Year:</strong> ${car.year}</p>
            <p style="color: #555; margin-top:10px; line-height: 1.6;">${car.description || 'No description provided.'}</p>
        </div>

        <div class="specs-grid" style="margin-top: 25px; border-top: 1px solid #eee; padding-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="spec-item"><i class="fa-solid fa-engine"></i> <strong>Engine:</strong> ${engine}</div>
            <div class="spec-item"><i class="fa-solid fa-bolt"></i> <strong>Horsepower:</strong> ${hp}</div>
            <div class="spec-item"><i class="fa-solid fa-gears"></i> <strong>Transmission:</strong> ${trans}</div>
            <div class="spec-item"><i class="fa-solid fa-road"></i> <strong>Drive Type:</strong> ${drive}</div>
            <div class="spec-item"><i class="fa-solid fa-gas-pump"></i> <strong>Fuel Type:</strong> ${fuel}</div>
            <div class="spec-item"><i class="fa-solid fa-car-side"></i> <strong>Trim:</strong> ${trim}</div>
        </div>

        <div id="owner-actions" style="margin-top: 30px; display: ${isOwner ? 'flex' : 'none'}; gap: 10px;">
            <button onclick="editCar('${car._id}')" class="btn-primary" style="background:#2ecc71; flex: 1;">
                <i class="fa-solid fa-pen-to-square"></i> EDIT LISTING
            </button>
            <button onclick="deleteCar('${car._id}')" class="btn-primary" style="flex: 1;">
                <i class="fa-solid fa-trash"></i> DELETE LISTING
            </button>
        </div>
    `;
    openModal('details-modal');
}

async function deleteCar(id) {
    if (!confirm('Are you sure you want to remove this listing?')) return;

    try {
        const res = await fetch(`${API_URL}/cars/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            alert('Car removed!');
            closeModal('details-modal');
            fetchCars(); 
        } else {
            alert('Error: Not authorized');
        }
    } catch (err) {
        console.error(err);
    }
}

async function editCar(id) {
    try {
        const res = await fetch(`${API_URL}/cars/${id}`);
        const car = await res.json();

        if (res.ok) {
            document.getElementById('editCarId').value = car._id;
            document.getElementById('editCarBrand').value = car.brand;
            document.getElementById('editCarModel').value = car.model;
            document.getElementById('editCarYear').value = car.year;
            document.getElementById('editCarPrice').value = car.price;
            document.getElementById('editCarImage').value = car.imageUrl;
            document.getElementById('editCarCondition').value = car.condition;
            document.getElementById('editCarDesc').value = car.description;

            closeModal('details-modal'); 
            openModal('edit-car-modal'); 
        }
    } catch (err) {
        console.error("Error fetching car for edit:", err);
    }
}

document.getElementById('editCarForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editCarId').value;

    const updatedData = {
        brand: document.getElementById('editCarBrand').value,
        model: document.getElementById('editCarModel').value,
        year: Number(document.getElementById('editCarYear').value),
        price: Number(document.getElementById('editCarPrice').value),
        imageUrl: document.getElementById('editCarImage').value,
        condition: document.getElementById('editCarCondition').value,
        description: document.getElementById('editCarDesc').value
    };

    try {
        const res = await fetch(`${API_URL}/cars/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedData)
        });

        if (res.ok) {
            alert('Listing updated successfully!');
            closeModal('edit-car-modal');
            fetchCars(); 
        } else {
            const error = await res.json();
            alert(error.message || 'Failed to update');
        }
    } catch (err) {
        console.error("Error updating car:", err);
    }
});

function showAllCars() {
    document.querySelector('.section-header h2').innerHTML = 'FEATURED <span>LISTINGS</span>';
    fetchCars();
}

function filterByOwner() {
    const currentUserId = localStorage.getItem('userId');
    if (!currentUserId) return alert('Please login to see your listings');
    
    document.querySelector('.section-header h2').innerHTML = 'MY <span>LISTINGS</span>';
    fetchCars(`?owner=${currentUserId}`); 
}s


function filterCars() {
    const brand = document.getElementById('searchBrand').value; 
    const condition = document.getElementById('searchType').value; 
    const maxPrice = document.getElementById('maxPrice').value;    

    let queryParams = new URLSearchParams();

    if (brand) queryParams.append('brand', brand);
    if (condition && condition !== 'All Types') queryParams.append('condition', condition);
    if (maxPrice) queryParams.append('maxPrice', maxPrice);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    fetchCars(queryString);
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}