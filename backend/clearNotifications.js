const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Notification = require('./models/Notification');
    
    // Clear all existing notifications so the cron job creates fresh ones with email
    const result = await Notification.deleteMany({});
    console.log(`Cleared ${result.deletedCount} old notifications.`);
    console.log('Now restart the server to trigger fresh expiry check with emails.');
    
    await mongoose.disconnect();
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
