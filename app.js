const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL pool setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'booknotes',
  password: 'PalmersGreenN13!',
  port: 5432,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
  res.render('pages/index');
});

// Create a new book
app.post('/books', async (req, res) => {
  const { title, author, rating, date_read, notes, cover_image_url } = req.body;

  try {
    const newBook = await pool.query(
      'INSERT INTO books (title, author, rating, date_read, notes, cover_image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, author, rating, date_read, notes, cover_image_url]
    );
    res.json(newBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get all books
app.get('/books', async (req, res) => {
  try {
    const allBooks = await pool.query('SELECT * FROM books ORDER BY date_read DESC');
    res.json(allBooks.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get a single book by ID
app.get('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const book = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

    if (book.rows.length === 0) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json(book.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update a book by ID
app.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const { title, author, rating, date_read, notes, cover_image_url } = req.body;

  try {
    const updatedBook = await pool.query(
      'UPDATE books SET title = $1, author = $2, rating = $3, date_read = $4, notes = $5, cover_image_url = $6 WHERE id = $7 RETURNING *',
      [title, author, rating, date_read, notes, cover_image_url, id]
    );

    if (updatedBook.rows.length === 0) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json(updatedBook.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete a book by ID
app.delete('/books/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleteBook = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

    if (deleteBook.rows.length === 0) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    res.json({ msg: 'Book deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

