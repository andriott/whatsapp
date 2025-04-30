const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const path = require("path");

const app = express();
const port = 5000;
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath:
            process.env.CHROME_PATH ||
            (process.platform === "win32"
                ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
                : "chromium"), // Use environment variable or default paths
        headless: true, // Run in headless mode
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

app.use(express.json());

// Middleware para logs
app.use(morgan("dev"));

// Middleware para habilitar o CORS
app.use(cors());

let isClientReady = false;

client.on("ready", () => {
    console.log("Cliente conectado com sucesso! Verificando conta...");

    client
        .getState()
        .then((state) => {
            console.log(`Estado da conta: ${state}`);
        })
        .catch((err) => {
            console.error("Erro ao verificar estado da conta:", err);
        });

    isClientReady = true;
});

client.on("auth_failure", (msg) => {
    console.error("Falha na autenticação:", msg);
    isClientReady = false;
});

client.on("qr", (qr) => {
    console.log(
        "Nenhuma conta conectada. Escaneie o QR Code abaixo para conectar:",
    );
    qrcode.generate(qr, { small: true });
});

// Middleware para verificar se o cliente está conectado
function ensureClientReady(req, res, next) {
    if (!isClientReady) {
        return res.status(503).send({
            error: "Cliente do WhatsApp não está conectado. Aguarde a conexão.",
        });
    }
    next();
}

function formatPhoneNumber(number) {
    // Remove caracteres não numéricos, incluindo o '+'
    const cleaned = number.replace(/\D/g, "");

    // Verifica se o número tem o formato correto
    if (!/^\d{10,15}$/.test(cleaned)) {
        throw new Error(
            "Número de telefone inválido. Certifique-se de usar o formato internacional, como 5511999999999.",
        );
    }

    return cleaned;
}

// Aplicar o middleware nos endpoints
app.post("/send", ensureClientReady, async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res
            .status(400)
            .send({ error: "Número e mensagem são obrigatórios." });
    }

    try {
        const formattedNumber = formatPhoneNumber(number);
        const chatId = `${formattedNumber}@c.us`;
        await client.sendMessage(chatId, message);
        res.send({ status: "Mensagem enviada com sucesso!" });
    } catch (error) {
        res.status(500).send({
            error: "Erro ao enviar mensagem.",
            details: error.message,
        });
    }
});

app.post("/receive", ensureClientReady, (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res
            .status(400)
            .send({ error: "Número e mensagem são obrigatórios." });
    }

    console.log(`Mensagem recebida de ${number}: ${message}`);
    res.send({ status: "Mensagem recebida com sucesso!" });
});

// Listener para respostas de contatos
client.on("message", async (msg) => {
    console.log(`Mensagem recebida de ${msg.from}: ${msg.body}`);

    // Exemplo: Responder automaticamente
    if (
        msg.from === "553491094313-1580764955@g.us" &&
        msg.body.toLowerCase() === "oi"
    ) {
        await client.sendMessage(msg.from, "GET A LIFE");
    }
});

// Inicializar o cliente do WhatsApp
client.initialize();

// Iniciar o servidor
app.listen(port, "0.0.0.0", () => {
    console.log(`Servidor rodando na porta http://0.0.0.0:${port}`);
});
