// Options page script

// Storage helper
const storage = {
    get: (keys) => {
        return new Promise((resolve) => {
            if (chrome?.storage) {
                chrome.storage.local.get(keys, resolve);
            } else if (browser?.storage) {
                browser.storage.local.get(keys).then(resolve);
            } else {
                const result = {};
                keys.forEach(k => result[k] = localStorage.getItem(k));
                resolve(result);
            }
        });
    },
    set: (data) => {
        return new Promise((resolve) => {
            if (chrome?.storage) {
                chrome.storage.local.set(data, resolve);
            } else if (browser?.storage) {
                browser.storage.local.set(data).then(resolve);
            } else {
                Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
                resolve();
            }
        });
    },
    remove: (key) => {
        return new Promise((resolve) => {
            if (chrome?.storage) {
                chrome.storage.local.remove(key, resolve);
            } else if (browser?.storage) {
                browser.storage.local.remove(key).then(resolve);
            } else {
                localStorage.removeItem(key);
                resolve();
            }
        });
    }
};

// Load settings
async function loadSettings() {
    const result = await storage.get(["userName", "demoMode", "autoUndockDelay", "showScheduler"]);
    if (result.userName) {
        document.getElementById("userName").value = result.userName;
    }
    if (result.demoMode === true || result.demoMode === "true") {
        document.getElementById("demoToggle").checked = true;
    }
    if (result.autoUndockDelay) {
        document.getElementById("autoUndock").value = result.autoUndockDelay;
    }
    if (result.showScheduler === true || result.showScheduler === "true") {
        document.getElementById("schedulerToggle").checked = true;
    }
}

// Save settings
async function saveSettings() {
    const userName = document.getElementById("userName").value.trim();
    const demoMode = document.getElementById("demoToggle").checked;
    const autoUndockDelay = document.getElementById("autoUndock").value;
    const showScheduler = document.getElementById("schedulerToggle").checked;

    await storage.set({userName, demoMode, autoUndockDelay, showScheduler});
    showStatus("Saved!");
}

// Show status message
function showStatus(message) {
    const status = document.getElementById("status");
    status.textContent = message;
    status.classList.add("show", "success");
    setTimeout(() => status.classList.remove("show"), 2000);
}

// Event listeners - auto save on change
document.getElementById("userName").addEventListener("input", saveSettings);
document.getElementById("demoToggle").addEventListener("change", saveSettings);
document.getElementById("autoUndock").addEventListener("change", saveSettings);
document.getElementById("schedulerToggle").addEventListener("change", saveSettings);

// Load on page load
loadSettings();
