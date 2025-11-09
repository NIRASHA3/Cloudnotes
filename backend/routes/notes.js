const express = require('express');
const router = express.Router();
const passport = require('passport');
const Note = require('../models/Note');
const mongoose = require('mongoose');

// Protect all routes with JWT authentication
router.use(passport.authenticate('jwt', { session: false }));

// Simple storage calculation function
const calculateStorage = async (userId) => {
  try {
    // Get all user's notes
    const notes = await Note.find({ owner: userId });
    
    // Calculate total size in bytes
    let totalBytes = 0;
    notes.forEach(note => {
      totalBytes += Buffer.byteLength(note.title || '', 'utf8');
      totalBytes += Buffer.byteLength(note.content || '', 'utf8');
      if (note.tags && Array.isArray(note.tags)) {
        note.tags.forEach(tag => {
          totalBytes += Buffer.byteLength(tag || '', 'utf8');
        });
      }
    });
    
    // Convert to MB and round to 2 decimal places
    const usedMB = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
    return usedMB;
  } catch (error) {
    console.error('Storage calculation error:', error);
    return 0;
  }
};

// GET /api/notes - Get all notes for the authenticated user
router.get('/', async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { category, pinned, search, limit = 8 } = req.query;
    
    const filter = { owner: ownerId };
    
    if (category && category !== 'all') filter.category = category;
    if (pinned !== undefined) filter.pinned = pinned === 'true';
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const notes = await Note.find(filter)
      .sort({ pinned: -1, updatedAt: -1 })
      .limit(Number(limit))
      .lean();

    res.json({ notes });
  } catch (error) {
    console.error('getNotes error', error);
    res.status(500).json({ message: 'Failed to get notes' });
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (String(note.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('getNote error', error);
    res.status(500).json({ message: 'Failed to get note' });
  }
});

// POST /api/notes - Create new note
router.post('/', async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { title, content = '', tags = [], category = 'general' } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Check storage limit before creating (1GB = 1024MB)
    const currentStorage = await calculateStorage(ownerId);
    const newNoteSize = Buffer.byteLength(title + content, 'utf8') / (1024 * 1024);
    
    if (currentStorage + newNoteSize > 1024) {
      return res.status(400).json({ 
        message: `Storage limit exceeded! You have ${currentStorage.toFixed(2)}MB used of 1024MB limit.`,
        usedMB: currentStorage,
        limitMB: 1024
      });
    }

    const validTags = Array.isArray(tags) ? tags : [];
    
    const note = new Note({ 
      owner: ownerId, 
      title: title.trim(),
      content: content.trim(),
      tags: validTags,
      category: category.toLowerCase()
    });
    
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error('createNote error', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (String(note.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, content, tags, category } = req.body;
    
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (tags !== undefined) note.tags = Array.isArray(tags) ? tags : [];
    if (category !== undefined) note.category = category.toLowerCase();

    await note.save();
    res.json(note);
  } catch (error) {
    console.error('updateNote error', error);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// PATCH /api/notes/:id/pin - Toggle pin status
router.patch('/:id/pin', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (String(note.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('togglePin error', error);
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
});

// DELETE /api/notes/:id - Delete note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (String(note.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('deleteNote error', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

// GET /api/notes/search/:query - Search notes
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const ownerId = req.user._id;
    
    const notes = await Note.find({
      owner: ownerId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('searchNotes error', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// GET /api/notes/stats/overview - Get user stats
router.get('/stats/overview', async (req, res) => {
  try {
    const ownerId = req.user._id;
    
    const [total, pinned, categories] = await Promise.all([
      Note.countDocuments({ owner: ownerId }),
      Note.countDocuments({ owner: ownerId, pinned: true }),
      Note.distinct('category', { owner: ownerId })
    ]);

    // Calculate actual storage usage
    const usedMB = await calculateStorage(ownerId);

    res.json({
      total,
      pinned,
      usedMB: Math.round(usedMB * 100) / 100, // Round to 2 decimal places
      limitMB: 1024,
      categoriesList: categories
    });
  } catch (error) {
    console.error('getStats error', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
});

module.exports = router;