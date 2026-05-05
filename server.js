const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3001;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "";
const dataDir = path.join(__dirname, "data");
const ordersFile = path.join(dataDir, "orders.json");
const repliesFile = path.join(dataDir, "replies.json");

function ensureDataFile(filePath) {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "[]", "utf8");
    }
}

function readJson(filePath) {
    ensureDataFile(filePath);

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        return [];
    }
}

function writeJson(filePath, value) {
    ensureDataFile(filePath);
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf8");
}

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
    if (!reply.orderReference) {
        return null;
    }

    const orders = readJson(ordersFile);
    return orders.find((order) => order.orderReference === reply.orderReference) || null;
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
        sendJson(res, 200, readJson(ordersFile));
        return;
    }

    if (req.method === "GET" && req.url === "/api/replies") {
        const replies = readJson(repliesFile).sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
        sendJson(res, 200, replies);
        return;
    }

    if (req.method === "POST" && req.url === "/api/orders") {
        try {
            const payload = await collectBody(req);

            if (!payload.orderReference) {
                sendJson(res, 400, { error: "orderReference is required." });
                return;
            }

            const orders = readJson(ordersFile);
            const record = {
                id: `order-${Date.now()}`,
                orderReference: payload.orderReference,
                customerName: payload.customerName || "Unknown customer",
                customerEmail: payload.customerEmail || "",
                customerPhone: payload.customerPhone || "",
                customerAddress: payload.customerAddress || "",
                items: payload.items || [],
                total: payload.total || 0,
                totalItems: payload.totalItems || 0,
                createdAt: new Date().toISOString()
            };

            orders.push(record);
            writeJson(ordersFile, orders);
            sendJson(res, 201, { success: true, order: record });
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
            const matchedOrder = attachReplyToOrder(reply);
            const replies = readJson(repliesFile);

            replies.push({
                ...reply,
                matchedOrder: matchedOrder
                    ? {
                          orderReference: matchedOrder.orderReference,
                          customerName: matchedOrder.customerName,
                          total: matchedOrder.total
                      }
                    : null
            });

            writeJson(repliesFile, replies);
            sendJson(res, 201, { success: true });
        } catch (error) {
            sendJson(res, 400, { error: "Invalid reply payload." });
        }

        return;
    }

    sendJson(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
    ensureDataFile(ordersFile);
    ensureDataFile(repliesFile);
    console.log(`QuickEats backend running on http://localhost:${PORT}`);
});
