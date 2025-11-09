const Note = require('../models/Note');
const mongoose = require('mongoose');

// GET /api/notes - Get all notes with pagination and filtering
exports.getNotes = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const { 
      category, 
      page = 1, 
      limit = 50, 
      pinned,
      search 
    } = req.query;
    
    const filter = { owner: ownerId };
    
    // Add filters
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
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Note.countDocuments(filter);

    res.json({
      notes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('getNotes error', error);
    res.status(500).json({ message: 'Failed to get notes' });
  }
};

// GET /api/notes/:id - Get single note
exports.getNote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (String(note.owner) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    res.json(note);
  } catch (error) {
    console.error('getNote error', error);
    res.status(500).json({ message: 'Failed to get note' });
  }
};

// POST /api/notes - Create new note
exports.createNote = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const { title, content = '', tags = [], category = 'general' } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Validate tags array
    const validTags = tags.filter(tag => 
      tag && typeof tag === 'string' && tag.trim() !== ''
    ).map(tag => tag.trim().toLowerCase());

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
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to create note' });
  }
};

// PUT /api/notes/:id - Update note
exports.updateNote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (String(note.owner) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { title, content, tags, category } = req.body;
    
    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (tags !== undefined) {
      note.tags = tags.filter(tag => 
        tag && typeof tag === 'string' && tag.trim() !== ''
      ).map(tag => tag.trim().toLowerCase());
    }
    if (category !== undefined) note.category = category.toLowerCase();

    await note.save();
    res.json(note);
  } catch (error) {
    console.error('updateNote error', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Failed to update note' });
  }
};

// PATCH /api/notes/:id/pin - Toggle pin status
exports.togglePin = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (String(note.owner) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    note.pinned = !note.pinned;
    await note.save();
    res.json(note);
  } catch (error) {
    console.error('togglePin error', error);
    res.status(500).json({ message: 'Failed to toggle pin' });
  }
};

// DELETE /api/notes/:id - Delete note
exports.deleteNote = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }

    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    
    if (String(note.owner) !== String(req.user?.id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('deleteNote error', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

// GET /api/notes/search/:query - Search notes
exports.searchNotes = async (req, res) => {
  try {
    const query = req.params.query;
    const ownerId = req.user?.id;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const notes = await Note.find({
      owner: ownerId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(50);

    res.json(notes);
  } catch (error) {
    console.error('searchNotes error', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

// GET /api/notes/stats/overview - Get user stats
exports.getStats = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    
    const [total, pinned, categories, tags] = await Promise.all([
      Note.countDocuments({ owner: ownerId }),
      Note.countDocuments({ owner: ownerId, pinned: true }),
      Note.distinct('category', { owner: ownerId }),
      Note.aggregate([
        { $match: { owner: ownerId } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $project: { tag: '$_id', count: 1, _id: 0 } },
        { $sort: { count: -1 } }
      ])
    ]);

    // Calculate storage usage (simplified - in real app, calculate actual size)
    const storageInfo = await Note.aggregate([
      { $match: { owner: ownerId } },
      { 
        $project: { 
          size: { 
            $add: [
              { $strLenBytes: '$title' },
              { $strLenBytes: '$content' },
              { $multiply: [{ $size: '$tags' }, 50] } // Approximate tag size
            ]
          } 
        } 
      },
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);

    const usedBytes = storageInfo[0]?.totalSize || 0;
    const usedMB = Math.round((usedBytes / (1024 * 1024)) * 100) / 100;

    res.json({
      total,
      pinned,
      categories: categories.length,
      tags: tags.length,
      usedMB,
      limitMB: 1024,
      categoriesList: categories,
      popularTags: tags.slice(0, 10)
    });
  } catch (error) {
    console.error('getStats error', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
};

// GET /api/notes/categories/list - Get user categories
exports.getCategories = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const categories = await Note.getUserCategories(ownerId);
    res.json(categories);
  } catch (error) {
    console.error('getCategories error', error);
    res.status(500).json({ message: 'Failed to get categories' });
  }
};

// GET /api/notes/tags/list - Get user tags
exports.getTags = async (req, res) => {
  try {
    const ownerId = req.user?.id;
    const tags = await Note.getUserTags(ownerId);
    res.json(tags.map(t => t.tag));
  } catch (error) {
    console.error('getTags error', error);
    res.status(500).json({ message: 'Failed to get tags' });
  }
};