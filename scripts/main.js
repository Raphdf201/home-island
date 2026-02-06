// Interpolate colors based on time of day
const TIME_COLORS = [
    {hour: 0, colors: ['#0a0a0f', '#12121a', '#1a1a25', '#1d1d28', '#20202b', '#23232e']}, // Midnight - deep blacks with slight warmth
    {hour: 5, colors: ['#1a1520', '#251e2e', '#30273c', '#3b304a', '#463958', '#514266']}, // Pre-dawn - deep purple to soft lavender
    {hour: 7, colors: ['#6b4c6e', '#8d6b92', '#b08ab6', '#d1a9c8', '#e8c8d8', '#f5e0e8']}, // Sunrise - soft purple to pink pastels
    {hour: 9, colors: ['#a8d5e8', '#b8dff0', '#c8e8f5', '#d8f0f8', '#e5f6fa', '#f0fafc']}, // Morning - soft sky blues
    {hour: 12, colors: ['#87ceeb', '#9dd9f0', '#b3e4f5', '#c9eff8', '#dff5fb', '#f0fafd']}, // Noon - bright pastel blue sky
    {hour: 15, colors: ['#a8d0e6', '#b8dae8', '#cfe4ea', '#d8e8ea', '#e5f0ed', '#f0f5f0']}, // Afternoon - soft blue-white
    {hour: 17, colors: ['#d8b8a8', '#e8c8b8', '#f0d8c8', '#f5e0d0', '#fae8d8', '#fff0e0']}, // Late afternoon - warm cream
    {hour: 18, colors: ['#d89070', '#e8a888', '#f0b898', '#f5c8a8', '#fad8b8', '#ffe8c8']}, // Sunset start - warm peach
    {hour: 19, colors: ['#c86850', '#d88868', '#e8a080', '#f0b098', '#f5c0a8', '#fad0b8']}, // Sunset - vibrant orange-pink
    {hour: 20, colors: ['#905070', '#a86888', '#c080a0', '#d098b0', '#e0b0c8', '#f0c8d8']}, // Dusk - deep rose to lavender
    {hour: 21, colors: ['#302838', '#403848', '#504858', '#605868', '#6a6278', '#756c88']}, // Early night - muted purple-gray
    {hour: 23, colors: ['#151520', '#1a1a28', '#1f1f30', '#222233', '#252536', '#282839']}, // Late night - very dark with slight purple
    {hour: 24, colors: ['#0a0a0f', '#12121a', '#1a1a25', '#1d1d28', '#20202b', '#23232e']}, // Midnight (loop)
];

// Get current time as decimal hours (0-24)
function getDecimalHour() {
    const now = new Date();
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

// Interpolate between two hex colors
function lerpColor(hex1, hex2, t) {
    const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
    const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, '0')}`;
}

// Get interpolated colors for current time
function getColorsForTime(hour) {
    // Find the two keyframes we're between
    let before = TIME_COLORS[0], after = TIME_COLORS[1];
    for (let i = 0; i < TIME_COLORS.length - 1; i++) {
        if (hour >= TIME_COLORS[i].hour && hour < TIME_COLORS[i + 1].hour) {
            before = TIME_COLORS[i];
            after = TIME_COLORS[i + 1];
            break;
        }
    }

    // Calculate interpolation factor [0-1] between keyframes
    const t = (hour - before.hour) / (after.hour - before.hour);

    // Interpolate each color in the palette
    return before.colors.map((color, i) => lerpColor(color, after.colors[i], t));
}

// Get star opacity based on time
function getStarOpacity(hour) {
    if (hour >= 21 || hour < 5) return 1;           // Full stars
    if (hour >= 20 && hour < 21) return hour - 20;  // Fade in 8-9pm
    if (hour >= 5 && hour < 6) return 6 - hour;     // Fade out 5-6am
    return 0;
}

function updateBackground() {
    const hour = getDecimalHour();
    const background = document.getElementById("dynamic-background");
    const starsContainer = document.getElementById("stars-container");

    // Get interpolated colors and apply gradient
    const colors = getColorsForTime(hour);
    background.style.background = `linear-gradient(135deg, ${colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ')})`;
    background.style.backgroundSize = '150% 150%';

    // Smooth star opacity
    starsContainer.style.opacity = getStarOpacity(hour);

    // Update text color based on day/night
    updateTextColor(hour);
}

// Toggle text between light and dark based on time
function updateTextColor(hour) {
    const isDarkTime = hour >= 19 || hour < 6; // 7pm-6am -> light text, 6am-7pm -> dark text

    if (isDarkTime) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
}

// ================================
// Stars
// ================================
function createStars() {
    const starsContainer = document.getElementById("stars-container");
    starsContainer.innerHTML = ''; // Clear existing stars

    const starCount = 135; // Number of stars
    const sizes = ['small', 'medium', 'large'];
    const weights = [0.7, 0.25, 0.05]; // Probability weights for sizes

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Weighted random size selection
        const rand = Math.random();
        let sizeIndex = 0;
        let cumulative = 0;
        for (let j = 0; j < weights.length; j++) {
            cumulative += weights[j];
            if (rand < cumulative) {
                sizeIndex = j;
                break;
            }
        }
        star.classList.add(sizes[sizeIndex]);

        // Random position
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;

        // Random twinkle animation timing
        star.style.setProperty('--twinkle-duration', `${2 + Math.random() * 4}s`);
        star.style.setProperty('--twinkle-delay', `${Math.random() * 5}s`);

        starsContainer.appendChild(star);
    }

    // Add occasional shooting stars
    createShootingStars();
}

function createShootingStars() {
    const starsContainer = document.getElementById('stars-container');
    const shootingStarCount = 3;

    for (let i = 0; i < shootingStarCount; i++) {
        const shootingStar = document.createElement('div');
        shootingStar.classList.add('shooting-star');
        shootingStar.style.left = `${10 + Math.random() * 60}%`;
        shootingStar.style.top = `${Math.random() * 40}%`;
        shootingStar.style.animationDelay = `${5 + Math.random() * 20}s`;
        shootingStar.style.animationDuration = `${15 + Math.random() * 15}s`;
        starsContainer.appendChild(shootingStar);
    }
}

// ================================
// Time and date
// ================================
function updateClock() {
    const now = new Date();
    const clockElement = document.getElementById('clock');
    const dateElement = document.getElementById('date');

    // Format time (12-hour format with AM/PM)
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const second = now.getSeconds().toString().padStart(2, '0');

    clockElement.textContent = `${hours}:${minutes}:${second}`;

    // Format date
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// ================================
// Greeting
// ================================
function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    const hour = new Date().getHours();

    let greeting;

    if (hour >= 5 && hour < 7) {
        greeting = "Early Bird";
    } else if (hour >= 7 && hour < 12) {
        greeting = "Good Morning";
    } else if (hour >= 12 && hour < 17) {
        greeting = "Good Afternoon";
    } else if (hour >= 17 && hour < 21) {
        greeting = "Good Evening";
    } else {
        greeting = "Good Night";
    }

    greetingElement.textContent = greeting;
}

// ================================
// Search
// ================================
function initSearch() {
    // Focus search input on page load
    const searchInput = document.getElementById('q');
    if (searchInput) {
        searchInput.focus();
    }
}

const DEFAULT_QUICK_LINKS = [
    {name: 'GitHub', url: 'https://github.com', icon: '🐙'},
    {name: 'YouTube', url: 'https://youtube.com', icon: '📺'},
    {name: 'Reddit', url: 'https://reddit.com', icon: '📰'},
    {name: 'Twitter', url: 'https://twitter.com', icon: '🐦'}
];

function loadQuickLinks() {
    // You can expand this to load from browser storage
    // For now, we use the HTML-defined links
    // This function is a placeholder for future dynamic link management
}

function saveQuickLinks(links) {
    // Save to browser storage (for future use)
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({quickLinks: links});
    } else if (typeof browser !== 'undefined' && browser.storage) {
        browser.storage.local.set({quickLinks: links});
    } else {
        localStorage.setItem('quickLinks', JSON.stringify(links));
    }
}

// ================================
// Keyboard Shortcuts
// ================================
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Focus search on pressing '/' key
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }

        // Escape to blur search input
        if (e.key === 'Escape') {
            document.getElementById('search-input').blur();
        }
    });
}

// ================================
// Init
// ================================
function init() {
    // Initialize dynamic background
    createStars();
    updateBackground();

    // Update background every 30 seconds for smooth real-time transitions
    setInterval(updateBackground, 30000);

    // Update clock immediately and then every second
    updateClock();
    setInterval(updateClock, 1000);

    // Update greeting
    updateGreeting();
    // Update greeting every minute in case time period changes
    setInterval(updateGreeting, 60000);

    // Initialize search
    initSearch();

    // Initialize keyboard shortcuts
    initKeyboardShortcuts();

    // Load quick links
    loadQuickLinks();

    console.log('🏝️ Home Island loaded successfully!');
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);
