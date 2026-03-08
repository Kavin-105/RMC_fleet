const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Notification = require('./models/Notification');
    const notifs = await Notification.find({}).sort({ createdAt: -1 }).limit(15);
    
    console.log('\n=== NOTIFICATIONS IN DATABASE ===');
    console.log('Total notifications:', notifs.length);
    console.log('');
    
    notifs.forEach((n, i) => {
        console.log(`${i + 1}. [${n.severity.toUpperCase()}] ${n.title}`);
        console.log(`   Type: ${n.type}`);
        console.log(`   Message: ${n.message}`);
        console.log(`   Email Sent: ${n.emailSent}`);
        console.log(`   Read: ${n.isRead}`);
        console.log(`   Created: ${n.createdAt}`);
        console.log('');
    });

    await mongoose.disconnect();
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
