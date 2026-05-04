let cart = JSON.parse(localStorage.getItem("cart")) || [];
let currentPage = 1;
const itemsPerPage = 6;
const orderDetailsKey = "orderDetails";

function getFoods() {
    return JSON.parse(localStorage.getItem("foods")) || [];
}

function getOrderDetails() {
    return JSON.parse(localStorage.getItem(orderDetailsKey)) || null;
}

function hasOrderDetails() {
    const details = getOrderDetails();

    return Boolean(
        details &&
        details.fullName &&
        details.phone &&
        details.email &&
        details.address
    );
}

function showOrderRequirement(message) {
    const msg = document.getElementById("msg");
    const orderSection = document.querySelector(".contact");

    if (msg) {
        msg.textContent = message;
        msg.style.color = "red";
        msg.classList.add("is-visible");
    }

    if (orderSection) {
        orderSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function loadSavedOrderDetails() {
    const details = getOrderDetails();

    if (!details) {
        return;
    }

    const fullName = document.getElementById("fullName");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const address = document.getElementById("address");
    const msg = document.getElementById("msg");

    if (fullName) fullName.value = details.fullName || "";
    if (phone) phone.value = details.phone || "";
    if (email) email.value = details.email || "";
    if (address) address.value = details.address || "";

    if (msg) {
        msg.textContent = "";
        msg.classList.remove("is-visible");
    }
}

function resetOrderForm() {
    const fullName = document.getElementById("fullName");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const address = document.getElementById("address");
    const msg = document.getElementById("msg");

    if (fullName) fullName.value = "";
    if (phone) phone.value = "";
    if (email) email.value = "";
    if (address) address.value = "";

    localStorage.removeItem(orderDetailsKey);

    if (msg) {
        msg.textContent = "";
        msg.classList.remove("is-visible");
    }
}

function showCheckoutPrompt() {
    const prompt = document.getElementById("checkoutPrompt");

    if (!prompt) {
        window.location.href = "cart.html";
        return;
    }

    prompt.classList.add("is-visible");

    window.setTimeout(() => {
        window.location.href = "cart.html";
    }, 1200);
}

function placeCheckoutPrompt() {
    const prompt = document.getElementById("checkoutPrompt");
    const orderSection = document.querySelector(".contact");

    if (!prompt || !orderSection) {
        return;
    }

    orderSection.appendChild(prompt);
}

function displayFoods(list = getFoods(), page = 1) {
    const container = document.getElementById("foodList");
    const pagination = document.getElementById("pagination");

    container.innerHTML = "";

    if (list.length === 0) {
        container.innerHTML = "<p>No foods available yet.</p>";
        if (pagination) pagination.innerHTML = "";
        return;
    }

    const totalPages = Math.ceil(list.length / itemsPerPage);
    currentPage = page;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedFoods = list.slice(start, end);

    paginatedFoods.forEach((food) => {
        container.innerHTML += `
            <div class="card">
                <img src="${food.image}" alt="${food.name}">
                <div class="card-content">
                    <h3>${food.name}</h3>
                    <p>${food.restaurant || ""}</p>
                    <p class="price">RWF ${food.price}</p>
                    <button onclick="addToCart(${food.id})">Add to Cart</button>
                </div>
            </div>
        `;
    });

    renderPagination(list, totalPages);
}

function renderPagination(list, totalPages) {
    const pagination = document.getElementById("pagination");
    if (!pagination) return;

    pagination.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        pagination.innerHTML += `
            <button onclick='displayFoods(${JSON.stringify(list)}, ${i})' class="${i === currentPage ? "active-page" : ""}">
                ${i}
            </button>
        `;
    }
}

function filterCategory(category) {
    const foods = getFoods();

    if (category === "All") {
        displayFoods(foods, 1);
    } else {
        const filtered = foods.filter((f) => f.category === category);
        displayFoods(filtered, 1);
    }
}

const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", (e) => {
        const value = e.target.value.toLowerCase();
        const foods = getFoods();

        const filtered = foods.filter((f) =>
            (f.name || "").toLowerCase().includes(value) ||
            (f.restaurant || "").toLowerCase().includes(value)
        );

        displayFoods(filtered, 1);
    });
}

function addToCart(id) {
    if (!hasOrderDetails()) {
        showOrderRequirement("Please fill in and submit the Place order form before adding items to cart.");
        return;
    }

    const orderDetails = getOrderDetails();
    const foods = getFoods();
    const item = foods.find((f) => f.id === id);

    if (!item) {
        alert("Item not found.");
        return;
    }

    cart.push({
        ...item,
        client: {
            fullName: orderDetails.fullName,
            phone: orderDetails.phone,
            address: orderDetails.address
        }
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    resetOrderForm();
    showCheckoutPrompt();
}

window.addEventListener("storage", (e) => {
    if (e.key === "foods") {
        displayFoods(getFoods(), 1);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    placeCheckoutPrompt();
    loadSavedOrderDetails();
    displayFoods(getFoods(), 1);
});

function submitContact() {
    const fullName = document.getElementById("fullName");
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");
    const address = document.getElementById("address");
    const msg = document.getElementById("msg");

    if (!fullName || !phone || !email || !address || !msg) {
        return;
    }

    if (
        fullName.value.trim() === "" ||
        phone.value.trim() === "" ||
        email.value.trim() === "" ||
        address.value.trim() === ""
    ) {
        msg.textContent = "Please fill in all fields.";
        msg.style.color = "red";
        msg.classList.add("is-visible");
        return;
    }

    localStorage.setItem(
        orderDetailsKey,
        JSON.stringify({
            fullName: fullName.value.trim(),
            phone: phone.value.trim(),
            email: email.value.trim(),
            address: address.value.trim()
        })
    );

    alert("Place an order");
    msg.textContent = "";
    msg.classList.remove("is-visible");
}
