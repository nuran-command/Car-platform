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
            const imgUrl = car.imageUrl || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=500';
            
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
    const imgUrl = car.imageUrl || 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800';
    
    let specsHtml = '';
    if (car.specs && Object.keys(car.specs).length > 0) {
        specsHtml = `<div class="specs-container" style="margin-top: 20px; border-top: 1px solid #eee; padding-top:15px;">
                     <h3 style="color: #e74c3c;">Technical Specifications</h3>
                     <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9rem;">`;

        const renderSpecs = (obj) => {
            for (const [key, value] of Object.entries(obj)) {
                if (value && typeof value === 'object') {
                    renderSpecs(value); 
                } else if (value && !key.includes('id') && !key.includes('url')) {
                    const cleanKey = key.replace(/_/g, ' ').toUpperCase();
                    specsHtml += `<div><strong>${cleanKey}:</strong> ${value}</div>`;
                }
            }
        };

        renderSpecs(car.specs);
        specsHtml += `</div></div>`;
    }

    modalBody.innerHTML = `
        <div style="width:100%; height:300px; background:url('${imgUrl}') center/cover; border-radius: 8px; margin-bottom:20px;"></div>
        <h2>${car.brand} ${car.model}</h2>
        <h3 style="color:#e74c3c;">$${car.price.toLocaleString()}</h3>
        <p><strong>Year:</strong> ${car.year} | <strong>Condition:</strong> ${car.condition}</p>
        <p style="margin: 15px 0;">${car.description || 'No description provided.'}</p>
        ${specsHtml}
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