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
    document.getElementById('dashboardLink').style.display = isLoggedIn ? 'block' : 'none';
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
            localStorage.setItem('token', data.token);
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
    token = null;
    checkAuth();
    location.reload();
}

function showDetails(car) {
    const modalBody = document.getElementById('modal-body');
    const imgUrl = car.imageUrl || 'https://static9.depositphotos.com/1579454/1194/i/450/depositphotos_11943255-stock-photo-presentation-of-the-new-car.jpg';
    
    const specs = car.specs || {};
    
    const engine = specs.engine_type || "N/A";
    const horsepower = specs.horsepower_hp || "N/A";
    const transmission = specs.transmission || "N/A";
    const drive = specs.drive_type || "N/A";
    const fuel = specs.fuel_type || "N/A";
    const trim = specs.trim_name || "Standard";

    modalBody.innerHTML = `
        <div style="width:100%; height:300px; background:url('${imgUrl}') center/cover; border-radius: 8px; margin-bottom:20px;"></div>
        
        <div class="details-main">
            <h2>${car.brand} ${car.model}</h2>
            <h3 style="color:#e74c3c; font-size: 1.5rem; margin: 10px 0;">$${car.price.toLocaleString()}</h3>
            <p style="margin-bottom: 10px;"><strong>Condition:</strong> ${car.condition} | <strong>Year:</strong> ${car.year}</p>
            <p style="color: #555; line-height: 1.6;">${car.description || 'No description provided.'}</p>
        </div>

        <div class="specs-grid" style="margin-top: 25px; border-top: 2px solid #eee; padding-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="spec-item"><strong>Engine:</strong> ${engine}</div>
            <div class="spec-item"><strong>Horsepower:</strong> ${horsepower} HP</div>
            <div class="spec-item"><strong>Transmission:</strong> ${transmission}</div>
            <div class="spec-item"><strong>Drive Type:</strong> ${drive}</div>
            <div class="spec-item"><strong>Fuel Type:</strong> ${fuel}</div>
            <div class="spec-item"><strong>Trim:</strong> ${trim}</div>
        </div>
    `;
    openModal('details-modal');
}


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