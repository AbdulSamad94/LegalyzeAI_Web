import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

type Body = {
    name?: string;
    email?: string;
    subject: string;
    message: string;
};

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

const REPORT_RATE_LIMIT_MAX = 5;
const REPORT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

export async function POST(req: Request) {
    try {
        const clientIp = getClientIp(req);
        const { allowed, retryAfterSeconds } = checkRateLimit(
            `report:${clientIp}`,
            REPORT_RATE_LIMIT_MAX,
            REPORT_RATE_LIMIT_WINDOW_MS
        );
        if (!allowed) {
            return NextResponse.json(
                { error: "Too many reports submitted. Please try again later." },
                { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
            );
        }

        const body = (await req.json()) as Body;

        if (!body || !body.subject || !body.message) {
            return NextResponse.json({ error: "subject and message required" }, { status: 400 });
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
            subject: `[Bug Report] ${body.subject}`,
            replyTo: body.email || undefined,
            text: `Name: ${body.name || "-"}\nEmail: ${body.email || "-"}\n\nMessage:\n${body.message}`,
            html: `<p><strong>Name:</strong> ${escapeHtml(body.name || "-")}</p>
             <p><strong>Email:</strong> ${escapeHtml(body.email || "-")}</p>
             <hr />
             <p>${escapeHtml(body.message).replace(/\n/g, "<br />")}</p>`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Error sending bug report", err);
        return NextResponse.json({ error: "internal" }, { status: 500 });
    }
}
