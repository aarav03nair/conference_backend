const Slot = require('./models/Slot');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/conference', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const slots = [
  { day: 'Day 1', room: 'Room 1', time: '10:00 AM - 11:00 AM', capacity: 20, bookedCount: 0 },
  { day: 'Day 1', room: 'Room 2', time: '11:00 AM - 12:00 PM', capacity: 20, bookedCount: 0 },
  // Add other slots...
];

Slot.insertMany(slots).then(() => {
  console.log('Slots added');
  mongoose.connection.close();
});
