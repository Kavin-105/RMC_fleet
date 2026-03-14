const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const User = require('./models/User');
    
    // Find owner user
    const owner = await User.findOne({ role: 'owner' });
    
    if (!owner) {
        console.log('No owner user found!');
        await mongoose.disconnect();
        process.exit(1);
    }
    
    console.log('Current owner email:', owner.email);
    
    // Update to real email
    owner.email = 'kavinr.23cse@kongu.edu';
    await owner.save();
    
    console.log('Updated owner email to:', owner.email);
    console.log('Owner name:', owner.name);
    
    await mongoose.disconnect();
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
