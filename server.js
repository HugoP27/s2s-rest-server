const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

// Create or open an SQLite database
const db = new sqlite3.Database("products");

// Initialize the database table if it doesn't exist
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS products");
  db.run("CREATE TABLE products (sku SERIAL PRIMARY KEY, attributes TEXT)");

  // Sample data to insert
  const sampleData = [
    { sku: 1, attributes: '{size:"small",grams:40,name:"bag"}' },
    { sku: 2, attributes: '{size:"large",grams:1500,name:"fanta"}' },
    { sku: 3, attributes: '{size:"large",grams:2000,name:"cola"}' },
    { sku: 4, attributes: '{size:"medium",grams:750,name:"flower"}' },
    { sku: 5, attributes: '{size:"small",grams:250,name:"macaroni"}' },
    { sku: 6, attributes: '{size:"large",grams:1200,name:"cheese"}' },
    { sku: 7, attributes: '{size:"medium",grams:600,name:"t-bone steak"}' },
    { sku: 8, attributes: '{size:"small",grams:80,name:"simba tomato"}' },
    { sku: 9, attributes: '{size:"very large",grams:5000,name:"weight"}' },
    { sku: 10, attributes: '{size:"small",grams:150,name:"box"}' },
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

// HTML page to show when the user visits root (localhost:3000)
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: __dirname });
});

// Endpoint to get product by SKU
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

// Endpoint for creating a new product or updating an existing one.
app.post("/v1/products", (req, res) => {
  const { sku, attributes } = req.body;

  if (typeof attributes !== "string") {
    return res.status(400).json({ error: "Invalid request data." });
  }

  let sql;
  let params;

  if (sku === undefined) {
    // If SKU is not provided, use an INSERT statement.
    sql = "INSERT INTO products (attributes) VALUES (?)";
    params = [attributes];
  } else {
    // If SKU is provided, use an UPDATE statement.
    sql = "UPDATE products SET attributes = ? WHERE sku = ?";
    params = [attributes, sku];
  }

  // Execute the SQL statement.
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      // If no rows were affected, it means no existing product was updated.
      res.status(201).json({ message: "Product added successfully" });
    } else {
      res.status(200).json({ message: "Product updated successfully" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
