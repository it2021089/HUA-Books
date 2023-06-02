const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();

// Create a new SQLite database
const db = new sqlite3.Database("books.db");

// Create the books table in the database
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author TEXT NOT NULL,
      title TEXT NOT NULL,
      genre TEXT NOT NULL,
      price REAL NOT NULL
    )
  `);
});

// Middleware to parse JSON body
app.use(express.json());

// Serve static files (HTML, CSS, JS)
app.use(express.static(__dirname));

// POST /insert
app.post("/insert", (req, res) => {
  const { author, title, genre, price } = req.body;

  // Insert the book into the database
  const query = `
    INSERT INTO books (author, title, genre, price)
    VALUES (?, ?, ?, ?)
  `;
  console.log(author, title, genre, price);
  db.run(query, [author, title, genre, price], (err) => {
    if (err) {
      console.error("Error inserting book:", err);
      res.status(500).send("Error inserting book");
    } else {
      res.sendStatus(200);
    }
  });
});

// POST /check
app.post("/check", (req, res) => {
  const { author, title } = req.body;

  // Query the database to check if the book exists
  const query = `SELECT EXISTS(SELECT 1 FROM books WHERE author = ? AND title = ?) AS exist`;
  db.get(query, [author, title], (err, row) => {
    if (err) {
      console.error("Error checking book existence:", err);
      res.status(500).send("Error checking book existence");
    } else {
      res.json({ exists: row.exist === 1 });
    }
  });
});

// GET /books/:keyword
app.get("/books/:keyword", (req, res) => {
  const keyword = req.params.keyword;

  // Query the database for books with title containing the keyword
  const query = `SELECT * FROM books WHERE title LIKE '%${keyword}%'`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error retrieving books:", err);
      res.status(500).send("Error retrieving books");
    } else {
      res.json(rows);
    }
  });
});

// GET /books to fetch all books
app.get("/books", (req, res) => {
  // Query the database to get all books
  const query = `SELECT * FROM books`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Error retrieving books:", err);
      res.status(500).send("Error retrieving books");
    } else {
      res.json(rows);
    }
  });
});

// DELETE /books/:id
app.delete("/books/:id", (req, res) => {
  const bookId = req.params.id;

  // Delete the book from the database
  const query = `DELETE FROM books WHERE id = ?`;
  db.run(query, [bookId], (err) => {
    if (err) {
      console.error("Error removing book:", err);
      res.status(500).send("Error removing book");
    } else {
      res.sendStatus(200);
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
