const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

// Create or open an SQLite database
const db = new sqlite3.Database("products");

// Initialize the database table if it doesn't exist
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS products (sku INTEGER PRIMARY KEY, attributes TEXT)"
  );

  // Sample data to insert
  const sampleData = [
    { sku: 1, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 2, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 3, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 4, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 5, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 6, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 7, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 8, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 9, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
    { sku: 10, attributes: '{"size":"small","grams":"100","name":"mouse"}' },
  ];

  // Insert the sample data into the table
  const insertStmt = db.prepare(
    "INSERT INTO products (sku, attributes) VALUES (?, ?)"
  );
  sampleData.forEach((product) => {
    insertStmt.run(product.sku, product.attributes);
  });
  insertStmt.finalize();
});

// Middleware for parsing JSON data in the request body
app.use(bodyParser.json());

// HTML page to show when the user visits root localhost:3000
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

// Get product by SKU
app.get("/v1/products", (req, res) => {
  const sku = req.query.sku;

  // Only accept SKU as a query parameter
  if (!sku) {
    return res.status(400).json({ error: "SKU parameter is missing." });
  }

  // Check if sku is an integer
  const skuAsInt = parseInt(sku);

  // Give feedback to the user if not a valid integer
  if (isNaN(skuAsInt) || !Number.isInteger(skuAsInt)) {
    return res.status(400).json({ error: "SKU must be a valid integer." });
  }

  // Retrieve the product from the database by SKU
  db.get("SELECT * FROM products WHERE sku = ?", skuAsInt, (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.status(200).json(row);
  });
});

// Endpoint for creating a new product.
app.post("/v1/products", (req, res) => {
  const { sku, attributes } = req.body;

  if (sku === undefined || typeof attributes !== "string") {
    return res.status(400).json({ error: "Invalid request data." });
  }

  // Insert the new product into the database
  db.run(
    "INSERT INTO products (sku, attributes) VALUES (?, ?)",
    sku,
    attributes,
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: "Product added successfully" });
    }
  );
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
