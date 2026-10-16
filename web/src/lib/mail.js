import nodemailer from 'nodemailer';

export function mailConfigured() {
    return !!process.env.SMTP_HOST;
}

export async function sendMail({ to, subject, html }) {
    if (!mailConfigured()) {
        console.log(`[mail:disabled] to=${to} subject=${subject}`);
        return false;
    }
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
    return true;
}

export function mailLayout(title, body, cta) {
    return `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 40px; border-radius: 8px;">
  <h2 style="color: #1f3a8a; margin-top: 0;">${title}</h2>
  <div style="font-size: 16px; line-height: 1.6; color: #444;">${body}</div>
  ${cta ? `<div style="margin: 32px 0;"><a href="${cta.href}" style="background-color: #1f3a8a; color: white; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${cta.label}</a></div>` : ''}
  <p style="font-size: 12px; color: #999;">Kariyer Rota · Haftalık performans arşivin</p>
</div>`;
}
