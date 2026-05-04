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

/* SAVE TO STORAGE */
function save() {
    localStorage.setItem("foods", JSON.stringify(foods));
}

/* DISPLAY */
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
                <h3>${food.name}</h3>
                <p>RWF ${food.price}</p>
                <p>${food.category}</p>
                <p>${food.restaurant}</p>
                ${food.image ? `<img src="${food.image}" alt="${food.name}" width="120">` : ""}
                <button onclick="editFood(${food.id})">Edit</button>
                <button onclick="deleteFood(${food.id})">Delete</button>
            </div>
        `;
    });
}

/* CREATE */
function addFood() {
    const newFood = {
        id: Date.now(),
        name: nameInput.value.trim(),
        price: priceInput.value.trim(),
        image: imageInput.value.trim(),
        restaurant: restaurantInput.value.trim(),
        category: categoryInput.value.trim()
    };

    if (!newFood.name || !newFood.price || !newFood.category) {
        alert("Please fill in name, price, and category.");
        return;
    }

    foods.push(newFood);
    save();
    display();
    clearForm();
}

/* DELETE */
function deleteFood(id) {
    foods = foods.filter((f) => f.id !== id);
    save();
    display();
}

/* EDIT */
function editFood(id) {
    const food = foods.find((f) => f.id === id);
    if (!food) return;

    nameInput.value = food.name || "";
    priceInput.value = food.price || "";
    imageInput.value = food.image || "";
    restaurantInput.value = food.restaurant || "";
    categoryInput.value = food.category || "";

    editId = id;

    if (addBtn) addBtn.style.display = "none";
    if (updateBtn) updateBtn.style.display = "block";
}

/* UPDATE */
function updateFood() {
    foods = foods.map((f) => {
        if (f.id === editId) {
            return {
                ...f,
                name: nameInput.value.trim(),
                price: priceInput.value.trim(),
                image: imageInput.value.trim(),
                restaurant: restaurantInput.value.trim(),
                category: categoryInput.value.trim()
            };
        }
        return f;
    });

    save();
    display();
    clearForm();

    if (addBtn) addBtn.style.display = "block";
    if (updateBtn) updateBtn.style.display = "none";

    editId = null;
}

/* CLEAR FORM */
function clearForm() {
    nameInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    restaurantInput.value = "";
    categoryInput.value = "";
}

display();
window.dispatchEvent(new Event("foodsUpdated"));
function formatCategory(category) {
    const value = category.trim().toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/* CREATE */
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
}

/* UPDATE */
function updateFood() {
    foods = foods.map((f) => {
        if (f.id === editId) {
            return {
                ...f,
                name: nameInput.value.trim(),
                price: priceInput.value.trim(),
                image: imageInput.value.trim(),
                restaurant: restaurantInput.value.trim(),
                category: formatCategory(categoryInput.value)
            };
        }
        return f;
    });

    save();
    display();
    clearForm();

    if (addBtn) addBtn.style.display = "block";
    if (updateBtn) updateBtn.style.display = "none";

    editId = null;
}
