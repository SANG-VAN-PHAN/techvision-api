/**
 * Email Service
 *
 * Hỗ trợ gửi email thật qua nhiều provider, tự động fallback:
 *   1. Resend  - nếu có RESEND_API_KEY (giới hạn người nhận nếu chưa verify domain)
 *   2. SMTP   - nếu có SMTP_HOST (Brevo/Gmail/... gửi được đến mọi người)
 *   3. Console - fallback, chỉ log ra terminal (dev)
 *
 * Ưu tiên dùng SMTP vì không cần verify domain, gửi đến mọi người được ngay.
 */

const nodemailer = require('nodemailer');

// Tạo transporter SMTP (lazy init)
let smtpTransporter = null;
const getSmtpTransporter = () => {
    if (smtpTransporter) return smtpTransporter;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return null;
    }

    smtpTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true', // true cho port 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    return smtpTransporter;
};

// Resend client (optional)
let resendClient = null;
const getResendClient = () => {
    if (resendClient !== null) return resendClient || null;
    if (!process.env.RESEND_API_KEY) {
        resendClient = null;
        return null;
    }
    const { Resend } = require('resend');
    resendClient = new Resend(process.env.RESEND_API_KEY);
    return resendClient;
};

/**
 * Gửi email
 * @param {Object} options
 * @param {string} options.to - Email người nhận
 * @param {string} options.subject - Tiêu đề
 * @param {string} options.html - Nội dung HTML
 * @param {string} [options.text] - Nội dung text thuần
 * @returns {Promise<{sent: boolean, provider: string, error?: string}>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
    // 1. Ưu tiên SMTP - gửi đến mọi người, không cần verify domain
    const transporter = getSmtpTransporter();
    if (transporter) {
        try {
            await transporter.sendMail({
                from: process.env.SMTP_FROM || process.env.SMTP_USER,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]+>/g, ' ')
            });
            return { sent: true, provider: 'smtp' };
        } catch (error) {
            console.error(`[Email] SMTP failed: ${error.message}`);
            // Không throw, thử provider tiếp theo
        }
    }

    // 2. Fallback sang Resend
    const resend = getResendClient();
    if (resend) {
        try {
            await resend.emails.send({
                from: process.env.FROM_EMAIL || 'TechVision <onboarding@resend.dev>',
                to,
                subject,
                html
            });
            return { sent: true, provider: 'resend' };
        } catch (error) {
            console.error(`[Email] Resend failed: ${error.message}`);
        }
    }

    // 3. Cuối cùng: log ra console (dev mode)
    console.log('\n========== [EMAIL - CONSOLE FALLBACK] ==========');
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log('==============================================\n');

    return { sent: false, provider: 'console' };
};

/**
 * Gửi email xác minh tài khoản
 */
const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
    const subject = 'Xác minh email - TechVision';
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
                    <!-- Header -->
                    <tr>
                        <td style="background:#0066FF;padding:28px 32px;text-align:center;">
                            <div style="color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.5px;">
                                📱 TechVision
                            </div>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:36px 32px;">
                            <h1 style="margin:0 0 16px;font-size:22px;color:#1D1D1F;font-weight:700;">
                                Xin chào ${name}!
                            </h1>
                            <p style="margin:0 0 16px;font-size:15px;color:#6E6E73;line-height:1.6;">
                                Cảm ơn bạn đã đăng ký tài khoản tại <strong style="color:#1D1D1F;">TechVision</strong>.
                                Vui lòng xác minh email để hoàn tất đăng ký.
                            </p>
                            <!-- CTA Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${verifyUrl}"
                                           style="display:inline-block;background:#0066FF;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:600;font-size:15px;">
                                            Xác minh email ngay
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <!-- Fallback link -->
                            <p style="margin:0 0 8px;font-size:13px;color:#86868B;line-height:1.6;">
                                Nếu nút trên không hoạt động, copy link này vào trình duyệt:
                            </p>
                            <p style="margin:0 0 24px;font-size:12px;color:#0066FF;word-break:break-all;line-height:1.5;">
                                ${verifyUrl}
                            </p>
                            <!-- Divider -->
                            <div style="height:1px;background:#E8E8ED;margin:24px 0;"></div>
                            <p style="margin:0;font-size:12px;color:#86868B;line-height:1.6;">
                                ⏱️ Link có hiệu lực trong <strong>24 giờ</strong>.<br>
                                📍 Cần trợ giúp? Liên hệ <a href="mailto:support@techvision.vn" style="color:#0066FF;">support@techvision.vn</a><br>
                                🔒 Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #E8E8ED;">
                            <p style="margin:0;font-size:11px;color:#A1A1A6;">
                                © ${new Date().getFullYear()} TechVision. Cửa hàng công nghệ uy tín tại Việt Nam.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return sendEmail({ to, subject, html });
};

/**
 * Gửi email đặt lại mật khẩu
 */
const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const subject = 'Đặt lại mật khẩu - TechVision';
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,.06);">
                    <tr>
                        <td style="background:#0066FF;padding:28px 32px;text-align:center;">
                            <div style="color:#ffffff;font-size:24px;font-weight:700;">📱 TechVision</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h1 style="margin:0 0 16px;font-size:22px;color:#1D1D1F;">Đặt lại mật khẩu</h1>
                            <p style="margin:0 0 16px;font-size:15px;color:#6E6E73;line-height:1.6;">
                                Xin chào ${name}, chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="${resetUrl}"
                                           style="display:inline-block;background:#0066FF;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:600;font-size:15px;">
                                            Đặt lại mật khẩu
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 8px;font-size:13px;color:#86868B;">Hoặc copy link này:</p>
                            <p style="margin:0 0 24px;font-size:12px;color:#0066FF;word-break:break-all;">${resetUrl}</p>
                            <div style="height:1px;background:#E8E8ED;margin:24px 0;"></div>
                            <p style="margin:0;font-size:12px;color:#86868B;line-height:1.6;">
                                ⏱️ Link hết hạn sau <strong>10 phút</strong>.<br>
                                ⚠️ Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #E8E8ED;">
                            <p style="margin:0;font-size:11px;color:#A1A1A6;">© ${new Date().getFullYear()} TechVision</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return sendEmail({ to, subject, html });
};

/**
 * Gửi email xác nhận đơn hàng
 */
const sendOrderConfirmationEmail = async ({ to, name, orderNumber, total }) => {
    const subject = `Xác nhận đơn hàng #${orderNumber} - TechVision`;
    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
                    <tr>
                        <td style="background:#0066FF;padding:28px 32px;text-align:center;">
                            <div style="color:#ffffff;font-size:24px;font-weight:700;">📱 TechVision</div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:36px 32px;">
                            <h1 style="margin:0 0 8px;font-size:22px;color:#1D1D1F;">✅ Đơn hàng đã được xác nhận</h1>
                            <p style="margin:0 0 24px;font-size:15px;color:#6E6E73;">
                                Xin chào ${name}, cảm ơn bạn đã đặt hàng.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-radius:12px;padding:20px;margin-bottom:24px;">
                                <tr>
                                    <td style="padding:8px 0;font-size:14px;color:#6E6E73;">Mã đơn hàng</td>
                                    <td align="right" style="padding:8px 0;font-size:14px;color:#1D1D1F;font-weight:600;">#${orderNumber}</td>
                                </tr>
                                <tr>
                                    <td style="padding:8px 0;font-size:14px;color:#6E6E73;">Tổng tiền</td>
                                    <td align="right" style="padding:8px 0;font-size:16px;color:#0066FF;font-weight:700;">${total}</td>
                                </tr>
                            </table>
                            <p style="margin:0;font-size:14px;color:#6E6E73;line-height:1.6;">
                                Chúng tôi sẽ liên hệ với bạn sớm để xác nhận giao hàng.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #E8E8ED;">
                            <p style="margin:0;font-size:11px;color:#A1A1A6;">© ${new Date().getFullYear()} TechVision</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return sendEmail({ to, subject, html });
};

module.exports = {
    sendEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendOrderConfirmationEmail
};