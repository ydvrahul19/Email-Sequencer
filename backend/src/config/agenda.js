import Agenda from 'agenda';
import { sendEmail } from '../services/emailService.js';

const agenda = new Agenda({
    db: { address: process.env.MONGODB_URI },
    processEvery: '1 minute'
});

// Define the job type
agenda.define('send email', async (job) => {
    const { to, subject, body } = job.attrs.data;
    try {
        await sendEmail({ to, subject, body });
        console.log(`Scheduled email sent to ${to}`);
    } catch (error) {
        console.error('Failed to send scheduled email:', error);
        throw error;
    }
});

// Start Agenda
(async function() {
    await agenda.start();
    console.log('Agenda started successfully');
})();

export const scheduleEmail = async ({ to, subject, body, sendAt }) => {
    try {
        await agenda.schedule(sendAt, 'send email', {
            to,
            subject,
            body
        });
        console.log(`Email scheduled for ${sendAt} to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('Error scheduling email:', error);
        throw error;
    }
};
