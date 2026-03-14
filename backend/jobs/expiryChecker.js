const cron = require('node-cron');
const Document = require('../models/Document');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendDocumentExpiryWarning, sendDocumentExpiredNotification } = require('../services/emailService');

/**
 * Check for expiring and expired documents.
 * - Documents expiring within 30 days → Notify owner (email + in-app) daily
 * - Email sent at key milestones: 15, 7, 3, 1 days before expiry
 * - In-app notification created for any expiring/expired doc without a recent one
 * - Expired documents → Notify owner + driver
 */
const checkDocumentExpiry = async () => {
    try {
        console.log('[Cron] Running document expiry check...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all documents
        const documents = await Document.find({})
            .populate('vehicle', 'vehicleNumber model assignedDriver')
            .populate('owner', 'name email');

        let expiringCount = 0;
        let expiredCount = 0;
        let newNotifications = 0;

        for (const doc of documents) {
            const expiryDate = new Date(doc.expiryDate);
            expiryDate.setHours(0, 0, 0, 0);

            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

            // Update document status
            let newStatus = 'Valid';
            if (daysUntilExpiry < 0) {
                newStatus = 'Expired';
            } else if (daysUntilExpiry <= 30) {
                newStatus = 'Expiring';
            }

            if (doc.status !== newStatus) {
                doc.status = newStatus;
                await Document.updateOne({ _id: doc._id }, { status: newStatus });
            }

            const vehicleNumber = doc.vehicle?.vehicleNumber || 'Unknown Vehicle';
            const ownerName = doc.owner?.name || 'Owner';
            const ownerEmail = doc.owner?.email;
            const ownerId = doc.owner?._id;

            if (!ownerId) continue;

            // === EXPIRING SOON (within 30 days) - Notify Owner ===
            if (daysUntilExpiry >= 0 && daysUntilExpiry <= 30) {
                expiringCount++;

                // Check if we already sent notification today for this doc
                const existingNotification = await Notification.findOne({
                    recipient: ownerId,
                    relatedDocument: doc._id,
                    type: 'document_expiring',
                    createdAt: { $gte: today }
                });

                if (!existingNotification) {
                    newNotifications++;

                    const daysText = daysUntilExpiry === 0
                        ? 'Today'
                        : `in ${daysUntilExpiry} Day${daysUntilExpiry !== 1 ? 's' : ''}`;

                    // Create in-app notification for owner
                    await Notification.create({
                        recipient: ownerId,
                        type: 'document_expiring',
                        title: `${doc.type} Expiring ${daysText}!`,
                        message: `${doc.type} for vehicle ${vehicleNumber} will expire on ${expiryDate.toLocaleDateString('en-IN')}. Please renew it before expiry.`,
                        relatedDocument: doc._id,
                        relatedVehicle: doc.vehicle?._id,
                        severity: daysUntilExpiry <= 3 ? 'error' : 'warning'
                    });

                    console.log(`[Cron] In-app notification created: ${doc.type} - ${vehicleNumber} (${daysUntilExpiry} days)`);

                    // Send EMAIL at key milestones: 30, 15, 7, 3, 1, 0 days
                    if ([0, 1, 3, 7, 15, 30].includes(daysUntilExpiry)) {
                        if (ownerEmail) {
                            const emailResult = await sendDocumentExpiryWarning({
                                ownerEmail,
                                ownerName,
                                vehicleNumber,
                                documentType: doc.type,
                                expiryDate: doc.expiryDate,
                                daysRemaining: daysUntilExpiry
                            });

                            if (emailResult.success) {
                                console.log(`[Cron] ✉ Expiry warning email SENT for ${doc.type} - ${vehicleNumber} (${daysUntilExpiry} days)`);
                            }
                        }
                    }
                }
            }

            // === EXPIRED - Notify Owner + Driver ===
            if (daysUntilExpiry < 0) {
                expiredCount++;
                const daysSinceExpiry = Math.abs(daysUntilExpiry);

                // Check if we already sent expired notification today
                const existingExpiredNotif = await Notification.findOne({
                    recipient: ownerId,
                    relatedDocument: doc._id,
                    type: 'document_expired',
                    createdAt: { $gte: today }
                });

                // Send notification on day 1, then every 7 days, OR if no notification exists at all for this doc
                const hasAnyNotification = await Notification.findOne({
                    recipient: ownerId,
                    relatedDocument: doc._id,
                    type: 'document_expired'
                });

                const shouldNotify = !existingExpiredNotif && (
                    !hasAnyNotification ||       // First time detecting this expired doc
                    daysSinceExpiry === 1 ||      // Day after expiry
                    daysSinceExpiry % 7 === 0     // Weekly reminder
                );

                if (shouldNotify) {
                    newNotifications++;

                    const title = !hasAnyNotification
                        ? `${doc.type} Has Expired!`
                        : `Reminder: ${doc.type} Still Expired (${daysSinceExpiry} days)`;

                    // Notify Owner
                    await Notification.create({
                        recipient: ownerId,
                        type: 'document_expired',
                        title,
                        message: `${doc.type} for vehicle ${vehicleNumber} expired on ${expiryDate.toLocaleDateString('en-IN')}. Expired ${daysSinceExpiry} day${daysSinceExpiry !== 1 ? 's' : ''} ago. Immediate renewal required!`,
                        relatedDocument: doc._id,
                        relatedVehicle: doc.vehicle?._id,
                        severity: 'error'
                    });

                    console.log(`[Cron] Expired notification created: ${doc.type} - ${vehicleNumber} (${daysSinceExpiry} days ago)`);

                    // Send expired email to owner (first time or weekly)
                    if (ownerEmail && (!hasAnyNotification || daysSinceExpiry % 7 === 0)) {
                        const emailResult = await sendDocumentExpiredNotification({
                            ownerEmail,
                            ownerName,
                            vehicleNumber,
                            documentType: doc.type,
                            expiryDate: doc.expiryDate
                        });

                        if (emailResult.success) {
                            console.log(`[Cron] ✉ EXPIRED email SENT for ${doc.type} - ${vehicleNumber}`);
                        }
                    }

                    // Notify Driver (if vehicle has an assigned driver)
                    if (doc.vehicle?.assignedDriver) {
                        const driver = await Driver.findById(doc.vehicle.assignedDriver);
                        if (driver && driver.user) {
                            const existingDriverNotif = await Notification.findOne({
                                recipient: driver.user,
                                relatedDocument: doc._id,
                                type: 'document_expired',
                                createdAt: { $gte: today }
                            });

                            if (!existingDriverNotif) {
                                await Notification.create({
                                    recipient: driver.user,
                                    type: 'document_expired',
                                    title: `${doc.type} Has Expired!`,
                                    message: `${doc.type} for your assigned vehicle ${vehicleNumber} expired on ${expiryDate.toLocaleDateString('en-IN')}. Please inform the owner and avoid operating this vehicle until the document is renewed.`,
                                    relatedDocument: doc._id,
                                    relatedVehicle: doc.vehicle?._id,
                                    severity: 'error'
                                });
                                console.log(`[Cron] Driver notification sent to ${driver.name} for expired ${doc.type} - ${vehicleNumber}`);
                            }
                        }
                    }
                }
            }
        }

        console.log(`[Cron] Document expiry check complete. Expiring: ${expiringCount}, Expired: ${expiredCount}, New notifications: ${newNotifications}`);
    } catch (error) {
        console.error('[Cron] Error in document expiry check:', error.message);
    }
};

/**
 * Check for driver license expiry
 */
const checkLicenseExpiry = async () => {
    try {
        console.log('[Cron] Running driver license expiry check...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const drivers = await Driver.find({ status: 'Active' }).populate('owner', 'name email');

        for (const driver of drivers) {
            if (!driver.licenseExpiry) continue;

            const expiryDate = new Date(driver.licenseExpiry);
            expiryDate.setHours(0, 0, 0, 0);
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

            // Notify at 15, 7, 3, 1 days before expiry
            if ([1, 3, 7, 15].includes(daysUntilExpiry)) {
                const existingNotif = await Notification.findOne({
                    recipient: driver.owner,
                    type: 'license_expiring',
                    createdAt: { $gte: today },
                    message: { $regex: driver.name }
                });

                if (!existingNotif) {
                    // Notify Owner
                    await Notification.create({
                        recipient: driver.owner,
                        type: 'license_expiring',
                        title: `Driver License Expiring in ${daysUntilExpiry} Day${daysUntilExpiry !== 1 ? 's' : ''}`,
                        message: `Driving license of ${driver.name} (${driver.licenseNumber}) will expire on ${expiryDate.toLocaleDateString('en-IN')}.`,
                        severity: daysUntilExpiry <= 3 ? 'error' : 'warning'
                    });

                    // Notify Driver
                    if (driver.user) {
                        await Notification.create({
                            recipient: driver.user,
                            type: 'license_expiring',
                            title: `Your License Expiring in ${daysUntilExpiry} Day${daysUntilExpiry !== 1 ? 's' : ''}`,
                            message: `Your driving license (${driver.licenseNumber}) will expire on ${expiryDate.toLocaleDateString('en-IN')}. Please renew it before expiry.`,
                            severity: daysUntilExpiry <= 3 ? 'error' : 'warning'
                        });
                    }
                }
            }
        }

        console.log('[Cron] Driver license expiry check complete.');
    } catch (error) {
        console.error('[Cron] Error in license expiry check:', error.message);
    }
};

/**
 * Initialize all cron jobs
 */
const initCronJobs = () => {
    // Run document expiry check every day at 8:00 AM
    cron.schedule('0 8 * * *', () => {
        console.log('[Cron] Scheduled document expiry check starting...');
        checkDocumentExpiry();
        checkLicenseExpiry();
    });

    // Also run once on server startup (after 30 seconds to let DB stabilize)
    setTimeout(() => {
        console.log('[Cron] Running initial document expiry check on startup...');
        checkDocumentExpiry();
        checkLicenseExpiry();
    }, 30000);

    console.log('[Cron] Document expiry cron jobs initialized. Checks run daily at 8:00 AM.');
};

module.exports = {
    initCronJobs,
    checkDocumentExpiry,
    checkLicenseExpiry
};
