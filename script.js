"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

const storageKey = "glowGuideLuxury";

function loadData() {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        return saved && typeof saved === "object" ? saved : {};
    } catch (error) {
        console.error("Could not read saved Glow Guide data:", error);
        return {};
    }
}

let data = loadData();

function saveData() {
    try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error("Could not save Glow Guide data:", error);
        return false;
    }
}

function money(amount) {
    return "KSh " + Number(amount || 0).toLocaleString("en-KE");
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getCustomProducts() {
    return Array.isArray(data.customProducts) ? data.customProducts : [];
}

// MOBILE NAVIGATION
const menuToggle = $("#menuToggle");
const navigation = $("#navigation");

if (menuToggle && navigation) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navigation.classList.toggle("open");
        menuToggle.textContent = isOpen ? "CLOSE −" : "MENU +";
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    $$("nav a").forEach(link => {
        link.addEventListener("click", () => {
            navigation.classList.remove("open");
            menuToggle.textContent = "MENU +";
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

// PRODUCT FILTERS
$$(".filter").forEach(button => {
    button.addEventListener("click", () => {
        $$(".filter").forEach(item => item.classList.remove("active"));
        button.classList.add("active");

        const category = button.dataset.category;

        $$(".product-card").forEach(product => {
            const matches =
                category === "all" ||
                product.dataset.category === category;

            product.classList.toggle("hidden", !matches);
        });
    });
});

// SHOPPING BAG
let bag = Array.isArray(data.bag) ? data.bag : [];

function renderBag() {
    const list = $("#bagList");
    const bagCount = $("#bagCount");
    const bagItems = $("#bagItems");
    const bagTotal = $("#bagTotal");

    let total = 0;
    let itemCount = 0;

    bag = bag.filter(item =>
        item &&
        typeof item.name === "string" &&
        Number.isFinite(Number(item.price)) &&
        Number(item.price) >= 0 &&
        Number(item.quantity) > 0
    );

    bag.forEach(item => {
        item.price = Number(item.price);
        item.quantity = Math.floor(Number(item.quantity));
        total += item.price * item.quantity;
        itemCount += item.quantity;
    });

    if (list) {
        list.replaceChildren();

        if (bag.length === 0) {
            const empty = document.createElement("p");
            empty.className = "muted";
            empty.textContent = "Your bag is currently empty.";
            list.appendChild(empty);
        }

        bag.forEach((item, index) => {
            const row = document.createElement("div");
            row.className = "bag-item";

            const details = document.createElement("span");
            details.textContent = `${item.name} × ${item.quantity}`;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = "remove-item";
            remove.textContent = "REMOVE";
            remove.setAttribute("aria-label", `Remove ${item.name}`);

            remove.addEventListener("click", () => {
                bag.splice(index, 1);
                data.bag = bag;
                saveData();
                renderBag();
            });

            row.append(details, remove);
            list.appendChild(row);
        });
    }

    if (bagCount) bagCount.textContent = itemCount;
    if (bagItems) {
        bagItems.textContent = `${itemCount} ${itemCount === 1 ? "ITEM" : "ITEMS"}`;
    }
    if (bagTotal) bagTotal.textContent = money(total);

    data.bag = bag;
    saveData();
}

$$(".add-button").forEach(button => {
    button.addEventListener("click", () => {
        const name = button.dataset.name;
        const price = Number(button.dataset.price);

        if (!name || !Number.isFinite(price) || price < 0) return;

        const existing = bag.find(item => item.name === name);

        if (existing) {
            existing.quantity += 1;
        } else {
            bag.push({ name, price, quantity: 1 });
        }

        renderBag();

        const originalText = button.textContent;
        button.textContent = "ADDED ✓";
        button.disabled = true;

        window.setTimeout(() => {
            button.textContent = originalText || "ADD +";
            button.disabled = false;
        }, 900);
    });
});

const bagButton = $("#bagButton");
if (bagButton) {
    bagButton.addEventListener("click", () => {
        $("#shoppingBag")?.scrollIntoView({ behavior: "smooth" });
    });
}

const clearBagButton = $("#clearBag");
if (clearBagButton) {
    clearBagButton.addEventListener("click", () => {
        bag = [];
        data.bag = [];
        saveData();
        renderBag();
    });
}

renderBag();

// ROUTINE CHECKLIST
const routines = {
    morning: [
        "Cleanse my face",
        "Apply serum",
        "Moisturise",
        "Apply sunscreen"
    ],
    evening: [
        "Remove makeup and sunscreen",
        "Cleanse my face",
        "Apply evening treatment",
        "Moisturise"
    ]
};

let activeTime = "morning";

if (!data.completed || typeof data.completed !== "object") {
    data.completed = { morning: [], evening: [] };
}

function renderRoutine() {
    const list = $("#routineList");
    if (!list) return;

    list.replaceChildren();

    const tasks = routines[activeTime];
    const completed = Array.isArray(data.completed[activeTime])
        ? data.completed[activeTime]
        : [];

    tasks.forEach((task, index) => {
        const label = document.createElement("label");
        label.className = "routine-item";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = completed.includes(index);

        const text = document.createElement("span");
        text.textContent = task;

        checkbox.addEventListener("change", () => {
            const current = new Set(
                Array.isArray(data.completed[activeTime])
                    ? data.completed[activeTime]
                    : []
            );

            checkbox.checked ? current.add(index) : current.delete(index);
            data.completed[activeTime] = [...current];
            saveData();
            renderRoutine();
        });

        label.append(checkbox, text);
        list.appendChild(label);
    });

    const percent = Math.round((completed.length / tasks.length) * 100);

    if ($("#progressText")) $("#progressText").textContent = `${percent}%`;
    if ($("#progressBar")) $("#progressBar").style.width = `${percent}%`;

    if ($("#routineMessage")) {
        $("#routineMessage").textContent = percent === 100
            ? "Beautiful work. You've completed this routine."
            : `You've completed ${completed.length} of ${tasks.length} steps.`;
    }
}

$$(".routine-tab").forEach(button => {
    button.addEventListener("click", () => {
        activeTime = button.dataset.time;

        $$(".routine-tab").forEach(tab => {
            tab.classList.toggle("active", tab === button);
        });

        renderRoutine();
    });
});

const resetRoutine = $("#resetRoutine");
if (resetRoutine) {
    resetRoutine.addEventListener("click", () => {
        data.completed[activeTime] = [];
        saveData();
        renderRoutine();
    });
}

renderRoutine();

// WATER TRACKER
let water = Math.max(0, Math.min(12, Number(data.water) || 0));

function renderWater() {
    water = Math.max(0, Math.min(12, water));

    if ($("#waterCount")) $("#waterCount").textContent = water;
    if ($("#waterBar")) {
        $("#waterBar").style.width = `${Math.min((water / 8) * 100, 100)}%`;
    }
    if ($("#waterMessage")) {
        $("#waterMessage").textContent = water >= 8
            ? "You've reached your reminder goal."
            : "Every little pause counts.";
    }

    data.water = water;
    saveData();
}

$("#waterPlus")?.addEventListener("click", () => {
    water = Math.min(12, water + 1);
    renderWater();
});

$("#waterMinus")?.addEventListener("click", () => {
    water = Math.max(0, water - 1);
    renderWater();
});

renderWater();

// MOOD AND JOURNAL
let mood = data.mood || "";

function renderMood() {
    $$(".mood-button").forEach(button => {
        const selected = button.dataset.mood === mood;
        button.classList.toggle("selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
}

$$(".mood-button").forEach(button => {
    button.addEventListener("click", () => {
        mood = button.dataset.mood;
        renderMood();
    });
});

if ($("#journalEntry")) {
    $("#journalEntry").value = data.journal || "";
}

$("#saveJournal")?.addEventListener("click", () => {
    data.mood = mood;
    data.journal = $("#journalEntry")?.value.trim() || "";
    data.journalSavedAt = new Date().toISOString();

    const success = saveData();
    if ($("#saveMessage")) {
        $("#saveMessage").textContent = success
            ? "Your note has been saved in this browser."
            : "Your note could not be saved. Check your browser storage settings.";
    }

    renderSavedJournal();
});

renderMood();

// NEWSLETTER DEMO
$("#newsletterForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const input = $("#emailInput");
    const message = $("#newsletterMessage");

    if (!input || !input.checkValidity()) {
        input?.reportValidity();
        return;
    }

    if (message) {
        message.textContent =
            "Thank you for your interest in Glow Guide! This is a demonstration form.";
    }

    input.value = "";
});

// SHARED CUSTOM PRODUCTS
function renderCustomProducts() {
    const products = getCustomProducts();
    const list = $("#customProductList");
    const empty = $("#customProductEmpty");
    const view = $("#routineView")?.value || "all";

    if (!list) return;

    list.replaceChildren();

    const filtered = products.filter(product => {
        if (view === "all") return true;
        return product.time === view || product.time === "both";
    });

    if (empty) empty.hidden = filtered.length > 0;

    filtered.forEach(product => {
        const card = document.createElement("article");
        card.className = "saved-product";

        const title = document.createElement("h3");
        title.textContent = product.name;

        const meta = document.createElement("p");
        meta.className = "category";
        meta.textContent =
            `${product.category} · ${product.time === "both" ? "morning & evening" : product.time}`;

        card.append(title, meta);

        if (product.notes) {
            const notes = document.createElement("p");
            notes.textContent = product.notes;
            card.appendChild(notes);
        }

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "remove-item";
        remove.textContent = "REMOVE";
        remove.addEventListener("click", () => {
            data.customProducts = getCustomProducts().filter(item => item.id !== product.id);
            saveData();
            renderCustomProducts();
            renderJournalProducts();
        });

        card.appendChild(remove);
        list.appendChild(card);
    });
}

$("#routineView")?.addEventListener("change", renderCustomProducts);

$("#productForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const nameInput = $("#productName");
    const categoryInput = $("#productCategory");
    const timeInput = $("#productTime");
    const notesInput = $("#productNotes");
    const message = $("#productFormMessage");

    if (!nameInput || !categoryInput || !timeInput) return;

    const name = nameInput.value.trim();
    const category = categoryInput.value;
    const time = timeInput.value;
    const notes = notesInput?.value.trim() || "";

    if (name.length < 2 || name.length > 60) {
        nameInput.setCustomValidity("Enter a name between 2 and 60 characters.");
        nameInput.reportValidity();
        nameInput.setCustomValidity("");
        return;
    }

    if (!category || !["cleanse", "treat", "hydrate", "protect", "other"].includes(category)) {
        categoryInput.reportValidity();
        return;
    }

    if (!["morning", "evening", "both"].includes(time)) {
        timeInput.reportValidity();
        return;
    }

    const products = getCustomProducts();
    products.push({
        id: (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`),
        name,
        category,
        time,
        notes,
        createdAt: new Date().toISOString()
    });

    data.customProducts = products;
    const success = saveData();

    if (message) {
        message.textContent = success
            ? "Your product has been saved and will appear in your journal."
            : "Could not save. Your browser may have storage disabled.";
    }

    if (success) {
        event.target.reset();
        renderCustomProducts();
        renderJournalProducts();
    }
});

renderCustomProducts();

// JOURNAL PAGE: READ SHARED DATA
function renderJournalProducts() {
    const list = $("#journalProducts");
    const empty = $("#journalProductsEmpty");

    if (!list) return;

    const products = getCustomProducts();
    list.replaceChildren();

    if (empty) empty.hidden = products.length > 0;

    products.forEach(product => {
        const card = document.createElement("article");
        card.className = "saved-product";

        const title = document.createElement("h3");
        title.textContent = product.name;

        const meta = document.createElement("p");
        meta.className = "category";
        meta.textContent = `${product.category} · ${product.time}`;

        card.append(title, meta);

        if (product.notes) {
            const notes = document.createElement("p");
            notes.textContent = product.notes;
            card.appendChild(notes);
        }

        list.appendChild(card);
    });
}

function renderSavedJournal() {
    if ($("#savedMood")) {
        $("#savedMood").textContent = data.mood || "Not selected yet";
    }

    if ($("#savedJournalEntry")) {
        $("#savedJournalEntry").textContent =
            data.journal?.trim() || "No reflection saved yet. Your next check-in can start here.";
    }

    if ($("#journalSavedStatus")) {
        const date = data.journalSavedAt
            ? new Date(data.journalSavedAt).toLocaleString("en-KE", {
                dateStyle: "medium",
                timeStyle: "short"
            })
            : "";

        $("#journalSavedStatus").textContent = date
            ? `Last saved: ${date}`
            : "Your notes are stored in this browser.";
    }
}

function renderJournalStats() {
    const morningDone = Array.isArray(data.completed?.morning)
        ? data.completed.morning.length
        : 0;
    const eveningDone = Array.isArray(data.completed?.evening)
        ? data.completed.evening.length
        : 0;

    if ($("#journalMorningProgress")) {
        $("#journalMorningProgress").textContent =
            `${Math.round((morningDone / routines.morning.length) * 100)}%`;
    }

    if ($("#journalEveningProgress")) {
        $("#journalEveningProgress").textContent =
            `${Math.round((eveningDone / routines.evening.length) * 100)}%`;
    }

    if ($("#journalWaterCount")) {
        $("#journalWaterCount").textContent = `${Number(data.water) || 0} glasses`;
    }

    if ($("#journalBagCount")) {
        const count = (Array.isArray(data.bag) ? data.bag : [])
            .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        $("#journalBagCount").textContent = `${count} items`;
    }
}

renderJournalProducts();
renderSavedJournal();
renderJournalStats();

// DATE ON HOME PAGE
if ($("#todayDate")) {
    $("#todayDate").textContent = new Date().toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short"
    });
}