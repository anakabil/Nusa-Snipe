// =============================================================================
//  /api/send-email  —  Pengiriman email lewat SMTP (Nodemailer)
//
//  Default-nya pakai Gmail SMTP (smtp.gmail.com:465) dengan App Password,
//  tapi bisa diganti ke provider lain (Brevo, Mailketing, dll) lewat env var
//  SMTP_HOST / SMTP_PORT. Kredensial HANYA di server (env var), tidak pernah
//  sampai ke browser.
//
//  GET  -> { configured: boolean, from }   (cek status, tidak bocorkan rahasia)
//  POST -> { ok, messageId } | { error }    (kirim email)
//
//  Dilindungi APP_API_TOKEN (browser mengirim Bearer NEXT_PUBLIC_API_TOKEN).
// =============================================================================
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const APP_TOKEN = process.env.APP_API_TOKEN;

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || "Nusa Safety";

function isConfigured() {
  return Boolean(SMTP_USER && SMTP_PASS);
}

function authorized(req) {
  const auth = req.headers.get("authorization") || "";
  return APP_TOKEN && auth === "Bearer " + APP_TOKEN;
}

function makeTransport() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true untuk 465, false untuk 587 (STARTTLS)
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function GET(req) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    configured: isConfigured(),
    from: isConfigured() ? `${SMTP_FROM_NAME} <${SMTP_FROM}>` : null,
    host: SMTP_HOST,
  });
}

export async function POST(req) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Email belum dikonfigurasi. Set SMTP_USER & SMTP_PASS di environment variable." },
      { status: 500 }
    );
  }

  try {
    const { to, cc, bcc, subject, html, text, attachments, replyTo } = await req.json();

    if (!to || (Array.isArray(to) && to.length === 0)) {
      return NextResponse.json({ error: "Penerima (to) wajib diisi" }, { status: 400 });
    }
    if (!subject && !html && !text) {
      return NextResponse.json({ error: "Subject/isi email kosong" }, { status: 400 });
    }

    // attachments: [{ filename, dataUrl }] -> Nodemailer menerima data URI via `path`
    const mailAttachments = Array.isArray(attachments)
      ? attachments
          .filter((a) => a && a.dataUrl)
          .map((a) => ({ filename: a.filename || "lampiran", path: a.dataUrl }))
      : [];

    const transporter = makeTransport();

    const info = await transporter.sendMail({
      from: `${SMTP_FROM_NAME} <${SMTP_FROM}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      cc: cc || undefined,
      bcc: bcc || undefined,
      replyTo: replyTo || undefined,
      subject: subject || "(tanpa subjek)",
      text: text || undefined,
      html: html || undefined,
      attachments: mailAttachments,
    });

    return NextResponse.json({ ok: true, messageId: info.messageId, accepted: info.accepted || [] });
  } catch (e) {
    return NextResponse.json({ error: String((e && e.message) || e) }, { status: 500 });
  }
}
