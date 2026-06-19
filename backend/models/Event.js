const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  eventType: {
    type: String,
    enum: ['page_view', 'click'],
    required: true,
    index: true
  },
  pageUrl: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  x: {
    type: Number,
    default: null
  },
  y: {
    type: Number,
    default: null
  },
  vw: {
    type: Number,
    default: null
  },
  vh: {
    type: Number,
    default: null
  },
  element: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Event', EventSchema);
