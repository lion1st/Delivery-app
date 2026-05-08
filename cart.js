const API_BASE = "http://localhost:3001";

function getCart() {
    return JSON.parse(localStorage.getItem("cart")) || [];
}

function getSavedOrderDetails() {
    return JSON.parse(localStorage.getItem("orderDetails")) || {};
}

function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
}

function displayCart() {
    const cart = getCart();
    const container = document.getElementById("cartList");
    const totalEl = document.getElementById("cartTotal");

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = "<p>Your cart is empty.</p>";
        totalEl.textContent = "Total Items: 0 | Total: RWF 0";
        return;
    }

    let total = 0;
    let totalItems = 0;
    const savedOrderDetails = getSavedOrderDetails();

    cart.forEach((item, index) => {
        const quantity = Number(item.quantity) || 1;
        const itemPrice = Number(item.price) || 0;
        const itemTotal = itemPrice * quantity;

        total += itemTotal;
        totalItems += quantity;
        const client = item.client || savedOrderDetails;

        container.innerHTML += `
            <div class="cart-card">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-card-content">
                    <h3>${item.name}</h3>
                    <p>${item.restaurant || ""}</p>
                    <p>Price: RWF ${item.price}</p>
                    <p>Quantity: ${quantity}</p>
                    <p>Item Total: RWF ${itemTotal}</p>
                    <p>Client Name: ${client.fullName || "Not provided"}</p>
                    <p>Phone Number: ${client.phone || "Not provided"}</p>
                    <p>Street Address: ${client.address || "Not provided"}</p>
                    <button onclick="removeFromCart(${index})">Remove</button>
                </div>
            </div>
        `;
    });

    totalEl.textContent = `Total Items: ${totalItems} | Total: RWF ${total}`;
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    displayCart();
}

function clearCart() {
    saveCart([]);
    displayCart();
}

function getEmailServiceConfig() {
    return window.EMAIL_SERVICE_CONFIG || {};
}

function isEmailServiceConfigured() {
    const config = getEmailServiceConfig();

    return Boolean(
        window.emailjs &&
        config.publicKey &&
        config.serviceId &&
        config.templateId &&
        !config.publicKey.includes("4IzVBRxUp3_yXpOiN") &&
        !config.serviceId.includes("SERVICE_1234567") &&
        !config.templateId.includes("template_lzzgucs")
    );
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function buildOrderEmail(cart) {
    const savedOrderDetails = getSavedOrderDetails();
    const firstClient = (cart[0] && cart[0].client) || savedOrderDetails;
    const config = getEmailServiceConfig();
    const totalItems = cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
    const total = cart.reduce(
        (sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)),
        0
    );
    const itemsSummary = cart
        .map((item, index) => {
            const quantity = Number(item.quantity) || 1;
            const itemTotal = (Number(item.price) || 0) * quantity;

            return `${index + 1}. ${item.name} x${quantity} - RWF ${itemTotal}`;
        })
        .join("\n");

    const subject = "New QuickEats Order";
    const body = [
        "A client has placed an order.",
        "",
        `Client Name: ${firstClient.fullName || "Not provided"}`,
        `Phone Number: ${firstClient.phone || "Not provided"}`,
        `Street Address: ${firstClient.address || "Not provided"}`,
        "",
        "Items:",
        itemsSummary,
        "",
        `Total Items: ${totalItems}`,
        "",
        `Total: RWF ${total}`
    ].join("\n");

    const itemsHtml = cart
        .map(
            (item, index) => {
                const quantity = Number(item.quantity) || 1;
                const itemTotal = (Number(item.price) || 0) * quantity;

                return `
                <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0e4db;">${index + 1}. ${escapeHtml(item.name || "Item")}</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0e4db; color: #7a5c4d;">${escapeHtml(item.restaurant || "QuickEats")}</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0e4db; text-align: center;">${escapeHtml(quantity)}</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #f0e4db; text-align: right; font-weight: 700;">RWF ${escapeHtml(itemTotal)}</td>
                </tr>
            `;
            }
        )
        .join("");

    const html = `
        <div style="margin: 0; padding: 24px; background: #fff7f1; font-family: Arial, sans-serif; color: #222;">
            <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; border: 1px solid #f3dfd3;">
                <div style="padding: 24px 28px; background: linear-gradient(135deg, #ff6b35, #ff9f1c); color: #ffffff;">
                    <p style="margin: 0 0 8px; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;">QuickEats</p>
                    <h2 style="margin: 0; font-size: 28px;">New Order Received</h2>
                </div>
                <div style="padding: 28px;">
                    <p style="margin: 0 0 18px; font-size: 16px; line-height: 1.6;">A client has placed a new order. Here are the delivery details and ordered items.</p>
                    <div style="padding: 18px; border-radius: 14px; background: #fff7f1; border: 1px solid #f4e0d4; margin-bottom: 22px;">
                        <p style="margin: 0 0 10px;"><strong>Client Name:</strong> ${escapeHtml(firstClient.fullName || "Not provided")}</p>
                        <p style="margin: 0 0 10px;"><strong>Phone Number:</strong> ${escapeHtml(firstClient.phone || "Not provided")}</p>
                        <p style="margin: 0;"><strong>Street Address:</strong> ${escapeHtml(firstClient.address || "Not provided")}</p>
                    </div>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 22px;">
                        <thead>
                            <tr>
                                <th style="padding-bottom: 10px; text-align: left; border-bottom: 2px solid #f0e4db;">Item</th>
                                <th style="padding-bottom: 10px; text-align: left; border-bottom: 2px solid #f0e4db;">Restaurant</th>
                                <th style="padding-bottom: 10px; text-align: center; border-bottom: 2px solid #f0e4db;">Qty</th>
                                <th style="padding-bottom: 10px; text-align: right; border-bottom: 2px solid #f0e4db;">Price</th>
                            </tr>
                        </thead>
                        <tbody>${itemsHtml}</tbody>
                    </table>
                    <p style="margin: 0 0 14px; color: #5f5f5f; font-weight: 700;">Total Items: ${escapeHtml(totalItems)}</p>
                    <div style="display: inline-block; padding: 14px 18px; border-radius: 14px; background: #222; color: #fff; font-size: 18px; font-weight: 700;">
                        Total: RWF ${escapeHtml(total)}
                    </div>
                </div>
            </div>
        </div>
    `;

    return {
        subject,
        body,
        html,
        total,
        totalItems,
        itemsSummary,
        firstClient,
        recipientEmail: config.recipientEmail || "cyubahiroallain1@gmail.com"
    };
}

function buildTemplateParams(orderEmail) {
    return {
        to_email: orderEmail.recipientEmail,
        subject: orderEmail.subject,
        client_name: orderEmail.firstClient.fullName || "Not provided",
        client_phone: orderEmail.firstClient.phone || "Not provided",
        client_address: orderEmail.firstClient.address || "Not provided",
        order_items: orderEmail.itemsSummary,
        total_items: orderEmail.totalItems,
        total_amount: `RWF ${orderEmail.total}`,
        message: orderEmail.body,
        message_html: orderEmail.html
    };
}

async function sendOrderNotification(cart) {
    const config = getEmailServiceConfig();
    const orderEmail = buildOrderEmail(cart);

    if (!isEmailServiceConfigured()) {
        throw new Error("Email service is not configured yet.");
    }

    emailjs.init({
        publicKey: config.publicKey
    });

    return emailjs.send(
        config.serviceId,
        config.templateId,
        buildTemplateParams(orderEmail)
    );
}

async function checkout() {
    const cart = getCart();

    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const savedOrderDetails = getSavedOrderDetails();
    const orderReference = `QE-${Date.now()}`;
    const orderPayload = {
        orderReference,
        customerName: savedOrderDetails.fullName || "Unknown customer",
        customerEmail: savedOrderDetails.email || "",
        customerPhone: savedOrderDetails.phone || "",
        customerAddress: savedOrderDetails.address || "",
        items: cart.map((item) => ({
            id: item.id,
            name: item.name,
            restaurant: item.restaurant,
            price: item.price,
            quantity: Number(item.quantity) || 1
        })),
        total: cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0),
        totalItems: cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0)
    };

    try {
        const response = await fetch(`${API_BASE}/api/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
            throw new Error("Failed to save the order to the backend.");
        }
    } catch (error) {
        console.error(error);
        alert("Unable to save order to backend. Make sure the backend server is running on http://localhost:3001.");
        return;
    }

    try {
        await sendOrderNotification(cart);
        alert("Order sent");
        clearCart();
        window.location.href = "tracking.html";
    } catch (error) {
        console.error(error);
        alert("Order was saved, but email delivery failed. Add your EmailJS keys in email-config.js and try again.");
    }
}

window.addEventListener("cartUpdated", displayCart);
document.addEventListener("DOMContentLoaded", displayCart);
