const mongoose = require('mongoose');
const User = require('./models/Slot'); // Adjust the path based on your file structure

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/conference', { // Change the URI as necessary
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB...');

    // Prepopulate data (example users)
    const users = [
      {
        registrationNumber: 'REG001',
        bookedSlots: []
        
      },
      {
        registrationNumber: 'REG002',
        bookedSlots: []
       
      },
      {
        registrationNumber: 'REG003',
        bookedSlots: []
      },
      {
        registrationNumber: 'REG004',
        bookedSlots: []
        
      },
      {
        registrationNumber: 'REG005',
        bookedSlots: []
       
      },
    ];

    try {
      // Clear existing users to avoid duplicate issues
      await User.deleteMany({}); // This deletes all existing users
      console.log('Existing users cleared.');

      // Insert new users into the database
      await User.insertMany(users);
      console.log('Users have been successfully added to the database.');

      // Close connection after seeding
      mongoose.connection.close();
    } catch (error) {
      console.error('Error seeding users:', error);
      mongoose.connection.close();
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });
