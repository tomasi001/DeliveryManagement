import nodemailer from 'nodemailer'

export type MailOptions = {
  to: string
  subject: string
  html: string
  successMessage: string
  errorMessage: string
}

// Helper to determine if we should use the 'service' shorthand or full host config
const isGmailService = process.env.EMAIL_HOST === 'Gmail';

// Create a transport for sending emails
const transporter = nodemailer.createTransport({
  ...(isGmailService 
    ? { service: 'Gmail' } 
    : {
        host: process.env.EMAIL_HOST, 
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
      }
  ),
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
})

// Send the email
export const sendMail = ({
  to,
  subject,
  html,
  successMessage,
  errorMessage,
}: MailOptions): Promise<boolean> => {
  const mailOptions = {
    from: `Procedure Buddy <${process.env.SENDER_EMAIL}>`,
    to,
    subject,
    html,
  }

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(`${errorMessage}: `, error)
        reject(false)
      } else {
        console.log(`${successMessage}: ${info.response}`)
        resolve(true)
      }
    })
  })
}
