import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { CHEFS, MEALS, TIFFIN_PLANS } from './src/data';

const app = express();
const PORT = 3000;
const STORE_PATH = path.join(process.cwd(), 'data_store.json');

app.use(express.json());

// Initialize data store if not exists
function initStore() {
  if (!fs.existsSync(STORE_PATH)) {
    const initialData = {
      chefs: CHEFS,
      meals: MEALS,
      tiffinPlans: TIFFIN_PLANS,
      businessName: "GharBhojan Mom's Kitchen",
      orders: []
    };
    fs.writeFileSync(STORE_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

initStore();

function getStore() {
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading data store, reinitializing", err);
    initStore();
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  }
}

function saveStore(data: any) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// API Routes
app.get("/api/contents", (req, res) => {
  const store = getStore();
  res.json({
    chefs: store.chefs || CHEFS,
    meals: store.meals || MEALS,
    tiffinPlans: store.tiffinPlans || TIFFIN_PLANS,
    businessName: store.businessName || "GharBhojan Mom's Kitchen"
  });
});

app.post("/api/contents", (req, res) => {
  const { chefs: updatedChefs, meals: updatedMeals, tiffinPlans: updatedTiffins, businessName } = req.body;
  const store = getStore();
  if (updatedChefs) store.chefs = updatedChefs;
  if (updatedMeals) store.meals = updatedMeals;
  if (updatedTiffins) store.tiffinPlans = updatedTiffins;
  if (businessName) store.businessName = businessName;
  saveStore(store);
  res.json({ success: true, message: "Contents updated successfully" });
});

app.get("/api/orders", (req, res) => {
  const store = getStore();
  res.json(store.orders || []);
});

app.post("/api/orders", (req, res) => {
  const order = req.body;
  const store = getStore();
  if (!store.orders) store.orders = [];
  
  // Check if order already exists (to update status) or append new one
  const index = store.orders.findIndex((o: any) => o.id === order.id);
  if (index !== -1) {
    store.orders[index] = order;
  } else {
    store.orders.push(order);
  }
  saveStore(store);
  res.json({ success: true, order });
});

// Update order status route
app.post("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const store = getStore();
  if (!store.orders) store.orders = [];
  const index = store.orders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    store.orders[index].status = status;
    saveStore(store);
    res.json({ success: true, order: store.orders[index] });
  } else {
    res.status(404).json({ error: "Order not found" });
  }
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin") {
    res.json({ success: true, token: "admin-session-token-123" });
  } else {
    res.status(401).json({ error: "Invalid username or password" });
  }
});

// Vite middleware for development or Static Assets for Production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
