const nodemailer = require('nodemailer');

// Create reusable transporter
// Configure these in your .env file:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=587
// EMAIL_USER=your-email@gmail.com
// EMAIL_PASS=your-app-password (use Gmail App Password, not regular password)
// EMAIL_FROM=RMC Fleet <your-email@gmail.com>

const createTransporter = () => {
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port,
        secure: port === 465, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
const sendEmail = async ({ to, subject, html }) => {
    try {
        // Skip if email credentials are not configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('[Email Service] Email credentials not configured. Skipping email send.');
            console.log(`[Email Service] Would have sent to: ${to}, Subject: ${subject}`);
            return { success: false, reason: 'Email credentials not configured' };
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"RMC Fleet" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Email sent: ${info.messageId} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send document expiry warning email to owner
 */
const sendDocumentExpiryWarning = async ({ ownerEmail, ownerName, vehicleNumber, documentType, expiryDate, daysRemaining }) => {
    const subject = `⚠️ Document Expiring Soon - ${documentType} for ${vehicleNumber}`;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚛 RMC Fleet</h1>
            <p style="color: #dbeafe; margin: 8px 0 0;">Document Expiry Alert</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-top: 0;">⚠️ Document Expiring in ${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''}!</h2>
            <p style="color: #374151;">Dear <strong>${ownerName}</strong>,</p>
            <p style="color: #374151;">This is to inform you that the following document is about to expire:</p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Document Type:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${documentType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Vehicle Number:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${vehicleNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Expiry Date:</td>
                        <td style="padding: 8px 0; color: #dc2626; font-weight: 600;">${new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Days Remaining:</td>
                        <td style="padding: 8px 0; color: #dc2626; font-weight: 600;">${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}</td>
                    </tr>
                </table>
            </div>
            
            <p style="color: #374151;">Please renew this document at the earliest to avoid any legal issues or disruptions in fleet operations.</p>
            
            <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/owner/documents" 
                   style="background: #1e40af; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                    View Documents
                </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                This is an automated notification from RMC Fleet Management System.
            </p>
        </div>
    </div>`;

    return sendEmail({ to: ownerEmail, subject, html });
};

/**
 * Send document expired notification email to owner
 */
const sendDocumentExpiredNotification = async ({ ownerEmail, ownerName, vehicleNumber, documentType, expiryDate }) => {
    const subject = `🚨 Document EXPIRED - ${documentType} for ${vehicleNumber}`;
    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: linear-gradient(135deg, #991b1b, #dc2626); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚛 RMC Fleet</h1>
            <p style="color: #fecaca; margin: 8px 0 0;">Urgent: Document Expired</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: #dc2626; margin-top: 0;">🚨 Document Has Expired!</h2>
            <p style="color: #374151;">Dear <strong>${ownerName}</strong>,</p>
            <p style="color: #374151;">The following document has <strong style="color: #dc2626;">EXPIRED</strong> and requires immediate attention:</p>
            
            <div style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Document Type:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${documentType}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Vehicle Number:</td>
                        <td style="padding: 8px 0; color: #1f2937; font-weight: 600;">${vehicleNumber}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Expired On:</td>
                        <td style="padding: 8px 0; color: #dc2626; font-weight: 600;">${new Date(expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                    </tr>
                </table>
            </div>
            
            <p style="color: #dc2626; font-weight: 600;">⚠️ Operating vehicles with expired documents may lead to legal penalties.</p>
            <p style="color: #374151;">Please renew this document immediately.</p>
            
            <div style="text-align: center; margin: 24px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/owner/documents" 
                   style="background: #dc2626; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                    Renew Now
                </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                This is an automated notification from RMC Fleet Management System.
            </p>
        </div>
    </div>`;

    return sendEmail({ to: ownerEmail, subject, html });
};

module.exports = {
    sendEmail,
    sendDocumentExpiryWarning,
    sendDocumentExpiredNotification
};
