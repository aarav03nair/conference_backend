const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./models/User');
const Slot = require('./models/Slot');

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
    console.log("login tried");
  const { registrationNumber } = req.body;
  let user = await User.findOne({ registrationNumber });
  console.log(user);

  if (!user) {
    // user = new User({ registrationNumber, bookedSlots: [] });
    // await user.save();
    return res.status(400).send('user id not valid');
  }

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

      // Clear bookedSlots array in user
      user.bookedSlots = [];
      await user.save();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Book slots
app.post('/api/book-slot', async (req, res) => {
  const { RegNo, selectedSlots } = req.body;

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
  if (slot1.bookedCount >= 20 || slot2.bookedCount >= 20) {
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

  res.send({ success: true });
});



app.listen(3000, () => {
  console.log('Server started on ');
});
