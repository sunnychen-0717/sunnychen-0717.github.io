// routes/api.js — authenticated JSON API for books
const express = require('express');
const Book = require('../models/book');

const router = express.Router();

// List current user's books
router.get('/books/me', async (req, res) => {
  const books = await Book.find({ owner: req.session.userId }).sort({ createdAt: -1 }).limit(200);
  res.json(books);
});

// Create
router.post('/books', async (req, res) => {
  try {
    const { title, author, year, tags } = req.body;
    if (!title || !author) return res.status(400).json({ error: 'title_and_author_required' });
    const book = await Book.create({
      title,
      author,
      year: year ? Number(year) : undefined,
      tags: Array.isArray(tags)
        ? tags
        : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      owner: req.session.userId,
    });
    res.status(201).json(book);
  } catch (e) {
    console.error('API create book error:', e);
    res.status(500).json({ error: 'internal_error' });
  }
});

// Update
router.put('/books/:id', async (req, res) => {
  const { id } = req.params;
  const update = {};
  ['title', 'author', 'year', 'tags'].forEach(k => {
    if (k in req.body) update[k] = req.body[k];
  });
  if ('year' in update && update.year !== undefined) update.year = Number(update.year);
  if ('tags' in update) {
    update.tags = Array.isArray(update.tags)
      ? update.tags
      : (typeof update.tags === 'string'
          ? update.tags.split(',').map(t => t.trim()).filter(Boolean)
          : []);
  }
  const result = await Book.findOneAndUpdate({ _id: id, owner: req.session.userId }, { $set: update }, { new: true });
  if (!result) return res.status(404).json({ error: 'not_found' });
  res.json(result);
});

// Delete
router.delete('/books/:id', async (req, res) => {
  const { id } = req.params;
  const del = await Book.deleteOne({ _id: id, owner: req.session.userId });
  if (!del.deletedCount) return res.status(404).json({ error: 'not_found' });
  res.status(204).send();
});

module.exports = router;
