const sendgridMail = require('@sendgrid/mail');
const { transporter, fromEmail } = require('../config/email');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';

const sendEmail = async ({ to, subject, text, html }) => {
    if (process.env.SENDGRID_API_KEY) {
        sendgridMail.setApiKey(process.env.SENDGRID_API_KEY);
        await sendgridMail.send({
            to,
            from: fromEmail,
            subject,
            text,
            html,
        });
        return;
    }

    await transporter.sendMail({
        from: fromEmail,
        to,
        subject,
        text,
        html,
    });
};

const sendVerificationEmail = async (user, token) => {
    const verifyLink = `${frontendUrl}/login.html?verifyToken=${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Verify your CUET Computer Club account',
        text: `Hi ${user.name}, verify your account: ${verifyLink}`,
        html: `<p>Hi ${user.name},</p><p>Please verify your account by clicking <a href="${verifyLink}">this link</a>.</p>`,
    });
};

const sendPasswordResetEmail = async (user, token) => {
    const resetLink = `${frontendUrl}/login.html?resetToken=${token}`;
    await sendEmail({
        to: user.email,
        subject: 'Reset your CUET Computer Club password',
        text: `Hi ${user.name}, reset your password: ${resetLink}`,
        html: `<p>Hi ${user.name},</p><p>Reset your password by clicking <a href="${resetLink}">this link</a>.</p>`,
    });
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
};
