// models/book.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    year: { type: Number },
    tags: { type: [String], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

bookSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);
