const ICON_UP = '<svg width="8" height="5" viewBox="0 0 8 5"><path d="M1 4L4 1L7 4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON_DOWN = '<svg width="8" height="5" viewBox="0 0 8 5"><path d="M1 1L4 4L7 1" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Default shortcuts
const DEFAULT_SHORTCUTS = [
    {name: "Outlook", url: "https://outlook.live.com", favicon: ""},
    {name: "OneDrive", url: "https://onedrive.live.com", favicon: "https://onedrive.live.com/_layouts/15/images/odbfavicon.ico"},
    {name: "Word", url: "https://word.cloud.microsoft", favicon: ""},
    {name: "Excel", url: "https://excel.cloud.microsoft", favicon: ""},
    {name: "PowerPoint", url: "https://powerpoint.cloud.microsoft", favicon: ""},
    {name: "Gmail", url: "https://mail.google.com", favicon: ""},
    {name: "YouTube", url: "https://youtube.com", favicon: ""},
    {name: "GitHub", url: "https://github.com", favicon: ""},
    {name: "Spotify", url: "https://spotify.com", favicon: ""}
];

// Storage helper
const storage = {
    get: keys => new Promise(resolve => {
        if (chrome?.storage) chrome.storage.local.get(keys, resolve);
        else if (browser?.storage) browser.storage.local.get(keys).then(resolve);
        else {
            const result = {};
            keys.forEach(k => result[k] = localStorage.getItem(k));
            resolve(result);
        }
    }),
    set: data => new Promise(resolve => {
        if (chrome?.storage) chrome.storage.local.set(data, resolve);
        else if (browser?.storage) browser.storage.local.set(data).then(resolve);
        else {
            Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, v));
            resolve();
        }
    })
};

// Load settings
async function loadSettings() {
    const result = await storage.get(["userName", "demoMode", "autoUndockDelay", "showScheduler", "schedulerId", "shortcuts"]);

    if (result.userName) document.getElementById("userName").value = result.userName;
    if (result.demoMode === true || result.demoMode === "true") document.getElementById("demoToggle").checked = true;
    if (result.autoUndockDelay) document.getElementById("autoUndock").value = result.autoUndockDelay;
    if (result.showScheduler === true || result.showScheduler === "true") {
        document.getElementById("schedulerToggle").checked = true;
        document.getElementById("schedulerIdGroup").style.display = "block";
    }
    if (result.schedulerId) document.getElementById("schedulerId").value = result.schedulerId;

    renderShortcuts(result.shortcuts ? JSON.parse(result.shortcuts) : DEFAULT_SHORTCUTS);
}

// Render shortcuts list
function renderShortcuts(shortcuts) {
    const container = document.getElementById("shortcutList");
    container.innerHTML = shortcuts.map((s, i) => `
        <div class="shortcut-item">
            <div class="reorder-btns">
                <button type="button" class="btn-reorder btn-up" data-index="${i}" title="Move up" ${i === 0 ? 'disabled' : ''}>${ICON_UP}</button>
                <button type="button" class="btn-reorder btn-down" data-index="${i}" title="Move down" ${i === shortcuts.length - 1 ? 'disabled' : ''}>${ICON_DOWN}</button>
            </div>
            <input type="text" class="shortcut-name" value="${escapeHtml(s.name)}" placeholder="Name" maxlength="20">
            <input type="text" class="shortcut-url" value="${escapeHtml(s.url)}" placeholder="URL">
            <input type="text" class="shortcut-favicon" value="${escapeHtml(s.favicon || '')}" placeholder="Favicon (optional)">
            <button type="button" class="btn-remove" data-index="${i}" title="Remove">×</button>
        </div>
    `).join('');

    container.querySelectorAll("input").forEach(input => input.addEventListener("input", saveShortcuts));
    container.querySelectorAll(".btn-remove").forEach(btn => btn.addEventListener("click", e => removeShortcut(+e.target.dataset.index)));
    container.querySelectorAll(".btn-up").forEach(btn => btn.addEventListener("click", e => moveShortcut(+e.target.dataset.index, -1)));
    container.querySelectorAll(".btn-down").forEach(btn => btn.addEventListener("click", e => moveShortcut(+e.target.dataset.index, 1)));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Get current shortcuts from form
function getShortcutsFromForm() {
    return [...document.querySelectorAll(".shortcut-item")].map(item => ({
        name: item.querySelector(".shortcut-name").value.trim(),
        url: item.querySelector(".shortcut-url").value.trim(),
        favicon: item.querySelector(".shortcut-favicon").value.trim()
    })).filter(s => s.name && s.url);
}

// Save shortcuts
async function saveShortcuts() {
    await storage.set({shortcuts: JSON.stringify(getShortcutsFromForm())});
    showStatus("Saved!");
}

// Add new shortcut
function addShortcut() {
    const shortcuts = getShortcutsFromForm();
    shortcuts.push({name: "", url: "", favicon: ""});
    renderShortcuts(shortcuts);
    document.querySelectorAll(".shortcut-name").item(shortcuts.length - 1)?.focus();
}

// Remove shortcut
async function removeShortcut(index) {
    const shortcuts = getShortcutsFromForm();
    shortcuts.splice(index, 1);
    renderShortcuts(shortcuts);
    await storage.set({shortcuts: JSON.stringify(shortcuts)});
    showStatus("Saved!");
}

// Move shortcut up or down
async function moveShortcut(index, direction) {
    const shortcuts = getShortcutsFromForm();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= shortcuts.length) return;
    [shortcuts[index], shortcuts[newIndex]] = [shortcuts[newIndex], shortcuts[index]];
    renderShortcuts(shortcuts);
    await storage.set({shortcuts: JSON.stringify(shortcuts)});
    showStatus("Saved!");
}

// Reset shortcuts to default
async function resetShortcuts() {
    renderShortcuts(DEFAULT_SHORTCUTS);
    await storage.set({shortcuts: JSON.stringify(DEFAULT_SHORTCUTS)});
    showStatus("Reset to defaults!");
}

// Save settings
async function saveSettings() {
    const userName = document.getElementById("userName").value.trim();
    const demoMode = document.getElementById("demoToggle").checked;
    const autoUndockDelay = document.getElementById("autoUndock").value;
    const showScheduler = document.getElementById("schedulerToggle").checked;
    const schedulerId = document.getElementById("schedulerId").value.trim();

    // Show/hide scheduler ID field based on toggle
    document.getElementById("schedulerIdGroup").style.display = showScheduler ? "block" : "none";

    await storage.set({userName, demoMode, autoUndockDelay, showScheduler, schedulerId});
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
document.getElementById("schedulerId").addEventListener("input", saveSettings);
document.getElementById("addShortcut").addEventListener("click", addShortcut);
document.getElementById("resetShortcuts").addEventListener("click", resetShortcuts);

// Load on page load
loadSettings();
