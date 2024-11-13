const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: String,
  room: String,
  time: String,
  capacity: Number,
  bookedCount: Number,
  
  topic: String,
  speakerName: String,
});

module.exports = mongoose.model('Slot', slotSchema);
