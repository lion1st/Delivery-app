const http = require("http");
const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const nodemailer = require("nodemailer");
require("dotenv").config({ path: path.join(__dirname, "email.env") });

const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const DB_PATH = path.join(__dirname, "delivery.db");

// Initialize database
const db = new sqlite3.Database(DB_PATH);

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        orderReference TEXT UNIQUE,
        customerName TEXT,
        customerEmail TEXT,
        customerPhone TEXT,
        customerAddress TEXT,
        items TEXT,
        total REAL,
        totalItems INTEGER,
        createdAt TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS replies (
        id TEXT PRIMARY KEY,
        from_email TEXT,
        subject TEXT,
        text TEXT,
        html TEXT,
        orderReference TEXT,
        receivedAt TEXT,
        matchedOrder TEXT
    )`);
});

// Email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function sendJson(res, statusCode, data) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Webhook-Secret"
    });
    res.end(JSON.stringify(data));
}

function collectBody(req) {
    return new Promise((resolve, reject) => {
        let raw = "";

        req.on("data", (chunk) => {
            raw += chunk;
        });

        req.on("end", () => {
            if (!raw) {
                resolve({});
                return;
            }

            try {
                resolve(JSON.parse(raw));
            } catch (error) {
                reject(error);
            }
        });

        req.on("error", reject);
    });
}

function normaliseReplyPayload(payload) {
    const bodyText = payload.text || payload.body || payload.plain || payload.message || "";
    const subject = payload.subject || "";
    const orderReferenceMatch =
        payload.orderReference ||
        subject.match(/QE-\d+/i)?.[0] ||
        bodyText.match(/QE-\d+/i)?.[0] ||
        "";

    return {
        id: `reply-${Date.now()}`,
        from: payload.from || payload.sender || payload.from_email || "Unknown sender",
        subject: subject || "Reply received",
        text: bodyText,
        html: payload.html || "",
        orderReference: orderReferenceMatch,
        receivedAt: new Date().toISOString()
    };
}

function attachReplyToOrder(reply) {
    return new Promise((resolve, reject) => {
        if (!reply.orderReference) {
            resolve(null);
            return;
        }

        db.get("SELECT orderReference, customerName, total FROM orders WHERE orderReference = ?", [reply.orderReference], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

const server = http.createServer(async (req, res) => {
    if (req.method === "OPTIONS") {
        sendJson(res, 204, {});
        return;
    }

    if (req.method === "GET" && req.url === "/api/health") {
        sendJson(res, 200, { ok: true });
        return;
    }

    if (req.method === "GET" && req.url === "/api/orders") {
        db.all("SELECT * FROM orders ORDER BY createdAt DESC", [], (err, rows) => {
            if (err) {
                sendJson(res, 500, { error: "Database error" });
            } else {
                sendJson(res, 200, rows);
            }
        });
        return;
    }

    if (req.method === "GET" && req.url === "/api/replies") {
        db.all("SELECT * FROM replies ORDER BY receivedAt DESC", [], (err, rows) => {
            if (err) {
                sendJson(res, 500, { error: "Database error" });
            } else {
                sendJson(res, 200, rows);
            }
        });
        return;
    }

    if (req.method === "POST" && req.url === "/api/orders") {
        try {
            const payload = await collectBody(req);

            if (!payload.orderReference) {
                sendJson(res, 400, { error: "orderReference is required." });
                return;
            }

            const record = {
                id: `order-${Date.now()}`,
                orderReference: payload.orderReference,
                customerName: payload.customerName || "Unknown customer",
                customerEmail: payload.customerEmail || "",
                customerPhone: payload.customerPhone || "",
                customerAddress: payload.customerAddress || "",
                items: JSON.stringify(payload.items || []),
                total: payload.total || 0,
                totalItems: payload.totalItems || 0,
                createdAt: new Date().toISOString()
            };

            db.run(`INSERT INTO orders (id, orderReference, customerName, customerEmail, customerPhone, customerAddress, items, total, totalItems, createdAt)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [record.id, record.orderReference, record.customerName, record.customerEmail, record.customerPhone, record.customerAddress, record.items, record.total, record.totalItems, record.createdAt],
                function(err) {
                    if (err) {
                        sendJson(res, 500, { error: "Database error" });
                    } else {
                        sendJson(res, 201, { success: true, order: record });
                    }
                });
        } catch (error) {
            sendJson(res, 400, { error: "Invalid order payload." });
        }

        return;
    }

    if (req.method === "POST" && req.url === "/api/email/replies/webhook") {
        if (WEBHOOK_SECRET && req.headers["x-webhook-secret"] !== WEBHOOK_SECRET) {
            sendJson(res, 403, { error: "Invalid webhook secret." });
            return;
        }

        try {
            const payload = await collectBody(req);
            const reply = normaliseReplyPayload(payload);
            const matchedOrder = await attachReplyToOrder(reply);

            db.run(`INSERT INTO replies (id, from_email, subject, text, html, orderReference, receivedAt, matchedOrder)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [reply.id, reply.from, reply.subject, reply.text, reply.html, reply.orderReference, reply.receivedAt, matchedOrder ? JSON.stringify(matchedOrder) : null],
                function(err) {
                    if (err) {
                        sendJson(res, 500, { error: "Database error" });
                    } else {
                        sendJson(res, 201, { success: true });
                    }
                });
        } catch (error) {
            sendJson(res, 400, { error: "Invalid reply payload." });
        }

        return;
    }

    if (req.method === "POST" && req.url === "/api/send-reply") {
        try {
            const payload = await collectBody(req);

            if (!payload.orderReference || !payload.message) {
                sendJson(res, 400, { error: "orderReference and message are required." });
                return;
            }

            db.get("SELECT customerEmail, customerName FROM orders WHERE orderReference = ?", [payload.orderReference], async (err, row) => {
                if (err) {
                    sendJson(res, 500, { error: "Database error" });
                    return;
                }

                if (!row) {
                    sendJson(res, 404, { error: "Order not found." });
                    return;
                }

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: row.customerEmail,
                    subject: `Reply to your order ${payload.orderReference}`,
                    text: payload.message
                };

                try {
                    await transporter.sendMail(mailOptions);
                    sendJson(res, 200, { success: true });
                } catch (emailError) {
                    sendJson(res, 500, { error: "Failed to send email." });
                }
            });
        } catch (error) {
            sendJson(res, 400, { error: "Invalid payload." });
        }

        return;
    }

    sendJson(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
    console.log(`QuickEats backend running on http://localhost:${PORT}`);
});
