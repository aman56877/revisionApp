require('dotenv').config();
require('./dbConfig');
const express = require('express');
const app = express();
const port = process.env.PORT || 8089
const cors = require('cors');
const Revision = require('./models/revision');
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const cron = require("node-cron");
const nodemailer = require("nodemailer");


app.use(express.json());
app.use(cors());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL,
    pass: process.env.GMAILPASSWORD,
  },
});

// Function to send email
const sendReminderEmail = async (email, reminderDate, fromPageToPage, difficulty) => {
  const mailOptions = {
    from: '"No Reply" <noreply@example.com>', // Sender address
    to: email, // Recipient email
    subject: 'Reminder Notification',
    text: `This is a reminder for your revision from page ${fromPageToPage} with the difficulty of ${difficulty} as  scheduled on ${reminderDate}.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Cron job to run every day at 11 AM
cron.schedule('0 11 * * *', async () => {
  try {
    const today = moment().format('DD-MM-YYYY'); // Get today's date in DD-MM-YYYY format
    console.log(today);

    // Find all reminders for today
    const reminders = await Revision.find({ reminder: today });

    if (reminders.length > 0) {
      reminders.forEach(async (reminder) => {
        // Send email to the user
        await sendReminderEmail(reminder.email, reminder.reminder, reminder.fromPageToPage, reminder.difficulty);
        console.log("Email sent");
      });
    } else {
      console.log('No reminders for today.');
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}, {
  timezone: "UTC" // Ensures the cron job runs at 11 AM UTC
});



app.post('/submit-progress', async (req, res) => {
  const { pagesRead, fromPageToPage, difficulty, deviceID, email } = req.body;
  const token = uuidv4();
  const today = moment();

  const reminderDate = today.add(difficulty, 'weeks').format("DD-MM-YYYY");

  const revision = new Revision({
    deviceID,
    pagesRead,
    fromPageToPage,
    difficulty,
    email,
    token: token,
    reminder: reminderDate,
  });

  const newRevision = await revision.save();

  if (newRevision) {
    res.status(200).json({ message: "Revision has been saved" });
  } else {
    res.status(400).json({ message: "Unexpected Error Occured" });
  };
});

app.get('/get-revisions', async (req, res) => {
  try {
    const deviceID = req.query.deviceID;
    // console.log("Here");

    if (!deviceID) {
      // console.log("this issue");
      return res.status(400).send({ error: 'deviceID is required' });
    }

    // Query the database for revisions associated with the provided deviceID
    const revisions = await Revision.find({ deviceID });

    if (revisions.length === 0) {
      return res.status(404).send({ message: 'No revisions found for this device' });
    }

    // Return the found revisions
    res.status(200).json(revisions);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'An error occurred while fetching revisions' });
  }
});

app.delete('/delete-revision', async (req, res) => {
  const { token } = req.body;

  try {
    await Revision.findOneAndDelete(token); // Assuming you use Mongoose
    res.status(200).json({ message: 'Revision deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting revision', error });
  }
});



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
