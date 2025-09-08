import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type Body = {
    name?: string;
    email?: string;
    subject: string;
    message: string;
};

export async function POST(req: Request) {
    try {
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
            html: `<p><strong>Name:</strong> ${body.name || "-"}</p>
             <p><strong>Email:</strong> ${body.email || "-"}</p>
             <hr />
             <p>${body.message.replace(/\n/g, "<br />")}</p>`,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("Error sending bug report", err);
        return NextResponse.json({ error: "internal" }, { status: 500 });
    }
}
