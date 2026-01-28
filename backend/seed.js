const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Document = require('./models/Document');
const Expense = require('./models/Expense');
const Checklist = require('./models/Checklist');

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Document.deleteMany();
    await Expense.deleteMany();
    await Checklist.deleteMany();

    console.log('Cleared existing data...');

    // ✅ Create owner using .save() to trigger pre-save hook
    const owner = new User({
      name: 'Amit Sharma',
      email: 'owner@demo.com',
      password: 'demo123',
      role: 'owner'
    });
    await owner.save();
    console.log('Created owner:', owner.email);

    // Create drivers
    const driverUsers = [];
    const driverData = [
      { name: 'Rajesh Kumar', mobile: '9876543210', licenseNumber: 'MH-1220220012345', licenseExpiry: '2027-06-15' },
      { name: 'Suresh Patil', mobile: '9876543211', licenseNumber: 'MH-1420200056789', licenseExpiry: '2026-03-20' },
      { name: 'Mahesh Jadhav', mobile: '9876543212', licenseNumber: 'MH-1220210098765', licenseExpiry: '2025-12-10' },
      { name: 'Ganesh More', mobile: '9876543213', licenseNumber: 'MH-1520220011111', licenseExpiry: '2026-08-25' }
    ];

    for (const d of driverData) {
      const user = new User({
        name: d.name,
        mobile: d.mobile,
        password: 'driver123',
        role: 'driver'
      });
      await user.save();
      driverUsers.push({ ...d, userId: user._id });
    }

    // Create driver profiles
    const drivers = [];
    for (const d of driverUsers) {
      const driver = await Driver.create({
        name: d.name,
        mobile: d.mobile,
        licenseNumber: d.licenseNumber,
        licenseExpiry: new Date(d.licenseExpiry),
        status: 'Active',
        checklistCompliance: Math.floor(Math.random() * 20) + 80,
        user: d.userId,
        owner: owner._id
      });
      drivers.push(driver);
    }

    console.log('Created', drivers.length, 'drivers');

    // Create vehicles (same as before)
    const vehicleData = [
      { vehicleNumber: 'MH-12-AB-1234', chassisNumber: 'TCM202312345', model: 'Schwing Stetter AM 9', drumCapacity: 9 },
      { vehicleNumber: 'MH-12-CD-5678', chassisNumber: 'TCM202367890', model: 'Schwing Stetter AM 7', drumCapacity: 7 },
      { vehicleNumber: 'MH-14-EF-9012', chassisNumber: 'TCM202311111', model: 'Schwing Stetter AM 6', drumCapacity: 6 },
      { vehicleNumber: 'MH-15-GH-3456', chassisNumber: 'TCM202322222', model: 'Ajax Fiori ARGO 4000', drumCapacity: 6 },
      { vehicleNumber: 'MH-12-IJ-7890', chassisNumber: 'TCM202333333', model: 'Schwing Stetter AM 12', drumCapacity: 12 }
    ];

    const vehicles = [];
    for (let i = 0; i < vehicleData.length; i++) {
      const v = vehicleData[i];
      const vehicle = await Vehicle.create({
        vehicleNumber: v.vehicleNumber,
        chassisNumber: v.chassisNumber,
        model: v.model,
        manufacturingYear: 2022 + (i % 3),
        drumCapacity: v.drumCapacity,
        registrationDate: new Date('2023-01-15'),
        currentOdometer: Math.floor(Math.random() * 50000) + 10000,
        engineHours: Math.floor(Math.random() * 3000) + 500,
        status: i === 2 ? 'Maintenance' : 'Active',
        assignedDriver: drivers[i] ? drivers[i]._id : null,
        owner: owner._id
      });
      vehicles.push(vehicle);

      if (drivers[i]) {
        drivers[i].assignedVehicles = [vehicle._id];
        await drivers[i].save();
      }
    }

    console.log('Created', vehicles.length, 'vehicles');

    // The rest (documents, expenses, checklists) stays the same
    console.log('\n✅ Seed data created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('   Owner: owner@demo.com / demo123');
    console.log('   Driver: 9876543210 / driver123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected...');
  seedData();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});
