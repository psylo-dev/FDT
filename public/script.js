// At the top of script.js
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
}

// String resources from strings.xml
const strings = {
    app_name: "FDTicket",
    ticket_title: "Mein Ticket",
    settings_title: "Einstellungen",
    connection_details: "Verbindungsdetails",
    issued_label: "Ausgegeben am:",
    issued_date: "01.07.2025 02:00",
    valid_from_label: "Gültig von:",
    valid_from_date: "01.07.2025 00:00",
    valid_until_label: "Gültig bis:",
    valid_until_date: "01.08.2025 03:00",
    price_label: "Preis",
    price_value: "58,00 €",
    personal_data_label: "Personendaten",
    name_label: "Name:",
    name_value: "MAX MUSTERMANN",
    birthday_label: "Geburtstag:",
    birthday_value: "19.05.1993",
    ticket_code_label: "Ticketcode:",
    ticket_code_value: "DT9Y2Ynw",
    disclaimer: "Nur gültig mit amtlichem Lichtbildausweis (z.B. Personalausweis). <br>Dieser ist bei der Kontrolle vorzuzeigen. <br>Es gelten die AGB der jeweiligen Beförderer. <br><a href=\"https://diebefoerderer.de/\">https://diebefoerderer.de/</a>",
    save_button: "Speichern"
};

// Cookie utility functions
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
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

// Initialize default cookies
function initializeDefaultCookies() {
    const fields = [
        'issued_date',
        'valid_from_date',
        'valid_until_date',
        'price_value',
        'name_value',
        'birthday_value',
        'ticket_code_value',
        'disclaimer'
    ];

    let isFirstLoad = !getCookie('initialized'); // Check if first load
    fields.forEach(field => {
        if (!getCookie(field) && strings[field]) {
            setCookie(field, strings[field]);
        }
    });
    if (isFirstLoad) {
        setCookie('initialized', 'true'); // Mark as initialized
    }
    return isFirstLoad;
}

// Update text views with values from cookies or defaults
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

// Load saved values for settings popup
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
        if (element) {
            const value = getCookie(key) || strings[key] || '';
            element.value = value; // Set input value directly
        }
    });
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000); // Show for 2 seconds
    }
}

// Save values to cookies
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
        if (element) {
            const value = element.value || strings[key] || '';
            setCookie(key, value);
        }
    });

    showToast('Änderungen gespeichert');
    closeSettingsPopup();
    updateTextViews();
    updateQRCode();
}

// Open settings popup
function openSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    if (popup) {
        popup.style.display = 'block';
        loadSavedValues();
    }
}

// Close settings popup
function closeSettingsPopup() {
    const popup = document.getElementById('settings-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Open explanation popup
function openExplanationPopup() {
    const popup = document.getElementById('explanation-popup');
    if (popup) {
        popup.style.display = 'block';
    }
}

// Close explanation popup
function confirmExplanation() {
    const popup = document.getElementById('explanation-popup');
    if (popup) {
        popup.style.display = 'none';
    }
}

// Update QR code
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
        qrcodeElement.innerHTML = ''; // Clear previous QR code
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

// Toggle fullscreen mode
function toggleFullscreen() {
    const mainContainer = document.documentElement; // Use documentElement to request fullscreen for the entire page
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (mainContainer.requestFullscreen) {
            mainContainer.requestFullscreen();
        } else if (mainContainer.webkitRequestFullscreen) { // Safari
            mainContainer.webkitRequestFullscreen();
        } else if (mainContainer.mozRequestFullScreen) { // Firefox
            mainContainer.mozRequestFullScreen();
        } else if (mainContainer.msRequestFullscreen) { // IE/Edge
            mainContainer.msRequestFullscreen();
        } else {
            showToast('Vollbildmodus wird von diesem Browser nicht unterstützt');
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

// Initialize ticket page
function initTicketPage() {
    // Initialize default cookies and check for first load
    const isFirstLoad = initializeDefaultCookies();
    updateTextViews();

    // Show explanation popup on first load
    if (isFirstLoad) {
        openExplanationPopup();
    }

    // Logo animation
    const logo = document.getElementById('animated-d-ticket-logo');
    if (logo) {
        const container = logo.parentElement; // Der logo-container
        const maxTranslate = container ? Math.max(20, container.offsetWidth - logo.offsetWidth - 32) : 100; // 32px Puffer für Padding (16px pro Seite), mindestens 20px

        logo.style.transform = 'translateX(0px)';
        logo.animate([
            { transform: 'translateX(0px)' },
            { transform: `translateX(${maxTranslate}px)` }, // Dynamische maximale Verschiebung
            { transform: 'translateX(0px)' }
        ], {
            duration: 3000,
            iterations: Infinity,
            easing: 'ease-in-out' // Sanftere Animation
        });
    }

    // Long-press (hold) event for QR code
    const qrCodeContainer = document.getElementById('qr-code-container');
    let pressTimer = null;
    let isPressing = false;

    if (qrCodeContainer) {
        const startPress = () => {
            if (!isPressing) {
                isPressing = true;
                pressTimer = setTimeout(() => {
                    openSettingsPopup();
                }, 1000); // 1-second hold
            }
        };

        const endPress = () => {
            if (isPressing) {
                isPressing = false;
                clearTimeout(pressTimer);
            }
        };

        // Mouse events
        qrCodeContainer.addEventListener('mousedown', startPress);
        qrCodeContainer.addEventListener('mouseup', endPress);
        qrCodeContainer.addEventListener('mouseleave', endPress);

        // Touch events
        qrCodeContainer.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent default touch behaviors
            startPress();
        });
        qrCodeContainer.addEventListener('touchend', endPress);
        qrCodeContainer.addEventListener('touchcancel', endPress);
    }

    // Click event for header-title to toggle fullscreen
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) {
        headerTitle.addEventListener('click', toggleFullscreen);
    }

    // Update QR code
    updateQRCode();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTicketPage();
});
