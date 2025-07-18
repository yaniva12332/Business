// Global Variables
let currentUser = null;
let selectedService = null;
let selectedDate = null;
let selectedTime = null;
let bookings = [];
let users = [];

// Demo data
const demoUsers = [
    { 
        id: 1, 
        name: 'אדמין', 
        email: 'admin@dannyfit.co.il', 
        password: '123456', 
        role: 'admin',
        phone: '050-1234567'
    },
    { 
        id: 2, 
        name: 'יוסי כהן', 
        email: 'yossi@gmail.com', 
        password: '123456', 
        role: 'client',
        phone: '050-9876543'
    }
];

const demoBookings = [
    {
        id: 1,
        userId: 2,
        service: 'personal',
        serviceName: 'אימון אישי',
        date: '2024-01-20',
        time: '09:00',
        status: 'confirmed',
        price: 150,
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        userId: 2,
        service: 'group',
        serviceName: 'אימון קבוצתי',
        date: '2024-01-22',
        time: '18:00',
        status: 'pending',
        price: 80,
        createdAt: new Date().toISOString()
    }
];

// Available time slots
const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Load data from localStorage or use demo data
    users = JSON.parse(localStorage.getItem('users')) || demoUsers;
    bookings = JSON.parse(localStorage.getItem('bookings')) || demoBookings;
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserDashboard();
    }
    
    // Set minimum date for booking
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('selectedDate');
    if (dateInput) {
        dateInput.min = today;
    }
    
    // Setup form listeners
    setupFormListeners();
}

function setupFormListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(event) {
        const userDropdown = document.getElementById('userDropdown');
        const dropdownContent = document.getElementById('dropdownContent');
        
        if (userDropdown && dropdownContent && 
            !userDropdown.contains(event.target)) {
            userDropdown.classList.remove('active');
            dropdownContent.classList.remove('show');
        }
    });
}

// Navigation functions
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Modal functions
function openLoginModal() {
    if (currentUser) {
        showUserDashboard();
        return;
    }
    document.getElementById('loginModal').style.display = 'block';
}

function openBookingModal() {
    if (!currentUser) {
        showMessage('יש להתחבר תחילה כדי לקבוע אימון', 'error');
        openLoginModal();
        return;
    }
    document.getElementById('bookingModal').style.display = 'block';
    resetBookingForm();
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function switchToRegister() {
    closeModal('loginModal');
    document.getElementById('registerModal').style.display = 'block';
}

function switchToLogin() {
    closeModal('registerModal');
    document.getElementById('loginModal').style.display = 'block';
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        closeModal('loginModal');
        showUserDashboard();
        showMessage('התחברת בהצלחה!', 'success');
    } else {
        showMessage('אימייל או סיסמה שגויים', 'error');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = e.target.querySelector('input[type="text"]').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const phone = e.target.querySelector('input[type="tel"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showMessage('משתמש עם אימייל זה כבר קיים', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length + 1,
        name,
        email,
        phone,
        password,
        role: 'client'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    closeModal('registerModal');
    showUserDashboard();
    showMessage('נרשמת בהצלחה!', 'success');
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    hideAllDashboards();
    showMessage('התנתקת בהצלחה', 'success');
    
    // Update navigation
    updateNavigationForLogout();
}

function updateNavigationForLogout() {
    const btnLogin = document.querySelector('.btn-login');
    const userDropdown = document.getElementById('userDropdown');
    
    if (btnLogin) {
        btnLogin.style.display = 'block';
        btnLogin.textContent = 'התחברות';
        btnLogin.onclick = openLoginModal;
    }
    
    if (userDropdown) {
        userDropdown.style.display = 'none';
    }
}

function updateNavigationForLogin() {
    const btnLogin = document.querySelector('.btn-login');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.querySelector('.user-name');
    
    if (btnLogin) {
        btnLogin.style.display = 'none';
    }
    
    if (userDropdown && userName && currentUser) {
        userDropdown.style.display = 'inline-block';
        userName.textContent = currentUser.name;
    }
}

// User dropdown functions
function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const dropdownContent = document.getElementById('dropdownContent');
    
    if (dropdown && dropdownContent) {
        dropdown.classList.toggle('active');
        dropdownContent.classList.toggle('show');
    }
}

function closeUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const dropdownContent = document.getElementById('dropdownContent');
    
    if (dropdown && dropdownContent) {
        dropdown.classList.remove('active');
        dropdownContent.classList.remove('show');
    }
}

// Booking functions
function selectService(serviceType) {
    selectedService = serviceType;
    
    // Update UI
    document.querySelectorAll('.service-option').forEach(option => {
        option.classList.remove('selected');
    });
    event.target.closest('.service-option').classList.add('selected');
    
    // Move to step 2
    setTimeout(() => {
        document.getElementById('bookingStep1').style.display = 'none';
        document.getElementById('bookingStep2').style.display = 'block';
        
        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        document.getElementById('selectedDate').value = dateString;
        loadAvailableSlots();
    }, 300);
}

function loadAvailableSlots() {
    const dateInput = document.getElementById('selectedDate');
    selectedDate = dateInput.value;
    
    if (!selectedDate) return;
    
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    
    // Get booked slots for selected date
    const bookedSlots = bookings
        .filter(booking => booking.date === selectedDate && booking.status !== 'cancelled')
        .map(booking => booking.time);
    
    timeSlots.forEach(time => {
        const slotElement = document.createElement('div');
        slotElement.className = 'time-slot';
        slotElement.textContent = time;
        
        if (bookedSlots.includes(time)) {
            slotElement.classList.add('unavailable');
            slotElement.textContent += ' (תפוס)';
        } else {
            slotElement.onclick = () => selectTimeSlot(time, slotElement);
        }
        
        timeSlotsContainer.appendChild(slotElement);
    });
}

function selectTimeSlot(time, element) {
    selectedTime = time;
    
    // Update UI
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.classList.remove('selected');
    });
    element.classList.add('selected');
}

function confirmBooking() {
    if (!selectedService || !selectedDate || !selectedTime) {
        showMessage('אנא בחר סוג אימון, תאריך ושעה', 'error');
        return;
    }
    
    const serviceNames = {
        'personal': 'אימון אישי',
        'group': 'אימון קבוצתי',
        'online': 'אימון אונליין'
    };
    
    const servicePrices = {
        'personal': 150,
        'group': 80,
        'online': 100
    };
    
    const newBooking = {
        id: bookings.length + 1,
        userId: currentUser.id,
        service: selectedService,
        serviceName: serviceNames[selectedService],
        date: selectedDate,
        time: selectedTime,
        status: 'pending',
        price: servicePrices[selectedService],
        createdAt: new Date().toISOString()
    };
    
    bookings.push(newBooking);
    localStorage.setItem('bookings', JSON.stringify(bookings));
    
    closeModal('bookingModal');
    showMessage('האימון נקבע בהצלחה! מחכה לאישור המאמן', 'success');
    
    // Refresh dashboard if open
    if (currentUser.role === 'client') {
        loadUserBookings();
    } else if (currentUser.role === 'admin') {
        loadAdminBookings();
    }
}

function resetBookingForm() {
    selectedService = null;
    selectedDate = null;
    selectedTime = null;
    
    document.getElementById('bookingStep1').style.display = 'block';
    document.getElementById('bookingStep2').style.display = 'none';
    
    document.querySelectorAll('.service-option').forEach(option => {
        option.classList.remove('selected');
    });
}

// Dashboard functions
function showUserDashboard() {
    hideAllDashboards();
    
    if (currentUser.role === 'admin') {
        document.getElementById('adminPanel').style.display = 'block';
        loadAdminBookings();
        loadClientsList();
    } else {
        document.getElementById('userDashboard').style.display = 'block';
        loadUserBookings();
    }
    
    // Update navigation
    updateNavigationForLogin();
    closeUserDropdown();
}

function hideAllDashboards() {
    document.getElementById('userDashboard').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    
    // Show main content
    document.querySelector('.hero').style.display = 'flex';
    document.querySelector('.about').style.display = 'block';
    document.querySelector('.services').style.display = 'block';
    document.querySelector('.contact').style.display = 'block';
}

function loadUserBookings() {
    const userBookingsContainer = document.getElementById('userBookings');
    const userBookings = bookings.filter(booking => booking.userId === currentUser.id);
    
    if (userBookings.length === 0) {
        userBookingsContainer.innerHTML = '<p>אין לך אימונים מתוכננים</p>';
        return;
    }
    
    userBookingsContainer.innerHTML = userBookings
        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
        .map(booking => createBookingElement(booking, false))
        .join('');
}

function loadAdminBookings() {
    const adminBookingsContainer = document.getElementById('adminBookings');
    
    if (bookings.length === 0) {
        adminBookingsContainer.innerHTML = '<p>אין תורים מתוכננים</p>';
        return;
    }
    
    adminBookingsContainer.innerHTML = bookings
        .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time))
        .map(booking => createBookingElement(booking, true))
        .join('');
}

function createBookingElement(booking, isAdmin) {
    const user = users.find(u => u.id === booking.userId);
    const statusClass = `status-${booking.status}`;
    const statusText = {
        'pending': 'ממתין לאישור',
        'confirmed': 'מאושר',
        'cancelled': 'בוטל'
    };
    
    const actions = isAdmin ? `
        <div class="booking-actions">
            ${booking.status === 'pending' ? `
                <button class="btn-small btn-confirm" onclick="updateBookingStatus(${booking.id}, 'confirmed')">אשר</button>
                <button class="btn-small btn-cancel" onclick="updateBookingStatus(${booking.id}, 'cancelled')">בטל</button>
            ` : ''}
            ${booking.status === 'confirmed' ? `
                <button class="btn-small btn-cancel" onclick="updateBookingStatus(${booking.id}, 'cancelled')">בטל</button>
            ` : ''}
        </div>
    ` : `
        <div class="booking-actions">
            ${booking.status === 'pending' || booking.status === 'confirmed' ? `
                <button class="btn-small btn-cancel" onclick="updateBookingStatus(${booking.id}, 'cancelled')">בטל אימון</button>
            ` : ''}
        </div>
    `;
    
    return `
        <div class="booking-item">
            <div class="booking-header">
                <span class="booking-service">${booking.serviceName}</span>
                <span class="booking-status ${statusClass}">${statusText[booking.status]}</span>
            </div>
            <div class="booking-details">
                ${isAdmin ? `<strong>לקוח:</strong> ${user ? user.name : 'לא ידוע'}<br>` : ''}
                <strong>תאריך:</strong> ${formatDate(booking.date)}<br>
                <strong>שעה:</strong> ${booking.time}<br>
                <strong>מחיר:</strong> ₪${booking.price}
                ${isAdmin && user ? `<br><strong>טלפון:</strong> ${user.phone}` : ''}
            </div>
            ${actions}
        </div>
    `;
}

function updateBookingStatus(bookingId, newStatus) {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        booking.status = newStatus;
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        const statusMessages = {
            'confirmed': 'האימון אושר בהצלחה',
            'cancelled': 'האימון בוטל'
        };
        
        showMessage(statusMessages[newStatus], 'success');
        
        // Refresh appropriate dashboard
        if (currentUser.role === 'admin') {
            loadAdminBookings();
        } else {
            loadUserBookings();
        }
    }
}

function loadClientsList() {
    const clientsListContainer = document.getElementById('clientsList');
    const clients = users.filter(user => user.role === 'client');
    
    if (clients.length === 0) {
        clientsListContainer.innerHTML = '<p>אין לקוחות רשומים</p>';
        return;
    }
    
    clientsListContainer.innerHTML = clients.map(client => {
        const clientBookings = bookings.filter(b => b.userId === client.id);
        return `
            <div class="booking-item">
                <div class="booking-header">
                    <span class="booking-service">${client.name}</span>
                    <span class="booking-status status-confirmed">${clientBookings.length} אימונים</span>
                </div>
                <div class="booking-details">
                    <strong>אימייל:</strong> ${client.email}<br>
                    <strong>טלפון:</strong> ${client.phone}<br>
                    <strong>תאריך הצטרפות:</strong> ${formatDate(new Date().toISOString().split('T')[0])}
                </div>
            </div>
        `;
    }).join('');
}

// Admin functions
function showTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load appropriate data
    if (tabName === 'bookings') {
        loadAdminBookings();
    } else if (tabName === 'clients') {
        loadClientsList();
    }
}

function updateContent() {
    const heroTitle = document.getElementById('heroTitle').value;
    const heroDescription = document.getElementById('heroDescription').value;
    
    // Update the actual content on the page
    const titleElement = document.querySelector('.hero h1');
    const descriptionElement = document.querySelector('.hero p');
    
    if (titleElement) {
        titleElement.innerHTML = heroTitle.replace('דני פיט', '<span class="highlight">דני פיט</span>');
    }
    
    if (descriptionElement) {
        descriptionElement.textContent = heroDescription;
    }
    
    // Save to localStorage
    localStorage.setItem('heroContent', JSON.stringify({
        title: heroTitle,
        description: heroDescription
    }));
    
    showMessage('התוכן עודכן בהצלחה!', 'success');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    
    // Insert at top of body
    document.body.insertBefore(messageElement, document.body.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Load saved content on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedContent = localStorage.getItem('heroContent');
    if (savedContent) {
        const content = JSON.parse(savedContent);
        const titleElement = document.querySelector('.hero h1');
        const descriptionElement = document.querySelector('.hero p');
        
        if (titleElement && content.title) {
            titleElement.innerHTML = content.title.replace('דני פיט', '<span class="highlight">דני פיט</span>');
        }
        
        if (descriptionElement && content.description) {
            descriptionElement.textContent = content.description;
        }
        
        // Update admin form if it exists
        const heroTitleInput = document.getElementById('heroTitle');
        const heroDescriptionInput = document.getElementById('heroDescription');
        
        if (heroTitleInput) heroTitleInput.value = content.title;
        if (heroDescriptionInput) heroDescriptionInput.value = content.description;
    }
});