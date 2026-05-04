function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

function setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "admin-login.html";
}

function requireAdmin() {
    const currentUser = getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
        alert("Access denied! Admin only.");
        window.location.href = "admin-login.html";
    }
}
