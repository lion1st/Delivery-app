const currentUser = JSON.parse(localStorage.getItem("currentUser"));

if (!currentUser || currentUser.role !== "admin") {
    alert("Access denied! Admin only.");
    window.location.href = "admin-login.html";
}

let foods = JSON.parse(localStorage.getItem("foods")) || [];
let editId = null;

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const restaurantInput = document.getElementById("restaurant");
const categoryInput = document.getElementById("category");
const updateBtn = document.getElementById("updateBtn");
const addBtn = document.getElementById("addBtn");
const adminBadge = document.getElementById("adminLiveBadge");
const adminBadgeText = document.getElementById("adminLiveBadgeText");
const adminListHeader = document.querySelector(".admin-list-header");

function save() {
    localStorage.setItem("foods", JSON.stringify(foods));
    window.dispatchEvent(new Event("foodsUpdated"));
}

function formatCategory(category) {
    const value = category.trim().toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function setAdminBadgeStatus(status, label) {
    if (!adminBadge || !adminBadgeText) {
        return;
    }

    adminBadge.dataset.status = status;
    adminBadgeText.textContent = label;
}

function display() {
    const container = document.getElementById("adminList");
    container.innerHTML = "";

    if (foods.length === 0) {
        container.innerHTML = "<p>No foods added yet.</p>";
        return;
    }

    foods.forEach((food) => {
        container.innerHTML += `
            <div class="admin-card">
                ${food.image ? `<img src="${food.image}" alt="${food.name}" width="120">` : ""}
                <h3>${food.name}</h3>
                <p>RWF ${food.price}</p>
                <p>${food.category}</p>
                <p>${food.restaurant || "QuickEats"}</p>
                <button onclick="editFood(${food.id})">Edit</button>
                <button onclick="deleteFood(${food.id})">Delete</button>
            </div>
        `;
    });
}

function addFood() {
    const newFood = {
        id: Date.now(),
        name: nameInput.value.trim(),
        price: priceInput.value.trim(),
        image: imageInput.value.trim(),
        restaurant: restaurantInput.value.trim(),
        category: formatCategory(categoryInput.value)
    };

    if (!newFood.name || !newFood.price || !newFood.category) {
        alert("Please fill in name, price, and category.");
        return;
    }

    foods.push(newFood);
    save();
    display();
    clearForm();
    setAdminBadgeStatus("success", `${newFood.name} added. Click to review menu.`);
}

function deleteFood(id) {
    foods = foods.filter((food) => food.id !== id);
    save();
    display();
    setAdminBadgeStatus("live", "Live Menu Control");
}

function editFood(id) {
    const food = foods.find((item) => item.id === id);

    if (!food) {
        return;
    }

    nameInput.value = food.name || "";
    priceInput.value = food.price || "";
    imageInput.value = food.image || "";
    restaurantInput.value = food.restaurant || "";
    categoryInput.value = food.category || "";
    editId = id;

    if (addBtn) addBtn.style.display = "none";
    if (updateBtn) updateBtn.style.display = "block";

    setAdminBadgeStatus("editing", `Editing ${food.name}. Click to view menu.`);
    document.querySelector(".admin-form-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateFood() {
    let updatedFoodName = "Food";

    foods = foods.map((food) => {
        if (food.id === editId) {
            updatedFoodName = nameInput.value.trim() || food.name;

            return {
                ...food,
                name: updatedFoodName,
                price: priceInput.value.trim(),
                image: imageInput.value.trim(),
                restaurant: restaurantInput.value.trim(),
                category: formatCategory(categoryInput.value)
            };
        }

        return food;
    });

    save();
    display();
    clearForm();

    if (addBtn) addBtn.style.display = "block";
    if (updateBtn) updateBtn.style.display = "none";

    editId = null;
    setAdminBadgeStatus("success", `${updatedFoodName} updated. Click to review menu.`);
}

function clearForm() {
    nameInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    restaurantInput.value = "";
    categoryInput.value = "";
}

if (adminBadge) {
    adminBadge.addEventListener("click", () => {
        adminListHeader?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
}

display();
