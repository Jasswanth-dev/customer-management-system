const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const { error } = require("console");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite
const db = new sqlite3.Database(path.join(__dirname, "database.db"), (err) => {
  if (err) {
    console.error("DB connection error:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});


//
// API's START
//


// CUSTOMERS

// Get one customer
app.get('/api/customers/:id', (req, res) => {
    const sql = "SELECT * FROM customers WHERE id = ?";
    db.get(sql, [req.params.id], (err, row) => {
        if (err || row === undefined) {
            const message = err ? err.message : "Customer Details Not Found"
            res.status(400).send({ "error_message": message });
            return;
        }
        res.send({
            "message": "success",
            "data": row
        });
    });
});


// Gets List all customers with search, sort, pagination
app.get('/api/customers', (req, res) => {
    let { search, sortBy, order, limit, page } = req.query;

    search = search ? `%${search}%` : "%";
    sortBy = sortBy || "id";
    order = (order && order.toUpperCase() === "DESC") ? "DESC" : "ASC";
    limit = parseInt(limit) || 10;
    page = parseInt(page) || 1;
    const offset = (page - 1) * limit;

    // SQL for filtering
    const filterSql = `WHERE first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR id = ?`;
    const params = [search, search, search, search];

    // Query for data with pagination
    const dataSql = `SELECT * FROM customers ${filterSql} ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;

    // Query for total count (without limit/offset)
    const countSql = `SELECT COUNT(*) AS total FROM customers ${filterSql}`;

    // Run both queries
    db.get(countSql, params, (err, countRow) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            return;
        }

        db.all(dataSql, [...params, limit, offset], (err, rows) => {
            if (err) {
                res.status(400).json({ "error_message": err.message });
                return;
            }

            const total = countRow.total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                "message": "success",
                "data": rows || [],
                "pagination": {
                    totalCutomers: total,
                    totalPages,
                    page,
                    limit
                }
            });
        });
    });
});




// Creates a new customer
app.post('/api/customers', (req, res) => {
    const { first_name, last_name, phone_number } = req.body;

    // checking whether all fields are provided
    if (!first_name || !last_name || !phone_number) {
        res.status(400).json({ "error_message": "Please provide valid details" });
        return;
    }

    // checking whether phone number already exists
    const checkMobileSQL = "SELECT * FROM customers WHERE phone_number = ?";
    db.get(checkMobileSQL, [phone_number], (err, row) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            return;
        }
        if (row) {
            res.status(400).json({ "error_message": "Phone Number already exists" });
            return;
        }

        // Inserting new customer if phone number doesn't exist
        const sql = "INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)";
        const params = [first_name, last_name, phone_number]
        db.run(sql, params, (err) => {
            if (err) {
                res.status(400).json({ "error_message": err.message });
                return;
            }
            res.json({
                "message": "New Customer Added"
            });
        });
    });
});
//


// Updates customer Details
app.put('/api/customers/:id', (req, res) => {
    const { first_name, last_name, phone_number } = req.body;
    const customerId = req.params.id;

    // checking whether all fields are provided
    if (!first_name || !last_name || !phone_number) {
        return res.status(400).json({ "error_message": "Please provide valid details" });
    }

    // Check if phone number already exists (excluding the current customer)
    const checkMobileSQL = "SELECT * FROM customers WHERE phone_number = ? AND id != ?";
    db.get(checkMobileSQL, [phone_number, customerId], (err, row) => {
        if (err) {
            return res.status(400).json({ "error_message": err.message });
        }
        if (row) {
            return res.status(400).json({ "error_message": "Phone Number already exists" });
        }

        // updates the details if the mobile_number is unique
        const sql = "UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?";
        const params = [first_name, last_name, phone_number, customerId];

        db.run(sql, params, function (err) {
            if (err) {
                return res.status(400).json({ "error_message": err.message });
            }
            res.json({
                "message": "Customer Details Updated"
            });
        });
    });
});
//


// Deletes customer
app.delete('/api/customers/:id', (req, res) => {
    const sql = "DELETE FROM customers WHERE id = ?";
    const params = [req.params.id];

    db.run(sql, params, (err) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            return;
        }
        db.run("DELETE FROM addresses WHERE customer_id = ?", params);
        res.json({
            "message": "Deleted Customer Details",
        });
    });
});


//Addresses Routes

// Gets addresses of customer
app.get('/api/customers/:id/addresses', (req, res) => {
    const sql = "SELECT * FROM addresses WHERE customer_id = ?";
    const params = [req.params.id];

    db.all(sql, params, (err, rows) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            return;
        }
        res.json({ 
            "message": "success", 
            "data": rows 
        });
    });
});


//Adds address for customer
app.post('/api/customer/:id/addresses', (req, res) => {
    const { address_details, city, state, pin_code } = req.body;
    const sql = "INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)";
    const params = [req.params.id, address_details, city, state, pin_code];

    db.run(sql, params, (err) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            console.log(err)
            return;
        }
        res.json({
            "message": "Customer Address Created"
        });
    });
});


// Updates address
app.put('/api/addresses/:addressId', (req, res) => {
    const { address_details, city, state, pin_code } = req.body;
    const sql = "UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?";
    const params = [address_details, city, state, pin_code, req.params.addressId];

    db.run(sql, params, (err) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            return;
        }
        res.json({
            "message": "Customer Address Updated"
        });
    });
});


// Deletes address
app.delete('/api/addresses/:addressId', (req, res) => {
    const sql = "DELETE FROM addresses WHERE id = ?";
    const params = [req.params.addressId];

    db.run(sql, params, (err) => {
        if (err) {
            res.status(400).json({ "error_message": err.message });
            return;
        }
        res.json({
            "message": "Customer Address Deleted"
        });
    });
});

//
// API's END
//

app.use(express.static(path.join(__dirname, "../client/build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});



// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
