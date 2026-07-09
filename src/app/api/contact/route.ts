import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { escapeHtml } from "@/lib/utils/html";

type Body = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_RATE_LIMIT_MAX = 5;
const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const { allowed, retryAfterSeconds } = checkRateLimit(
            `contact:${clientIp}`,
            CONTACT_RATE_LIMIT_MAX,
            CONTACT_RATE_LIMIT_WINDOW_MS
        );
        if (!allowed) {
            return NextResponse.json(
                { error: "Too many messages submitted. Please try again later." },
                { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
            );
        }

        const body = (await req.json()) as Body;

        if (!body || !body.name?.trim() || !body.email?.trim() || !body.subject?.trim() || !body.message?.trim()) {
            return NextResponse.json({ error: "name, email, subject, and message are required" }, { status: 400 });
        }

        if (!EMAIL_REGEX.test(body.email)) {
            return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
        }

        const SMTP_HOST = process.env.SMTP_HOST;
        const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
        const SMTP_USER = process.env.SMTP_USER;
        const SMTP_PASS = process.env.SMTP_PASS;
        const TO_EMAIL = process.env.TO_EMAIL;

        if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !TO_EMAIL) {
            return NextResponse.json({ error: "SMTP configuration missing on server" }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465,
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const mailOptions = {
            from: process.env.SMTP_FROM || SMTP_USER,
            to: TO_EMAIL,
            replyTo: body.email,
            subject: `[Contact Form] ${body.subject}`,
            text: `Name: ${body.name}\nEmail: ${body.email}\n\nMessage:\n${body.message}`,
            html: `<p><strong>Name:</strong> ${escapeHtml(body.name)}</p>
             <p><strong>Email:</strong> ${escapeHtml(body.email)}</p>
             <hr />
             <p>${escapeHtml(body.message).replace(/\n/g, "<br />")}</p>`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Error sending contact message", err);
        return NextResponse.json({ error: "internal" }, { status: 500 });
    }
}
