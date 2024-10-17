const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  registrationNumber: String,
  bookedSlots: [{
    type: mongoose.Schema.Types.ObjectId,  // Assuming slots are stored as ObjectIds in MongoDB
    ref: 'Slot'  // Referencing the Slot model
  }]
});

module.exports = mongoose.model('User', userSchema);
