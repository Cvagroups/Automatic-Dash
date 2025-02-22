const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");

puppeteer.use(StealthPlugin());

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

let browserInstances = [];
let activeTabs = 0;

// 📌 API to Open Tabs
app.post("/open-tabs", async (req, res) => {
  const { url, count } = req.body;
  if (!url || !count || count <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const browser = await puppeteer.launch({ headless: "new" });
    browserInstances.push(browser);

    const pages = [];
    for (let i = 0; i < count; i++) {
      const page = await browser.newPage();
      try {
        await page.goto(url, { timeout: 60000, waitUntil: "networkidle2" });
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s delay
      } catch (error) {
        console.error(`Error loading page ${i + 1}:`, error.message);
      }
      pages.push(page);
    }

    activeTabs += count;
    io.emit("tabCount", activeTabs);

    return res.json({ message: `${count} tabs opened successfully` });
  } catch (error) {
    console.error("Error opening tabs:", error);
    return res.status(500).json({ error: "Failed to open tabs" });
  }
});

// 📌 API to Close All Tabs
app.post("/close-tabs", async (req, res) => {
  try {
    for (const browser of browserInstances) {
      await browser.close();
    }

    browserInstances = [];
    activeTabs = 0;
    io.emit("tabCount", activeTabs);

    return res.json({ message: "All tabs closed successfully" });
  } catch (error) {
    console.error("Error closing tabs:", error);
    return res.status(500).json({ error: "Failed to close tabs" });
  }
});

// 📌 Real-time Connection
io.on("connection", (socket) => {
  console.log("Client connected");
  socket.emit("tabCount", activeTabs);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// 📌 Start Server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
