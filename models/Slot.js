const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: String,
  room: String,
  time: String,
  capacity: Number,
  
  bookedCount: Number,
});

module.exports = mongoose.model('Slot', slotSchema);
