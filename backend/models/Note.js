const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: 200 
  },
  content: { 
    type: String, 
    default: '',
    maxlength: 10000 
  },
  tags: [{ 
    type: String, 
    trim: true,
    maxlength: 50 
  }],
  category: { 
    type: String, 
    default: 'general',
    enum: ['general', 'work', 'personal', 'ideas', 'important', 'study', 'projects','travel','finance','health','shopping','others'],
    maxlength: 50 
  },
  pinned: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

noteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Note', noteSchema);