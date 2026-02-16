const SCHEDULER_URL_PREFIX = "https://jerryxf.net";
// const SCHEDULER_URL_PREFIX = "http://localhost:5173";

// Default shortcuts
const DEFAULT_SHORTCUTS = [
    { name: "Outlook", url: "https://outlook.live.com", favicon: "" },
    { name: "OneDrive", url: "https://onedrive.live.com", favicon: "https://onedrive.live.com/_layouts/15/images/odbfavicon.ico" },
    { name: "Word", url: "https://word.cloud.microsoft", favicon: "" },
    { name: "Excel", url: "https://excel.cloud.microsoft", favicon: "" },
    { name: "PowerPoint", url: "https://powerpoint.cloud.microsoft", favicon: "" },
    { name: "Gmail", url: "https://mail.google.com", favicon: "" },
    { name: "YouTube", url: "https://youtube.com", favicon: "" },
    { name: "GitHub", url: "https://github.com", favicon: "" },
    { name: "Spotify", url: "https://spotify.com", favicon: "" }
];

// Interpolate colors based on time of day
const TIME_COLORS = [
    {hour: 0, colors: ["#050508", "#08080d", "#0b0b12", "#0e0e15", "#101018", "#12121a"]},
    {hour: 5, colors: ["#1a1520", "#251e2e", "#30273c", "#3b304a", "#463958", "#514266"]},
    {hour: 7, colors: ["#6b4c6e", "#8d6b92", "#b08ab6", "#d1a9c8", "#e8c8d8", "#f5e0e8"]},
    {hour: 9, colors: ["#b8dcc8", "#c5e5d5", "#d2ebe0", "#dff2ea", "#ebf7f0", "#f5faf8"]},
    {hour: 12, colors: ["#e8e8b8", "#f0eec8", "#f5f2d5", "#f8f5e0", "#faf8e8", "#fdfbf0"]},
    {hour: 16, colors: ["#f0e8c0", "#f5eed0", "#f8f2d8", "#faf5e0", "#fcf8e8", "#fefbf0"]},
    {hour: 17, colors: ["#d8b8a8", "#e8c8b8", "#f0d8c8", "#f5e0d0", "#fae8d8", "#fff0e0"]},
    {hour: 18, colors: ["#a87058", "#c08870", "#d09880", "#d8a890", "#e0b8a0", "#e8c8b0"]},
    {hour: 19, colors: ["#583048", "#683850", "#784058", "#884860", "#985068", "#a85870"]},
    {hour: 20, colors: ["#2a2035", "#382840", "#45304a", "#503850", "#5a4058", "#654860"]},
    {hour: 22, colors: ["#0f0f18", "#141420", "#191928", "#1c1c2b", "#1f1f2e", "#222230"]},
    {hour: 24, colors: ["#050508", "#08080d", "#0b0b12", "#0e0e15", "#101018", "#12121a"]},
];

// Get current time as decimal hours (0-24)
function getDecimalHour() {
    // If in demo mode, return demoHour instead
    if (demoMode) return demoHour;

    const now = new Date();
    return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

// Interpolate between two hex colors
function lerpColor(hex1, hex2, t) {
    const r1 = parseInt(hex1.slice(1, 3), 16), g1 = parseInt(hex1.slice(3, 5), 16), b1 = parseInt(hex1.slice(5, 7), 16);
    const r2 = parseInt(hex2.slice(1, 3), 16), g2 = parseInt(hex2.slice(3, 5), 16), b2 = parseInt(hex2.slice(5, 7), 16);
    const r = Math.round(r1 + (r2 - r1) * t), g = Math.round(g1 + (g2 - g1) * t), b = Math.round(b1 + (b2 - b1) * t);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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
    if (hour >= 21 || hour < 5) return 1;           // full stars
    if (hour >= 20 && hour < 21) return hour - 20;  // fade in 8-9pm
    if (hour >= 5 && hour < 6) return 6 - hour;     // fade out 5-6am
    return 0;
}

function updateBackground() {
    const hour = getDecimalHour();
    const background = document.getElementById("dynamic-background");
    const starsContainer = document.getElementById("stars-container");

    // Get interpolated colors and apply gradient
    const colors = getColorsForTime(hour);
    background.style.background = `linear-gradient(135deg, ${colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(", ")})`;
    background.style.backgroundSize = "150% 150%";

    // Smooth star opacity
    starsContainer.style.opacity = getStarOpacity(hour);

    // Update text color based on day/night
    updateTextColor(hour);
}

// Toggle text between light and dark based on time
function updateTextColor(hour) {
    const isDarkTime = hour >= 19 || hour < 5; // 7pm-6am -> light text, 6am-7pm -> dark text

    if (isDarkTime) {
        document.documentElement.classList.add("dark-mode");
        document.documentElement.classList.remove("light-mode");
    } else {
        document.documentElement.classList.add("light-mode");
        document.documentElement.classList.remove("dark-mode");
    }
}

// ================================
// Stars
// ================================
function createStars() {
    const starsContainer = document.getElementById("stars-container");
    starsContainer.innerHTML = ""; // Clear existing stars

    const starCount = 135; // Number of stars
    const sizes = ["small", "medium", "large"];
    const weights = [0.7, 0.25, 0.05]; // Probability weights for sizes

    for (let i = 0; i < starCount; i++) {
        const star = document.createElement("div");
        star.classList.add("star");

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
        star.style.setProperty("--twinkle-duration", `${2 + Math.random() * 4}s`);
        star.style.setProperty("--twinkle-delay", `${Math.random() * 5}s`);

        starsContainer.appendChild(star);
    }

    // Add occasional shooting stars
    createShootingStars();
}

function createShootingStars() {
    const starsContainer = document.getElementById("stars-container");
    const shootingStarCount = 3;

    for (let i = 0; i < shootingStarCount; i++) {
        const shootingStar = document.createElement("div");
        shootingStar.classList.add("shooting-star");
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
    const clockElement = document.getElementById("clock");
    const dateElement = document.getElementById("date");

    // Use demo time if in demo mode
    let hours, minutes, seconds;
    if (demoMode) {
        hours = Math.floor(demoHour);
        minutes = Math.floor((demoHour % 1) * 60);
        seconds = Math.floor(((demoHour % 1) * 60 % 1) * 60);
    } else {
        hours = now.getHours();
        minutes = now.getMinutes();
        seconds = now.getSeconds();
    }

    const minutesStr = minutes.toString().padStart(2, "0");
    const secondsStr = seconds.toString().padStart(2, "0");

    clockElement.textContent = `${hours}:${minutesStr}:${secondsStr}`;

    // Format date
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    dateElement.textContent = now.toLocaleDateString("en-US", options);
}

// ================================
// Greeting
// ================================
function updateGreeting() {
    const greetingElement = document.getElementById("greeting");
    // Use demo time if in demo mode
    const hour = demoMode ? Math.floor(demoHour) : new Date().getHours();

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

    // Load user name from storage and append if exists
    if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["userName"], (result) => {
            if (result.userName) {
                greetingElement.textContent = `${greeting}, ${result.userName}`;
            } else {
                greetingElement.textContent = greeting;
            }
        });
    } else if (typeof browser !== "undefined" && browser.storage) {
        browser.storage.local.get(["userName"]).then((result) => {
            if (result.userName) {
                greetingElement.textContent = `${greeting}, ${result.userName}`;
            } else {
                greetingElement.textContent = greeting;
            }
        });
    } else {
        const userName = localStorage.getItem("userName");
        if (userName) {
            greetingElement.textContent = `${greeting}, ${userName}`;
        } else {
            greetingElement.textContent = greeting;
        }
    }
}

// ================================
// Search
// ================================
function initSearch() {
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("q");

    // Focus search input on page load
    if (searchInput) {
        searchInput.focus();
    }

    // Handle search form submission using Chrome Search API
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const query = searchInput?.value?.trim();
            if (!query) return;

            // Use Chrome Search API to respect user's default search engine
            if (typeof chrome !== "undefined" && chrome.search && chrome.search.query) {
                chrome.search.query({
                    text: query,
                    disposition: "CURRENT_TAB"
                });
            } else if (typeof browser !== "undefined" && browser.search && browser.search.query) {
                // Firefox compatibility
                browser.search.query({
                    text: query,
                    disposition: "CURRENT_TAB"
                });
            } else {
                // Fallback for local testing - open in omnibox style
                window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

// ================================
// Keyboard Shortcuts & Undock
// ================================
let isUndocked = false;
let autoUndockTimeout = null;
let autoUndockDelay = 0; // ms, 0 = disabled

function initKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        // List of modifier keys to ignore
        const modifierKeys = ["Control", "Alt", "Meta", "Tab"];

        // Escape to undock/blur the screen
        if (e.key === "Escape") {
            e.preventDefault();
            if (!isUndocked) {
                undockScreen();
            } else {
                dockScreen();
            }
            return;
        }

        // Dock back if on any key press (except modifier keys)
        if (isUndocked && !modifierKeys.includes(e.key)) {
            e.preventDefault();
            dockScreen();
            return;
        }

        // Reset auto-undock timer on any key press (except modifier keys)
        if (!modifierKeys.includes(e.key)) {
            resetAutoUndockTimer();
        }

        // Focus search on pressing "/" key
        if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
            e.preventDefault();
            document.getElementById("q").focus();
        }
    });

    // Click anywhere while undocked to dock back, reset timer otherwise
    document.addEventListener("click", () => {
        if (isUndocked) {
            dockScreen();
        } else {
            resetAutoUndockTimer();
        }
    });

    // Reset timer on mouse movement
    document.addEventListener("mousemove", () => {
        if (!isUndocked) {
            resetAutoUndockTimer();
        }
    });

    // Load auto-undock setting and start timer
    loadAutoUndockSetting();
}

function resetAutoUndockTimer() {
    if (autoUndockDelay <= 0) return;

    clearTimeout(autoUndockTimeout);
    autoUndockTimeout = setTimeout(() => {
        if (!isUndocked) {
            undockScreen();
        }
    }, autoUndockDelay);
}

function loadAutoUndockSetting() {
    if (chrome?.storage) {
        chrome.storage.local.get(["autoUndockDelay"], (result) => {
            autoUndockDelay = parseInt(result.autoUndockDelay) || 0;
            if (autoUndockDelay > 0) resetAutoUndockTimer();
        });
    } else if (browser?.storage) {
        browser.storage.local.get(["autoUndockDelay"]).then((result) => {
            autoUndockDelay = parseInt(result.autoUndockDelay) || 0;
            if (autoUndockDelay > 0) resetAutoUndockTimer();
        });
    } else {
        autoUndockDelay = parseInt(localStorage.getItem("autoUndockDelay")) || 0;
        if (autoUndockDelay > 0) resetAutoUndockTimer();
    }
}

function undockScreen() {
    isUndocked = true;
    document.body.classList.add("undocked");
    document.getElementById("q")?.blur();
    clearTimeout(autoUndockTimeout);
}

function dockScreen() {
    isUndocked = false;
    document.body.classList.remove("undocked");
    resetAutoUndockTimer();
}

// ================================
// Demo Mode
// ================================
let demoMode = false;
let demoHour = 0;
let demoUpdatesPerSecond = 30; // How many times to update per second
let demoHoursPerUpdate = 0.04; // How many hours to advance each update (0.01 = 36 seconds of simulated time)

// ================================
// Scheduler
// ================================
function initScheduler() {
    const container = document.getElementById("scheduler-container");
    if (!container) return;

    const iframe = container.querySelector("iframe");

    if (chrome?.storage) {
        chrome.storage.local.get(["showScheduler", "schedulerId"], (result) => {
            if (result.showScheduler === true || result.showScheduler === "true") {
                const schedulerId = result.schedulerId || "";
                iframe.src = `${SCHEDULER_URL_PREFIX}/scheduler?homeisland=true&id=${encodeURIComponent(schedulerId)}`;
                container.classList.remove("hidden");
            }
        });
    } else if (browser?.storage) {
        browser.storage.local.get(["showScheduler", "schedulerId"]).then((result) => {
            if (result.showScheduler === true || result.showScheduler === "true") {
                const schedulerId = result.schedulerId || "";
                iframe.src = `${SCHEDULER_URL_PREFIX}/scheduler?homeisland=true&id=${encodeURIComponent(schedulerId)}`;
                container.classList.remove("hidden");
            }
        });
    } else {
        const showScheduler = localStorage.getItem("showScheduler");
        const schedulerId = localStorage.getItem("schedulerId") || "";
        if (showScheduler === "true") {
            iframe.src = `${SCHEDULER_URL_PREFIX}/scheduler?homeisland=true&id=${encodeURIComponent(schedulerId)}`;
            container.classList.remove("hidden");
        }
    }
}

function toggleDemoMode() {
    demoMode = !demoMode;
    if (demoMode) {
        demoHour = getDecimalHour();
        console.log(`🎬 Demo mode ON - ${demoUpdatesPerSecond} updates/sec, ${demoHoursPerUpdate} hours/update`);
        console.log(`   (${(demoHoursPerUpdate * demoUpdatesPerSecond * 60).toFixed(1)} simulated minutes per real second)`);
        startDemoMode();
    } else {
        console.log("⏸️ Demo mode OFF - Using real time");
    }
}

function startDemoMode() {
    if (!demoMode) return;

    // Calculate interval in milliseconds
    const intervalMs = 1000 / demoUpdatesPerSecond;

    // Advance time at specified rate
    setInterval(() => {
        if (!demoMode) return;

        demoHour += demoHoursPerUpdate;
        if (demoHour >= 24) demoHour = 0; // Loop back to midnight

        // Update with demo time
        const colors = getColorsForTime(demoHour);
        const background = document.getElementById("dynamic-background");
        const starsContainer = document.getElementById("stars-container");

        background.style.background = `linear-gradient(135deg, ${colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(", ")})`;
        starsContainer.style.opacity = getStarOpacity(demoHour);
        updateTextColor(demoHour);

        // Update clock and greeting with demo time
        updateClock();
        updateGreeting();

        console.log(`⏰ Demo time: ${Math.floor(demoHour)}:${Math.floor((demoHour % 1) * 60).toString().padStart(2, "0")}`);
    }, intervalMs);
}

// ================================
// Quick Links / Shortcuts
// ================================
function getFaviconUrl(url, customFavicon) {
    if (customFavicon && customFavicon.trim()) {
        return customFavicon.trim();
    }
    // Extract domain from URL for favicon.im
    try {
        const urlObj = new URL(url);
        return `https://favicon.im/${urlObj.host}`;
    } catch {
        return `https://favicon.im/${url}`;
    }
}

function renderShortcuts(shortcuts) {
    const container = document.getElementById("quick-links");
    if (!container) return;

    container.innerHTML = "";

    shortcuts.forEach(shortcut => {
        if (!shortcut.name || !shortcut.url) return;

        const link = document.createElement("a");
        link.href = shortcut.url;
        link.className = "quick-link";

        const faviconUrl = getFaviconUrl(shortcut.url, shortcut.favicon);

        link.innerHTML = `
            <span class="quick-link-icon"><img src="${faviconUrl}" alt="${shortcut.name} icon" class="quick-link-favicon"></span>
            <span class="quick-link-text">${shortcut.name}</span>
        `;

        container.appendChild(link);
    });
}

function loadShortcuts() {
    if (chrome?.storage) {
        chrome.storage.local.get(["shortcuts"], (result) => {
            const shortcuts = result.shortcuts ? JSON.parse(result.shortcuts) : DEFAULT_SHORTCUTS;
            renderShortcuts(shortcuts);
        });
    } else if (browser?.storage) {
        browser.storage.local.get(["shortcuts"]).then((result) => {
            const shortcuts = result.shortcuts ? JSON.parse(result.shortcuts) : DEFAULT_SHORTCUTS;
            renderShortcuts(shortcuts);
        });
    } else {
        const shortcutsStr = localStorage.getItem("shortcuts");
        const shortcuts = shortcutsStr ? JSON.parse(shortcutsStr) : DEFAULT_SHORTCUTS;
        renderShortcuts(shortcuts);
    }
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

    // Load demo mode setting from storage
    loadDemoModeSetting();

    // Initialize scheduler
    initScheduler();

    // Load custom shortcuts
    loadShortcuts();

    // Enable color transitions after initial render
    requestAnimationFrame(() => {
        document.body.classList.add("transitions-ready");
    });

    console.log("🏝️ Home Island loaded successfully!");
}

// Load demo mode setting from storage
function loadDemoModeSetting() {
    if (chrome?.storage) {
        chrome.storage.local.get(["demoMode"], (result) => {
            if (result.demoMode === true || result.demoMode === "true") {
                toggleDemoMode();
            }
        });
    } else if (browser?.storage) {
        browser.storage.local.get(["demoMode"]).then((result) => {
            if (result.demoMode === true || result.demoMode === "true") {
                toggleDemoMode();
            }
        });
    } else {
        const demoSetting = localStorage.getItem("demoMode");
        if (demoSetting === "true") {
            toggleDemoMode();
        }
    }
}

// Run initialization when DOM is ready
document.addEventListener("DOMContentLoaded", init);
