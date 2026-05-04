(function initializeDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const hasAdmin = users.some((user) => user.role === "admin");

    if (!hasAdmin) {
        users.push({
            id: Date.now(),
            name: "Main Admin",
            email: "admin@quickeats.com",
            password: "admin123",
            role: "admin"
        });

        localStorage.setItem("users", JSON.stringify(users));
    }
})();
