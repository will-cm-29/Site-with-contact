import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function isEmail(s) {
    return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {
        const { name, email, type, message, botField } = req.body || {};

        // Honeypot spam trap
        if (botField) return res.status(200).json({ ok: true });

        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing fields" });
        }
        if (!isEmail(email)) {
            return res.status(400).json({ error: "Invalid email" });
        }

        const to = process.env.CONTACT_TO_EMAIL;
        const from = process.env.CONTACT_FROM_EMAIL;

        const subject = `New enquiry: ${name}`;
        const html = `
      <p><strong>Name:</strong> ${String(name)}</p>
      <p><strong>Email:</strong> ${String(email)}</p>
      <p><strong>Type:</strong> ${String(type || "")}</p>
      <p><strong>Message:</strong><br>${String(message).replaceAll("\n", "<br>")}</p>
    `;

        const { error } = await resend.emails.send({
            from,
            to,
            subject,
            html,
            reply_to: email
        });

        if (error) {
            return res.status(500).json({ error: "Email send failed" });
        }

        return res.status(200).json({ ok: true });
    } catch {
        return res.status(500).json({ error: "Server error" });
    }
}