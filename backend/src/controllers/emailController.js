import { scheduleEmail } from '../config/agenda.js';

export const scheduleEmailController = async (req, res) => {
    try {
        const { to, subject, body } = req.body;

        // Calculate time to send (1 hour from now)
        const sendAt = new Date();
        sendAt.setHours(sendAt.getHours() + 1);

        // Schedule the email
        await scheduleEmail({
            to,
            subject,
            body,
            sendAt
        });

        res.status(200).json({
            success: true,
            message: 'Email scheduled successfully',
            scheduledFor: sendAt
        });
    } catch (error) {
        console.error('Error in scheduleEmailController:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to schedule email',
            error: error.message
        });
    }
};
