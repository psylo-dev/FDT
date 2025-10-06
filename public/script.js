// ================================
// Service Worker Registration
// ================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
}

// ================================
// String Resources (keine externe strings.xml nötig)
// ================================
const strings = {
    app_name: "FDTicket",
    ticket_title: "Mein Ticket",
    settings_title: "Einstellungen",
    connection_details: "Verbindungsdetails",
    issued_label: "Ausgegeben am:",
    valid_from_label: "Gültig von:",
    valid_until_label: "Gültig bis:",
    price_label: "Preis",
    personal_data_label: "Personendaten",
    name_label: "Name:",
    birthday_label: "Geburtstag:",
    ticket_code_label: "Ticketcode:",
    disclaimer: "Nur gültig mit amtlichem Lichtbildausweis (z.B. Personalausweis). <br>Dieser ist bei der Kontrolle vorzuzeigen. <br>Es gelten die AGB der jeweiligen Beförderer. <br><a href=\"https://diebefoerderer.de/\">https://diebefoerderer.de/</a>",
    save_button: "Speichern",
    price_value: "58,00 €",
    name_value: "MAX MUSTERMANN",
    birthday_value: "19.05.1993",
    ticket_code_value: "DT9Y2Ynw"
};

// ================================
// Cookie Utilities
// ================================
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

// ================================
// Default Cookie Initialization with Auto Monthly Update
// ================================
function initializeDefaultCookies() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const firstOfThisMonth = new Date(currentYear, currentMonth, 1, 0, 0);
    const nextMonth = (currentMonth + 1) % 12;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    const firstOfNextMonth = new Date(nextYear, nextMonth, 1, 0, 0);

    // Datum formatieren
    const formatDate = (date, hour = 0, minute = 0) => {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        const hh = String(hour).padStart(2, '0');
        const mm = String(minute).padStart(2, '0');
        return `${d}.${m}.${y} ${hh}:${mm}`;
    };

    // Automatische Monatsdaten
    const issuedDate = formatDate(firstOfThisMonth, 2, 0);     // 01.MM.YYYY 02:00
    const validFromDate = formatDate(firstOfThisMonth, 0, 0);  // 01.MM.YYYY 00:00
    const validUntilDate = formatDate(firstOfNextMonth, 3, 0); // 01.(nächster) 03:00

    // Prüfen, ob bereits für diesen Monat gesetzt
    const storedMonth = getCookie('current_month');
    const thisMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

    const fields = {
        'issued_date': issuedDate,
        'valid_from_date': validFromDate,
        'valid_until_date': validUntilDate,
        'price_value': strings.price_value,
        'name_value': strings.name_value,
        'birthday_value': strings.birthday_value,
        'ticket_code_value': strings.ticket_code_value,
        'disclaimer': strings.disclaimer
    };

    // Nur bei Monatswechsel oder erstmaligem Laden aktualisieren
    if (storedMonth !== thisMonth) {
        for (const key in fields) {
            setCookie(key, fields[key]);
        }
        setCookie('current_month', thisMonth);
        setCookie('initialized', 'true');
        return true; // First load this month
    }

    return false;
}

// ================================
// UI Update Functions
// ================================
function updateTextViews() {
    const fields = [
        { id: 'text-issued-date', key: 'issued_date' },
        { id: 'text-valid-from', key: 'valid_from_date' },
        { id: 'text-valid-until', key: 'valid_until_date' },
        { id: 'text-price', key: 'price_value' },
        { id: 'text-name', key: 'name_value' },
        { id: 'text-birthday', key: 'birthday_value' },
        { id: 'text-ticket-code', key: 'ticket_code_value' }
    ];

    fields.forEach(({ id, key }) => {
        const element = document.getElementById(id);
        if (element) {
            const value = getCookie(key) || strings[key] || '';
            element.textContent = value;
        }
    });

    const disclaimer = document.getElementById('text-disclaimer');
    if (disclaimer) {
        const value = getCookie('disclaimer') || strings.disclaimer || '';
        disclaimer.innerHTML = value;
    }
}

// ================================
// Settings Popup Functions
// ================================
function loadSavedValues() {
    const fields = [
        { id: 'edit-name', key: 'name_value' },
        { id: 'edit-birthday', key: 'birthday_value' },
        { id: 'edit-ticket-code', key: 'ticket_code_value' },
        { id: 'edit-price', key: 'price_value' },
        { id: 'edit-issued-date', key: 'issued_date' },
        { id: 'edit-valid-from', key: 'valid_from_date' },
        { id: 'edit-valid-until', key: 'valid_until_date' }
    ];

    fields.forEach(({ id, key }) => {
        const element = document.getElementById(id);
        if (element) element.value = getCookie(key) || strings[key] || '';
    });
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }
}

function saveValues() {
    const fields = [
        { id: 'edit-name', key: 'name_value' },
        { id: 'edit-birthday', key: 'birthday_value' },
        { id: 'edit-ticket-code', key: 'ticket_code_value' },
        { id: 'edit-price', key: 'price_value' },
        { id: 'edit-issued-date', key: 'issued_date' },
        { id: 'edit-valid-from', key: 'valid_from_date' },
        { id: 'edit-valid-until', key: 'valid_until_date' }
    ];

    fields.forEach(({ id, key }) => {
        const element = document.getElementById(id);
        if (element) setCookie(key, element.value || strings[key] || '');
    });

    showToast('Änderungen gespeichert');
    closeSettingsPopup();
    updateTextViews();
    updateQRCode();
}

function openSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    if (popup) {
        popup.style.display = 'block';
        loadSavedValues();
    }
}

function closeSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    if (popup) popup.style.display = 'none';
}

// ================================
// Explanation Popup
// ================================
function openExplanationPopup() {
    const popup = document.getElementById('explanation-popup');
    if (popup) popup.style.display = 'block';
}

function confirmExplanation() {
    const popup = document.getElementById('explanation-popup');
    if (popup) popup.style.display = 'none';
}

// ================================
// QR Code Handling
// ================================
function updateQRCode() {
    const ticketCode = getCookie('ticket_code_value') || strings.ticket_code_value || '';
    const name = getCookie('name_value') || strings.name_value || '';
    const birthday = getCookie('birthday_value') || strings.birthday_value || '';
    const validFrom = getCookie('valid_from_date') || strings.valid_from_date || '';
    const validUntil = getCookie('valid_until_date') || strings.valid_until_date || '';

    const qrData = `Ticket Code: ${ticketCode}\nName: ${name}\nBirthday: ${birthday}\nValid From: ${validFrom}\nValid Until: ${validUntil}`;
    const qrCodeContainer = document.getElementById('qr-code-container');
    if (qrCodeContainer && typeof QRCode !== 'undefined') {
        const qrSize = Math.min(qrCodeContainer.offsetWidth, qrCodeContainer.offsetHeight) || 350;
        const qrcodeElement = document.getElementById('qrcode');
        qrcodeElement.innerHTML = '';
        new QRCode(qrcodeElement, {
            text: qrData,
            width: qrSize,
            height: qrSize,
            colorDark: '#000000',
            colorLight: '#FFFFFF',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// ================================
// Fullscreen Toggle
// ================================
function toggleFullscreen() {
    const mainContainer = document.documentElement;
    if (!document.fullscreenElement) {
        mainContainer.requestFullscreen?.() ||
        mainContainer.webkitRequestFullscreen?.() ||
        mainContainer.mozRequestFullScreen?.() ||
        mainContainer.msRequestFullscreen?.();
    } else {
        document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.mozCancelFullScreen?.() ||
        document.msExitFullscreen?.();
    }
}

// ================================
// Ticket Initialization
// ================================
function initTicketPage() {
    const isFirstLoad = initializeDefaultCookies();
    updateTextViews();

    if (isFirstLoad) openExplanationPopup();

    // Logo animation
    const logo = document.getElementById('animated-d-ticket-logo');
    if (logo) {
        const container = logo.parentElement;
        const maxTranslate = container ? Math.max(20, container.offsetWidth - logo.offsetWidth - 32) : 100;
        logo.animate([
            { transform: 'translateX(0px)' },
            { transform: `translateX(${maxTranslate}px)` },
            { transform: 'translateX(0px)' }
        ], {
            duration: 3000,
            iterations: Infinity,
            easing: 'ease-in-out'
        });
    }

    // Long press on QR code for settings
    const qrCodeContainer = document.getElementById('qr-code-container');
    let pressTimer = null;
    let isPressing = false;
    if (qrCodeContainer) {
        const startPress = () => {
            if (!isPressing) {
                isPressing = true;
                pressTimer = setTimeout(openSettingsPopup, 1000);
            }
        };
        const endPress = () => {
            isPressing = false;
            clearTimeout(pressTimer);
        };
        qrCodeContainer.addEventListener('mousedown', startPress);
        qrCodeContainer.addEventListener('mouseup', endPress);
        qrCodeContainer.addEventListener('mouseleave', endPress);
        qrCodeContainer.addEventListener('touchstart', e => { e.preventDefault(); startPress(); });
        qrCodeContainer.addEventListener('touchend', endPress);
        qrCodeContainer.addEventListener('touchcancel', endPress);
    }

    // Header click toggles fullscreen
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) headerTitle.addEventListener('click', toggleFullscreen);

    updateQRCode();
}

// ================================
// Theme Handling
// ================================
function applyTheme(theme) {
    document.body.className = ''; // reset
    if (theme && theme !== 'default') {
        document.body.classList.add(theme);
    }
    setCookie('selected_theme', theme);
}

function loadTheme() {
    const savedTheme = getCookie('selected_theme') || 'default';
    applyTheme(savedTheme);

    // Dropdown aktualisieren (falls im DOM vorhanden)
    const select = document.getElementById('theme-select');
    if (select) select.value = savedTheme;
}

// Beim Laden aktivieren
document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultCookies();
    loadTheme();

    const select = document.getElementById('theme-select');
    if (select) {
        select.addEventListener('change', (e) => {
            applyTheme(e.target.value);
        });
    }
});

// ================================
// Start on Load
// ================================
document.addEventListener('DOMContentLoaded', initTicketPage);
