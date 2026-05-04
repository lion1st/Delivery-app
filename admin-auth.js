const signupForm = document.getElementById("adminSignupForm");
const loginForm = document.getElementById("adminLoginForm");

if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();

        if (!name || !email || !password) {
            alert("Please fill in all fields.");
            return;
        }

        const users = getUsers();
        const exists = users.some((user) => user.email === email);

        if (exists) {
            alert("Admin already exists with this email.");
            return;
        }

        const newAdmin = {
            id: Date.now(),
            name,
            email,
            password,
            role: "admin"
        };

        users.push(newAdmin);
        saveUsers(users);
        setCurrentUser(newAdmin);

        alert("Admin account created successfully.");
        window.location.href = "admin.html";
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value.trim();

        const users = getUsers();
        const user = users.find(
            (item) => item.email === email && item.password === password && item.role === "admin"
        );

        if (!user) {
            alert("Invalid admin email or password.");
            return;
        }

        setCurrentUser(user);
        alert("Login successful.");
        window.location.href = "admin.html";
    });
}
