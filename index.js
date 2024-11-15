const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const Slot = require('./models/Slot');
const nodemailer = require('nodemailer');


const app = express();
app.use(bodyParser.json());
const allowedOrigins = [
  'https://conference-dental-dtsnuaf7m-aarav03nairs-projects.vercel.app',
];

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // if you need to pass cookies or authorization headers
}));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})
  // {
//   origin: ['https://vercel.live/link/conference-dental.vercel.app?via=project-dashboard-alias-list&p=1'],
//   method :['POST','GET'],
//   credentials:true
// }));
// app.opt ions('*', cors());  // Allow preflight requests for all routes

mongoose.connect('mongodb+srv://aarav03nair:conf123@cluster0.v9bpk.mongodb.net/conference?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


// Route to get users who booked a specific slot
app.post('/api/getUsersBySlot', async (req, res) => {
  const { day, room, time } = req.body;

  // Find the slot ID that matches the selected day, hall, and time
  const slot = await Slot.findOne({ day, room, time });

  if (!slot) {
    return res.status(404).send('No slot found for the selected criteria');
  }

  // Find users who booked the selected slot ID
  const users = await User.find({ bookedSlots: slot._id });
  res.json(users);
});



app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().populate('bookedSlots'); // Populate slot details if needed
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving users.' });
  }
});
// Login endpoint
app.post('/api/login', async (req, res) => {
  console.log("Login attempt");

  const { registrationNumber, phoneNumber } = req.body;
  
  // Find user by registration number
  let user = await User.findOne({ registrationNumber });

  if (!user) {
      // If no user is found with the provided registration number
      return res.status(400).send('Registration number or phone number is incorrect');
  }

  // If the user exists but phoneNumber is not provided in the database
  if (!user.phoneNumber) {
    // console.alert("please contact 9850575877 for this")
      return res.status(402).send('Phone number not provided for this registration number. please contact 9850575877 for this');
  }

  // If the user exists but phone number does not match
  if (user.phoneNumber !== phoneNumber) {
      return res.status(400).send('Registration number or phone number is incorrect');
  }

  // If both registration number and phone number match
  res.json(user);
});


// Get available slots
app.get('/api/slots', async (req, res) => {
  const slots = await Slot.find({ bookedCount: { $lt: 20 } });
  res.json(slots);
});

app.post('/api/user-slot-info',async(req, res)=>{
  const { RegNo} = req.body;
  try{
  const user  = await User.findOne({registrationNumber:RegNo});
  console.log('user: ',user?.bookedSlots?.length);

  const bookedSlots = user?.bookedSlots;

    // Fetch the slot details using the booked slot IDs
    const slots = await Slot.find({ _id: { $in: bookedSlots } });

    res.json(slots); 
  }
  catch(err){
    console.log(err);
  }
})
app.post('/api/clear-user-slots', async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({registrationNumber:userId}).populate('bookedSlots');
    console.log(user);

    if (user && user.bookedSlots) {
      // Update bookedCount of slots
      for (let slot of user.bookedSlots) {
        slot.bookedCount = Math.max(slot.bookedCount - 1, 0);
        await slot.save();
      }
      const prevBookedSlots = user.bookedSlots;
      // Clear bookedSlots array in user
      user.bookedSlots = [];
      await user.save();

      const transporter = nodemailer.createTransport({
        service: 'gmail', // use your email service
        auth: {
          user: 'isddexperiencezone@gmail.com',
          pass: 'pxbq lvsf eubq avlt',
        },
      });
    
      const mailOptions = {
        from: 'isddexperiencezone@gmail.com',
        to:'isddexperiencezone@gmail.com',
        subject: 'Slot cleared info',
        text: `RegNo: ${userId}
        ${prevBookedSlots}`,
      };
    
      await transporter.sendMail(mailOptions);
    }


    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Book slots
app.post('/api/book-slot', async (req, res) => {
  // const { RegNo, selectedSlots } = req.body;
  const { RegNo, selectedSlots, email } = req.body;

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).send('Please provide a valid email address.');
  }

    console.log(RegNo);
  // const user = await User.findById(userId);
  const user  = await User.findOne({registrationNumber:RegNo});
  console.log("yaay");
  console.log(user);
  console.log("yaay");

  // if (!Array.isArray(user.bookedSlots)) {
  //   user.bookedSlots = [];
  // }
  
  if (user.bookedSlots.length >= 2) {
    console.log("You have already booked 2 slots previously");
    return res.status(400).send('You have already booked two slots.');
  }

  const slot1 = await Slot.findById(selectedSlots[0]);
  const slot2 = await Slot.findById(selectedSlots[1]);

  if (slot1.day === slot2.day && slot1.time === slot2.time) {
    return res.status(400).send('Slots cannot be at the same time on the same day.');
  }
console.log("hello");
  if (slot1.bookedCount >= 15 || slot2.bookedCount >= 15) {
    return res.status(400).send('One of the slots is already full.');
  }
  const bookedslot = user.bookedSlots;

  slot1.bookedCount++;
  slot2.bookedCount++;
  await slot1.save();
  await slot2.save();
console.log("here booked slot is saved");
console.log(slot1._id);
console.log(slot2._id);
console.log(bookedslot);
  user.bookedSlots.push(slot1._id, slot2._id);
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail', // use your email service
    auth: {
      user: 'isddexperiencezone@gmail.com',
      pass: 'pxbq lvsf eubq avlt',
    },
  });

  const mailOptions = {
    from: 'isddexperiencezone@gmail.com',
    to: email,
    subject: 'Slot Booking Confirmation',
    text: `Thankyou for registering for the ISDD Experience zone. Your bookings are as follows:
    Slot 1: ${slot1.day},  Room ${slot1.room}, Time ${slot1.time}
      Name: ${slot1.topic}
    Slot 2: ${slot2.day},  Room ${slot2.room}, Time ${slot2.time}
      Name: ${slot2.topic}

    Please assemble at the assigned Hall 15mins before the scheduled time and show this email for confirmation.
    `,
  };

  await transporter.sendMail(mailOptions);

  res.send({ success: true });
});



app.listen(3000, () => {
  console.log('Server started on ');
});
