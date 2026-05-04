(function initializeDefaultAdmin() {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const hasAdmin = users.some((user) => user.role === "admin");

    if (!hasAdmin) {
        users.push({
            id: Date.now(),
            name: "Main Admin",
            email: "admin@quickeats.com",
            password: "1234",
            role: "admin"
        });

        localStorage.setItem("users", JSON.stringify(users));
        return;
    }

    const updatedUsers = users.map((user) =>
        user.role === "admin"
            ? {
                  ...user,
                  password: "1234"
              }
            : user
    );

    localStorage.setItem("users", JSON.stringify(updatedUsers));
})();
