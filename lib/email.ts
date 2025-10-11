import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email templates
export const emailTemplates = {
  packageExpiryReminder: (customerName: string, packageName: string, expiryDate: string) => ({
    subject: `Package Expiry Reminder - ${packageName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Package Expiry Reminder</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that your <strong>${packageName}</strong> package will expire on 
            <strong style="color: #e74c3c;">${expiryDate}</strong>.
          </p>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            To avoid any service interruption, please ensure your payment is processed before the expiry date.
          </p>
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">What happens if I don't renew?</h3>
            <ul style="color: #856404; margin: 10px 0;">
              <li>Your account will be locked 3 days after expiry</li>
              <li>You won't be able to log complaints</li>
              <li>Meeting room bookings will be restricted</li>
              <li>Gate pass access will be denied</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/customer/profile" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              Manage Your Account
            </a>
          </div>
        </div>
        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Coworking Portal. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  packageExpired: (customerName: string, packageName: string, expiryDate: string) => ({
    subject: `Package Expired - ${packageName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Package Expired</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your <strong>${packageName}</strong> package expired on 
            <strong style="color: #e74c3c;">${expiryDate}</strong>.
          </p>
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">⚠️ Important Notice</h3>
            <p style="color: #721c24; margin: 10px 0;">
              Your account will be locked in 3 days if payment is not received. 
              Please contact us immediately to avoid service interruption.
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/customer/profile" 
               style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              Renew Your Package
            </a>
          </div>
        </div>
        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Coworking Portal. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  accountLocked: (customerName: string, packageName: string, lockDate: string) => ({
    subject: `Account Locked - Payment Overdue`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Account Locked</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your account has been locked due to overdue payment for your 
            <strong>${packageName}</strong> package.
          </p>
          <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #721c24; margin-top: 0;">🚫 Account Restrictions</h3>
            <ul style="color: #721c24; margin: 10px 0;">
              <li>Cannot log complaints</li>
              <li>Cannot book meeting rooms</li>
              <li>Gate pass access denied</li>
              <li>Limited portal access</li>
            </ul>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/customer/profile" 
               style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              Contact Support
            </a>
          </div>
        </div>
        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Coworking Portal. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  complaintStatusUpdate: (customerName: string, complaintTitle: string, newStatus: string) => ({
    subject: `Complaint Status Update - ${complaintTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Complaint Update</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your complaint "<strong>${complaintTitle}</strong>" status has been updated to 
            <strong style="color: #3498db;">${newStatus}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/customer/complaints" 
               style="background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              View Complaint
            </a>
          </div>
        </div>
        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Coworking Portal. All rights reserved.</p>
        </div>
      </div>
    `
  }),

  contractReady: (customerName: string, contractFileName: string) => ({
    subject: `Contract Ready for Download`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Contract Ready</h1>
        </div>
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Hello ${customerName}!</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your requested contract <strong>${contractFileName}</strong> is now ready for download.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/customer/contracts" 
               style="background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%); 
                      color: white; padding: 15px 30px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;">
              Download Contract
            </a>
          </div>
        </div>
        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 Coworking Portal. All rights reserved.</p>
        </div>
      </div>
    `
  })
}

// Send email function
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Coworking Portal" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    })
    
    console.log('📧 Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ Email sending failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Send notification email
export async function sendNotificationEmail(
  customerEmail: string,
  customerName: string,
  type: 'packageExpiryReminder' | 'packageExpired' | 'accountLocked' | 'complaintStatusUpdate' | 'contractReady',
  data: any
) {
  let template
  
  switch (type) {
    case 'packageExpiryReminder':
      template = emailTemplates.packageExpiryReminder(
        customerName,
        data.packageName,
        data.expiryDate
      )
      break
    case 'packageExpired':
      template = emailTemplates.packageExpired(
        customerName,
        data.packageName,
        data.expiryDate
      )
      break
    case 'accountLocked':
      template = emailTemplates.accountLocked(
        customerName,
        data.packageName,
        data.lockDate
      )
      break
    case 'complaintStatusUpdate':
      template = emailTemplates.complaintStatusUpdate(
        customerName,
        data.complaintTitle,
        data.newStatus
      )
      break
    case 'contractReady':
      template = emailTemplates.contractReady(
        customerName,
        data.contractFileName
      )
      break
    default:
      throw new Error('Unknown email template type')
  }

  return await sendEmail(customerEmail, template.subject, template.html)
}
