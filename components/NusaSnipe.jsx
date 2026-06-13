"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Crosshair, Search, Bell, Plus, Mail, Phone, Building2,
  Users, Briefcase, Sparkles, Send, X, Edit3, Trash2,
  ChevronRight, ChevronLeft, Filter, MoreHorizontal, Globe, MapPin,
  Calendar, Tag, MessageSquare, FileText, AlertCircle,
  TrendingUp, Target, Activity, Layers, Settings,
  ArrowRight, Loader2, CheckCircle2, Circle, Save,
  LayoutDashboard, Workflow, Bot, Copy, ExternalLink,
  Flame, Radio, Factory, ChevronDown, Star, Clock,
  LogOut, ShieldCheck, UserPlus, KeyRound, Eye, EyeOff,
  UserCheck, AtSign, UserCog, Lock,
  Inbox, MailOpen, MailCheck, PauseCircle, PlayCircle,
  ListOrdered, ChevronUp, Pause, Play, FilePlus, UserMinus,
  Variable, Megaphone, Archive, MessageCircle, Smartphone,
  CalendarCheck, CalendarPlus, CalendarX, CalendarClock,
  Radar, Zap, Sigma, Reply, ArrowUpRight, Link2,
  Linkedin, FileSearch, Newspaper, BarChart3,
  Calculator, Receipt, Percent, Hash, ClipboardList,
  Coins, ListChecks, Wand2, FileCheck, PenLine,
  Link as LinkIcon, TrendingDown, Award, FileSpreadsheet,
  Wallet, BellRing, Banknote, CircleDollarSign, HandCoins
} from "lucide-react";
import * as XLSX from "xlsx";

/* ============================================================================
   NUSA SNIPE — AI MARKETING & SALES INTELLIGENCE  (v0.1 base)
   PT. Nusa Rendra Jayatama (Nusa Safety) — QHSE & Fire Protection Consultancy

   Phase 1 base scope (this file): CRM + AI Copilot
   Auth layer added separately in v0.2 (see follow-up edits)

   Production target: Next.js 14 + Vercel + Upstash Redis
   ============================================================================ */

const T = {
  canvas: "#F4F2EB", surface: "#FFFFFF", surfaceAlt: "#FAF8F2",
  ink: "#0F1419", inkSoft: "#5C6470", inkFaint: "#8B8F96",
  rule: "#E5E2D6", ruleSoft: "#EFEDE4",
  navy: "#1F3864", navyDark: "#0D1F3C", navySoft: "#E7ECF4",
  red: "#C00000", redSoft: "#FCEBEB",
  amber: "#B5681F", amberSoft: "#FAEEDA",
  sage: "#4A7C59", sageSoft: "#E8F0EA",
};

const FONT_MONO = '"JetBrains Mono", "SF Mono", "Menlo", "Consolas", monospace';

/* ============== BRAND LOGO ============== */
function NusaSnipeLogo({ size = 24, color = "currentColor" }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Nusa Snipe">
      {/* Hexagon shield - pointy top */}
      <path
        d="M60 10 L102 35 L102 85 L60 110 L18 85 L18 35 Z"
        stroke={color}
        strokeWidth="6"
        strokeLinejoin="miter"
      />
      {/* Bullseye target - 3 concentric circles */}
      <circle cx="50" cy="70" r="25" stroke={color} strokeWidth="5" />
      <circle cx="50" cy="70" r="14" stroke={color} strokeWidth="3.5" />
      <circle cx="50" cy="70" r="4.5" fill={color} />
      {/* Arrow shaft - diagonal to bullseye */}
      <line x1="50" y1="70" x2="89" y2="20" stroke={color} strokeWidth="5" strokeLinecap="square" />
      {/* Arrow fletching - stylized vane */}
      <path d="M89 20 L104 9 L99 17 L107 20 L99 23 L104 31 Z" fill={color} />
    </svg>
  );
}

/* ============== COMPANY CONFIG (Nusa Safety defaults) ============== */
const COMPANY_CONFIG = {
  legalName: "PT. Nusa Rendra Jayatama",
  brandName: "Nusa Safety",
  tagline: "QHSE & Fire Protection Consultancy",
  email: "admin@nusasafety.co.id",
  phone: "+62 283 000 0000",
  website: "www.nusasafety.co.id",
  websiteUrl: "https://www.nusasafety.co.id",
  hq: "Slawi, Tegal",
  branches: ["Bekasi"],
  certifications: ["ISO 45001:2018", "SMK3 PP 50/2012"],
  emailDomain: "nusasafety.co.id",
  nib: "0000000000000",
  npwp: "XX.XXX.XXX.X-XXX.XXX",
  director: "Nama Direktur Utama",
  establishedYear: "2018",
  businessField: "Jasa Konsultansi K3, Lingkungan & Fire Protection (KBLI 71209 · 74909)",
  bankName: "Bank Mandiri",
  bankBranch: "KCP Slawi",
  bankAccount: "1234567890",
  bankHolder: "PT. Nusa Rendra Jayatama",
  financeEmail: "finance@nusasafety.co.id",
  addressFull: "Jl. Raya Slawi No. XX, Slawi, Kabupaten Tegal, Jawa Tengah 52419",
};

/* ============== STORAGE LAYER ============== */
const memStore = {};
const storage = {
  async get(key) {
    try {
      if (typeof window !== "undefined" && window.storage && typeof window.storage.get === "function") {
        const result = await window.storage.get(key);
        return result ? result.value : null;
      }
    } catch (e) { /* fall through */ }
    return memStore[key] || null;
  },
  async set(key, value) {
    try {
      if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
        const result = await window.storage.set(key, value);
        if (result) return true;
      }
    } catch (e) { /* fall through */ }
    memStore[key] = value;
    return true;
  },
  async clear(key) {
    try {
      if (typeof window !== "undefined" && window.storage && typeof window.storage.set === "function") {
        await window.storage.set(key, "");
      }
    } catch (e) { /* fall through */ }
    delete memStore[key];
    return true;
  },
};

const STORAGE_KEYS = {
  clients: "snipe:clients",
  contacts: "snipe:contacts",
  deals: "snipe:deals",
  activities: "snipe:activities",
  ai: "snipe:ai-threads",
  users: "snipe:users",
  session: "snipe:session",
  templates: "snipe:templates",
  campaigns: "snipe:campaigns",
  meetingTypes: "snipe:meeting-types",
  bookings: "snipe:bookings",
  signals: "snipe:signals",
  replies: "snipe:replies",
  proposals: "snipe:proposals",
  company: "snipe:company",
};

/* ============== AUTH UTILITIES ============== */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SEED_USERS_RAW = [
  { id: "u_admin", name: "Daddy", email: "admin@nusasafety.co.id", password: "admin123", role: "admin", position: "Founder & Direktur", phone: "+62 811-0000-0001", photo: "" },
  { id: "u_sales1", name: "Ahmad Sutanto", email: "ahmad@nusasafety.co.id", password: "sales123", role: "sales", position: "Marketing & Sales Executive", phone: "+62 811-0000-0002", photo: "" },
  { id: "u_sales2", name: "Bunga Permata", email: "bunga@nusasafety.co.id", password: "sales123", role: "sales", position: "Business Development", phone: "+62 811-0000-0003", photo: "" },
];

async function buildSeedUsers() {
  const results = [];
  for (const u of SEED_USERS_RAW) {
    const hash = await hashPassword(u.password);
    results.push({
      id: u.id, name: u.name, email: u.email, role: u.role,
      position: u.position || "", phone: u.phone || "", photo: u.photo || "",
      passwordHash: hash, active: true, createdAt: "2026-01-01T00:00:00Z",
    });
  }
  return results;
}

/* ============== SEED DATA ============== */
const SEED_CLIENTS = [
  { id: "cl_001", ownerId: "u_admin", name: "PT Pertamina Geothermal Energy", industry: "Energi - Geothermal", country: "Indonesia", city: "Jakarta", website: "pge.pertamina.com", employees: "1000-5000", tags: ["BUMN", "Energi", "ISO 45001", "SMK3"], health: "hot", source: "LPSE", notes: "Tender konsultan HSE untuk PLTP Kamojang ekspansi, nilai estimasi Rp 850jt. Deadline submit 18 Juni 2026.", createdAt: "2026-06-08T09:00:00Z" },
  { id: "cl_002", ownerId: "u_sales1", name: "PT Krakatau Steel (Persero) Tbk", industry: "Manufaktur - Baja", country: "Indonesia", city: "Cilegon", website: "krakatausteel.com", employees: "5000+", tags: ["BUMN", "Manufaktur", "Fire Protection"], health: "warm", source: "Sales Navigator", notes: "Kontak via Sales Navigator. SHE Manager baru, butuh refresh sistem fire protection di mill HSM.", createdAt: "2026-06-05T10:00:00Z" },
  { id: "cl_003", ownerId: "u_admin", name: "PT Vale Indonesia Tbk", industry: "Pertambangan - Nikel", country: "Indonesia", city: "Sorowako", website: "vale.com/indonesia", employees: "1000-5000", tags: ["Mining", "QHSE", "ISO 45001"], health: "hot", source: "LinkedIn signal", notes: "Hiring SHE Manager — sinyal kuat butuh transformasi sistem manajemen K3. Decision maker: VP HSE.", createdAt: "2026-06-10T14:00:00Z" },
  { id: "cl_004", ownerId: "u_admin", name: "PT Adaro Energy Indonesia Tbk", industry: "Pertambangan - Batubara", country: "Indonesia", city: "Jakarta", website: "adaro.com", employees: "5000+", tags: ["Mining", "QHSE", "Renewal"], health: "warm", source: "Existing client", notes: "Klien lama. Kontrak audit SMK3 tahunan, perpanjangan jatuh tempo Oktober 2026.", createdAt: "2026-04-15T08:00:00Z" },
  { id: "cl_005", ownerId: "u_sales2", name: "PT WIKA Industri Manufaktur", industry: "Konstruksi - Beton", country: "Indonesia", city: "Bogor", website: "wikaindustri.com", employees: "500-1000", tags: ["BUMN", "Konstruksi", "SMK3"], health: "cold", source: "INAPROC", notes: "RFQ audit SMK3 di portal INAPROC. Belum ada kontak person, perlu intel.", createdAt: "2026-06-09T11:00:00Z" },
  { id: "cl_006", ownerId: "u_admin", name: "Saudi Aramco", industry: "Oil & Gas", country: "Saudi Arabia", city: "Dhahran", website: "aramco.com", employees: "5000+", tags: ["Oil & Gas", "International", "Prequalification"], health: "warm", source: "Vendor portal", notes: "Aramco Vendor Portal membuka prequalification untuk QHSE consultants. Butuh dokumen ISO 45001 + ISO 14001 + audit financial 3 tahun.", createdAt: "2026-06-07T07:00:00Z" },
];

const SEED_CONTACTS = [
  { id: "ct_001", clientId: "cl_001", name: "Ir. Budi Santoso, M.T.", role: "VP HSE", email: "b.santoso@pge.pertamina.com", phone: "+62 811-1234-5001", isDecisionMaker: true, notes: "Kenal lewat seminar K3 Geothermal 2025. Responsif via WA." },
  { id: "ct_002", clientId: "cl_001", name: "Sari Wijayanti, S.T.", role: "Procurement Lead", email: "s.wijayanti@pge.pertamina.com", phone: "+62 812-1234-5002", isDecisionMaker: false, notes: "Gatekeeper untuk semua tender vendor." },
  { id: "ct_003", clientId: "cl_002", name: "Ahmad Hidayat, M.M.", role: "SHE Manager", email: "a.hidayat@krakatausteel.com", phone: "+62 813-1234-5003", isDecisionMaker: true, notes: "Baru menjabat 3 bulan, sedang assess vendor partner." },
  { id: "ct_004", clientId: "cl_003", name: "David Tjandra", role: "GM Operations", email: "d.tjandra@vale.com", phone: "+62 814-1234-5004", isDecisionMaker: true, notes: "Approver utama untuk konsultan eksternal." },
  { id: "ct_005", clientId: "cl_004", name: "Ibu Maria Lestari", role: "Procurement Director", email: "m.lestari@adaro.com", phone: "+62 815-1234-5005", isDecisionMaker: true, notes: "Sudah tanda tangan 3 kontrak dengan Nusa Safety sebelumnya." },
];

const PIPELINE_STAGES = [
  { id: "new", label: "Baru", color: T.inkSoft },
  { id: "qualified", label: "Qualified", color: T.navy },
  { id: "proposal", label: "Proposal", color: T.amber },
  { id: "won", label: "Closed Won", color: T.sage },
];

const SEED_DEALS = [
  { id: "dl_001", clientId: "cl_001", ownerId: "u_admin", title: "Konsultan HSE PLTP Kamojang", value: 850000000, stage: "proposal", probability: 60, closeDate: "2026-08-15", services: ["ISO 45001", "HAZID"] },
  { id: "dl_002", clientId: "cl_002", ownerId: "u_sales1", title: "Fire Protection System Audit - HSM", value: 420000000, stage: "qualified", probability: 40, closeDate: "2026-09-30", services: ["Fire Protection"] },
  { id: "dl_003", clientId: "cl_003", ownerId: "u_admin", title: "SMK3 Implementation - Sorowako", value: 1200000000, stage: "qualified", probability: 35, closeDate: "2026-10-20", services: ["SMK3", "ISO 45001"] },
  { id: "dl_004", clientId: "cl_004", ownerId: "u_admin", title: "Annual SMK3 Audit Renewal", value: 380000000, stage: "won", probability: 100, closeDate: "2026-05-30", services: ["SMK3 Audit"] },
  { id: "dl_005", clientId: "cl_005", ownerId: "u_sales2", title: "SMK3 Compliance Assessment", value: 280000000, stage: "new", probability: 20, closeDate: "2026-12-01", services: ["SMK3"] },
  { id: "dl_006", clientId: "cl_006", ownerId: "u_admin", title: "QHSE Vendor Prequalification", value: 650000000, stage: "new", probability: 25, closeDate: "2026-11-15", services: ["QHSE Consulting"] },
];

const SEED_ACTIVITIES = [
  { id: "act_001", clientId: "cl_001", type: "email", title: "Kirim proposal awal", at: "2026-06-10T09:30:00Z", body: "Proposal teknis & komersial v1 dikirim ke b.santoso@pge.pertamina.com" },
  { id: "act_002", clientId: "cl_001", type: "meeting", title: "Kick-off meeting", at: "2026-06-08T14:00:00Z", body: "Meeting virtual dengan VP HSE & tim procurement. Konfirmasi scope ekspansi unit 4." },
  { id: "act_003", clientId: "cl_003", type: "note", title: "Sinyal intent terdeteksi", at: "2026-06-10T08:00:00Z", body: "AI Prospect Hunter mendeteksi posting LinkedIn untuk SHE Manager. Prioritas tinggi." },
  { id: "act_004", clientId: "cl_004", type: "email", title: "Reminder perpanjangan kontrak", at: "2026-06-05T10:15:00Z", body: "Follow-up perpanjangan kontrak audit SMK3 tahunan." },
];

const SEED_TEMPLATES = [
  {
    id: "tpl_001",
    name: "Cold Outreach — QHSE Intro Indonesia",
    category: "cold_outreach",
    subject: "Pertanyaan singkat tentang program QHSE di {{company}}",
    body: "Halo {{contact_name}},\n\nSaya {{sender_name}} dari Nusa Safety — konsultan QHSE & fire protection bersertifikat ISO 45001 dan SMK3 yang berbasis di Slawi & Bekasi.\n\nKami melihat {{company}} ({{industry}}) sebagai salah satu perusahaan yang sangat aktif dalam pengembangan sistem manajemen K3. Apakah saat ini ada inisiatif refresh atau audit SMK3 yang sedang dipertimbangkan?\n\nKami sudah dipercaya oleh klien seperti PT Pertamina Geothermal Energy dan PT Adaro Energy. Saya bisa kirim 2-3 case study singkat dalam 48 jam jika {{contact_name}} berminat.\n\nTerima kasih atas waktunya.\n\nSalam,\n{{sender_name}}\nNusa Safety",
    ownerId: "u_admin",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "tpl_002",
    name: "Follow-up — LinkedIn Signal Hiring",
    category: "follow_up",
    subject: "Selamat atas posisi SHE Manager baru di {{company}}",
    body: "Halo {{contact_name}},\n\nSaya melihat {{company}} sedang membangun tim SHE/HSE yang lebih kuat — congrats untuk inisiatif ini!\n\nTransisi tim SHE baru biasanya momentum yang tepat untuk audit sistem yang ada + identifikasi gap terhadap ISO 45001 / SMK3. Kami di Nusa Safety sudah membantu beberapa klien mining (Vale, Adaro) melalui proses transformasi serupa.\n\nApakah {{contact_name}} terbuka untuk diskusi singkat 30 menit minggu depan? Tidak ada sales pitch — saya hanya ingin sharing 3 framework yang biasanya sangat berguna di fase ini.\n\nSalam,\n{{sender_name}}",
    ownerId: "u_admin",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "tpl_003",
    name: "Proposal Sent — Polite Reminder",
    category: "reminder",
    subject: "Re: Proposal {{deal_title}} — apakah ada pertanyaan?",
    body: "Halo {{contact_name}},\n\nSemoga sehat selalu. Saya mau pastikan proposal yang kami kirim minggu lalu untuk {{deal_title}} sudah sampai dan apakah ada pertanyaan yang perlu kami klarifikasi.\n\nKalau {{contact_name}} butuh revisi scope, breakdown harga lebih detail, atau referensi proyek serupa, saya siap respons dalam 24 jam.\n\nMohon update kapan kira-kira tim {{company}} akan finalisasi keputusan. Kami siap untuk presentasi langsung jika diperlukan.\n\nTerima kasih,\n{{sender_name}}",
    ownerId: "u_admin",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "tpl_004",
    name: "Aramco/International — Prequalification Follow-up (EN)",
    category: "international",
    subject: "Nusa Safety — QHSE Vendor Prequalification Documents Submitted",
    body: "Dear {{contact_name}},\n\nFollowing the vendor prequalification process opened on the {{company}} Vendor Portal, we have submitted the complete documentation package on behalf of PT. Nusa Rendra Jayatama (Nusa Safety).\n\nDocuments included:\n- ISO 45001:2018 certification\n- ISO 14001:2015 certification\n- SMK3 PP 50/2012 certification\n- Audited financial statements (2023, 2024, 2025)\n- HSE policy & track record portfolio\n- Key personnel CVs (NEBOSH, OSHA 30, lead auditor credentials)\n\nWe would appreciate confirmation of receipt and an indication of next steps in the evaluation timeline.\n\nBest regards,\n{{sender_name}}\nNusa Safety — Indonesia",
    ownerId: "u_admin",
    createdAt: "2026-06-01T00:00:00Z",
  },
  {
    id: "tpl_005",
    name: "BUMN Energy — Geothermal/Oil Intro",
    category: "cold_outreach",
    subject: "Konsultan HSE untuk fase ekspansi {{company}}",
    body: "Yth. Bapak/Ibu {{contact_name}},\n\nSaya {{sender_name}} dari PT. Nusa Rendra Jayatama (Nusa Safety). Kami adalah konsultan QHSE & fire protection yang fokus pada sektor energi BUMN, dengan track record di PT Pertamina Geothermal Energy.\n\nKami melihat {{company}} sedang dalam fase pengembangan kapasitas yang signifikan. Pada fase ini, biasanya muncul kebutuhan untuk:\n- Risk assessment komprehensif (HAZID, HAZOP, Bowtie)\n- Penyesuaian sistem manajemen K3 untuk standar internasional\n- Audit fire protection sesuai NFPA standards\n\nApakah Bapak/Ibu {{contact_name}} terbuka untuk diskusi singkat tentang pengalaman kami di proyek serupa? Saya bisa atur meeting virtual 30 menit dengan tim teknis kami.\n\nMatur nuwun,\n{{sender_name}}\nNusa Safety",
    ownerId: "u_admin",
    createdAt: "2026-06-01T00:00:00Z",
  },
];

const SEED_CAMPAIGNS = [
  {
    id: "cmp_001",
    name: "Pertambangan Hot Outreach Q3 2026",
    description: "Sequence multi-touch untuk decision maker di sektor mining dengan sinyal intent tinggi (Vale, Adaro).",
    status: "active",
    ownerId: "u_admin",
    createdAt: "2026-06-05T08:00:00Z",
    steps: [
      { id: "stp_a1", order: 1, type: "email", templateId: "tpl_002", subject: "Selamat atas posisi SHE Manager baru di {{company}}", body: "" },
      { id: "stp_a2", order: 2, type: "wait", days: 4 },
      { id: "stp_a3", order: 3, type: "email", templateId: null, subject: "Re: posisi SHE Manager baru — 3 framework yang relevan", body: "Halo {{contact_name}},\n\nMenindaklanjuti email saya minggu lalu, ini 3 framework yang biasanya sangat berguna saat onboarding tim SHE baru:\n\n1. Gap analysis ISO 45001 — biasanya selesai dalam 2-3 minggu\n2. SMK3 compliance audit — wajib untuk perpanjangan sertifikat\n3. Bowtie risk assessment — untuk skenario major hazard\n\nMau saya kirim sample report dari klien sejenis?\n\nSalam,\n{{sender_name}}" },
      { id: "stp_a4", order: 4, type: "wait", days: 5 },
      { id: "stp_a5", order: 5, type: "email", templateId: null, subject: "Closing — last touch", body: "Halo {{contact_name}},\n\nIni email terakhir dari saya untuk sequence ini — saya hormati waktu Anda. Kalau timing-nya belum tepat sekarang, tidak apa-apa.\n\nSaya akan tetap di sini jika {{company}} butuh konsultan QHSE di masa depan.\n\nSalam hangat,\n{{sender_name}}" },
    ],
    enrollments: [
      { id: "enr_001", clientId: "cl_003", contactId: "ct_004", startedAt: "2026-06-10T09:00:00Z", currentStepIdx: 1, status: "active", lastActionAt: "2026-06-10T09:00:00Z" },
    ],
  },
  {
    id: "cmp_002",
    name: "BUMN Energy Renewal Q3-Q4",
    description: "Reaktivasi klien BUMN energi yang belum dikontak 6+ bulan. Fokus geothermal & oil/gas. Multi-channel: email + WhatsApp follow-up.",
    status: "active",
    ownerId: "u_admin",
    createdAt: "2026-06-01T08:00:00Z",
    steps: [
      { id: "stp_b1", order: 1, type: "email", templateId: "tpl_005", subject: "", body: "" },
      { id: "stp_b2", order: 2, type: "wait", days: 7 },
      { id: "stp_b3", order: 3, type: "email", templateId: "tpl_003", subject: "", body: "" },
      { id: "stp_b4", order: 4, type: "wait", days: 3 },
      { id: "stp_b5", order: 5, type: "whatsapp", body: "Halo {{contact_name}}, ini {{sender_name}} dari Nusa Safety.\n\nSaya barusan kirim email tentang proposal {{company}}. Apakah sudah sempat dilihat?\n\nKalau butuh diskusi singkat, saya available besok pagi atau lusa. WA aja kapan enaknya 🙏\n\nTerima kasih!" },
    ],
    enrollments: [
      { id: "enr_002", clientId: "cl_001", contactId: "ct_001", startedAt: "2026-06-05T10:00:00Z", currentStepIdx: 2, status: "active", lastActionAt: "2026-06-12T10:00:00Z" },
      { id: "enr_003", clientId: "cl_004", contactId: "ct_005", startedAt: "2026-05-28T10:00:00Z", currentStepIdx: 3, status: "completed", lastActionAt: "2026-06-08T10:00:00Z" },
    ],
  },
  {
    id: "cmp_003",
    name: "International — Aramco Prequal Track",
    description: "Sequence formal English untuk klien internasional yang sedang dalam proses prequalification.",
    status: "paused",
    ownerId: "u_admin",
    createdAt: "2026-06-07T08:00:00Z",
    steps: [
      { id: "stp_c1", order: 1, type: "email", templateId: "tpl_004", subject: "", body: "" },
      { id: "stp_c2", order: 2, type: "wait", days: 10 },
      { id: "stp_c3", order: 3, type: "email", templateId: null, subject: "Follow-up: vendor prequalification status", body: "Dear {{contact_name}},\n\nFollowing up on our prequalification submission. Could you provide an update on the evaluation timeline?\n\nWe remain available for any technical clarifications.\n\nBest regards,\n{{sender_name}}" },
    ],
    enrollments: [
      { id: "enr_004", clientId: "cl_006", contactId: null, startedAt: "2026-06-08T08:00:00Z", currentStepIdx: 1, status: "paused", lastActionAt: "2026-06-08T08:00:00Z" },
    ],
  },
];

const SEED_MEETING_TYPES = [
  { id: "mt_001", name: "Discovery Call — 15 menit", duration: 15, description: "Perkenalan singkat, pahami kebutuhan QHSE klien, jadwalkan deep dive jika cocok.", color: T.navy, ownerId: "u_admin", active: true },
  { id: "mt_002", name: "Technical Deep Dive — 60 menit", duration: 60, description: "Diskusi teknis lengkap: scope audit, standar (ISO 45001/SMK3/NFPA), proposal teknis, timeline.", color: T.amber, ownerId: "u_admin", active: true },
  { id: "mt_003", name: "Proposal Walk-through — 45 menit", duration: 45, description: "Review proposal komersial bersama stakeholder klien, Q&A, dan next steps.", color: T.sage, ownerId: "u_admin", active: true },
  { id: "mt_004", name: "Quick Sync — 30 menit", duration: 30, description: "Follow-up update, status proyek berjalan, atau klarifikasi singkat.", color: T.red, ownerId: "u_sales1", active: true },
];

const SEED_BOOKINGS = [
  { id: "bk_001", clientId: "cl_001", contactId: "ct_001", meetingTypeId: "mt_002", scheduledAt: "2026-06-16T10:00:00Z", duration: 60, status: "confirmed", notes: "Diskusi scope PLTP Kamojang ekspansi unit 4.", attendeeName: "Ir. Budi Santoso, M.T.", attendeeEmail: "b.santoso@pge.pertamina.com", attendeePhone: "+62 811-1234-5001", ownerId: "u_admin", createdAt: "2026-06-12T08:00:00Z" },
  { id: "bk_002", clientId: "cl_003", contactId: "ct_004", meetingTypeId: "mt_001", scheduledAt: "2026-06-17T14:30:00Z", duration: 15, status: "confirmed", notes: "Discovery call dengan VP HSE Vale soal hiring SHE Manager baru.", attendeeName: "David Tjandra", attendeeEmail: "d.tjandra@vale.com", attendeePhone: "+62 814-1234-5004", ownerId: "u_admin", createdAt: "2026-06-11T09:30:00Z" },
  { id: "bk_003", clientId: "cl_004", contactId: "ct_005", meetingTypeId: "mt_003", scheduledAt: "2026-06-18T09:00:00Z", duration: 45, status: "confirmed", notes: "Walk-through proposal perpanjangan audit SMK3 tahunan.", attendeeName: "Ibu Maria Lestari", attendeeEmail: "m.lestari@adaro.com", attendeePhone: "+62 815-1234-5005", ownerId: "u_admin", createdAt: "2026-06-10T11:00:00Z" },
  { id: "bk_004", clientId: "cl_002", contactId: "ct_003", meetingTypeId: "mt_004", scheduledAt: "2026-06-09T15:00:00Z", duration: 30, status: "completed", notes: "Sync dengan SHE Manager baru Krakatau Steel. Outcome: minta proposal teknis dalam 2 minggu.", attendeeName: "Ahmad Hidayat, M.M.", attendeeEmail: "a.hidayat@krakatausteel.com", attendeePhone: "+62 813-1234-5003", ownerId: "u_sales1", createdAt: "2026-06-05T10:00:00Z" },
  { id: "bk_005", clientId: null, contactId: null, meetingTypeId: "mt_001", scheduledAt: "2026-06-20T11:00:00Z", duration: 15, status: "confirmed", notes: "Inbound booking dari website — calon klien baru di sektor petrokimia.", attendeeName: "Rini Hartanto", attendeeEmail: "rini.hartanto@chandra-asri.com", attendeePhone: "+62 819-1234-5067", ownerId: "u_admin", createdAt: "2026-06-13T07:30:00Z" },
];

const SEED_SIGNALS = [
  { id: "sig_001", source: "linkedin", title: "Vale Indonesia hiring SHE Manager — Sorowako", description: "PT Vale Indonesia memposting lowongan SHE Manager dengan tanggung jawab utama: refresh sistem manajemen K3 dan compliance audit. Sinyal kuat butuh konsultan transformasi.", companyName: "PT Vale Indonesia Tbk", industry: "Pertambangan - Nikel", location: "Sorowako, Sulawesi", signalDate: "2026-06-10T08:00:00Z", aiScore: 92, status: "new", relatedClientId: "cl_003", sourceUrl: "linkedin.com/jobs/vale-she-manager", aiReasoning: "Skor 92: Vale sudah klien hot. Hiring SHE Manager = budget refresh sistem K3. Decision maker (VP HSE) sudah dikenal. Window 30-60 hari setelah onboarding manager baru." },
  { id: "sig_002", source: "lpse", title: "Tender Konsultan HSE — PLTP Kamojang Ekspansi", description: "LPSE Pertamina Geothermal membuka tender konsultan HSE untuk ekspansi PLTP Kamojang unit 4. Nilai pagu Rp 1.2 M, deadline submit 18 Juni 2026.", companyName: "PT Pertamina Geothermal Energy", industry: "Energi - Geothermal", location: "Kamojang, Jawa Barat", signalDate: "2026-06-08T10:30:00Z", aiScore: 95, status: "converted", relatedClientId: "cl_001", sourceUrl: "lpse.pertamina.com/tender-12345", aiReasoning: "Skor 95: Klien existing dengan track record. Pagu sesuai sweet spot Nusa Safety. Sudah ada tim teknis yang kenal site Kamojang." },
  { id: "sig_003", source: "linkedin", title: "Antam — VP HSE role posted", description: "PT Aneka Tambang Tbk (Antam) memposting lowongan VP HSE level senior. Posting baru, scope: pertambangan emas & nikel.", companyName: "PT Aneka Tambang Tbk", industry: "Pertambangan - Logam Mulia", location: "Jakarta", signalDate: "2026-06-11T14:00:00Z", aiScore: 78, status: "new", relatedClientId: null, sourceUrl: "linkedin.com/jobs/antam-vp-hse", aiReasoning: "Skor 78: BUMN mining besar, profil sangat cocok. Tapi belum jadi klien Nusa Safety — perlu cold outreach 2-3 minggu setelah VP baru join. Approach: bridge via koneksi BUMN existing." },
  { id: "sig_004", source: "inaproc", title: "RFQ Audit SMK3 — PT WIKA Industri Manufaktur", description: "INAPROC memuat RFQ audit SMK3 PP 50/2012 dari WIKA Industri Manufaktur. Lokasi: pabrik Bogor.", companyName: "PT WIKA Industri Manufaktur", industry: "Konstruksi - Beton", location: "Bogor, Jawa Barat", signalDate: "2026-06-09T11:00:00Z", aiScore: 68, status: "new", relatedClientId: "cl_005", sourceUrl: "inaproc.lkpp.go.id/wika-12876", aiReasoning: "Skor 68: BUMN konstruksi, scope match. Sudah jadi lead (cold). Tantangan: kompetisi vendor lokal Jabodetabek. Strategi: highlight track record BUMN sejenis." },
  { id: "sig_005", source: "news", title: "Krakatau Steel umumkan ekspansi mill baru 2026-2027", description: "Krakatau Steel umumkan rencana ekspansi mill HSM tahap 2. Sinyal: butuh refresh fire protection system & risk assessment besar-besaran.", companyName: "PT Krakatau Steel (Persero) Tbk", industry: "Manufaktur - Baja", location: "Cilegon, Banten", signalDate: "2026-06-12T07:00:00Z", aiScore: 84, status: "new", relatedClientId: "cl_002", sourceUrl: "kompas.com/krakatau-steel-expansion", aiReasoning: "Skor 84: Klien warm. Ekspansi mill = wajib HAZID + fire protection redesign. Timing perfect: 6-12 bulan sebelum konstruksi dimulai." },
  { id: "sig_006", source: "vendor_portal", title: "Aramco Vendor Portal — QHSE Prequalification Window Open", description: "Saudi Aramco Vendor Portal membuka window prequalification untuk vendor QHSE consultants Q3 2026. Window 90 hari.", companyName: "Saudi Aramco", industry: "Oil & Gas", location: "Dhahran, Saudi Arabia", signalDate: "2026-06-07T07:00:00Z", aiScore: 71, status: "new", relatedClientId: "cl_006", sourceUrl: "vendors.aramco.com/qhse-2026", aiReasoning: "Skor 71: International expansion opportunity. Persyaratan dokumen Nusa Safety sudah ready (ISO 45001 + 14001 + audit financial). Resiko: kompetisi global tinggi." },
  { id: "sig_007", source: "lpse", title: "Tender Fire Protection PJB — pembangkit batubara Paiton", description: "LPSE PJB (PLN subsidiary) membuka tender fire protection audit untuk PLTU Paiton unit 5-6. Nilai pagu Rp 480jt.", companyName: "PT Pembangkitan Jawa-Bali", industry: "Energi - Pembangkitan", location: "Probolinggo, Jawa Timur", signalDate: "2026-06-12T09:00:00Z", aiScore: 81, status: "new", relatedClientId: null, sourceUrl: "lpse.pjb.co.id/tender-fp-paiton", aiReasoning: "Skor 81: Pagu match, sektor energi BUMN sub-Pertamina/PLN. Belum ada relationship — perlu cold outreach + dokumen prequalification cepat. Deadline submission penting." },
  { id: "sig_008", source: "linkedin", title: "Petronas Indonesia hiring HSE Specialist", description: "Petronas Carigali Indonesia posting lowongan HSE Specialist senior untuk operasi offshore. Sinyal: tim HSE diperluas.", companyName: "Petronas Carigali Indonesia", industry: "Oil & Gas - Upstream", location: "Jakarta + offshore", signalDate: "2026-06-11T16:00:00Z", aiScore: 65, status: "new", relatedClientId: null, sourceUrl: "linkedin.com/jobs/petronas-hse", aiReasoning: "Skor 65: O&G internasional, profil cocok. Tantangan: Petronas biasanya pakai vendor list internal Malaysia. Approach: via konsultan lokal partner atau direct prequalification." },
  { id: "sig_009", source: "news", title: "Adaro umumkan investasi Rp 5T pengembangan smelter nikel", description: "Adaro Minerals umumkan investasi besar pengembangan smelter nikel di Kalimantan. Konstruksi mulai 2027. Sinyal kuat: butuh QHSE consultant fase pre-construction.", companyName: "PT Adaro Energy Indonesia Tbk", industry: "Pertambangan - Diversifikasi", location: "Kalimantan Selatan", signalDate: "2026-06-10T12:00:00Z", aiScore: 89, status: "new", relatedClientId: "cl_004", sourceUrl: "bisnis.com/adaro-smelter-investment", aiReasoning: "Skor 89: Klien existing dengan kontrak audit aktif. Smelter baru = scope expansion besar (HAZID + risk assessment + commissioning). Approach: leverage existing relationship untuk dapat warm intro ke tim project." },
  { id: "sig_010", source: "news", title: "Kecelakaan kerja di pabrik tekstil Bandung — laporan investigasi K3", description: "Insiden kecelakaan kerja di pabrik tekstil besar Bandung. Disnaker Jabar minta audit K3 menyeluruh dalam 30 hari.", companyName: "PT Indorama Synthetics Tbk", industry: "Manufaktur - Tekstil", location: "Purwakarta, Jawa Barat", signalDate: "2026-06-12T18:30:00Z", aiScore: 76, status: "new", relatedClientId: null, sourceUrl: "detik.com/insiden-tekstil-bandung", aiReasoning: "Skor 76: Urgensi tinggi (mandat Disnaker 30 hari). Tantangan: harus respons sangat cepat (hari ini/besok). Approach: telepon langsung ke HSE Manager via koneksi BUMN sektor manufaktur." },
];

const SEED_REPLIES = [
  { id: "rpl_001", channel: "email", from: "b.santoso@pge.pertamina.com", fromName: "Ir. Budi Santoso, M.T.", clientId: "cl_001", contactId: "ct_001", subject: "Re: Pertanyaan singkat tentang program QHSE di Pertamina Geothermal", body: "Terima kasih sudah menghubungi. Tim kami memang sedang mempersiapkan ekspansi unit 4 di Kamojang. Bisa kirim portfolio proyek geothermal yang sudah ditangani? Lebih bagus lagi kalau ada referensi proyek PLTP.\n\nSalam,\nBudi", receivedAt: "2026-06-12T14:30:00Z", status: "unread", campaignId: "cmp_002", sentiment: "positive" },
  { id: "rpl_002", channel: "whatsapp", from: "+6281512345005", fromName: "Ibu Maria Lestari", clientId: "cl_004", contactId: "ct_005", subject: null, body: "Halo, sudah saya terima emailnya. Untuk renewal kontrak audit SMK3, kita lanjut Senin depan ya. Sekalian saya undang Pak Direktur untuk meeting.", receivedAt: "2026-06-12T09:15:00Z", status: "read", campaignId: "cmp_002", sentiment: "positive" },
  { id: "rpl_003", channel: "email", from: "a.hidayat@krakatausteel.com", fromName: "Ahmad Hidayat, M.M.", clientId: "cl_002", contactId: "ct_003", subject: "Re: Selamat atas posisi SHE Manager baru di Krakatau Steel", body: "Terima kasih sapaannya. Kami memang sedang assess vendor partner. Boleh kirim case study fire protection audit di sektor manufaktur baja?\n\nKalau memungkinkan, kita atur meeting 2 minggu lagi setelah saya selesai onboarding.\n\nAhmad", receivedAt: "2026-06-11T11:45:00Z", status: "unread", campaignId: "cmp_001", sentiment: "positive" },
  { id: "rpl_004", channel: "email", from: "d.tjandra@vale.com", fromName: "David Tjandra", clientId: "cl_003", contactId: "ct_004", subject: "Re: Selamat atas posisi SHE Manager baru di Vale", body: "Terima kasih, tapi untuk saat ini kami fokus internal dulu. Mungkin Q4 baru bisa kita diskusi lebih dalam.\n\nDavid", receivedAt: "2026-06-10T16:00:00Z", status: "read", campaignId: "cmp_001", sentiment: "neutral" },
  { id: "rpl_005", channel: "email", from: "procurement@aramco.com", fromName: "Aramco Procurement", clientId: "cl_006", contactId: null, subject: "Auto-reply: Vendor prequalification submission received", body: "Thank you for your submission. Our procurement team will review your application within 30-45 business days. You will be notified of the next steps via this email channel.\n\nBest regards,\nAramco Procurement Team", receivedAt: "2026-06-08T08:30:00Z", status: "read", campaignId: "cmp_003", sentiment: "neutral" },
];

const NUSA_SAFETY_CONTEXT = `Anda adalah AI Copilot dalam aplikasi Nusa Snipe — sistem marketing & sales intelligence milik ${COMPANY_CONFIG.legalName} (brand "${COMPANY_CONFIG.brandName}"), sebuah konsultan QHSE dan fire protection di Indonesia.

KONTAK PERUSAHAAN:
- Email resmi: ${COMPANY_CONFIG.email}
- Website: ${COMPANY_CONFIG.website}
- HQ: ${COMPANY_CONFIG.hq}
- Cabang: ${COMPANY_CONFIG.branches.join(", ")}
- Sertifikasi: ${COMPANY_CONFIG.certifications.join(", ")}

LAYANAN NUSA SAFETY:
- Konsultasi QHSE (Quality, Health, Safety, Environment)
- Implementasi & sertifikasi SMK3 (PP 50/2012)
- Implementasi & sertifikasi ISO 45001 (Occupational Health & Safety)
- Implementasi & sertifikasi ISO 14001 (Environmental Management)
- Fire protection engineering & audit (NFPA standards)
- HAZID, HAZOP, Bowtie risk analysis
- Risk assessment & SECE
- Inspeksi teknis bangunan

TARGET PASAR:
- Indonesia: BUMN energi (Pertamina, PLN, PGN), pertambangan (Vale, Adaro, Antam), manufaktur, konstruksi BUMN
- Internasional: Aramco, ADNOC, Petronas, operator industri Asia/Timur Tengah

GAYA: Bahasa Indonesia formal tapi tidak kaku. Selalu sertakan referensi standar (NFPA, ISO, OSHA, PP 50/2012) saat membahas teknis. Output praktis & langsung pakai. Saat menulis email atau proposal, gunakan email resmi (${COMPANY_CONFIG.email}) dan website (${COMPANY_CONFIG.website}) di footer/signature.

FORMAT JAWABAN: Tulis ringkas dan rapi. Gunakan paragraf pendek. Untuk daftar, pakai bullet sederhana ("- ") atau penomoran ("1. "). Boleh pakai **tebal** seperlunya untuk istilah penting saja. JANGAN gunakan garis pemisah horizontal (---), JANGAN pakai heading bertingkat berlebihan, dan hindari tabel ASCII. Jangan berlebihan memakai simbol.

Bantulah pengguna dengan: draft email cold outreach, draft proposal, ringkasan klien, strategi follow-up, terjemahan, analisa peluang, dan rekomendasi taktis.`;

/* ============== UTILITY HOOKS ============== */
function useConfirm() {
  const [state, setState] = useState({ open: false, message: "", resolve: null });
  const confirm = useCallback((message) => {
    return new Promise((resolve) => setState({ open: true, message, resolve }));
  }, []);
  const handleAnswer = useCallback((answer) => {
    if (state.resolve) state.resolve(answer);
    setState({ open: false, message: "", resolve: null });
  }, [state]);
  const Dialog = state.open ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,20,25,0.45)" }}>
      <div className="w-full max-w-md rounded-xl p-6" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="rounded-full p-2" style={{ background: T.redSoft }}>
            <AlertCircle size={18} style={{ color: T.red }} />
          </div>
          <p className="text-sm leading-relaxed" style={{ color: T.ink }}>{state.message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={() => handleAnswer(false)} className="px-4 py-2 text-sm rounded-md" style={{ color: T.inkSoft }}>Batal</button>
          <button onClick={() => handleAnswer(true)} className="px-4 py-2 text-sm rounded-md text-white" style={{ background: T.red }}>Konfirmasi</button>
        </div>
      </div>
    </div>
  ) : null;
  return { confirm, Dialog };
}

const formatIDR = (n) => {
  if (!n && n !== 0) return "—";
  if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1)} M`;
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(0)} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
};
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const formatDateTime = (iso) => iso ? new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} hari lalu`;
  return formatDate(iso);
};
const newId = (prefix) => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
const healthBadge = (h) => {
  if (h === "hot") return { label: "Hot", color: T.red, bg: T.redSoft };
  if (h === "warm") return { label: "Warm", color: T.amber, bg: T.amberSoft };
  return { label: "Cold", color: T.inkSoft, bg: T.ruleSoft };
};
const getUserInitials = (name) => name ? name.split(" ").map((n) => n[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() : "?";
const roleLabel = (r) => (r === "admin" ? "Admin" : "Sales");

/* Resize an uploaded image to a small square data URL (keeps storage light) */
function resizeImageFile(file, maxSize, quality, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = maxSize; canvas.height = maxSize;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, sx, sy, side, side, 0, 0, maxSize, maxSize);
      try { callback(canvas.toDataURL("image/jpeg", quality)); }
      catch (err) { callback(null); }
    };
    img.onerror = () => callback(null);
    img.src = e.target.result;
  };
  reader.onerror = () => callback(null);
  reader.readAsDataURL(file);
}

/* Avatar: shows photo if present, else colored initials */
function Avatar({ user, size = 36, ring = false }) {
  const px = `${size}px`;
  const isAdmin = user && user.role === "admin";
  const bg = isAdmin ? T.navySoft : T.sageSoft;
  const fg = isAdmin ? T.navy : T.sage;
  const fontSize = Math.max(9, Math.round(size * 0.36));
  const common = { width: px, height: px, flexShrink: 0, borderRadius: "9999px", ...(ring ? { boxShadow: `0 0 0 2px ${T.surface}, 0 0 0 3px ${T.rule}` } : {}) };
  if (user && user.photo) {
    return <img src={user.photo} alt={user.name} style={{ ...common, objectFit: "cover" }} />;
  }
  return (
    <div className="flex items-center justify-center font-medium" style={{ ...common, background: bg, color: fg, fontSize: `${fontSize}px` }}>
      {getUserInitials(user ? user.name : "?")}
    </div>
  );
}
const safeParse = (s, fallback) => { try { return s ? JSON.parse(s) : fallback; } catch (e) { return fallback; } };

/* ============== MAIN APP ============== */
export default function NusaSnipe() {
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);

  const [view, setView] = useState("dashboard");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [signals, setSignals] = useState([]);
  const [replies, setReplies] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [company, setCompany] = useState({ ...COMPANY_CONFIG });
  const [aiOpen, setAiOpen] = useState(false);
  const [aiContext, setAiContext] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [pendingProposalId, setPendingProposalId] = useState(null);
  const { confirm, Dialog: ConfirmDialog } = useConfirm();

  useEffect(() => {
    (async () => {
      /* Users */
      const usersStr = await storage.get(STORAGE_KEYS.users);
      let parsedUsers = usersStr ? safeParse(usersStr, null) : null;
      if (!parsedUsers || parsedUsers.length === 0) {
        parsedUsers = await buildSeedUsers();
        await storage.set(STORAGE_KEYS.users, JSON.stringify(parsedUsers));
      }
      setUsers(parsedUsers);

      /* Session */
      const sessionStr = await storage.get(STORAGE_KEYS.session);
      const session = safeParse(sessionStr, null);
      if (session && session.userId) {
        const sessionUser = parsedUsers.find((u) => u.id === session.userId && u.active);
        if (sessionUser) setCurrentUser(sessionUser);
      }

      /* Domain data */
      const cl = await storage.get(STORAGE_KEYS.clients);
      const ct = await storage.get(STORAGE_KEYS.contacts);
      const dl = await storage.get(STORAGE_KEYS.deals);
      const ac = await storage.get(STORAGE_KEYS.activities);
      const tp = await storage.get(STORAGE_KEYS.templates);
      const cp = await storage.get(STORAGE_KEYS.campaigns);
      const mt = await storage.get(STORAGE_KEYS.meetingTypes);
      const bk = await storage.get(STORAGE_KEYS.bookings);
      const sg = await storage.get(STORAGE_KEYS.signals);
      const rp = await storage.get(STORAGE_KEYS.replies);
      const pr = await storage.get(STORAGE_KEYS.proposals);
      const co = await storage.get(STORAGE_KEYS.company);
      setClients(cl ? safeParse(cl, []) : []);
      setContacts(ct ? safeParse(ct, []) : []);
      setDeals(dl ? safeParse(dl, []) : []);
      setActivities(ac ? safeParse(ac, []) : []);
      setTemplates(tp ? safeParse(tp, []) : []);
      setCampaigns(cp ? safeParse(cp, []) : []);
      setMeetingTypes(mt ? safeParse(mt, []) : []);
      setBookings(bk ? safeParse(bk, []) : []);
      setSignals(sg ? safeParse(sg, []) : []);
      setReplies(rp ? safeParse(rp, []) : []);
      setProposals(pr ? safeParse(pr, []) : []);
      const mergedCompany = co ? { ...COMPANY_CONFIG, ...safeParse(co, {}) } : { ...COMPANY_CONFIG };
      Object.assign(COMPANY_CONFIG, mergedCompany);
      setCompany(mergedCompany);
      if (!cl) await storage.set(STORAGE_KEYS.clients, JSON.stringify([]));
      if (!ct) await storage.set(STORAGE_KEYS.contacts, JSON.stringify([]));
      if (!dl) await storage.set(STORAGE_KEYS.deals, JSON.stringify([]));
      if (!ac) await storage.set(STORAGE_KEYS.activities, JSON.stringify([]));
      if (!tp) await storage.set(STORAGE_KEYS.templates, JSON.stringify([]));
      if (!cp) await storage.set(STORAGE_KEYS.campaigns, JSON.stringify([]));
      if (!mt) await storage.set(STORAGE_KEYS.meetingTypes, JSON.stringify([]));
      if (!bk) await storage.set(STORAGE_KEYS.bookings, JSON.stringify([]));
      if (!sg) await storage.set(STORAGE_KEYS.signals, JSON.stringify([]));
      if (!rp) await storage.set(STORAGE_KEYS.replies, JSON.stringify([]));
      if (!pr) await storage.set(STORAGE_KEYS.proposals, JSON.stringify([]));

      setLoaded(true);
      setAuthChecked(true);
    })();
  }, []);

  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.clients, JSON.stringify(clients)); }, [clients, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.contacts, JSON.stringify(contacts)); }, [contacts, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.deals, JSON.stringify(deals)); }, [deals, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.activities, JSON.stringify(activities)); }, [activities, loaded]);
  useEffect(() => { if (loaded && users.length > 0) storage.set(STORAGE_KEYS.users, JSON.stringify(users)); }, [users, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.templates, JSON.stringify(templates)); }, [templates, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.campaigns, JSON.stringify(campaigns)); }, [campaigns, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.meetingTypes, JSON.stringify(meetingTypes)); }, [meetingTypes, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.bookings, JSON.stringify(bookings)); }, [bookings, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.signals, JSON.stringify(signals)); }, [signals, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.replies, JSON.stringify(replies)); }, [replies, loaded]);
  useEffect(() => { if (loaded) storage.set(STORAGE_KEYS.proposals, JSON.stringify(proposals)); }, [proposals, loaded]);
  useEffect(() => { if (loaded) { Object.assign(COMPANY_CONFIG, company); storage.set(STORAGE_KEYS.company, JSON.stringify(company)); } }, [company, loaded]);

  const handleLogin = useCallback(async (user) => {
    await storage.set(STORAGE_KEYS.session, JSON.stringify({ userId: user.id, at: new Date().toISOString() }));
    setCurrentUser(user);
    setView("dashboard");
    setSelectedClientId(null);
  }, []);

  const handleLogout = useCallback(async () => {
    const ok = await confirm("Yakin mau logout dari Nusa Snipe?");
    if (!ok) return;
    await storage.clear(STORAGE_KEYS.session);
    setCurrentUser(null);
    setView("dashboard");
    setSelectedClientId(null);
    setAiOpen(false);
    setAiContext(null);
  }, [confirm]);

  /* RBAC filtering */
  const visibleClients = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return clients;
    return clients.filter((c) => c.ownerId === currentUser.id);
  }, [clients, currentUser]);

  const visibleDeals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return deals;
    return deals.filter((d) => d.ownerId === currentUser.id);
  }, [deals, currentUser]);

  const visibleContacts = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return contacts;
    const ids = visibleClients.map((c) => c.id);
    return contacts.filter((ct) => ids.includes(ct.clientId));
  }, [contacts, visibleClients, currentUser]);

  const visibleActivities = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return activities;
    const ids = visibleClients.map((c) => c.id);
    return activities.filter((a) => ids.includes(a.clientId));
  }, [activities, visibleClients, currentUser]);

  const visibleCampaigns = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return campaigns;
    return campaigns.filter((c) => c.ownerId === currentUser.id);
  }, [campaigns, currentUser]);

  const visibleTemplates = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return templates;
    return templates.filter((t) => t.ownerId === currentUser.id || t.ownerId === "u_admin");
  }, [templates, currentUser]);

  const visibleMeetingTypes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return meetingTypes;
    return meetingTypes.filter((m) => m.ownerId === currentUser.id || m.ownerId === "u_admin");
  }, [meetingTypes, currentUser]);

  const visibleBookings = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return bookings;
    return bookings.filter((b) => b.ownerId === currentUser.id);
  }, [bookings, currentUser]);

  const visibleSignals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return signals;
    return signals.filter((s) => {
      if (s.relatedClientId) {
        const c = clients.find((cl) => cl.id === s.relatedClientId);
        return c && c.ownerId === currentUser.id;
      }
      return true;
    });
  }, [signals, clients, currentUser]);

  const visibleReplies = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return replies;
    const ids = visibleClients.map((c) => c.id);
    return replies.filter((r) => ids.includes(r.clientId));
  }, [replies, visibleClients, currentUser]);

  const visibleProposals = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === "admin") return proposals;
    return proposals.filter((p) => p.ownerId === currentUser.id);
  }, [proposals, currentUser]);

  const billingAlerts = useMemo(() => {
    let count = 0;
    visibleProposals.forEach((p) => {
      (p.paymentTerms || []).forEach((t) => {
        if (t.status === "paid") return;
        const d = daysUntil(t.dueDate);
        if (d !== null && d <= 7) count += 1;
      });
    });
    return count;
  }, [visibleProposals]);

  const openAi = useCallback((context) => { setAiContext(context || null); setAiOpen(true); }, []);

  const handleUpdateProfile = useCallback((updates) => {
    setUsers((prev) => prev.map((u) => (u.id === updates.id ? { ...u, ...updates } : u)));
    setCurrentUser((prev) => (prev && prev.id === updates.id ? { ...prev, ...updates } : prev));
  }, []);

  const handleResetData = useCallback(async () => {
    const ok = await confirm("Hapus SEMUA data operasional (klien, kontak, deal, proposal, penagihan, sinyal, booking, kampanye, template, aktivitas)? Profil perusahaan & akun pengguna TETAP aman. Tindakan ini tidak bisa dibatalkan.");
    if (!ok) return;
    setClients([]); setContacts([]); setDeals([]); setActivities([]);
    setTemplates([]); setCampaigns([]); setMeetingTypes([]); setBookings([]);
    setSignals([]); setReplies([]); setProposals([]);
    try { await storage.clear(STORAGE_KEYS.ai); } catch (e) { /* ignore */ }
    setSelectedClientId(null); setSelectedCampaignId(null); setPendingProposalId(null);
    setView("dashboard");
  }, [confirm]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.canvas }}>
        <div className="flex items-center gap-2" style={{ color: T.inkSoft }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Memuat Nusa Snipe…</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  const effectiveView = view === "users" && currentUser.role !== "admin" ? "dashboard" : view;

  return (
    <div className="min-h-screen" style={{ background: T.canvas, color: T.ink, fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <div className="flex">
        <Sidebar view={effectiveView} onView={(v) => { setView(v); setSelectedClientId(null); setSelectedCampaignId(null); }} onOpenAi={() => openAi(null)} currentUser={currentUser} onLogout={handleLogout} unreadReplies={visibleReplies.filter((r) => r.status === "unread").length} newSignals={visibleSignals.filter((s) => s.status === "new").length} billingAlerts={billingAlerts} />
        <div className="flex-1 min-w-0">
          <TopBar currentUser={currentUser} onLogout={handleLogout} onOpenProfile={() => setView("profile")} />
          <main className="p-6 max-w-[1400px]">
            {effectiveView === "dashboard" && <DashboardView clients={visibleClients} deals={visibleDeals} activities={visibleActivities} signals={visibleSignals} bookings={visibleBookings} replies={visibleReplies} currentUser={currentUser} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} onOpenAi={openAi} onView={(v) => setView(v)} />}
            {effectiveView === "clients" && <ClientsView clients={visibleClients} allClients={clients} setClients={setClients} contacts={contacts} setContacts={setContacts} deals={deals} activities={activities} setActivities={setActivities} selectedId={selectedClientId} setSelectedId={setSelectedClientId} confirm={confirm} onOpenAi={openAi} currentUser={currentUser} users={users} />}
            {effectiveView === "pipeline" && <PipelineView deals={visibleDeals} allDeals={deals} setDeals={setDeals} clients={visibleClients} currentUser={currentUser} users={users} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} />}
            {effectiveView === "proposals" && <ProposalsView proposals={visibleProposals} setProposals={setProposals} clients={visibleClients} deals={visibleDeals} contacts={contacts} confirm={confirm} currentUser={currentUser} users={users} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} onOpenAi={openAi} openProposalId={pendingProposalId} onProposalOpened={() => setPendingProposalId(null)} />}
            {effectiveView === "billing" && <BillingView proposals={visibleProposals} clients={visibleClients} currentUser={currentUser} onOpenProposal={(id) => { setPendingProposalId(id); setView("proposals"); }} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} />}
            {effectiveView === "reports" && <ReportsView proposals={visibleProposals} clients={visibleClients} deals={visibleDeals} signals={visibleSignals} bookings={visibleBookings} campaigns={visibleCampaigns} replies={visibleReplies} users={users} currentUser={currentUser} />}
            {effectiveView === "outreach" && <OutreachView campaigns={visibleCampaigns} allCampaigns={campaigns} setCampaigns={setCampaigns} templates={visibleTemplates} setTemplates={setTemplates} clients={visibleClients} contacts={contacts} selectedId={selectedCampaignId} setSelectedId={setSelectedCampaignId} confirm={confirm} currentUser={currentUser} users={users} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} />}
            {effectiveView === "booking" && <BookingView meetingTypes={visibleMeetingTypes} setMeetingTypes={setMeetingTypes} bookings={visibleBookings} setBookings={setBookings} clients={visibleClients} contacts={contacts} confirm={confirm} currentUser={currentUser} users={users} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} />}
            {effectiveView === "hunter" && <HunterView signals={visibleSignals} setSignals={setSignals} clients={clients} setClients={setClients} currentUser={currentUser} confirm={confirm} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} onOpenAi={openAi} />}
            {effectiveView === "inbox" && <InboxView replies={visibleReplies} setReplies={setReplies} clients={visibleClients} campaigns={visibleCampaigns} currentUser={currentUser} onOpenClient={(id) => { setSelectedClientId(id); setView("clients"); }} onOpenAi={openAi} />}
            {effectiveView === "copilot" && <CopilotPage onOpenAi={openAi} clients={visibleClients} currentUser={currentUser} />}
            {effectiveView === "users" && currentUser.role === "admin" && <UsersView users={users} setUsers={setUsers} currentUser={currentUser} confirm={confirm} clients={clients} deals={deals} onUpdateSelf={handleUpdateProfile} />}
            {effectiveView === "company" && currentUser.role === "admin" && <CompanyView company={company} setCompany={setCompany} canEdit={currentUser.role === "admin"} />}
            {effectiveView === "profile" && <ProfileView currentUser={currentUser} onSave={handleUpdateProfile} />}
            {effectiveView === "settings" && <SettingsView currentUser={currentUser} company={company} onOpenCompany={() => setView("company")} onOpenProfile={() => setView("profile")} onResetData={handleResetData} />}
          </main>
        </div>
      </div>

      <AICopilotDrawer open={aiOpen} onClose={() => setAiOpen(false)} context={aiContext} clients={visibleClients} contacts={visibleContacts} deals={visibleDeals} activities={visibleActivities} currentUser={currentUser} />

      {!aiOpen && (
        <button onClick={() => openAi(null)} className="fixed bottom-6 right-6 z-30 rounded-full px-5 py-3 text-white shadow-lg flex items-center gap-2 transition-transform hover:scale-105" style={{ background: T.navy, boxShadow: "0 8px 24px rgba(31,56,100,0.35)" }}>
          <Sparkles size={16} />
          <span className="text-sm font-medium">Tanya Copilot</span>
        </button>
      )}

      {ConfirmDialog}
    </div>
  );
}

/* ============== SIDEBAR ============== */
function Sidebar({ view, onView, onOpenAi, currentUser, onLogout, unreadReplies, newSignals, billingAlerts }) {
  const items = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "sales"] },
    { id: "hunter", label: "Prospect Hunter", icon: Radar, roles: ["admin", "sales"], badge: newSignals, badgeColor: T.red },
    { id: "clients", label: "Klien", icon: Users, roles: ["admin", "sales"] },
    { id: "pipeline", label: "Pipeline", icon: Workflow, roles: ["admin", "sales"] },
    { id: "proposals", label: "Proposal", icon: ClipboardList, roles: ["admin", "sales"] },
    { id: "billing", label: "Penagihan", icon: Wallet, roles: ["admin", "sales"], badge: billingAlerts, badgeColor: T.red },
    { id: "reports", label: "Laporan", icon: BarChart3, roles: ["admin", "sales"] },
    { id: "outreach", label: "Outreach", icon: Megaphone, roles: ["admin", "sales"] },
    { id: "booking", label: "Booking", icon: CalendarCheck, roles: ["admin", "sales"] },
    { id: "inbox", label: "Inbox", icon: Inbox, roles: ["admin", "sales"], badge: unreadReplies, badgeColor: T.amber },
    { id: "copilot", label: "AI Copilot", icon: Sparkles, roles: ["admin", "sales"] },
    { id: "users", label: "Pengguna", icon: UserCog, roles: ["admin"] },
    { id: "company", label: "Perusahaan", icon: Building2, roles: ["admin"] },
    { id: "settings", label: "Pengaturan", icon: Settings, roles: ["admin", "sales"] },
  ];
  const allowed = items.filter((i) => i.roles.includes(currentUser.role));
  return (
    <aside className="w-60 min-h-screen border-r flex flex-col" style={{ background: T.surface, borderColor: T.rule }}>
      <div className="px-5 py-5 border-b" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.navy }}>
            <NusaSnipeLogo size={22} color="#fff" />
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-tight tracking-tight" style={{ color: T.ink }}>Nusa Snipe</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>NUSA SAFETY</p>
          </div>
        </div>
      </div>
      <nav className="px-3 py-4 flex-1 overflow-y-auto">
        {allowed.map((item) => {
          const Icon = item.icon;
          const active = view === item.id;
          const hasBadge = item.badge && item.badge > 0;
          return (
            <button key={item.id} onClick={() => onView(item.id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-md mb-0.5 text-sm transition-colors" style={{ background: active ? T.navySoft : "transparent", color: active ? T.navy : T.inkSoft, fontWeight: active ? 500 : 400 }}>
              <Icon size={16} strokeWidth={active ? 2.25 : 1.75} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "users" && <ShieldCheck size={11} style={{ color: T.amber }} />}
              {hasBadge && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center" style={{ background: item.badgeColor, color: "#fff", fontFamily: FONT_MONO }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md mb-2" style={{ background: T.surfaceAlt }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0" style={{ background: currentUser.role === "admin" ? T.navySoft : T.sageSoft, color: currentUser.role === "admin" ? T.navy : T.sage }}>
            {getUserInitials(currentUser.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium truncate" style={{ color: T.ink }}>{currentUser.name}</p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{roleLabel(currentUser.role)}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-md transition-colors hover:bg-white" aria-label="Logout">
            <LogOut size={13} style={{ color: T.inkSoft }} />
          </button>
        </div>
        <button onClick={onOpenAi} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-white text-sm font-medium" style={{ background: T.navy }}>
          <Sparkles size={14} />
          <span>Buka Copilot</span>
        </button>
        <p className="text-[10px] mt-2.5 px-2" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>v1.3.0 · + REPORTING ENGINE</p>
      </div>
    </aside>
  );
}

/* ============== TOP BAR ============== */
function TopBar({ currentUser, onLogout, onOpenProfile }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <header className="h-14 border-b flex items-center justify-between px-6 relative" style={{ background: T.surface, borderColor: T.rule }}>
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Search size={16} style={{ color: T.inkFaint }} />
        <input type="text" placeholder="Cari klien, kontak, deal…" className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" style={{ color: T.ink }} />
      </div>
      <div className="flex items-center gap-3" ref={menuRef}>
        <button className="p-2 rounded-md transition-colors hover:bg-gray-100" aria-label="Notifications">
          <Bell size={16} style={{ color: T.inkSoft }} />
        </button>
        <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors hover:bg-gray-50">
          <Avatar user={currentUser} size={32} />
          <ChevronDown size={13} style={{ color: T.inkSoft }} />
        </button>
        {menuOpen && (
          <div className="absolute right-6 top-14 mt-1 w-64 rounded-xl shadow-lg z-20" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
            <div className="p-4 border-b" style={{ borderColor: T.ruleSoft }}>
              <div className="flex items-center gap-2.5">
                <Avatar user={currentUser} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{currentUser.name}</p>
                  <p className="text-[11px] truncate" style={{ color: T.inkSoft }}>{currentUser.position || roleLabel(currentUser.role)}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: currentUser.role === "admin" ? T.navySoft : T.sageSoft, color: currentUser.role === "admin" ? T.navy : T.sage, fontFamily: FONT_MONO }}>
                  {roleLabel(currentUser.role)}
                </span>
                {currentUser.role === "admin" && <ShieldCheck size={11} style={{ color: T.amber }} />}
              </div>
            </div>
            <div className="p-1">
              <button onClick={() => { setMenuOpen(false); onOpenProfile(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-50" style={{ color: T.ink }}>
                <UserCheck size={13} /> Profil saya
              </button>
              <button onClick={() => { setMenuOpen(false); onLogout(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-50" style={{ color: T.red }}>
                <LogOut size={13} /> Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/* ============== DASHBOARD VIEW ============== */
function DashboardView({ clients, deals, activities, signals, bookings, replies, currentUser, onOpenClient, onOpenAi, onView }) {
  const hot = clients.filter((c) => c.health === "hot");
  const totalPipeline = deals.filter((d) => d.stage !== "won").reduce((sum, d) => sum + d.value, 0);
  const wonValue = deals.filter((d) => d.stage === "won").reduce((sum, d) => sum + d.value, 0);
  const winRate = deals.length ? ((deals.filter((d) => d.stage === "won").length / deals.length) * 100).toFixed(0) : 0;
  const newSignals = (signals || []).filter((s) => s.status === "new").sort((a, b) => b.aiScore - a.aiScore).slice(0, 4);
  const upcomingBookings = (bookings || []).filter((b) => b.status === "confirmed" && new Date(b.scheduledAt) >= new Date()).sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)).slice(0, 3);
  const unreadCount = (replies || []).filter((r) => r.status === "unread").length;
  const firstName = currentUser ? currentUser.name.split(" ")[0] : "Daddy";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Selamat datang, {firstName}</h1>
        <p className="text-sm mt-1" style={{ color: T.inkSoft }}>Ringkasan aktivitas Nusa Snipe hari ini · {formatDate(new Date().toISOString())} · {currentUser ? roleLabel(currentUser.role) : ""}</p>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <MetricCard label="Klien aktif" value={clients.length} sub={`${hot.length} hot prospect`} icon={Users} accent={T.navy} />
        <MetricCard label="Pipeline terbuka" value={formatIDR(totalPipeline)} sub={`${deals.filter((d) => d.stage !== "won").length} deal aktif`} icon={TrendingUp} accent={T.amber} />
        <MetricCard label="Closed won" value={formatIDR(wonValue)} sub={`${winRate}% win rate`} icon={CheckCircle2} accent={T.sage} />
        <MetricCard label="Sinyal baru" value={newSignals.length} sub="dari Hunter" icon={Radar} accent={T.red} />
        <MetricCard label="Inbox unread" value={unreadCount} sub="balasan menunggu" icon={Inbox} accent={T.amber} />
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Panel title="Hot prospects" subtitle="Prospek dengan sinyal urgensi tinggi" icon={Flame} accent={T.red} className="col-span-2">
          {hot.length === 0 ? <EmptyState text="Belum ada prospek hot." /> : hot.map((c) => <ClientRow key={c.id} client={c} onClick={() => onOpenClient(c.id)} onAi={() => onOpenAi({ type: "client", client: c })} />)}
        </Panel>
        <Panel title="Top sinyal AI Hunter" subtitle="Skor tertinggi minggu ini" icon={Radar} accent={T.red}>
          {newSignals.length === 0 ? <EmptyState text="Tidak ada sinyal baru." /> : newSignals.map((s) => (
            <button key={s.id} onClick={() => onView("hunter")} className="w-full text-left py-2 border-b last:border-0" style={{ borderColor: T.ruleSoft }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: T.red, background: T.redSoft, fontFamily: FONT_MONO }}>{s.source}</span>
                <span className="text-[11px] font-semibold" style={{ color: s.aiScore >= 80 ? T.sage : (s.aiScore >= 60 ? T.amber : T.inkSoft), fontFamily: FONT_MONO }}>{s.aiScore}</span>
              </div>
              <p className="text-[12px] font-medium leading-tight truncate" style={{ color: T.ink }}>{s.title}</p>
              <p className="text-[10px] mt-0.5 truncate" style={{ color: T.inkSoft }}>{s.companyName}</p>
            </button>
          ))}
        </Panel>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Panel title="Aktivitas terbaru" icon={Activity} accent={T.sage} className="col-span-2">
          {[...activities].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 5).map((a) => {
            const client = clients.find((c) => c.id === a.clientId);
            return (
              <div key={a.id} className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: T.ruleSoft }}>
                <ActivityIcon type={a.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: T.ink }}>{a.title}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: T.inkSoft }}>{client ? client.name : "—"} · {timeAgo(a.at)}</p>
                </div>
              </div>
            );
          })}
        </Panel>
        <Panel title="Meeting mendatang" subtitle={`${upcomingBookings.length} confirmed`} icon={CalendarCheck} accent={T.navy}>
          {upcomingBookings.length === 0 ? <EmptyState text="Tidak ada meeting." /> : upcomingBookings.map((b) => {
            const client = clients.find((c) => c.id === b.clientId);
            return (
              <button key={b.id} onClick={() => onView("booking")} className="w-full text-left py-2 border-b last:border-0" style={{ borderColor: T.ruleSoft }}>
                <p className="text-[12px] font-medium leading-tight truncate" style={{ color: T.ink }}>{b.attendeeName}</p>
                <p className="text-[11px] mt-0.5 truncate" style={{ color: T.inkSoft }}>{client ? client.name : "Inbound booking"}</p>
                <p className="text-[10px] mt-0.5" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatDateTime(b.scheduledAt)} · {b.duration}min</p>
              </button>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, accent }) {
  const Icon = icon;
  return (
    <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{label}</p>
        <Icon size={14} style={{ color: accent }} />
      </div>
      <p className="text-[22px] font-semibold leading-none" style={{ color: T.ink }}>{value}</p>
      <p className="text-[11px] mt-2" style={{ color: T.inkSoft }}>{sub}</p>
    </div>
  );
}

function Panel({ title, subtitle, icon, accent, className = "", children }) {
  const Icon = icon;
  return (
    <div className={`rounded-xl ${className}`} style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="px-4 py-3 border-b flex items-center gap-2.5" style={{ borderColor: T.ruleSoft }}>
        {Icon && <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: T.surfaceAlt }}><Icon size={13} style={{ color: accent }} /></div>}
        <div className="flex-1">
          <p className="text-[13px] font-medium" style={{ color: T.ink }}>{title}</p>
          {subtitle && <p className="text-[11px]" style={{ color: T.inkSoft }}>{subtitle}</p>}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ClientRow({ client, onClick, onAi }) {
  const h = healthBadge(client.health);
  return (
    <div className="flex items-center gap-3 py-2.5 border-b last:border-0 group" style={{ borderColor: T.ruleSoft }}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
        <Building2 size={14} style={{ color: T.navy }} />
      </div>
      <button className="flex-1 min-w-0 text-left" onClick={onClick}>
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{client.name}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0" style={{ color: h.color, background: h.bg, fontFamily: FONT_MONO }}>{h.label}</span>
        </div>
        <p className="text-[11px] truncate" style={{ color: T.inkSoft }}>{client.industry} · {client.city}, {client.country}</p>
      </button>
      <button onClick={(e) => { e.stopPropagation(); onAi(); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Ask AI">
        <Sparkles size={13} style={{ color: T.navy }} />
      </button>
      <ChevronRight size={14} style={{ color: T.inkFaint }} />
    </div>
  );
}

function ActivityIcon({ type }) {
  const map = {
    email: { Icon: Mail, color: T.navy, bg: T.navySoft },
    meeting: { Icon: Calendar, color: T.amber, bg: T.amberSoft },
    note: { Icon: FileText, color: T.sage, bg: T.sageSoft },
    call: { Icon: Phone, color: T.navy, bg: T.navySoft },
  };
  const conf = map[type] || map.note;
  return (
    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: conf.bg }}>
      <conf.Icon size={12} style={{ color: conf.color }} />
    </div>
  );
}

function QuickAiButton({ label, icon, onClick }) {
  const Icon = icon;
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-[12px] text-left transition-colors hover:bg-gray-50" style={{ background: T.surfaceAlt, border: `1px solid ${T.ruleSoft}`, color: T.ink }}>
      <Icon size={13} style={{ color: T.navy }} />
      <span className="flex-1">{label}</span>
      <ArrowRight size={12} style={{ color: T.inkFaint }} />
    </button>
  );
}

function EmptyState({ text }) {
  return <div className="py-8 text-center"><p className="text-[12px]" style={{ color: T.inkFaint }}>{text}</p></div>;
}

/* ============== CLIENTS VIEW ============== */
function ClientsView({ clients, allClients, setClients, contacts, setContacts, deals, activities, setActivities, selectedId, setSelectedId, confirm, onOpenAi, currentUser, users }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHealth, setFilterHealth] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (filterHealth !== "all" && c.health !== filterHealth) return false;
      if (currentUser.role === "admin" && filterOwner !== "all" && c.ownerId !== filterOwner) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q) || c.city.toLowerCase().includes(q);
    });
  }, [clients, searchQuery, filterHealth, filterOwner, currentUser]);

  const selectedClient = allClients.find((c) => c.id === selectedId);
  const canEditSelected = selectedClient && (currentUser.role === "admin" || selectedClient.ownerId === currentUser.id);

  const handleSave = (data) => {
    if (data.id) {
      const target = allClients.find((c) => c.id === data.id);
      if (target && currentUser.role !== "admin" && target.ownerId !== currentUser.id) return;
      setClients((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    } else {
      const nc = { ...data, id: newId("cl"), ownerId: data.ownerId || currentUser.id, createdAt: new Date().toISOString() };
      setClients((prev) => [nc, ...prev]);
    }
    setShowAddModal(false);
    setEditingClient(null);
  };

  const handleDelete = async (id) => {
    const target = allClients.find((c) => c.id === id);
    if (!target) return;
    if (currentUser.role !== "admin" && target.ownerId !== currentUser.id) return;
    const ok = await confirm("Hapus klien ini? Semua kontak terkait juga akan dihapus.");
    if (!ok) return;
    setClients((prev) => prev.filter((c) => c.id !== id));
    setContacts((prev) => prev.filter((c) => c.clientId !== id));
    if (selectedId === id) setSelectedId(null);
  };

  if (selectedClient) {
    if (currentUser.role !== "admin" && selectedClient.ownerId !== currentUser.id) {
      return (
        <div className="rounded-xl p-12 text-center" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <Lock size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Akses tidak diizinkan</p>
          <p className="text-xs mb-4" style={{ color: T.inkSoft }}>Klien ini bukan milik Anda. Hubungi admin jika butuh akses.</p>
          <button onClick={() => setSelectedId(null)} className="px-4 py-2 rounded-md text-sm" style={{ background: T.navy, color: "#fff" }}>Kembali</button>
        </div>
      );
    }
    return (
      <ClientDetail client={selectedClient} contacts={contacts.filter((c) => c.clientId === selectedClient.id)} setContacts={setContacts} deals={deals.filter((d) => d.clientId === selectedClient.id)} activities={activities.filter((a) => a.clientId === selectedClient.id)} setActivities={setActivities} onBack={() => setSelectedId(null)} onEdit={() => canEditSelected && setEditingClient(selectedClient)} onDelete={() => canEditSelected && handleDelete(selectedClient.id)} onAi={() => onOpenAi({ type: "client", client: selectedClient })} confirm={confirm} modalOpen={editingClient !== null} editingClient={editingClient} onSaveEdit={handleSave} onCloseEdit={() => setEditingClient(null)} canEdit={canEditSelected} currentUser={currentUser} users={users} />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Klien</h1>
          <p className="text-sm mt-1" style={{ color: T.inkSoft }}>{clients.length} klien {currentUser.role === "sales" ? "milik Anda" : "terdaftar"} · {clients.filter((c) => c.health === "hot").length} hot, {clients.filter((c) => c.health === "warm").length} warm</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
          <Plus size={14} /> Tambah klien
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[260px] flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <Search size={14} style={{ color: T.inkFaint }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama klien, industri, kota…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.ink }} />
        </div>
        <div className="flex items-center gap-1.5">
          {["all", "hot", "warm", "cold"].map((h) => (
            <button key={h} onClick={() => setFilterHealth(h)} className="px-3 py-1.5 rounded-md text-[12px] capitalize" style={{ background: filterHealth === h ? T.navy : T.surface, color: filterHealth === h ? "#fff" : T.inkSoft, border: `1px solid ${filterHealth === h ? T.navy : T.rule}` }}>
              {h === "all" ? "Semua" : h}
            </button>
          ))}
        </div>
        {currentUser.role === "admin" && (
          <select value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)} className="px-3 py-1.5 rounded-md text-[12px]" style={{ background: T.surface, color: T.ink, border: `1px solid ${T.rule}` }}>
            <option value="all">Semua owner</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({roleLabel(u.role)})</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((c) => (
          <ClientCard key={c.id} client={c} owner={users.find((u) => u.id === c.ownerId)} contactCount={contacts.filter((ct) => ct.clientId === c.id).length} dealCount={deals.filter((d) => d.clientId === c.id).length} onClick={() => setSelectedId(c.id)} onAi={() => onOpenAi({ type: "client", client: c })} showOwner={currentUser.role === "admin"} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
          <Users size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Tidak ada klien yang cocok</p>
          <p className="text-xs" style={{ color: T.inkSoft }}>Coba ubah filter atau tambahkan klien baru</p>
        </div>
      )}

      {(showAddModal || editingClient) && <ClientModal client={editingClient} onSave={handleSave} onClose={() => { setShowAddModal(false); setEditingClient(null); }} currentUser={currentUser} users={users} />}
    </div>
  );
}

function ClientCard({ client, owner, contactCount, dealCount, onClick, onAi, showOwner }) {
  const h = healthBadge(client.health);
  return (
    <div onClick={onClick} className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm group" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
          <Building2 size={18} style={{ color: T.navy }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate" style={{ color: T.ink }}>{client.name}</p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: T.inkSoft }}>{client.industry}</p>
          <p className="text-[11px] truncate flex items-center gap-1 mt-0.5" style={{ color: T.inkFaint }}><MapPin size={9} /> {client.city}, {client.country}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: h.color, background: h.bg, fontFamily: FONT_MONO }}>{h.label}</span>
          {showOwner && owner && (
            <div className="flex items-center gap-1" title={`Owner: ${owner.name}`}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: owner.role === "admin" ? T.navySoft : T.sageSoft, color: owner.role === "admin" ? T.navy : T.sage }}>
                {getUserInitials(owner.name)}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {client.tags.slice(0, 4).map((tag) => <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: T.surfaceAlt, color: T.inkSoft }}>{tag}</span>)}
      </div>
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        <div className="flex items-center gap-3 text-[11px]" style={{ color: T.inkSoft }}>
          <span className="flex items-center gap-1"><Users size={11} />{contactCount} kontak</span>
          <span className="flex items-center gap-1"><Briefcase size={11} />{dealCount} deal</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onAi(); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Ask AI">
          <Sparkles size={12} style={{ color: T.navy }} />
        </button>
      </div>
    </div>
  );
}

/* ============== CLIENT DETAIL ============== */
function ClientDetail({ client, contacts, setContacts, deals, activities, setActivities, onBack, onEdit, onDelete, onAi, confirm, modalOpen, editingClient, onSaveEdit, onCloseEdit, canEdit, currentUser, users }) {
  const [tab, setTab] = useState("overview");
  const [showAddContact, setShowAddContact] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const h = healthBadge(client.health);
  const owner = users.find((u) => u.id === client.ownerId);
  const phoneContacts = contacts.filter((c) => c.phone && c.phone.trim());
  const hasPhone = phoneContacts.length > 0;

  const handleSaveContact = (data) => {
    if (data.id) setContacts((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    else setContacts((prev) => [...prev, { ...data, id: newId("ct"), clientId: client.id }]);
    setShowAddContact(false);
    setEditingContact(null);
  };
  const handleDeleteContact = async (id) => {
    const ok = await confirm("Hapus kontak ini?");
    if (!ok) return;
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };
  const handleAddActivity = (data) => {
    setActivities((prev) => [{ ...data, id: newId("act"), clientId: client.id, at: new Date().toISOString() }, ...prev]);
    setShowAddActivity(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-sm transition-colors hover:opacity-80" style={{ color: T.inkSoft }}>
          <ChevronLeft size={16} /> Kembali ke daftar klien
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onAi} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
            <Sparkles size={13} /> Tanya AI tentang klien ini
          </button>
          {hasPhone && (
            <button onClick={() => setShowWaModal(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.surface, color: T.sage, border: `1px solid ${T.rule}` }}>
              <MessageCircle size={13} /> Kirim WhatsApp
            </button>
          )}
          {canEdit && (
            <>
              <button onClick={onEdit} className="p-2 rounded-md" style={{ background: T.surface, color: T.inkSoft, border: `1px solid ${T.rule}` }} aria-label="Edit"><Edit3 size={14} /></button>
              <button onClick={onDelete} className="p-2 rounded-md" style={{ background: T.surface, color: T.red, border: `1px solid ${T.rule}` }} aria-label="Delete"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl p-6 mb-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
            <Building2 size={24} style={{ color: T.navy }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: T.ink }}>{client.name}</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: h.color, background: h.bg, fontFamily: FONT_MONO }}>{h.label}</span>
              {owner && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: T.surfaceAlt }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium" style={{ background: owner.role === "admin" ? T.navySoft : T.sageSoft, color: owner.role === "admin" ? T.navy : T.sage }}>
                    {getUserInitials(owner.name)}
                  </div>
                  <span className="text-[11px]" style={{ color: T.inkSoft }}>{owner.name}</span>
                </div>
              )}
            </div>
            <p className="text-sm" style={{ color: T.inkSoft }}>{client.industry}</p>
            <div className="flex items-center gap-4 mt-2 text-[12px] flex-wrap" style={{ color: T.inkSoft }}>
              <span className="flex items-center gap-1"><MapPin size={11} />{client.city}, {client.country}</span>
              {client.website && <span className="flex items-center gap-1"><Globe size={11} />{client.website}</span>}
              <span className="flex items-center gap-1"><Users size={11} />{client.employees} karyawan</span>
              <span className="flex items-center gap-1"><Tag size={11} />{client.source}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-3">
              {client.tags.map((tag) => <span key={tag} className="text-[11px] px-2 py-0.5 rounded" style={{ background: T.navySoft, color: T.navy }}>{tag}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor: T.rule }}>
        {[{ id: "overview", label: "Overview" }, { id: "contacts", label: `Kontak (${contacts.length})` }, { id: "deals", label: `Deal (${deals.length})` }, { id: "activity", label: `Aktivitas (${activities.length})` }].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2.5 text-[13px] transition-colors" style={{ color: tab === t.id ? T.navy : T.inkSoft, fontWeight: tab === t.id ? 500 : 400, borderBottom: tab === t.id ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-3 gap-3">
          <Panel title="Catatan & briefing" icon={FileText} accent={T.sage} className="col-span-2">
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{client.notes || "Belum ada catatan."}</p>
          </Panel>
          <Panel title="Statistik" icon={Activity} accent={T.navy}>
            <div className="space-y-3">
              <Stat label="Total deal value" value={formatIDR(deals.reduce((s, d) => s + d.value, 0))} />
              <Stat label="Deal aktif" value={`${deals.filter((d) => d.stage !== "won").length} deal`} />
              <Stat label="Closed won" value={`${deals.filter((d) => d.stage === "won").length} deal`} />
              <Stat label="Aktivitas total" value={`${activities.length} interaksi`} />
              <Stat label="Klien sejak" value={formatDate(client.createdAt)} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "contacts" && (
        <div>
          {canEdit && (
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowAddContact(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                <Plus size={13} /> Tambah kontak
              </button>
            </div>
          )}
          {contacts.length === 0 ? (
            <div className="py-12 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <Users size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: T.inkSoft }}>Belum ada kontak person untuk klien ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {contacts.map((c) => <ContactCard key={c.id} contact={c} onEdit={() => canEdit && setEditingContact(c)} onDelete={() => canEdit && handleDeleteContact(c.id)} canEdit={canEdit} />)}
            </div>
          )}
        </div>
      )}

      {tab === "deals" && (
        <div className="grid grid-cols-1 gap-2">
          {deals.length === 0 ? (
            <div className="py-12 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <Briefcase size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: T.inkSoft }}>Belum ada deal aktif</p>
            </div>
          ) : deals.map((d) => <DealRow key={d.id} deal={d} owner={users.find((u) => u.id === d.ownerId)} />)}
        </div>
      )}

      {tab === "activity" && (
        <div>
          {canEdit && (
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowAddActivity(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                <Plus size={13} /> Catat aktivitas
              </button>
            </div>
          )}
          <div className="rounded-xl" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
            {activities.length === 0 ? (
              <div className="py-12 text-center"><p className="text-sm" style={{ color: T.inkSoft }}>Belum ada aktivitas tercatat</p></div>
            ) : activities.map((a, idx) => (
              <div key={a.id} className={`p-4 ${idx !== activities.length - 1 ? "border-b" : ""}`} style={{ borderColor: T.ruleSoft }}>
                <div className="flex items-start gap-3">
                  <ActivityIcon type={a.type} />
                  <div className="flex-1">
                    <p className="text-[13px] font-medium" style={{ color: T.ink }}>{a.title}</p>
                    <p className="text-[12px] mt-1 leading-relaxed" style={{ color: T.inkSoft }}>{a.body}</p>
                    <p className="text-[11px] mt-1.5" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{formatDateTime(a.at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalOpen && <ClientModal client={editingClient} onSave={onSaveEdit} onClose={onCloseEdit} currentUser={currentUser} users={users} />}
      {(showAddContact || editingContact) && <ContactModal contact={editingContact} onSave={handleSaveContact} onClose={() => { setShowAddContact(false); setEditingContact(null); }} />}
      {showAddActivity && <ActivityModal onSave={handleAddActivity} onClose={() => setShowAddActivity(false)} />}
      {showWaModal && <WhatsAppSendModal client={client} contacts={phoneContacts} currentUser={currentUser} onClose={() => setShowWaModal(false)} onLog={(actData) => setActivities((prev) => [{ ...actData, id: newId("act"), clientId: client.id, at: new Date().toISOString() }, ...prev])} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b last:border-0" style={{ borderColor: T.ruleSoft }}>
      <span className="text-[11px]" style={{ color: T.inkSoft }}>{label}</span>
      <span className="text-[12px] font-medium" style={{ color: T.ink, fontFamily: FONT_MONO }}>{value}</span>
    </div>
  );
}

function ContactCard({ contact, onEdit, onDelete, canEdit }) {
  return (
    <div className="rounded-xl p-4 group" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-medium flex-shrink-0" style={{ background: T.navySoft, color: T.navy }}>
          {getUserInitials(contact.name)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{contact.name}</p>
            {contact.isDecisionMaker && <Star size={11} style={{ color: T.amber, fill: T.amber }} />}
          </div>
          <p className="text-[11px]" style={{ color: T.inkSoft }}>{contact.role}</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
          </div>
        )}
      </div>
      <div className="space-y-1.5 pt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        {contact.email && <div className="flex items-center gap-2 text-[11px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}><Mail size={10} />{contact.email}</div>}
        {contact.phone && <div className="flex items-center gap-2 text-[11px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}><Phone size={10} />{contact.phone}</div>}
        {contact.notes && <p className="text-[11px] mt-2 leading-relaxed" style={{ color: T.inkFaint }}>{contact.notes}</p>}
      </div>
    </div>
  );
}

function DealRow({ deal, owner }) {
  const stage = PIPELINE_STAGES.find((s) => s.id === deal.stage);
  return (
    <div className="rounded-lg p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-[13px] font-medium" style={{ color: T.ink }}>{deal.title}</p>
          <div className="flex items-center gap-3 mt-1 text-[11px] flex-wrap" style={{ color: T.inkSoft }}>
            <span>Close: {formatDate(deal.closeDate)}</span>
            <span>Probability: {deal.probability}%</span>
            {owner && <span className="flex items-center gap-1">Owner: <span style={{ color: T.ink, fontWeight: 500 }}>{owner.name}</span></span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[14px] font-semibold" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatIDR(deal.value)}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block uppercase tracking-wider" style={{ background: T.surfaceAlt, color: stage ? stage.color : T.inkSoft, fontFamily: FONT_MONO }}>{stage ? stage.label : deal.stage}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 pt-2 border-t" style={{ borderColor: T.ruleSoft }}>
        {deal.services.map((s) => <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: T.navySoft, color: T.navy }}>{s}</span>)}
      </div>
    </div>
  );
}

/* ============== MODALS ============== */
function Modal({ children, onClose, maxWidth = "max-w-lg" }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(15,20,25,0.5)" }}>
      <div className={`w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-xl`} style={{ background: T.surface, border: `1px solid ${T.rule}` }}>{children}</div>
    </div>
  );
}

function ClientModal({ client, onSave, onClose, currentUser, users }) {
  const [form, setForm] = useState(client || { name: "", industry: "", country: "Indonesia", city: "", website: "", employees: "100-500", tags: [], health: "warm", source: "Manual", notes: "", ownerId: currentUser.id });
  const [tagInput, setTagInput] = useState("");
  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...form.tags, tagInput.trim()] });
      setTagInput("");
    }
  };
  const isAdmin = currentUser.role === "admin";
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{client ? "Edit klien" : "Tambah klien baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Nama perusahaan" required>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Industri">
            <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="contoh: Manufaktur - Baja" style={inputStyle} />
          </FormField>
          <FormField label="Status">
            <select value={form.health} onChange={(e) => setForm({ ...form, health: e.target.value })} style={inputStyle}>
              <option value="hot">Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </FormField>
        </div>
        {isAdmin && (
          <FormField label="Owner / penanggung jawab">
            <select value={form.ownerId || currentUser.id} onChange={(e) => setForm({ ...form, ownerId: e.target.value })} style={inputStyle}>
              {users.filter((u) => u.active).map((u) => <option key={u.id} value={u.id}>{u.name} ({roleLabel(u.role)})</option>)}
            </select>
          </FormField>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Negara"><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} style={inputStyle} /></FormField>
          <FormField label="Kota"><input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Website"><input type="text" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="example.com" style={inputStyle} /></FormField>
          <FormField label="Karyawan">
            <select value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} style={inputStyle}>
              <option>1-50</option><option>50-100</option><option>100-500</option><option>500-1000</option><option>1000-5000</option><option>5000+</option>
            </select>
          </FormField>
        </div>
        <FormField label="Sumber prospek">
          <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={inputStyle}>
            <option>Manual</option><option>LPSE</option><option>INAPROC</option><option>LinkedIn signal</option><option>Sales Navigator</option><option>Vendor portal</option><option>Existing client</option><option>Referral</option><option>Webinar</option>
          </select>
        </FormField>
        <FormField label="Tag">
          <div className="flex gap-2 mb-2">
            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="contoh: SMK3, ISO 45001…" style={inputStyle} />
            <button onClick={addTag} className="px-3 py-2 rounded-md text-sm flex-shrink-0" style={{ background: T.navySoft, color: T.navy }}>Tambah</button>
          </div>
          <div className="flex flex-wrap gap-1">
            {form.tags.map((tag) => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded inline-flex items-center gap-1" style={{ background: T.navySoft, color: T.navy }}>
                {tag}
                <button onClick={() => setForm({ ...form, tags: form.tags.filter((t) => t !== tag) })}><X size={10} /></button>
              </span>
            ))}
          </div>
        </FormField>
        <FormField label="Catatan & briefing">
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} />
        </FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.name.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan klien
        </button>
      </div>
    </Modal>
  );
}

function ContactModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState(contact || { name: "", role: "", email: "", phone: "", isDecisionMaker: false, notes: "" });
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{contact ? "Edit kontak" : "Tambah kontak baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Nama lengkap" required><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></FormField>
        <FormField label="Jabatan / role"><input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="contoh: HSE Manager" style={inputStyle} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} /></FormField>
          <FormField label="Telepon / WA"><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+62 ..." style={inputStyle} /></FormField>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isDecisionMaker} onChange={(e) => setForm({ ...form, isDecisionMaker: e.target.checked })} />
          <span className="text-[13px]" style={{ color: T.ink }}>Decision maker</span>
        </label>
        <FormField label="Catatan"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} /></FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.name.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan kontak
        </button>
      </div>
    </Modal>
  );
}

function ActivityModal({ onSave, onClose }) {
  const [form, setForm] = useState({ type: "note", title: "", body: "" });
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Catat aktivitas</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Tipe">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={inputStyle}>
            <option value="email">Email</option><option value="meeting">Meeting</option><option value="call">Telepon</option><option value="note">Catatan</option>
          </select>
        </FormField>
        <FormField label="Judul" required><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} /></FormField>
        <FormField label="Detail"><textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} /></FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.title.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.title.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan
        </button>
      </div>
    </Modal>
  );
}

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1.5" style={{ color: T.ink }}>
        {label} {required && <span style={{ color: T.red }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = { width: "100%", padding: "8px 12px", fontSize: "13px", borderRadius: "6px", border: `1px solid ${T.rule}`, background: T.surface, color: T.ink, outline: "none" };

/* ============== PIPELINE VIEW ============== */
function PipelineView({ deals, allDeals, setDeals, clients, currentUser, users, onOpenClient }) {
  const dealsByStage = useMemo(() => {
    const out = {};
    PIPELINE_STAGES.forEach((s) => { out[s.id] = deals.filter((d) => d.stage === s.id); });
    return out;
  }, [deals]);
  const totalByStage = useMemo(() => {
    const out = {};
    PIPELINE_STAGES.forEach((s) => { out[s.id] = dealsByStage[s.id].reduce((sum, d) => sum + d.value, 0); });
    return out;
  }, [dealsByStage]);
  const moveStage = (dealId, newStage) => {
    const target = allDeals.find((d) => d.id === dealId);
    if (!target) return;
    if (currentUser.role !== "admin" && target.ownerId !== currentUser.id) return;
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d)));
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Pipeline</h1>
        <p className="text-sm mt-1" style={{ color: T.inkSoft }}>Drag deal untuk pindah tahap · {deals.length} deal {currentUser.role === "sales" ? "milik Anda" : "total"}</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {PIPELINE_STAGES.map((stage) => <KanbanColumn key={stage.id} stage={stage} deals={dealsByStage[stage.id]} total={totalByStage[stage.id]} clients={clients} users={users} currentUser={currentUser} onMove={moveStage} onOpenClient={onOpenClient} />)}
      </div>
    </div>
  );
}

function KanbanColumn({ stage, deals, total, clients, users, currentUser, onMove, onOpenClient }) {
  const [draggedOver, setDraggedOver] = useState(false);
  return (
    <div onDragOver={(e) => { e.preventDefault(); setDraggedOver(true); }} onDragLeave={() => setDraggedOver(false)} onDrop={(e) => { e.preventDefault(); setDraggedOver(false); const dealId = e.dataTransfer.getData("dealId"); if (dealId) onMove(dealId, stage.id); }} className="rounded-xl flex flex-col" style={{ background: draggedOver ? T.surfaceAlt : T.surface, border: `1px solid ${draggedOver ? stage.color : T.rule}`, minHeight: "400px" }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: T.ruleSoft }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[12px] font-medium uppercase tracking-wider" style={{ color: stage.color, fontFamily: FONT_MONO }}>{stage.label}</p>
          <span className="text-[11px]" style={{ color: T.inkFaint }}>{deals.length}</span>
        </div>
        <p className="text-[12px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{formatIDR(total)}</p>
      </div>
      <div className="p-2 flex-1 space-y-2">
        {deals.map((d) => {
          const client = clients.find((c) => c.id === d.clientId);
          const owner = users.find((u) => u.id === d.ownerId);
          return <DealCard key={d.id} deal={d} client={client} owner={owner} onOpenClient={onOpenClient} showOwner={currentUser.role === "admin"} />;
        })}
        {deals.length === 0 && <div className="py-8 text-center"><p className="text-[11px]" style={{ color: T.inkFaint }}>Kosong</p></div>}
      </div>
    </div>
  );
}

function DealCard({ deal, client, owner, onOpenClient, showOwner }) {
  return (
    <div draggable onDragStart={(e) => e.dataTransfer.setData("dealId", deal.id)} onClick={() => client && onOpenClient(client.id)} className="rounded-lg p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <p className="text-[12px] font-medium leading-tight mb-1.5" style={{ color: T.ink }}>{deal.title}</p>
      <p className="text-[11px] mb-2 truncate" style={{ color: T.inkSoft }}>{client ? client.name : "—"}</p>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatIDR(deal.value)}</span>
        <span className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{deal.probability}%</span>
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1 text-[10px]" style={{ color: T.inkFaint }}>
          <Clock size={9} /> {formatDate(deal.closeDate)}
        </div>
        {showOwner && owner && (
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: owner.role === "admin" ? T.navySoft : T.sageSoft, color: owner.role === "admin" ? T.navy : T.sage }} title={owner.name}>
            {getUserInitials(owner.name)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== AI COPILOT PAGE ============== */
function CopilotPage({ onOpenAi, clients, currentUser }) {
  const prompts = [
    { icon: Mail, label: "Tulis cold email", prompt: "Tulis cold email yang dipersonalisasi untuk salah satu klien hot di pipeline. Pilih yang paling relevan dan jelaskan kenapa." },
    { icon: FileText, label: "Draft proposal", prompt: "Buatkan kerangka proposal teknis dan komersial untuk audit SMK3 di perusahaan manufaktur skala besar." },
    { icon: Target, label: "Strategi outreach", prompt: "Susun strategi multi-channel outreach (email + LinkedIn + WhatsApp) selama 14 hari untuk decision maker di sektor pertambangan." },
    { icon: Globe, label: "Translate ke EN/AR", prompt: "Terjemahkan paragraf proposal ke Bahasa Inggris formal untuk klien internasional di Timur Tengah." },
    { icon: TrendingUp, label: "Analisa peluang", prompt: "Lihat klien-klien yang berstatus hot di pipeline saya. Berikan analisa peluang dan prioritas dalam 48 jam ke depan." },
    { icon: MessageSquare, label: "Discovery questions", prompt: "Susun 10 pertanyaan discovery yang harus saya tanyakan di meeting kick-off dengan klien O&G yang baru hire SHE Manager." },
  ];
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: T.navySoft }}>
            <Sparkles size={18} style={{ color: T.navy }} />
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>AI Copilot Studio</h1>
        </div>
        <p className="text-sm" style={{ color: T.inkSoft }}>Powered by Claude · Bahasa Indonesia native · Tahu konteks Nusa Safety</p>
      </div>
      <div className="rounded-xl p-6 mb-6" style={{ background: T.navy, color: "#fff" }}>
        <Bot size={28} className="mb-3" style={{ color: "#fff", opacity: 0.9 }} />
        <h2 className="text-[18px] font-semibold mb-2">Apa yang bisa saya bantu, {currentUser.name.split(" ")[0]}?</h2>
        <p className="text-[13px] opacity-90 mb-4 max-w-2xl">Saya tahu layanan Nusa Safety, {clients.length} klien {currentUser.role === "sales" ? "milik Anda" : "di sistem"}, dan target pasar Indonesia + internasional.</p>
        <button onClick={() => onOpenAi(null)} className="px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2" style={{ background: "#fff", color: T.navy }}>
          <MessageSquare size={14} /> Mulai chat baru
        </button>
      </div>
      <p className="text-[11px] uppercase tracking-wider mb-3" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Quick prompts</p>
      <div className="grid grid-cols-3 gap-3">
        {prompts.map((p) => (
          <button key={p.label} onClick={() => onOpenAi({ type: "quick", prompt: p.prompt })} className="rounded-xl p-4 text-left transition-all hover:shadow-sm" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
            <div className="w-9 h-9 rounded-md flex items-center justify-center mb-3" style={{ background: T.navySoft }}><p.icon size={15} style={{ color: T.navy }} /></div>
            <p className="text-[13px] font-medium mb-1" style={{ color: T.ink }}>{p.label}</p>
            <p className="text-[11px] leading-relaxed" style={{ color: T.inkSoft }}>{p.prompt.slice(0, 80)}…</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============== AI COPILOT DRAWER ============== */
function AICopilotDrawer({ open, onClose, context, clients, contacts, deals, activities, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (!context) {
      const firstName = currentUser ? currentUser.name.split(" ")[0] : "Daddy";
      setMessages([{ role: "assistant", content: `Halo ${firstName}! Saya AI Copilot Nusa Snipe. Saya tahu klien Anda, layanan Nusa Safety, dan konteks pasar QHSE Indonesia + internasional. Mau dibantu apa?` }]);
      return;
    }
    if (context.type === "client") {
      const c = context.client;
      const clientContacts = contacts.filter((ct) => ct.clientId === c.id);
      const clientDeals = deals.filter((d) => d.clientId === c.id);
      const clientActivities = activities.filter((a) => a.clientId === c.id);
      const summary = `Saya sedang melihat klien: **${c.name}** (${c.industry}, ${c.city} ${c.country}). Status: ${c.health}. Kontak: ${clientContacts.length}. Deal aktif: ${clientDeals.filter((d) => d.stage !== "won").length} (nilai ${formatIDR(clientDeals.reduce((s, d) => s + d.value, 0))}). Aktivitas: ${clientActivities.length} interaksi.\n\nApa yang Anda butuhkan? Contoh: tulis cold email, draft proposal, ringkas histori, strategi follow-up.`;
      setMessages([{ role: "assistant", content: summary }]);
    } else if (context.type === "quick") {
      setMessages([]);
      setInput(context.prompt);
      setTimeout(() => sendMessage(context.prompt), 100);
    }
  }, [open, context, currentUser]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const sendMessage = useCallback(async (textOverride) => {
    const text = (textOverride !== undefined ? textOverride : input).trim();
    if (!text || loading) return;
    setInput("");
    setError(null);
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    const userContextString = currentUser ? `\n\nPENGGUNA AKTIF:\nNama: ${currentUser.name}\nRole: ${roleLabel(currentUser.role)}\nEmail: ${currentUser.email}\n${currentUser.role === "sales" ? "Catatan: User ini sales, hanya akses klien yang menjadi tanggung jawabnya." : "Catatan: User ini admin, melihat seluruh data perusahaan."}` : "";

    const clientContextString = context && context.type === "client" ? `\n\nKONTEKS KLIEN AKTIF:\n${JSON.stringify({
      nama: context.client.name, industri: context.client.industry, lokasi: `${context.client.city}, ${context.client.country}`,
      status: context.client.health, tags: context.client.tags, catatan: context.client.notes,
      kontak: contacts.filter((c) => c.clientId === context.client.id).map((c) => ({ nama: c.name, role: c.role, decisionMaker: c.isDecisionMaker })),
      deal: deals.filter((d) => d.clientId === context.client.id).map((d) => ({ judul: d.title, nilai: d.value, tahap: d.stage })),
    }, null, 2)}` : "";

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          system: NUSA_SAFETY_CONTEXT + userContextString + clientContextString,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API error ${response.status}: ${errText.slice(0, 200)}`);
      }
      const data = await response.json();
      const replyText = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "Maaf, tidak ada respons valid.";
      setMessages((prev) => [...prev, { role: "assistant", content: replyText }]);
    } catch (err) {
      setError(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, context, contacts, deals, currentUser]);

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-30" style={{ background: "rgba(15,20,25,0.3)" }} />
      <aside className="fixed right-0 top-0 bottom-0 z-40 w-[440px] flex flex-col" style={{ background: T.canvas, borderLeft: `1px solid ${T.rule}` }}>
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: T.surface, borderColor: T.rule }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: T.navy }}>
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: T.ink }}>AI Copilot</p>
              <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{currentUser ? currentUser.name.toUpperCase() : "POWERED BY CLAUDE"}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md transition-colors hover:bg-gray-100" aria-label="Close"><X size={16} style={{ color: T.inkSoft }} /></button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => <ChatMessage key={idx} role={m.role} content={m.content} />)}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: T.navy }}>
                <Sparkles size={12} color="#fff" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
                <Loader2 size={13} className="animate-spin" style={{ color: T.navy }} />
                <span className="text-[12px]" style={{ color: T.inkSoft }}>Berpikir…</span>
              </div>
            </div>
          )}
          {error && (
            <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
              <AlertCircle size={14} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[12px] font-medium" style={{ color: T.red }}>Error</p>
                <p className="text-[11px] mt-0.5" style={{ color: T.red }}>{error}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t" style={{ background: T.surface, borderColor: T.rule }}>
          <div className="flex items-end gap-2">
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Tanya apa saja… (Shift+Enter untuk baris baru)" rows={2} className="flex-1 px-3 py-2 text-[13px] rounded-md outline-none resize-none" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}`, color: T.ink }} disabled={loading} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="p-2.5 rounded-md text-white disabled:opacity-40" style={{ background: T.navy }} aria-label="Send"><Send size={14} /></button>
          </div>
          <p className="text-[10px] mt-2" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>
            CTX: {context && context.type === "client" ? `KLIEN ${context.client.name.toUpperCase()}` : "GENERAL"} · USER: {currentUser ? roleLabel(currentUser.role).toUpperCase() : "—"} · MODEL: CLAUDE-SONNET-4-6
          </p>
        </div>
      </aside>
    </>
  );
}

/* Lightweight markdown renderer — turns **bold**, lists, headings, --- into clean UI */
function mdInline(text, kp) {
  const out = [];
  const re = /(\*\*([^*]+?)\*\*|__([^_]+?)__|`([^`]+?)`|\*([^*\n]+?)\*)/g;
  let last = 0, m, i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2] !== undefined || m[3] !== undefined) out.push(<strong key={`${kp}-b${i}`} style={{ fontWeight: 600 }}>{m[2] !== undefined ? m[2] : m[3]}</strong>);
    else if (m[4] !== undefined) out.push(<code key={`${kp}-c${i}`} style={{ fontFamily: FONT_MONO, fontSize: "0.9em", background: T.surfaceAlt, padding: "1px 4px", borderRadius: "4px" }}>{m[4]}</code>);
    else if (m[5] !== undefined) out.push(<em key={`${kp}-i${i}`}>{m[5]}</em>);
    last = m.index + m[0].length; i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function MarkdownLite({ text, color }) {
  if (!text) return null;
  const lines = String(text).replace(/\r/g, "").split("\n");
  const blocks = [];
  let para = [], list = null;
  const flushPara = () => { if (para.length) { blocks.push({ t: "p", lines: para.slice() }); para = []; } };
  const flushList = () => { if (list) { blocks.push(list); list = null; } };
  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, "");
    if (line.trim() === "") { flushPara(); flushList(); return; }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) { flushPara(); flushList(); blocks.push({ t: "hr" }); return; }
    const h = line.match(/^\s*(#{1,4})\s+(.*)$/);
    if (h) { flushPara(); flushList(); blocks.push({ t: "h", lvl: h[1].length, text: h[2] }); return; }
    const b = line.match(/^\s*[-*•]\s+(.*)$/);
    if (b) { flushPara(); if (!list || list.t !== "ul") { flushList(); list = { t: "ul", items: [] }; } list.items.push(b[1]); return; }
    const n = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (n) { flushPara(); if (!list || list.t !== "ol") { flushList(); list = { t: "ol", items: [] }; } list.items.push(n[2]); return; }
    flushList(); para.push(line);
  });
  flushPara(); flushList();
  const c = color || T.ink;
  return (
    <div className="space-y-2">
      {blocks.map((blk, i) => {
        if (blk.t === "hr") return <div key={i} style={{ height: 1, background: T.ruleSoft, margin: "6px 0" }} />;
        if (blk.t === "h") {
          const sz = blk.lvl <= 1 ? 15 : blk.lvl === 2 ? 14 : 13;
          return <p key={i} className="font-semibold" style={{ color: c, fontSize: `${sz}px`, marginTop: i ? "4px" : 0 }}>{mdInline(blk.text, `h${i}`)}</p>;
        }
        if (blk.t === "ul") return (
          <ul key={i} className="space-y-1">
            {blk.items.map((it, j) => (
              <li key={j} className="flex gap-2 text-[13px] leading-relaxed" style={{ color: c }}>
                <span style={{ color: T.inkFaint }}>•</span><span className="flex-1">{mdInline(it, `ul${i}-${j}`)}</span>
              </li>
            ))}
          </ul>
        );
        if (blk.t === "ol") return (
          <ol key={i} className="space-y-1">
            {blk.items.map((it, j) => (
              <li key={j} className="flex gap-2 text-[13px] leading-relaxed" style={{ color: c }}>
                <span className="font-medium" style={{ color: T.navy, minWidth: "16px" }}>{j + 1}.</span><span className="flex-1">{mdInline(it, `ol${i}-${j}`)}</span>
              </li>
            ))}
          </ol>
        );
        return (
          <p key={i} className="text-[13px] leading-relaxed" style={{ color: c }}>
            {blk.lines.map((ln, j) => (
              <span key={j}>{mdInline(ln, `p${i}-${j}`)}{j < blk.lines.length - 1 ? <br /> : null}</span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function ChatMessage({ role, content }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] px-3 py-2 rounded-lg" style={{ background: T.navy, color: "#fff" }}>
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 group">
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: T.navy }}>
        <Sparkles size={12} color="#fff" />
      </div>
      <div className="flex-1 max-w-[85%] rounded-lg p-3" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <MarkdownLite text={content} />
        <button onClick={handleCopy} className="mt-2 text-[10px] flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>
          {copied ? <CheckCircle2 size={10} /> : <Copy size={10} />}
          {copied ? "TERSALIN" : "SALIN"}
        </button>
      </div>
    </div>
  );
}

/* ============== SETTINGS VIEW ============== */
function SettingsView({ currentUser, company, onOpenCompany, onOpenProfile, onResetData }) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Pengaturan</h1>
        <p className="text-sm mt-1" style={{ color: T.inkSoft }}>Konfigurasi Nusa Snipe</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Panel title="Akun Anda" icon={UserCheck} accent={T.navy}>
          <div className="flex items-center gap-3 mb-3">
            <Avatar user={currentUser} size={48} />
            <div>
              <p className="text-[14px] font-semibold" style={{ color: T.ink }}>{currentUser.name}</p>
              <p className="text-[11px]" style={{ color: T.inkSoft }}>{currentUser.position || roleLabel(currentUser.role)}</p>
            </div>
          </div>
          <div className="space-y-2.5">
            <Stat label="Email" value={currentUser.email} />
            <Stat label="No. HP" value={currentUser.phone || "—"} />
            <Stat label="Role" value={roleLabel(currentUser.role)} />
            <Stat label="Bergabung" value={formatDate(currentUser.createdAt)} />
          </div>
          <button onClick={onOpenProfile} className="w-full mt-3 py-2 rounded-md text-[12px] flex items-center justify-center gap-1.5" style={{ background: T.surfaceAlt, color: T.navy }}>
            <Edit3 size={12} /> Edit profil saya
          </button>
        </Panel>
        <Panel title="Perusahaan" icon={Building2} accent={T.navy}>
          <div className="space-y-2.5">
            <Stat label="Nama" value={COMPANY_CONFIG.legalName} />
            <Stat label="NIB" value={COMPANY_CONFIG.nib} />
            <Stat label="NPWP" value={COMPANY_CONFIG.npwp} />
            <Stat label="Rekening" value={`${COMPANY_CONFIG.bankName} · ${COMPANY_CONFIG.bankAccount}`} />
            <Stat label="Email" value={COMPANY_CONFIG.email} />
            <Stat label="Sertifikasi" value={COMPANY_CONFIG.certifications.join(", ")} />
          </div>
          <button onClick={onOpenCompany} className="w-full mt-3 py-2 rounded-md text-[12px] flex items-center justify-center gap-1.5" style={{ background: T.surfaceAlt, color: T.navy }}>
            <Building2 size={12} /> Buka & edit profil perusahaan
          </button>
        </Panel>
        <Panel title="AI Copilot" icon={Sparkles} accent={T.navy}>
          <div className="space-y-2.5">
            <Stat label="Model" value="claude-sonnet-4-6" />
            <Stat label="Max tokens" value="1500" />
            <Stat label="Konteks" value="Nusa Safety + user" />
            <Stat label="Bahasa" value="Indonesia primary" />
          </div>
        </Panel>
        <Panel title="Keamanan" icon={ShieldCheck} accent={T.amber}>
          <div className="rounded-md p-3 mb-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
            <p className="text-[11px] leading-relaxed" style={{ color: T.amber }}>
              <strong>Prototype mode:</strong> Password disimpan dengan SHA-256 di client. Untuk produksi, ganti dengan bcrypt server-side + httpOnly cookies (lihat catatan deploy di bawah).
            </p>
          </div>
          <div className="space-y-2.5">
            <Stat label="Hashing" value="SHA-256 (prototype)" />
            <Stat label="Session storage" value="window.storage" />
            <Stat label="RBAC" value="admin / sales" />
          </div>
        </Panel>
        <Panel title="Catatan deployment ke produksi" icon={AlertCircle} accent={T.red} className="col-span-2">
          <div className="grid grid-cols-2 gap-4 text-[12px]" style={{ color: T.inkSoft }}>
            <div>
              <p className="font-medium mb-1.5" style={{ color: T.ink }}>1. Auth server-side</p>
              <p className="leading-relaxed">Pindahkan SHA-256 client-side ke bcrypt server-side di /api/auth/login. Pakai NextAuth.js atau Lucia Auth dengan httpOnly cookies.</p>
            </div>
            <div>
              <p className="font-medium mb-1.5" style={{ color: T.ink }}>2. RBAC di API routes</p>
              <p className="leading-relaxed">Filter ownership di /api/clients dan /api/deals (server-side), jangan hanya di client. Ini critical security.</p>
            </div>
            <div>
              <p className="font-medium mb-1.5" style={{ color: T.ink }}>3. AI proxy</p>
              <p className="leading-relaxed">Buat /api/ai/route.js untuk proxy panggilan Anthropic. Jangan expose API key di client. Inject currentUser dari session.</p>
            </div>
            <div>
              <p className="font-medium mb-1.5" style={{ color: T.ink }}>4. Upstash Redis</p>
              <p className="leading-relaxed">Setup 4 env var (KV_REST_API_URL, KV_REST_API_TOKEN, APP_API_TOKEN, NEXT_PUBLIC_API_TOKEN) seperti AIRA & HazidApp.</p>
            </div>
          </div>
        </Panel>
        <Panel title="Roadmap & Status" icon={Workflow} accent={T.sage} className="col-span-2">
          <div className="grid grid-cols-4 gap-3 text-[12px]">
            <div>
              <p className="font-medium mb-1" style={{ color: T.sage }}>✓ v0.3 Outreach</p>
              <p style={{ color: T.inkSoft }}>Email campaign builder, templates, sequence, enrollment</p>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: T.sage }}>✓ v0.4a WhatsApp</p>
              <p style={{ color: T.inkSoft }}>WA step di campaign, Quick Send dari klien, wa.me link</p>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: T.sage }}>✓ v0.4b Booking</p>
              <p style={{ color: T.inkSoft }}>Meeting types, scheduler, public booking link generator</p>
            </div>
            <div>
              <p className="font-medium mb-1" style={{ color: T.sage }}>✓ v1.0 Hunter + Inbox</p>
              <p style={{ color: T.inkSoft }}>AI signal hunter (LinkedIn/LPSE/INAPROC/news), inbox reply tracking</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t" style={{ borderColor: T.ruleSoft }}>
            <p className="text-[12px] font-medium mb-1" style={{ color: T.ink }}>🎯 Next milestone — Production deployment</p>
            <p className="text-[11px] leading-relaxed" style={{ color: T.inkSoft }}>Migrate ke Next.js + Vercel + Upstash Redis. Integrasi real ESP (Resend/Brevo), WhatsApp BSP (Wati/Qiscus), Google Calendar API, NextAuth.js, dan cron job untuk sequence runner.</p>
          </div>
        </Panel>

        {currentUser.role === "admin" && onResetData && (
          <Panel title="Zona Berbahaya" icon={AlertCircle} accent={T.red} className="col-span-2">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[280px]">
                <p className="text-[13px] font-medium mb-1" style={{ color: T.ink }}>Reset & mulai dari awal</p>
                <p className="text-[11px] leading-relaxed" style={{ color: T.inkSoft }}>Menghapus semua data operasional (klien, kontak, deal, proposal, penagihan, sinyal, booking, kampanye, template, aktivitas) supaya Anda mulai dari nol dengan data asli. <strong style={{ color: T.ink }}>Profil perusahaan & akun pengguna tetap aman.</strong> Cocok dipakai sekali setelah deploy untuk membersihkan data contoh.</p>
              </div>
              <button onClick={onResetData} className="px-4 py-2.5 rounded-md text-sm text-white flex items-center gap-1.5 flex-shrink-0" style={{ background: T.red }}>
                <Trash2 size={14} /> Hapus semua data operasional
              </button>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* ============== LOGIN SCREEN ============== */
function LoginScreen({ users, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Email dan password harus diisi.");
      return;
    }
    setSubmitting(true);
    try {
      const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!user) {
        setError("Email tidak ditemukan.");
        setSubmitting(false);
        return;
      }
      if (!user.active) {
        setError("Akun Anda non-aktif. Hubungi admin.");
        setSubmitting(false);
        return;
      }
      const hash = await hashPassword(password);
      if (hash !== user.passwordHash) {
        setError("Password salah.");
        setSubmitting(false);
        return;
      }
      onLogin(user);
    } catch (err) {
      setError("Terjadi kesalahan: " + (err.message || "unknown"));
      setSubmitting(false);
    }
  };

  const quickLogin = (u) => {
    setEmail(u.email);
    setPassword(u.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: T.canvas, fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: T.navy }}>
            <NusaSnipeLogo size={28} color="#fff" />
          </div>
          <div>
            <p className="text-[20px] font-semibold leading-tight tracking-tight" style={{ color: T.ink }}>Nusa Snipe</p>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>NUSA SAFETY · AI SALES INTELLIGENCE</p>
          </div>
        </div>

        <div className="rounded-xl p-6 mb-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <h1 className="text-[20px] font-semibold tracking-tight mb-1" style={{ color: T.ink }}>Selamat datang kembali</h1>
          <p className="text-[13px] mb-5" style={{ color: T.inkSoft }}>Masuk ke dashboard Nusa Snipe Anda</p>

          <div className="space-y-3">
            <div>
              <label className="text-[12px] font-medium block mb-1.5" style={{ color: T.ink }}>Email</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
                <AtSign size={14} style={{ color: T.inkFaint }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@nusasafety.id" className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: T.ink }} disabled={submitting} />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium block mb-1.5" style={{ color: T.ink }}>Password</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
                <Lock size={14} style={{ color: T.inkFaint }} />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="••••••••" className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: T.ink }} disabled={submitting} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password">
                  {showPassword ? <EyeOff size={14} style={{ color: T.inkSoft }} /> : <Eye size={14} style={{ color: T.inkSoft }} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 rounded-md p-2.5" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
                <AlertCircle size={13} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
                <p className="text-[12px]" style={{ color: T.red }}>{error}</p>
              </div>
            )}
            <button onClick={handleSubmit} disabled={submitting} className="w-full py-2.5 rounded-md text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60" style={{ background: T.navy }}>
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Memverifikasi…</> : <><KeyRound size={14} /> Masuk</>}
            </button>
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: T.surfaceAlt, border: `1px dashed ${T.rule}` }}>
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Demo credentials · klik untuk auto-fill</p>
          <div className="space-y-1.5">
            {SEED_USERS_RAW.map((u) => (
              <button key={u.id} onClick={() => quickLogin(u)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors hover:bg-white" style={{ background: T.surface, border: `1px solid ${T.ruleSoft}` }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0" style={{ background: u.role === "admin" ? T.navySoft : T.sageSoft, color: u.role === "admin" ? T.navy : T.sage }}>
                  {getUserInitials(u.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate" style={{ color: T.ink }}>{u.name}</p>
                  <p className="text-[10px] truncate" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{u.email} · {u.password}</p>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: u.role === "admin" ? T.navySoft : T.sageSoft, color: u.role === "admin" ? T.navy : T.sage, fontFamily: FONT_MONO }}>
                  {roleLabel(u.role)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-[10px] text-center mt-6" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>
          {COMPANY_CONFIG.legalName.toUpperCase()} · {COMPANY_CONFIG.brandName.toUpperCase()} · {COMPANY_CONFIG.website.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

/* ============== USERS VIEW (admin only) ============== */
function UsersView({ users, setUsers, currentUser, confirm, clients, deals, onUpdateSelf }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPwdUser, setResetPwdUser] = useState(null);

  const handleSaveUser = async (data) => {
    if (data.id) {
      const patch = { id: data.id, name: data.name, email: data.email, role: data.role, position: data.position || "", phone: data.phone || "", photo: data.photo || "" };
      if (data.id === currentUser.id && onUpdateSelf) onUpdateSelf(patch);
      else setUsers((prev) => prev.map((u) => (u.id === data.id ? { ...u, ...patch } : u)));
    } else {
      const hash = await hashPassword(data.password || "changeme123");
      const newUser = {
        id: newId("u"), name: data.name, email: data.email, role: data.role,
        position: data.position || "", phone: data.phone || "", photo: data.photo || "",
        passwordHash: hash, active: true, createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [...prev, newUser]);
    }
    setShowAddModal(false);
    setEditingUser(null);
  };

  const handleResetPassword = async (newPassword) => {
    if (!resetPwdUser) return;
    const hash = await hashPassword(newPassword);
    setUsers((prev) => prev.map((u) => (u.id === resetPwdUser.id ? { ...u, passwordHash: hash } : u)));
    setResetPwdUser(null);
  };

  const handleToggleActive = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (target.id === currentUser.id) {
      await confirm("Anda tidak bisa menonaktifkan akun sendiri.");
      return;
    }
    const ok = await confirm(`${target.active ? "Nonaktifkan" : "Aktifkan kembali"} akun ${target.name}?`);
    if (!ok) return;
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  const handleDelete = async (id) => {
    const target = users.find((u) => u.id === id);
    if (!target) return;
    if (target.id === currentUser.id) {
      await confirm("Anda tidak bisa menghapus akun sendiri.");
      return;
    }
    const ownedClients = clients.filter((c) => c.ownerId === id).length;
    const ownedDeals = deals.filter((d) => d.ownerId === id).length;
    if (ownedClients > 0 || ownedDeals > 0) {
      await confirm(`Tidak bisa hapus: user ini masih memiliki ${ownedClients} klien dan ${ownedDeals} deal. Reassign dulu sebelum hapus.`);
      return;
    }
    const ok = await confirm(`Hapus user ${target.name} permanen?`);
    if (!ok) return;
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Pengguna</h1>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: T.amberSoft, color: T.amber, fontFamily: FONT_MONO }}>
              <ShieldCheck size={10} /> Admin only
            </span>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>{users.length} pengguna terdaftar · {users.filter((u) => u.active).length} aktif</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
          <UserPlus size={14} /> Tambah pengguna
        </button>
      </div>

      <div className="rounded-md p-3 mb-4" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
        <div className="flex items-start gap-2">
          <AlertCircle size={13} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: T.amber }}>
            <strong>Prototype:</strong> Password di-hash dengan SHA-256 client-side. Untuk produksi, ganti dengan bcrypt server-side + httpOnly cookies (lihat catatan di Settings).
          </p>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: T.surfaceAlt }}>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Nama</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Email</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Role</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Klien</th>
              <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Status</th>
              <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => {
              const ownedClients = clients.filter((c) => c.ownerId === u.id).length;
              const isSelf = u.id === currentUser.id;
              return (
                <tr key={u.id} style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar user={u} size={34} />
                      <div>
                        <p className="text-[13px] font-medium" style={{ color: T.ink }}>
                          {u.name} {isSelf && <span className="text-[10px] ml-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>(ANDA)</span>}
                        </p>
                        <p className="text-[10px]" style={{ color: T.inkFaint }}>{u.position || u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1" style={{ background: u.role === "admin" ? T.navySoft : T.sageSoft, color: u.role === "admin" ? T.navy : T.sage, fontFamily: FONT_MONO }}>
                      {u.role === "admin" && <ShieldCheck size={9} />}
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px]" style={{ color: T.inkSoft }}>{ownedClients} klien</td>
                  <td className="px-4 py-3">
                    <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: u.active ? T.sageSoft : T.ruleSoft, color: u.active ? T.sage : T.inkSoft, fontFamily: FONT_MONO }}>
                      {u.active ? "Aktif" : "Non-aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditingUser(u)} className="p-1.5 rounded-md transition-colors hover:bg-gray-100" aria-label="Edit"><Edit3 size={12} style={{ color: T.inkSoft }} /></button>
                      <button onClick={() => setResetPwdUser(u)} className="p-1.5 rounded-md transition-colors hover:bg-gray-100" aria-label="Reset password"><KeyRound size={12} style={{ color: T.amber }} /></button>
                      <button onClick={() => handleToggleActive(u.id)} disabled={isSelf} className="p-1.5 rounded-md transition-colors hover:bg-gray-100 disabled:opacity-30" aria-label="Toggle active">
                        {u.active ? <Eye size={12} style={{ color: T.inkSoft }} /> : <EyeOff size={12} style={{ color: T.inkSoft }} />}
                      </button>
                      <button onClick={() => handleDelete(u.id)} disabled={isSelf} className="p-1.5 rounded-md transition-colors hover:bg-gray-100 disabled:opacity-30" aria-label="Delete"><Trash2 size={12} style={{ color: T.red }} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(showAddModal || editingUser) && <UserModal user={editingUser} onSave={handleSaveUser} onClose={() => { setShowAddModal(false); setEditingUser(null); }} />}
      {resetPwdUser && <ResetPasswordModal user={resetPwdUser} onSave={handleResetPassword} onClose={() => setResetPwdUser(null)} />}
    </div>
  );
}

/* ============== USER MODAL ============== */
function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState(user || { name: "", email: "", role: "sales", password: "changeme123", position: "", phone: "", photo: "" });
  const isNew = !user;
  const fileRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    resizeImageFile(file, 256, 0.82, (dataUrl) => { if (dataUrl) setForm((f) => ({ ...f, photo: dataUrl })); });
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{user ? "Edit pengguna" : "Tambah pengguna baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          <Avatar user={{ name: form.name || "?", role: form.role, photo: form.photo }} size={64} />
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            <div className="flex items-center gap-2">
              <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-1.5 rounded-md text-[12px] flex items-center gap-1.5" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
                <UserPlus size={12} /> {form.photo ? "Ganti foto" : "Upload foto"}
              </button>
              {form.photo && (
                <button onClick={() => setForm((f) => ({ ...f, photo: "" }))} className="px-3 py-1.5 rounded-md text-[12px]" style={{ background: T.surface, color: T.red, border: `1px solid ${T.rule}` }}>Hapus</button>
              )}
            </div>
            <p className="text-[10px] mt-1.5" style={{ color: T.inkFaint }}>Foto otomatis dikecilkan ke 256×256. Tampil di email & dokumen.</p>
          </div>
        </div>
        <FormField label="Nama lengkap" required>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="contoh: Budi Santoso, S.T." />
        </FormField>
        <FormField label="Jabatan / posisi">
          <input type="text" value={form.position || ""} onChange={(e) => setForm({ ...form, position: e.target.value })} style={inputStyle} placeholder="contoh: Marketing & Sales Executive" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email" required>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} placeholder="nama@nusasafety.co.id" />
          </FormField>
          <FormField label="No. HP / WhatsApp">
            <input type="text" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+62 811-xxxx-xxxx" />
          </FormField>
        </div>
        <FormField label="Role" required>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle}>
            <option value="sales">Sales — akses hanya klien sendiri</option>
            <option value="admin">Admin — akses seluruh data + manajemen user</option>
          </select>
        </FormField>
        {isNew && (
          <FormField label="Password awal">
            <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} placeholder="Default: changeme123" />
            <p className="text-[10px] mt-1.5" style={{ color: T.inkFaint }}>User bisa ganti password sendiri di Profil, atau admin reset pakai tombol kunci di tabel.</p>
          </FormField>
        )}
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.email.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.name.trim() && form.email.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan pengguna
        </button>
      </div>
    </Modal>
  );
}

/* ============== RESET PASSWORD MODAL ============== */
function ResetPasswordModal({ user, onSave, onClose }) {
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    setError(null);
    if (newPwd.length < 8) { setError("Password minimal 8 karakter."); return; }
    if (newPwd !== confirmPwd) { setError("Password dan konfirmasi tidak cocok."); return; }
    onSave(newPwd);
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Reset password</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="rounded-md p-3" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
          <div className="flex items-start gap-2">
            <KeyRound size={13} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium" style={{ color: T.amber }}>Reset password untuk {user.name}</p>
              <p className="text-[11px] mt-0.5" style={{ color: T.amber }}>{user.email}</p>
            </div>
          </div>
        </div>
        <FormField label="Password baru" required>
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={inputStyle} placeholder="Min. 8 karakter" autoFocus />
        </FormField>
        <FormField label="Konfirmasi password baru" required>
          <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} style={inputStyle} placeholder="Ulangi password" />
        </FormField>
        {error && (
          <div className="rounded-md p-2.5 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
            <AlertCircle size={13} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[12px]" style={{ color: T.red }}>{error}</p>
          </div>
        )}
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={handleSubmit} disabled={!newPwd || !confirmPwd} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.amber, opacity: newPwd && confirmPwd ? 1 : 0.5 }}>
          <KeyRound size={13} /> Reset password
        </button>
      </div>
    </Modal>
  );
}

/* ============== OUTREACH VIEW (Campaigns + Templates) ============== */
function OutreachView({ campaigns, allCampaigns, setCampaigns, templates, setTemplates, clients, contacts, selectedId, setSelectedId, confirm, currentUser, users, onOpenClient }) {
  const [tab, setTab] = useState("campaigns");
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const selectedCampaign = allCampaigns.find((c) => c.id === selectedId);
  const canEditSelected = selectedCampaign && (currentUser.role === "admin" || selectedCampaign.ownerId === currentUser.id);

  const handleSaveCampaign = (data) => {
    if (data.id) {
      setCampaigns((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    } else {
      const nc = {
        ...data, id: newId("cmp"),
        ownerId: currentUser.id, status: "draft",
        steps: [], enrollments: [],
        createdAt: new Date().toISOString(),
      };
      setCampaigns((prev) => [nc, ...prev]);
    }
    setShowCampaignModal(false);
    setEditingCampaign(null);
  };

  const handleDeleteCampaign = async (id) => {
    const target = allCampaigns.find((c) => c.id === id);
    if (!target) return;
    if (currentUser.role !== "admin" && target.ownerId !== currentUser.id) return;
    const ok = await confirm(`Hapus kampanye "${target.name}"? Semua enrollment akan ikut terhapus.`);
    if (!ok) return;
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleToggleStatus = (id) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== id) return c;
      if (c.status === "active") return { ...c, status: "paused" };
      if (c.status === "paused" || c.status === "draft") return { ...c, status: "active" };
      return c;
    }));
  };

  const handleSaveTemplate = (data) => {
    if (data.id) {
      setTemplates((prev) => prev.map((t) => (t.id === data.id ? { ...t, ...data } : t)));
    } else {
      const nt = { ...data, id: newId("tpl"), ownerId: currentUser.id, createdAt: new Date().toISOString() };
      setTemplates((prev) => [nt, ...prev]);
    }
    setShowTemplateModal(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (id) => {
    const target = templates.find((t) => t.id === id);
    if (!target) return;
    if (currentUser.role !== "admin" && target.ownerId !== currentUser.id) return;
    const ok = await confirm(`Hapus template "${target.name}"?`);
    if (!ok) return;
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  if (selectedCampaign) {
    if (currentUser.role !== "admin" && selectedCampaign.ownerId !== currentUser.id) {
      return (
        <div className="rounded-xl p-12 text-center" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <Lock size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Akses tidak diizinkan</p>
          <p className="text-xs mb-4" style={{ color: T.inkSoft }}>Kampanye ini bukan milik Anda.</p>
          <button onClick={() => setSelectedId(null)} className="px-4 py-2 rounded-md text-sm" style={{ background: T.navy, color: "#fff" }}>Kembali</button>
        </div>
      );
    }
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        setCampaigns={setCampaigns}
        templates={templates}
        clients={clients}
        contacts={contacts}
        users={users}
        currentUser={currentUser}
        canEdit={canEditSelected}
        onBack={() => setSelectedId(null)}
        onEdit={() => canEditSelected && setEditingCampaign(selectedCampaign)}
        onDelete={() => canEditSelected && handleDeleteCampaign(selectedCampaign.id)}
        onOpenClient={onOpenClient}
        confirm={confirm}
        modalOpen={editingCampaign !== null}
        editingCampaign={editingCampaign}
        onSaveEdit={handleSaveCampaign}
        onCloseEdit={() => setEditingCampaign(null)}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Megaphone size={22} style={{ color: T.navy }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Outreach</h1>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>{campaigns.length} kampanye · {campaigns.filter((c) => c.status === "active").length} aktif · {templates.length} template tersedia</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "campaigns" && (
            <button onClick={() => setShowCampaignModal(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
              <Plus size={14} /> Kampanye baru
            </button>
          )}
          {tab === "templates" && (
            <button onClick={() => setShowTemplateModal(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
              <FilePlus size={14} /> Template baru
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 border-b" style={{ borderColor: T.rule }}>
        <button onClick={() => setTab("campaigns")} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === "campaigns" ? T.navy : T.inkSoft, fontWeight: tab === "campaigns" ? 500 : 400, borderBottom: tab === "campaigns" ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
          <Megaphone size={13} /> Kampanye ({campaigns.length})
        </button>
        <button onClick={() => setTab("templates")} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === "templates" ? T.navy : T.inkSoft, fontWeight: tab === "templates" ? 500 : 400, borderBottom: tab === "templates" ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
          <FileText size={13} /> Template ({templates.length})
        </button>
      </div>

      {tab === "campaigns" && (
        <div className="grid grid-cols-2 gap-3">
          {campaigns.length === 0 ? (
            <div className="col-span-2 py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <Megaphone size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Belum ada kampanye</p>
              <p className="text-xs" style={{ color: T.inkSoft }}>Buat kampanye outreach pertama Daddy</p>
            </div>
          ) : campaigns.map((c) => (
            <CampaignCard
              key={c.id}
              campaign={c}
              owner={users.find((u) => u.id === c.ownerId)}
              onClick={() => setSelectedId(c.id)}
              onToggleStatus={() => handleToggleStatus(c.id)}
              showOwner={currentUser.role === "admin"}
            />
          ))}
        </div>
      )}

      {tab === "templates" && (
        <div className="grid grid-cols-2 gap-3">
          {templates.length === 0 ? (
            <div className="col-span-2 py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <FileText size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: T.inkSoft }}>Belum ada template email</p>
            </div>
          ) : templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              owner={users.find((u) => u.id === t.ownerId)}
              onEdit={() => setEditingTemplate(t)}
              onDelete={() => handleDeleteTemplate(t.id)}
              canEdit={currentUser.role === "admin" || t.ownerId === currentUser.id}
            />
          ))}
        </div>
      )}

      {(showCampaignModal || editingCampaign) && tab === "campaigns" && (
        <CampaignModal campaign={editingCampaign} onSave={handleSaveCampaign} onClose={() => { setShowCampaignModal(false); setEditingCampaign(null); }} />
      )}
      {(showTemplateModal || editingTemplate) && (
        <TemplateModal template={editingTemplate} onSave={handleSaveTemplate} onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); }} />
      )}
    </div>
  );
}

/* ============== CAMPAIGN CARD ============== */
function CampaignCard({ campaign, owner, onClick, onToggleStatus, showOwner }) {
  const statusConf = {
    active: { label: "Aktif", color: T.sage, bg: T.sageSoft, Icon: PlayCircle },
    paused: { label: "Paused", color: T.amber, bg: T.amberSoft, Icon: PauseCircle },
    draft: { label: "Draft", color: T.inkSoft, bg: T.ruleSoft, Icon: Edit3 },
    completed: { label: "Selesai", color: T.navy, bg: T.navySoft, Icon: CheckCircle2 },
  }[campaign.status] || { label: campaign.status, color: T.inkSoft, bg: T.ruleSoft, Icon: Circle };

  const enrollCount = campaign.enrollments.length;
  const activeEnroll = campaign.enrollments.filter((e) => e.status === "active").length;
  const completedEnroll = campaign.enrollments.filter((e) => e.status === "completed").length;
  const repliedEnroll = campaign.enrollments.filter((e) => e.status === "replied").length;
  const emailSteps = campaign.steps.filter((s) => s.type === "email").length;
  const totalDays = campaign.steps.filter((s) => s.type === "wait").reduce((sum, s) => sum + (s.days || 0), 0);

  return (
    <div onClick={onClick} className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm group" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: statusConf.bg }}>
          <statusConf.Icon size={18} style={{ color: statusConf.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate" style={{ color: T.ink }}>{campaign.name}</p>
          <p className="text-[11px] mt-0.5 leading-relaxed line-clamp-2" style={{ color: T.inkSoft }}>{campaign.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: statusConf.color, background: statusConf.bg, fontFamily: FONT_MONO }}>{statusConf.label}</span>
          {showOwner && owner && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: owner.role === "admin" ? T.navySoft : T.sageSoft, color: owner.role === "admin" ? T.navy : T.sage }} title={owner.name}>
              {getUserInitials(owner.name)}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 py-3 border-t border-b" style={{ borderColor: T.ruleSoft }}>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Enrolled</p>
          <p className="text-[16px] font-semibold mt-0.5" style={{ color: T.ink, fontFamily: FONT_MONO }}>{enrollCount}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Steps</p>
          <p className="text-[16px] font-semibold mt-0.5" style={{ color: T.ink, fontFamily: FONT_MONO }}>{emailSteps}<span className="text-[10px]" style={{ color: T.inkSoft }}> · {totalDays}d</span></p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Replied</p>
          <p className="text-[16px] font-semibold mt-0.5" style={{ color: repliedEnroll > 0 ? T.sage : T.inkFaint, fontFamily: FONT_MONO }}>{repliedEnroll}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: T.inkSoft }}>
          <span className="flex items-center gap-1"><PlayCircle size={11} />{activeEnroll} aktif</span>
          <span className="flex items-center gap-1"><CheckCircle2 size={11} />{completedEnroll} selesai</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onToggleStatus(); }} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Toggle status">
          {campaign.status === "active" ? <Pause size={11} style={{ color: T.amber }} /> : <Play size={11} style={{ color: T.sage }} />}
        </button>
      </div>
    </div>
  );
}

/* ============== TEMPLATE CARD ============== */
function TemplateCard({ template, owner, onEdit, onDelete, canEdit }) {
  const categoryConf = {
    cold_outreach: { label: "Cold Outreach", color: T.red, bg: T.redSoft },
    follow_up: { label: "Follow-up", color: T.amber, bg: T.amberSoft },
    reminder: { label: "Reminder", color: T.navy, bg: T.navySoft },
    international: { label: "International", color: T.sage, bg: T.sageSoft },
  }[template.category] || { label: template.category, color: T.inkSoft, bg: T.ruleSoft };

  return (
    <div className="rounded-xl p-4 group" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
          <MailOpen size={16} style={{ color: T.navy }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{template.name}</p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>Subject: {template.subject}</p>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0" style={{ color: categoryConf.color, background: categoryConf.bg, fontFamily: FONT_MONO }}>{categoryConf.label}</span>
      </div>
      <p className="text-[11px] leading-relaxed line-clamp-3 mb-3" style={{ color: T.inkSoft }}>{template.body.slice(0, 200)}…</p>
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>OWNER: {owner ? owner.name.toUpperCase() : "—"}</p>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== CAMPAIGN DETAIL ============== */
function CampaignDetail({ campaign, setCampaigns, templates, clients, contacts, users, currentUser, canEdit, onBack, onEdit, onDelete, onOpenClient, confirm, modalOpen, editingCampaign, onSaveEdit, onCloseEdit }) {
  const [tab, setTab] = useState("sequence");
  const [editingStep, setEditingStep] = useState(null);
  const [showAddStep, setShowAddStep] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);

  const statusConf = {
    active: { label: "Aktif", color: T.sage, bg: T.sageSoft, Icon: PlayCircle },
    paused: { label: "Paused", color: T.amber, bg: T.amberSoft, Icon: PauseCircle },
    draft: { label: "Draft", color: T.inkSoft, bg: T.ruleSoft, Icon: Edit3 },
    completed: { label: "Selesai", color: T.navy, bg: T.navySoft, Icon: CheckCircle2 },
  }[campaign.status];

  const owner = users.find((u) => u.id === campaign.ownerId);

  const handleSaveStep = (stepData) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaign.id) return c;
      if (stepData.id) {
        return { ...c, steps: c.steps.map((s) => (s.id === stepData.id ? { ...s, ...stepData } : s)) };
      } else {
        const newStep = { ...stepData, id: newId("stp"), order: c.steps.length + 1 };
        return { ...c, steps: [...c.steps, newStep] };
      }
    }));
    setShowAddStep(false);
    setEditingStep(null);
  };

  const handleDeleteStep = async (stepId) => {
    const ok = await confirm("Hapus langkah ini dari sequence?");
    if (!ok) return;
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaign.id) return c;
      const filtered = c.steps.filter((s) => s.id !== stepId);
      const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
      return { ...c, steps: reordered };
    }));
  };

  const handleMoveStep = (stepId, direction) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaign.id) return c;
      const idx = c.steps.findIndex((s) => s.id === stepId);
      if (idx < 0) return c;
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= c.steps.length) return c;
      const newSteps = [...c.steps];
      const tmp = newSteps[idx];
      newSteps[idx] = newSteps[newIdx];
      newSteps[newIdx] = tmp;
      const reordered = newSteps.map((s, i) => ({ ...s, order: i + 1 }));
      return { ...c, steps: reordered };
    }));
  };

  const handleToggleStatus = () => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaign.id) return c;
      if (c.status === "active") return { ...c, status: "paused" };
      return { ...c, status: "active" };
    }));
  };

  const handleEnroll = (selections) => {
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaign.id) return c;
      const newEnrollments = selections.map((sel) => ({
        id: newId("enr"),
        clientId: sel.clientId,
        contactId: sel.contactId,
        startedAt: new Date().toISOString(),
        currentStepIdx: 1,
        status: "active",
        lastActionAt: new Date().toISOString(),
      }));
      return { ...c, enrollments: [...c.enrollments, ...newEnrollments] };
    }));
    setShowEnrollModal(false);
  };

  const handleUnenroll = async (enrollmentId) => {
    const ok = await confirm("Keluarkan klien ini dari kampanye?");
    if (!ok) return;
    setCampaigns((prev) => prev.map((c) => {
      if (c.id !== campaign.id) return c;
      return { ...c, enrollments: c.enrollments.filter((e) => e.id !== enrollmentId) };
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: T.inkSoft }}>
          <ChevronLeft size={16} /> Kembali ke daftar kampanye
        </button>
        <div className="flex items-center gap-2">
          {canEdit && (
            <>
              <button onClick={handleToggleStatus} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.surface, color: campaign.status === "active" ? T.amber : T.sage, border: `1px solid ${T.rule}` }}>
                {campaign.status === "active" ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Activate</>}
              </button>
              <button onClick={onEdit} className="p-2 rounded-md" style={{ background: T.surface, color: T.inkSoft, border: `1px solid ${T.rule}` }} aria-label="Edit"><Edit3 size={14} /></button>
              <button onClick={onDelete} className="p-2 rounded-md" style={{ background: T.surface, color: T.red, border: `1px solid ${T.rule}` }} aria-label="Delete"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl p-6 mb-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: statusConf.bg }}>
            <statusConf.Icon size={24} style={{ color: statusConf.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-[22px] font-semibold tracking-tight" style={{ color: T.ink }}>{campaign.name}</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: statusConf.color, background: statusConf.bg, fontFamily: FONT_MONO }}>{statusConf.label}</span>
              {owner && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded" style={{ background: T.surfaceAlt }}>
                  <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-medium" style={{ background: owner.role === "admin" ? T.navySoft : T.sageSoft, color: owner.role === "admin" ? T.navy : T.sage }}>
                    {getUserInitials(owner.name)}
                  </div>
                  <span className="text-[11px]" style={{ color: T.inkSoft }}>{owner.name}</span>
                </div>
              )}
            </div>
            <p className="text-[13px] leading-relaxed" style={{ color: T.inkSoft }}>{campaign.description}</p>
            <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t" style={{ borderColor: T.ruleSoft }}>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Total enrolled</p>
                <p className="text-[18px] font-semibold mt-0.5" style={{ color: T.ink, fontFamily: FONT_MONO }}>{campaign.enrollments.length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Sedang berjalan</p>
                <p className="text-[18px] font-semibold mt-0.5" style={{ color: T.navy, fontFamily: FONT_MONO }}>{campaign.enrollments.filter((e) => e.status === "active").length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Selesai</p>
                <p className="text-[18px] font-semibold mt-0.5" style={{ color: T.sage, fontFamily: FONT_MONO }}>{campaign.enrollments.filter((e) => e.status === "completed").length}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Replied</p>
                <p className="text-[18px] font-semibold mt-0.5" style={{ color: campaign.enrollments.filter((e) => e.status === "replied").length > 0 ? T.amber : T.inkFaint, fontFamily: FONT_MONO }}>{campaign.enrollments.filter((e) => e.status === "replied").length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor: T.rule }}>
        <button onClick={() => setTab("sequence")} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === "sequence" ? T.navy : T.inkSoft, fontWeight: tab === "sequence" ? 500 : 400, borderBottom: tab === "sequence" ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
          <ListOrdered size={13} /> Sequence ({campaign.steps.length})
        </button>
        <button onClick={() => setTab("enrollments")} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === "enrollments" ? T.navy : T.inkSoft, fontWeight: tab === "enrollments" ? 500 : 400, borderBottom: tab === "enrollments" ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
          <Users size={13} /> Enrolled ({campaign.enrollments.length})
        </button>
      </div>

      {tab === "sequence" && (
        <div>
          {canEdit && (
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowAddStep(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                <Plus size={13} /> Tambah langkah
              </button>
            </div>
          )}
          {campaign.steps.length === 0 ? (
            <div className="py-12 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <ListOrdered size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
              <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Belum ada langkah</p>
              <p className="text-xs" style={{ color: T.inkSoft }}>Tambahkan langkah pertama: email atau jeda hari</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaign.steps.map((step, idx) => (
                <StepRow
                  key={step.id}
                  step={step}
                  templates={templates}
                  isFirst={idx === 0}
                  isLast={idx === campaign.steps.length - 1}
                  canEdit={canEdit}
                  onEdit={() => setEditingStep(step)}
                  onDelete={() => handleDeleteStep(step.id)}
                  onMoveUp={() => handleMoveStep(step.id, "up")}
                  onMoveDown={() => handleMoveStep(step.id, "down")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "enrollments" && (
        <div>
          {canEdit && (
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowEnrollModal(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                <UserPlus size={13} /> Enroll klien
              </button>
            </div>
          )}
          {campaign.enrollments.length === 0 ? (
            <div className="py-12 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <Users size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
              <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Belum ada klien yang enrolled</p>
              <p className="text-xs" style={{ color: T.inkSoft }}>Tambahkan klien ke kampanye ini untuk mulai outreach</p>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: T.surfaceAlt }}>
                    <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Klien & Kontak</th>
                    <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Status</th>
                    <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Step</th>
                    <th className="text-left px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Mulai</th>
                    {canEdit && <th className="text-right px-4 py-2.5 text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Aksi</th>}
                  </tr>
                </thead>
                <tbody>
                  {campaign.enrollments.map((enr, idx) => {
                    const client = clients.find((c) => c.id === enr.clientId);
                    const contact = contacts.find((c) => c.id === enr.contactId);
                    const statusBadge = {
                      active: { label: "Aktif", color: T.navy, bg: T.navySoft },
                      completed: { label: "Selesai", color: T.sage, bg: T.sageSoft },
                      replied: { label: "Replied", color: T.amber, bg: T.amberSoft },
                      paused: { label: "Paused", color: T.inkSoft, bg: T.ruleSoft },
                    }[enr.status] || { label: enr.status, color: T.inkSoft, bg: T.ruleSoft };
                    return (
                      <tr key={enr.id} style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
                        <td className="px-4 py-3">
                          {client ? (
                            <button onClick={() => onOpenClient(client.id)} className="text-left">
                              <p className="text-[13px] font-medium" style={{ color: T.ink }}>{client.name}</p>
                              <p className="text-[11px]" style={{ color: T.inkSoft }}>{contact ? `${contact.name} · ${contact.role}` : "Tanpa kontak person"}</p>
                            </button>
                          ) : <span className="text-[12px]" style={{ color: T.inkFaint }}>Klien dihapus</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: statusBadge.color, background: statusBadge.bg, fontFamily: FONT_MONO }}>{statusBadge.label}</span>
                        </td>
                        <td className="px-4 py-3 text-[12px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{enr.currentStepIdx} / {campaign.steps.length}</td>
                        <td className="px-4 py-3 text-[12px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{formatDate(enr.startedAt)}</td>
                        {canEdit && (
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleUnenroll(enr.id)} className="p-1.5 rounded-md hover:bg-gray-100" aria-label="Unenroll"><UserMinus size={12} style={{ color: T.red }} /></button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modalOpen && <CampaignModal campaign={editingCampaign} onSave={onSaveEdit} onClose={onCloseEdit} />}
      {(showAddStep || editingStep) && <StepEditorModal step={editingStep} templates={templates} onSave={handleSaveStep} onClose={() => { setShowAddStep(false); setEditingStep(null); }} />}
      {showEnrollModal && <EnrollClientsModal campaign={campaign} clients={clients} contacts={contacts} onEnroll={handleEnroll} onClose={() => setShowEnrollModal(false)} />}
    </div>
  );
}

/* ============== STEP ROW ============== */
function StepRow({ step, templates, isFirst, isLast, canEdit, onEdit, onDelete, onMoveUp, onMoveDown }) {
  if (step.type === "wait") {
    return (
      <div className="rounded-lg p-3 flex items-center gap-3" style={{ background: T.surfaceAlt, border: `1px dashed ${T.rule}` }}>
        <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: T.amberSoft }}>
          <Clock size={14} style={{ color: T.amber }} />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-medium" style={{ color: T.ink }}>Jeda {step.days} hari</p>
          <p className="text-[11px]" style={{ color: T.inkSoft }}>Tunggu sebelum lanjut ke langkah berikutnya</p>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: T.amber, background: T.amberSoft, fontFamily: FONT_MONO }}>STEP {step.order}</span>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surface }} aria-label="Move up"><ChevronUp size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onMoveDown} disabled={isLast} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surface }} aria-label="Move down"><ChevronDown size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surface }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surface }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
          </div>
        )}
      </div>
    );
  }
  if (step.type === "whatsapp") {
    return (
      <div className="rounded-lg p-3 flex items-start gap-3" style={{ background: T.surface, border: `1px solid ${T.sage}` }}>
        <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: T.sageSoft }}>
          <MessageCircle size={14} style={{ color: T.sage }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: T.sage, background: T.sageSoft, fontFamily: FONT_MONO }}>STEP {step.order} · WHATSAPP</span>
            <span className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{(step.body || "").length} chars</span>
          </div>
          <p className="text-[11px] mt-1 leading-relaxed line-clamp-3 whitespace-pre-wrap" style={{ color: T.inkSoft }}>{(step.body || "Pesan belum diisi").slice(0, 240)}{(step.body || "").length > 240 ? "…" : ""}</p>
        </div>
        {canEdit && (
          <div className="flex items-center gap-1">
            <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surfaceAlt }} aria-label="Move up"><ChevronUp size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onMoveDown} disabled={isLast} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surfaceAlt }} aria-label="Move down"><ChevronDown size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
          </div>
        )}
      </div>
    );
  }
  const template = templates.find((t) => t.id === step.templateId);
  const displaySubject = step.subject || (template ? template.subject : "Subject belum diisi");
  const displayBody = step.body || (template ? template.body : "");
  return (
    <div className="rounded-lg p-3 flex items-start gap-3" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
        <Mail size={14} style={{ color: T.navy }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: T.navy, background: T.navySoft, fontFamily: FONT_MONO }}>STEP {step.order} · EMAIL</span>
          {template && <span className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>← {template.name}</span>}
        </div>
        <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{displaySubject}</p>
        <p className="text-[11px] mt-1 leading-relaxed line-clamp-2" style={{ color: T.inkSoft }}>{displayBody.slice(0, 200)}…</p>
      </div>
      {canEdit && (
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp} disabled={isFirst} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surfaceAlt }} aria-label="Move up"><ChevronUp size={11} style={{ color: T.inkSoft }} /></button>
          <button onClick={onMoveDown} disabled={isLast} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surfaceAlt }} aria-label="Move down"><ChevronDown size={11} style={{ color: T.inkSoft }} /></button>
          <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
        </div>
      )}
    </div>
  );
}

/* ============== CAMPAIGN MODAL ============== */
function CampaignModal({ campaign, onSave, onClose }) {
  const [form, setForm] = useState(campaign || { name: "", description: "", status: "draft" });
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{campaign ? "Edit kampanye" : "Buat kampanye baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Nama kampanye" required>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="contoh: Hot Outreach Pertambangan Q3" />
        </FormField>
        <FormField label="Deskripsi & target">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} placeholder="Jelaskan target audience dan tujuan kampanye…" />
        </FormField>
        {campaign && (
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              <option value="draft">Draft (belum running)</option>
              <option value="active">Active (sedang jalan)</option>
              <option value="paused">Paused (di-pause sementara)</option>
              <option value="completed">Completed (selesai)</option>
            </select>
          </FormField>
        )}
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.name.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan kampanye
        </button>
      </div>
    </Modal>
  );
}

/* ============== STEP EDITOR MODAL ============== */
function StepEditorModal({ step, templates, onSave, onClose }) {
  const [form, setForm] = useState(step || { type: "email", subject: "", body: "", templateId: null, days: 3 });
  const handleApplyTemplate = (tplId) => {
    if (!tplId) { setForm({ ...form, templateId: null }); return; }
    const tpl = templates.find((t) => t.id === tplId);
    if (!tpl) return;
    setForm({ ...form, templateId: tplId, subject: tpl.subject, body: tpl.body });
  };
  const isValid =
    form.type === "wait" ? form.days > 0 :
    form.type === "whatsapp" ? (form.body || "").trim().length > 0 :
    (form.subject || "").trim().length > 0;

  const bodyCharCount = (form.body || "").length;
  const waOverLimit = form.type === "whatsapp" && bodyCharCount > 1600;

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{step ? "Edit langkah" : "Tambah langkah baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Tipe langkah" required>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setForm({ ...form, type: "email" })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm" style={{ background: form.type === "email" ? T.navy : T.surface, color: form.type === "email" ? "#fff" : T.inkSoft, border: `1px solid ${form.type === "email" ? T.navy : T.rule}` }}>
              <Mail size={14} /> Email
            </button>
            <button onClick={() => setForm({ ...form, type: "whatsapp" })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm" style={{ background: form.type === "whatsapp" ? T.sage : T.surface, color: form.type === "whatsapp" ? "#fff" : T.inkSoft, border: `1px solid ${form.type === "whatsapp" ? T.sage : T.rule}` }}>
              <MessageCircle size={14} /> WhatsApp
            </button>
            <button onClick={() => setForm({ ...form, type: "wait" })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm" style={{ background: form.type === "wait" ? T.amber : T.surface, color: form.type === "wait" ? "#fff" : T.inkSoft, border: `1px solid ${form.type === "wait" ? T.amber : T.rule}` }}>
              <Clock size={14} /> Jeda
            </button>
          </div>
        </FormField>

        {form.type === "wait" && (
          <FormField label="Jumlah hari menunggu" required>
            <input type="number" min="1" max="60" value={form.days} onChange={(e) => setForm({ ...form, days: parseInt(e.target.value) || 1 })} style={inputStyle} />
            <p className="text-[10px] mt-1.5" style={{ color: T.inkFaint }}>Sistem akan menunggu sekian hari sebelum mengirim langkah berikutnya.</p>
          </FormField>
        )}

        {form.type === "email" && (
          <>
            <FormField label="Pakai template (opsional)">
              <select value={form.templateId || ""} onChange={(e) => handleApplyTemplate(e.target.value)} style={inputStyle}>
                <option value="">— Tulis manual / custom —</option>
                {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p className="text-[10px] mt-1.5" style={{ color: T.inkFaint }}>Pilih template untuk auto-fill subject & body, atau biarkan kosong untuk custom.</p>
            </FormField>
            <FormField label="Subject" required>
              <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} placeholder="contoh: Pertanyaan singkat tentang program QHSE di {{company}}" />
            </FormField>
            <FormField label="Body email">
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={10} style={{ ...inputStyle, resize: "vertical", minHeight: "200px", fontFamily: FONT_MONO, fontSize: "12px" }} placeholder="Halo {{contact_name}},\n\nSaya {{sender_name}} dari Nusa Safety…" />
            </FormField>
          </>
        )}

        {form.type === "whatsapp" && (
          <>
            <div className="rounded-md p-3" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
              <div className="flex items-start gap-2">
                <MessageCircle size={13} style={{ color: T.sage }} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium" style={{ color: T.sage }}>WhatsApp Outreach</p>
                  <p className="text-[11px] mt-1 leading-relaxed" style={{ color: T.sage }}>
                    Untuk demo, sistem akan generate link wa.me ke nomor kontak. Production butuh integrasi WhatsApp Business API (Twilio, Wati, atau Qiscus untuk Indonesia).
                  </p>
                </div>
              </div>
            </div>
            <FormField label="Pesan WhatsApp" required>
              <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={8} style={{ ...inputStyle, resize: "vertical", minHeight: "160px", fontFamily: FONT_MONO, fontSize: "12px" }} placeholder="Halo {{contact_name}}, saya {{sender_name}} dari Nusa Safety…" />
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px]" style={{ color: T.inkFaint }}>Limit WhatsApp: 1.600 karakter (template) / 4.096 (free-form)</p>
                <p className="text-[10px]" style={{ color: waOverLimit ? T.red : T.inkFaint, fontFamily: FONT_MONO }}>{bodyCharCount} / 1600</p>
              </div>
            </FormField>
          </>
        )}

        {(form.type === "email" || form.type === "whatsapp") && (
          <div className="rounded-md p-3" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
            <div className="flex items-start gap-2">
              <Variable size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[11px] font-medium" style={{ color: T.navy }}>Variable yang tersedia:</p>
                <p className="text-[11px] mt-1 leading-relaxed" style={{ color: T.navy, fontFamily: FONT_MONO }}>
                  {"{{contact_name}}"} · {"{{company}}"} · {"{{industry}}"} · {"{{sender_name}}"} · {"{{deal_title}}"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!isValid || waOverLimit} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: isValid && !waOverLimit ? 1 : 0.5 }}>
          <Save size={13} /> Simpan langkah
        </button>
      </div>
    </Modal>
  );
}

/* ============== ENROLL CLIENTS MODAL ============== */
function EnrollClientsModal({ campaign, clients, contacts, onEnroll, onClose }) {
  const [selected, setSelected] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const enrolledClientIds = campaign.enrollments.map((e) => e.clientId);
  const available = clients.filter((c) => !enrolledClientIds.includes(c.id));
  const filtered = available.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q);
  });

  const toggleSelect = (clientId) => {
    if (selected[clientId]) {
      const next = { ...selected };
      delete next[clientId];
      setSelected(next);
    } else {
      const dm = contacts.find((ct) => ct.clientId === clientId && ct.isDecisionMaker);
      const fallback = contacts.find((ct) => ct.clientId === clientId);
      setSelected({ ...selected, [clientId]: { clientId, contactId: dm ? dm.id : (fallback ? fallback.id : null) } });
    }
  };

  const handleSubmit = () => {
    const selections = Object.values(selected);
    if (selections.length === 0) return;
    onEnroll(selections);
  };

  const selectedCount = Object.keys(selected).length;

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Enroll klien ke "{campaign.name}"</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5">
        <div className="flex items-center gap-2 px-3 py-2 rounded-md mb-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
          <Search size={14} style={{ color: T.inkFaint }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari klien…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.ink }} />
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Users size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
            <p className="text-sm" style={{ color: T.inkSoft }}>{available.length === 0 ? "Semua klien sudah enrolled" : "Tidak ada klien cocok"}</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto space-y-1.5">
            {filtered.map((c) => {
              const isSelected = !!selected[c.id];
              const clientContacts = contacts.filter((ct) => ct.clientId === c.id);
              const dm = clientContacts.find((ct) => ct.isDecisionMaker);
              const h = healthBadge(c.health);
              return (
                <button key={c.id} onClick={() => toggleSelect(c.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left" style={{ background: isSelected ? T.navySoft : T.surface, border: `1px solid ${isSelected ? T.navy : T.rule}` }}>
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? T.navy : T.surface, border: `1.5px solid ${isSelected ? T.navy : T.rule}` }}>
                    {isSelected && <CheckCircle2 size={12} color="#fff" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{c.name}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0" style={{ color: h.color, background: h.bg, fontFamily: FONT_MONO }}>{h.label}</span>
                    </div>
                    <p className="text-[11px] truncate" style={{ color: T.inkSoft }}>
                      {c.industry} · {dm ? `DM: ${dm.name}` : (clientContacts.length > 0 ? `${clientContacts.length} kontak` : "Tanpa kontak")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: T.rule }}>
        <p className="text-[12px]" style={{ color: T.inkSoft }}>{selectedCount} klien dipilih</p>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
          <button onClick={handleSubmit} disabled={selectedCount === 0} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: selectedCount > 0 ? 1 : 0.5 }}>
            <UserPlus size={13} /> Enroll {selectedCount > 0 ? `(${selectedCount})` : ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ============== TEMPLATE MODAL ============== */
function TemplateModal({ template, onSave, onClose }) {
  const [form, setForm] = useState(template || { name: "", category: "cold_outreach", subject: "", body: "" });
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{template ? "Edit template" : "Template baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama template" required>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="contoh: Cold Email — Mining sector" />
          </FormField>
          <FormField label="Kategori">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              <option value="cold_outreach">Cold Outreach</option>
              <option value="follow_up">Follow-up</option>
              <option value="reminder">Reminder</option>
              <option value="international">International</option>
            </select>
          </FormField>
        </div>
        <FormField label="Subject" required>
          <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} style={inputStyle} placeholder="contoh: Pertanyaan singkat tentang program QHSE di {{company}}" />
        </FormField>
        <FormField label="Body email" required>
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={12} style={{ ...inputStyle, resize: "vertical", minHeight: "240px", fontFamily: FONT_MONO, fontSize: "12px" }} placeholder="Halo {{contact_name}},\n\n…" />
        </FormField>
        <div className="rounded-md p-3" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
          <div className="flex items-start gap-2">
            <Variable size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-medium" style={{ color: T.navy }}>Variable yang tersedia:</p>
              <p className="text-[11px] mt-1 leading-relaxed" style={{ color: T.navy, fontFamily: FONT_MONO }}>
                {"{{contact_name}}"} · {"{{company}}"} · {"{{industry}}"} · {"{{sender_name}}"} · {"{{deal_title}}"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim() || !form.subject.trim() || !form.body.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.name.trim() && form.subject.trim() && form.body.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan template
        </button>
      </div>
    </Modal>
  );
}

/* ============== WHATSAPP SEND MODAL ============== */
function normalizePhoneForWa(raw) {
  if (!raw) return "";
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = "62" + digits.slice(1);
  if (digits.startsWith("8")) digits = "62" + digits;
  return digits;
}

function WhatsAppSendModal({ client, contacts, currentUser, onClose, onLog }) {
  const [contactId, setContactId] = useState(contacts.length > 0 ? (contacts.find((c) => c.isDecisionMaker) || contacts[0]).id : "");
  const [message, setMessage] = useState("");

  const selectedContact = contacts.find((c) => c.id === contactId);
  const normalized = selectedContact ? normalizePhoneForWa(selectedContact.phone) : "";
  const phoneValid = normalized.length >= 10 && normalized.length <= 15;

  const substituteVars = (text) => {
    if (!text) return "";
    const firstName = selectedContact ? selectedContact.name.split(" ")[0].replace(/,$/, "") : "";
    const senderFirstName = currentUser ? currentUser.name : "";
    return text
      .replace(/\{\{contact_name\}\}/g, firstName)
      .replace(/\{\{company\}\}/g, client.name)
      .replace(/\{\{industry\}\}/g, client.industry || "")
      .replace(/\{\{sender_name\}\}/g, senderFirstName);
  };

  const previewMessage = substituteVars(message);
  const charCount = previewMessage.length;
  const overLimit = charCount > 4096;

  const quickTemplates = [
    {
      label: "Intro singkat",
      body: `Halo {{contact_name}}, ini {{sender_name}} dari Nusa Safety.\n\nKami konsultan QHSE & fire protection bersertifikat ISO 45001 dan SMK3. Saya tertarik diskusi singkat soal program K3 di {{company}}.\n\nApakah ada waktu 15 menit minggu ini?\n\nTerima kasih 🙏`,
    },
    {
      label: "Follow-up email",
      body: `Halo {{contact_name}},\n\nSaya barusan kirim email tentang proposal di {{company}}. Apakah sudah sempat dilihat?\n\nKalau ada pertanyaan, langsung tanya di sini saja 🙏`,
    },
    {
      label: "Reminder meeting",
      body: `Halo {{contact_name}}, ini reminder meeting kita besok.\n\nLink dan agenda sudah saya kirim via email. Jika butuh reschedule, info via WA saja.\n\nSampai ketemu besok!`,
    },
  ];

  const handleSend = () => {
    if (!selectedContact || !message.trim() || !phoneValid || overLimit) return;
    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(previewMessage)}`;
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
    if (onLog) {
      onLog({
        type: "call",
        title: `WhatsApp ke ${selectedContact.name}`,
        body: `Pesan dibuka via wa.me/${normalized}\n\n---\n${previewMessage.slice(0, 500)}${previewMessage.length > 500 ? "…" : ""}`,
      });
    }
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.sageSoft }}>
            <MessageCircle size={16} style={{ color: T.sage }} />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Kirim WhatsApp</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>Ke kontak di {client.name}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Kirim ke" required>
          <select value={contactId} onChange={(e) => setContactId(e.target.value)} style={inputStyle}>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.role}) — {c.phone}{c.isDecisionMaker ? " ⭐" : ""}
              </option>
            ))}
          </select>
          {selectedContact && (
            <p className="text-[10px] mt-1.5" style={{ color: phoneValid ? T.sage : T.red, fontFamily: FONT_MONO }}>
              {phoneValid ? `✓ wa.me/${normalized}` : `⚠ Nomor tidak valid: ${normalized || "(kosong)"}`}
            </p>
          )}
        </FormField>

        <FormField label="Quick template">
          <div className="flex flex-wrap gap-2">
            {quickTemplates.map((qt) => (
              <button key={qt.label} onClick={() => setMessage(qt.body)} className="px-3 py-1.5 rounded-md text-[12px]" style={{ background: T.surfaceAlt, color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                {qt.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Pesan" required>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} style={{ ...inputStyle, resize: "vertical", minHeight: "160px", fontFamily: FONT_MONO, fontSize: "12px" }} placeholder={`Halo {{contact_name}}, ini {{sender_name}} dari Nusa Safety…`} />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Variable: {"{{contact_name}}"} · {"{{company}}"} · {"{{industry}}"} · {"{{sender_name}}"}</p>
            <p className="text-[10px]" style={{ color: overLimit ? T.red : T.inkFaint, fontFamily: FONT_MONO }}>{charCount} / 4096</p>
          </div>
        </FormField>

        {message.trim() && (
          <div>
            <p className="text-[12px] font-medium mb-1.5" style={{ color: T.ink }}>Preview (variabel sudah disubstitusi):</p>
            <div className="rounded-md p-3 max-h-[200px] overflow-y-auto" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
              <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink, fontFamily: FONT_MONO }}>{previewMessage}</p>
            </div>
          </div>
        )}

        <div className="rounded-md p-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
          <div className="flex items-start gap-2">
            <Smartphone size={13} style={{ color: T.inkSoft }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed" style={{ color: T.inkSoft }}>
              Tombol di bawah akan buka WhatsApp Web/App di tab baru, dengan nomor & pesan sudah terisi. Aktivitas otomatis ter-log di tab Aktivitas klien.
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={handleSend} disabled={!message.trim() || !phoneValid || overLimit} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.sage, opacity: message.trim() && phoneValid && !overLimit ? 1 : 0.5 }}>
          <MessageCircle size={13} /> Buka di WhatsApp
        </button>
      </div>
    </Modal>
  );
}

/* ============== BOOKING VIEW ============== */
function BookingView({ meetingTypes, setMeetingTypes, bookings, setBookings, clients, contacts, confirm, currentUser, users, onOpenClient }) {
  const [tab, setTab] = useState("bookings");
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [showAddMt, setShowAddMt] = useState(false);
  const [editingMt, setEditingMt] = useState(null);
  const [linkMt, setLinkMt] = useState(null);

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.scheduledAt) >= now && b.status !== "cancelled").sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  const past = bookings.filter((b) => new Date(b.scheduledAt) < now || b.status === "cancelled").sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt));

  const handleSaveBooking = (data) => {
    if (data.id) {
      setBookings((prev) => prev.map((b) => (b.id === data.id ? { ...b, ...data } : b)));
    } else {
      const nb = { ...data, id: newId("bk"), ownerId: currentUser.id, createdAt: new Date().toISOString() };
      setBookings((prev) => [nb, ...prev]);
    }
    setShowAddBooking(false);
    setEditingBooking(null);
  };

  const handleDeleteBooking = async (id) => {
    const ok = await confirm("Hapus booking ini?");
    if (!ok) return;
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSaveMt = (data) => {
    if (data.id) {
      setMeetingTypes((prev) => prev.map((m) => (m.id === data.id ? { ...m, ...data } : m)));
    } else {
      const nm = { ...data, id: newId("mt"), ownerId: currentUser.id, active: true };
      setMeetingTypes((prev) => [nm, ...prev]);
    }
    setShowAddMt(false);
    setEditingMt(null);
  };

  const handleDeleteMt = async (id) => {
    const ok = await confirm("Hapus tipe meeting ini?");
    if (!ok) return;
    setMeetingTypes((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck size={22} style={{ color: T.navy }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Booking</h1>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>{upcoming.length} meeting mendatang · {meetingTypes.filter((m) => m.active).length} tipe meeting aktif</p>
        </div>
        <div className="flex items-center gap-2">
          {tab === "bookings" && (
            <button onClick={() => setShowAddBooking(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
              <CalendarPlus size={14} /> Jadwalkan
            </button>
          )}
          {tab === "types" && (
            <button onClick={() => setShowAddMt(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
              <Plus size={14} /> Tipe baru
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 mb-5 border-b" style={{ borderColor: T.rule }}>
        <button onClick={() => setTab("bookings")} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === "bookings" ? T.navy : T.inkSoft, fontWeight: tab === "bookings" ? 500 : 400, borderBottom: tab === "bookings" ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
          <CalendarCheck size={13} /> Meeting ({bookings.length})
        </button>
        <button onClick={() => setTab("types")} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === "types" ? T.navy : T.inkSoft, fontWeight: tab === "types" ? 500 : 400, borderBottom: tab === "types" ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
          <CalendarClock size={13} /> Tipe meeting ({meetingTypes.length})
        </button>
      </div>

      {tab === "bookings" && (
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Mendatang ({upcoming.length})</p>
          {upcoming.length === 0 ? (
            <div className="py-12 text-center rounded-xl mb-6" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <CalendarCheck size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: T.inkSoft }}>Belum ada meeting yang dijadwalkan</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-6">
              {upcoming.map((b) => <BookingCard key={b.id} booking={b} client={clients.find((c) => c.id === b.clientId)} meetingType={meetingTypes.find((m) => m.id === b.meetingTypeId)} onEdit={() => setEditingBooking(b)} onDelete={() => handleDeleteBooking(b.id)} onOpenClient={onOpenClient} />)}
            </div>
          )}
          {past.length > 0 && (
            <>
              <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Lampau & batal ({past.length})</p>
              <div className="grid grid-cols-2 gap-3">
                {past.map((b) => <BookingCard key={b.id} booking={b} client={clients.find((c) => c.id === b.clientId)} meetingType={meetingTypes.find((m) => m.id === b.meetingTypeId)} onEdit={() => setEditingBooking(b)} onDelete={() => handleDeleteBooking(b.id)} onOpenClient={onOpenClient} isPast />)}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "types" && (
        <div>
          <div className="rounded-md p-3 mb-4" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
            <div className="flex items-start gap-2">
              <LinkIcon size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed" style={{ color: T.navy }}>
                Setiap tipe meeting bisa di-share lewat link unik. Klien atau prospek bisa langsung pesan slot tanpa login. Klik "Link booking" di tiap kartu untuk dapat URL share-able.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {meetingTypes.map((m) => <MeetingTypeCard key={m.id} mt={m} onEdit={() => setEditingMt(m)} onDelete={() => handleDeleteMt(m.id)} onLink={() => setLinkMt(m)} />)}
          </div>
        </div>
      )}

      {(showAddBooking || editingBooking) && <BookingModal booking={editingBooking} meetingTypes={meetingTypes} clients={clients} contacts={contacts} onSave={handleSaveBooking} onClose={() => { setShowAddBooking(false); setEditingBooking(null); }} />}
      {(showAddMt || editingMt) && <MeetingTypeModal mt={editingMt} onSave={handleSaveMt} onClose={() => { setShowAddMt(false); setEditingMt(null); }} />}
      {linkMt && <BookingLinkModal mt={linkMt} onClose={() => setLinkMt(null)} />}
    </div>
  );
}

/* ============== BOOKING CARD ============== */
function BookingCard({ booking, client, meetingType, onEdit, onDelete, onOpenClient, isPast }) {
  const statusConf = {
    confirmed: { label: "Confirmed", color: T.sage, bg: T.sageSoft },
    completed: { label: "Selesai", color: T.navy, bg: T.navySoft },
    cancelled: { label: "Batal", color: T.red, bg: T.redSoft },
    no_show: { label: "No-show", color: T.amber, bg: T.amberSoft },
  }[booking.status] || { label: booking.status, color: T.inkSoft, bg: T.ruleSoft };
  const accent = (meetingType && meetingType.color) || T.navy;
  return (
    <div className="rounded-xl p-4 group" style={{ background: T.surface, border: `1px solid ${T.rule}`, opacity: isPast ? 0.75 : 1 }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg flex flex-col items-center justify-center flex-shrink-0" style={{ background: accent + "15" }}>
          <p className="text-[9px] uppercase tracking-wider leading-none" style={{ color: accent, fontFamily: FONT_MONO }}>{new Date(booking.scheduledAt).toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}</p>
          <p className="text-[16px] font-semibold leading-tight" style={{ color: accent, fontFamily: FONT_MONO }}>{new Date(booking.scheduledAt).getDate()}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: T.ink }}>{booking.attendeeName}</p>
          {client ? (
            <button onClick={() => onOpenClient(client.id)} className="text-[11px] truncate hover:underline" style={{ color: T.navy }}>{client.name}</button>
          ) : (
            <p className="text-[11px] truncate" style={{ color: T.inkFaint }}>Inbound booking</p>
          )}
          <p className="text-[10px] mt-0.5" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{new Date(booking.scheduledAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} · {booking.duration} mnt</p>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0" style={{ color: statusConf.color, background: statusConf.bg, fontFamily: FONT_MONO }}>{statusConf.label}</span>
      </div>
      {meetingType && (
        <div className="flex items-center gap-1.5 mb-2">
          <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
          <span className="text-[11px]" style={{ color: T.inkSoft }}>{meetingType.name}</span>
        </div>
      )}
      {booking.notes && <p className="text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ color: T.inkSoft }}>{booking.notes}</p>}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        <div className="flex items-center gap-2 text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>
          <Mail size={9} /> {booking.attendeeEmail}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============== MEETING TYPE CARD ============== */
function MeetingTypeCard({ mt, onEdit, onDelete, onLink }) {
  return (
    <div className="rounded-xl p-4 group" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: mt.color + "15" }}>
          <CalendarClock size={16} style={{ color: mt.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium" style={{ color: T.ink }}>{mt.name}</p>
          <p className="text-[11px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{mt.duration} menit · {mt.active ? "aktif" : "non-aktif"}</p>
        </div>
        {!mt.active && <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: T.ruleSoft, color: T.inkSoft, fontFamily: FONT_MONO }}>OFF</span>}
      </div>
      <p className="text-[11px] leading-relaxed line-clamp-3 mb-3" style={{ color: T.inkSoft }}>{mt.description}</p>
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        <button onClick={onLink} className="text-[11px] flex items-center gap-1" style={{ color: T.navy }}>
          <LinkIcon size={11} /> Link booking
        </button>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
        </div>
      </div>
    </div>
  );
}

/* ============== BOOKING MODAL ============== */
function BookingModal({ booking, meetingTypes, clients, contacts, onSave, onClose }) {
  const defaultDate = booking ? booking.scheduledAt.slice(0, 16) : new Date(Date.now() + 86400000).toISOString().slice(0, 16);
  const [form, setForm] = useState(booking ? { ...booking, scheduledAt: booking.scheduledAt.slice(0, 16) } : {
    clientId: "", contactId: "", meetingTypeId: meetingTypes.length > 0 ? meetingTypes[0].id : "",
    scheduledAt: defaultDate, duration: 30, status: "confirmed",
    notes: "", attendeeName: "", attendeeEmail: "", attendeePhone: "",
  });

  const handleClientChange = (clientId) => {
    setForm({ ...form, clientId, contactId: "" });
  };
  const handleContactChange = (contactId) => {
    const ct = contacts.find((c) => c.id === contactId);
    setForm({ ...form, contactId, attendeeName: ct ? ct.name : "", attendeeEmail: ct ? ct.email : "", attendeePhone: ct ? ct.phone : "" });
  };
  const handleTypeChange = (mtId) => {
    const mt = meetingTypes.find((m) => m.id === mtId);
    setForm({ ...form, meetingTypeId: mtId, duration: mt ? mt.duration : 30 });
  };

  const clientContacts = form.clientId ? contacts.filter((c) => c.clientId === form.clientId) : [];
  const isValid = form.scheduledAt && form.attendeeName.trim() && form.meetingTypeId;

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{booking ? "Edit booking" : "Jadwalkan meeting baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tipe meeting" required>
            <select value={form.meetingTypeId} onChange={(e) => handleTypeChange(e.target.value)} style={inputStyle}>
              <option value="">— Pilih tipe —</option>
              {meetingTypes.filter((m) => m.active).map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </FormField>
          <FormField label="Durasi (menit)">
            <input type="number" min="5" max="240" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })} style={inputStyle} />
          </FormField>
        </div>
        <FormField label="Tanggal & jam" required>
          <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} style={inputStyle} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Klien (opsional)">
            <select value={form.clientId || ""} onChange={(e) => handleClientChange(e.target.value)} style={inputStyle}>
              <option value="">— Inbound / belum ada klien —</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Kontak (opsional)">
            <select value={form.contactId || ""} onChange={(e) => handleContactChange(e.target.value)} style={inputStyle} disabled={!form.clientId}>
              <option value="">— Pilih kontak —</option>
              {clientContacts.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.role})</option>)}
            </select>
          </FormField>
        </div>
        <FormField label="Nama attendee" required>
          <input type="text" value={form.attendeeName} onChange={(e) => setForm({ ...form, attendeeName: e.target.value })} style={inputStyle} placeholder="contoh: Ir. Budi Santoso" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Email attendee">
            <input type="email" value={form.attendeeEmail} onChange={(e) => setForm({ ...form, attendeeEmail: e.target.value })} style={inputStyle} placeholder="nama@email.com" />
          </FormField>
          <FormField label="Telepon/WA attendee">
            <input type="text" value={form.attendeePhone} onChange={(e) => setForm({ ...form, attendeePhone: e.target.value })} style={inputStyle} placeholder="+62 ..." />
          </FormField>
        </div>
        <FormField label="Agenda / catatan">
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} placeholder="Topik yang akan dibahas, pertanyaan, dll." />
        </FormField>
        {booking && (
          <FormField label="Status">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Batal</option>
              <option value="no_show">No-show</option>
            </select>
          </FormField>
        )}
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!isValid} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: isValid ? 1 : 0.5 }}>
          <Save size={13} /> Simpan booking
        </button>
      </div>
    </Modal>
  );
}

/* ============== MEETING TYPE MODAL ============== */
function MeetingTypeModal({ mt, onSave, onClose }) {
  const [form, setForm] = useState(mt || { name: "", duration: 30, description: "", color: T.navy, active: true });
  const colorOptions = [T.navy, T.sage, T.amber, T.red, T.inkSoft];
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{mt ? "Edit tipe meeting" : "Tipe meeting baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Nama" required>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="contoh: Discovery Call — 30 menit" />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Durasi (menit)" required>
            <input type="number" min="5" max="240" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 30 })} style={inputStyle} />
          </FormField>
          <FormField label="Status">
            <select value={form.active ? "yes" : "no"} onChange={(e) => setForm({ ...form, active: e.target.value === "yes" })} style={inputStyle}>
              <option value="yes">Aktif (bisa dipesan)</option>
              <option value="no">Non-aktif (tersembunyi)</option>
            </select>
          </FormField>
        </div>
        <FormField label="Warna identitas">
          <div className="flex items-center gap-2">
            {colorOptions.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} className="w-8 h-8 rounded-md transition-transform" style={{ background: c, border: form.color === c ? `2px solid ${T.ink}` : `2px solid transparent`, transform: form.color === c ? "scale(1.1)" : "scale(1)" }} aria-label="Pick color" />
            ))}
          </div>
        </FormField>
        <FormField label="Deskripsi">
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }} placeholder="Jelaskan tujuan meeting ini buat prospek yang booking." />
        </FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.name.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.name.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan
        </button>
      </div>
    </Modal>
  );
}

/* ============== BOOKING LINK MODAL ============== */
function BookingLinkModal({ mt, onClose }) {
  const [copied, setCopied] = useState(false);
  const url = `${COMPANY_CONFIG.websiteUrl}/book/${mt.id}`;
  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Link booking publik</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2.5 p-3 rounded-md" style={{ background: mt.color + "10", border: `1px solid ${mt.color}` }}>
          <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: mt.color + "20" }}>
            <CalendarClock size={15} style={{ color: mt.color }} />
          </div>
          <div>
            <p className="text-[13px] font-medium" style={{ color: T.ink }}>{mt.name}</p>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>{mt.duration} menit · {mt.description.slice(0, 80)}…</p>
          </div>
        </div>
        <FormField label="URL booking — share ke prospek">
          <div className="flex items-center gap-2 p-2.5 rounded-md" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
            <LinkIcon size={13} style={{ color: T.inkSoft }} />
            <p className="flex-1 text-[12px] truncate" style={{ color: T.ink, fontFamily: FONT_MONO }}>{url}</p>
            <button onClick={handleCopy} className="px-2.5 py-1 rounded text-[11px] flex items-center gap-1" style={{ background: copied ? T.sage : T.navy, color: "#fff" }}>
              {copied ? <><CheckCircle2 size={11} /> Tersalin</> : <><Copy size={11} /> Salin</>}
            </button>
          </div>
        </FormField>
        <div className="rounded-md p-3" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
          <div className="flex items-start gap-2">
            <AlertCircle size={13} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed" style={{ color: T.amber }}>
              <strong>Production note:</strong> URL ini adalah placeholder. Di production, perlu setup public booking page di route /book/[mtId] yang menampilkan calendar slot picker, lalu submit booking ke /api/bookings/create. Engine bisa pakai Cal.com SDK atau bikin custom dengan Next.js + React Day Picker.
            </p>
          </div>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Tutup</button>
      </div>
    </Modal>
  );
}

/* ============== HUNTER VIEW (Prospect signals) ============== */
function HunterView({ signals, setSignals, clients, setClients, currentUser, confirm, onOpenClient, onOpenAi }) {
  const [filterSource, setFilterSource] = useState("all");
  const [filterStatus, setFilterStatus] = useState("new");
  const [sortBy, setSortBy] = useState("score");
  const [selectedSignal, setSelectedSignal] = useState(null);
  const [convertingSignal, setConvertingSignal] = useState(null);
  const [scoringId, setScoringId] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [kwInput, setKwInput] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResult, setSearchResult] = useState(null);

  const addKeyword = (val) => {
    const k = (val !== undefined ? val : kwInput).trim();
    if (k && !keywords.some((x) => x.toLowerCase() === k.toLowerCase())) setKeywords((prev) => [...prev, k]);
    setKwInput("");
  };
  const removeKeyword = (k) => setKeywords((prev) => prev.filter((x) => x !== k));

  const filtered = useMemo(() => {
    let result = signals;
    if (filterSource !== "all") result = result.filter((s) => s.source === filterSource);
    if (filterStatus !== "all") result = result.filter((s) => s.status === filterStatus);
    if (sortBy === "score") return [...result].sort((a, b) => b.aiScore - a.aiScore);
    return [...result].sort((a, b) => new Date(b.signalDate) - new Date(a.signalDate));
  }, [signals, filterSource, filterStatus, sortBy]);

  const stats = useMemo(() => ({
    total: signals.length,
    newCount: signals.filter((s) => s.status === "new").length,
    converted: signals.filter((s) => s.status === "converted").length,
    dismissed: signals.filter((s) => s.status === "dismissed").length,
    avgScore: signals.length ? (signals.reduce((sum, s) => sum + s.aiScore, 0) / signals.length).toFixed(0) : 0,
  }), [signals]);

  const handleUpdateStatus = (id, status) => {
    setSignals((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleDismiss = async (id) => {
    const ok = await confirm("Tandai sinyal ini sebagai dismissed? Bisa di-restore nanti.");
    if (!ok) return;
    handleUpdateStatus(id, "dismissed");
  };

  const handleConvert = (newClientData) => {
    if (!convertingSignal) return;
    const newClient = { ...newClientData, id: newId("cl"), ownerId: currentUser.id, createdAt: new Date().toISOString() };
    setClients((prev) => [newClient, ...prev]);
    setSignals((prev) => prev.map((s) => (s.id === convertingSignal.id ? { ...s, status: "converted", relatedClientId: newClient.id } : s)));
    setConvertingSignal(null);
    onOpenClient(newClient.id);
  };

  const handleRescore = useCallback(async (signal) => {
    setScoringId(signal.id);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          system: `Anda AI prospect scoring untuk Nusa Safety (konsultan QHSE & fire protection Indonesia). Anda menilai prospek berdasarkan: (1) Fit dengan layanan Nusa (ISO 45001, SMK3, fire protection, HAZID), (2) Urgensi/timing, (3) Existing relationship, (4) Budget alignment, (5) Decision maker access. Output STRICT JSON: {"score": <0-100>, "reasoning": "<2-3 kalimat>"}. JANGAN tulis apapun selain JSON.`,
          messages: [{ role: "user", content: `Sinyal:\nSumber: ${signal.source}\nJudul: ${signal.title}\nDeskripsi: ${signal.description}\nPerusahaan: ${signal.companyName}\nIndustri: ${signal.industry}\nLokasi: ${signal.location}\nTerdeteksi: ${formatDateTime(signal.signalDate)}\nKlien existing? ${signal.relatedClientId ? "Ya" : "Tidak"}\n\nScore prospek ini.` }],
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      const parsed = JSON.parse(jsonMatch[0]);
      setSignals((prev) => prev.map((s) => (s.id === signal.id ? { ...s, aiScore: parsed.score, aiReasoning: parsed.reasoning } : s)));
    } catch (err) {
      await confirm(`Gagal scoring AI: ${err.message}`);
    } finally {
      setScoringId(null);
    }
  }, [confirm, setSignals]);

  const handleSearch = useCallback(async () => {
    const allKw = kwInput.trim() ? [...keywords, kwInput.trim()] : keywords;
    if (allKw.length === 0) { setSearchError("Masukkan minimal satu keyword."); return; }
    setKwInput("");
    setKeywords(allKw);
    setSearching(true); setSearchError(null); setSearchResult(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2200,
          system: `Anda AI prospect researcher untuk ${COMPANY_CONFIG.brandName} (${COMPANY_CONFIG.legalName}), konsultan QHSE & fire protection Indonesia. Layanan: SMK3 (PP 50/2012), ISO 45001, ISO 14001, fire protection engineering & audit (NFPA), HAZID/HAZOP, risk assessment. Berdasarkan keyword dari tim marketing, hasilkan daftar 6-8 PROSPEK perusahaan di Indonesia yang relevan dan kemungkinan besar membutuhkan layanan tersebut. Utamakan perusahaan nyata yang dikenal di sektor terkait. Untuk setiap prospek, dasarkan alasan pada profil industri & kebutuhan QHSE umum — JANGAN mengarang berita/kejadian spesifik yang belum tentu benar. Output HARUS berupa JSON array murni tanpa teks lain: [{"companyName":"<nama PT>","industry":"<industri>","location":"<kota, provinsi>","title":"<ringkas peluang, maks 10 kata>","description":"<2-3 kalimat: kebutuhan QHSE & kenapa relevan>","aiScore":<angka 0-100 tingkat kecocokan>,"aiReasoning":"<1-2 kalimat: alasan skor + saran approach singkat>"}]`,
          messages: [{ role: "user", content: `Keyword pencarian dari tim marketing: ${allKw.join(", ")}\n\nCarikan prospek perusahaan yang paling relevan dengan keyword di atas untuk ditawari layanan QHSE/fire protection Nusa Safety. Beri skor kecocokan realistis.` }],
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Format respons AI tidak valid");
      const arr = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(arr) || arr.length === 0) throw new Error("Tidak ada prospek ditemukan, coba keyword lain");
      const now = new Date().toISOString();
      const newSignals = arr.map((p) => ({
        id: newId("sig"),
        source: "ai_research",
        title: p.title || `Peluang: ${p.companyName || "Prospek"}`,
        description: p.description || "",
        companyName: p.companyName || "—",
        industry: p.industry || "—",
        location: p.location || "—",
        signalDate: now,
        aiScore: typeof p.aiScore === "number" ? Math.max(0, Math.min(100, Math.round(p.aiScore))) : 60,
        status: "new",
        relatedClientId: null,
        sourceUrl: "",
        aiReasoning: p.aiReasoning || "",
        searchKeywords: allKw.slice(),
      }));
      setSignals((prev) => [...newSignals, ...prev]);
      setSearchResult(newSignals.length);
      setFilterStatus("new"); setFilterSource("all"); setSortBy("score");
    } catch (err) {
      setSearchError(err.message || "Gagal mencari prospek");
    } finally {
      setSearching(false);
    }
  }, [keywords, kwInput, setSignals]);

  const sources = ["all", "ai_research", "linkedin", "lpse", "inaproc", "news", "vendor_portal"];
  const statuses = ["all", "new", "reviewed", "converted", "dismissed"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radar size={22} style={{ color: T.red }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Prospect Hunter</h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1" style={{ background: T.redSoft, color: T.red, fontFamily: FONT_MONO }}>
              <Zap size={10} /> AI-powered
            </span>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>Sinyal prospek dari LinkedIn, LPSE, INAPROC, news, vendor portal — di-score otomatis oleh Claude</p>
        </div>
      </div>

      {/* AI keyword search */}
      <div className="rounded-xl p-5 mb-6" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: T.redSoft }}><Crosshair size={14} style={{ color: T.red }} /></div>
          <p className="text-[14px] font-semibold" style={{ color: T.ink }}>Mulai pencarian prospek</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1" style={{ background: T.navySoft, color: T.navy, fontFamily: FONT_MONO }}><Sparkles size={9} /> AI</span>
        </div>
        <p className="text-[11px] mb-3" style={{ color: T.inkSoft }}>Masukkan tema/keyword: industri, layanan, lokasi, atau kebutuhan. Bisa <strong>lebih dari satu keyword</strong> agar hasilnya lebih menyeluruh. Tekan Enter untuk menambah.</p>

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {keywords.map((k) => (
              <span key={k} className="inline-flex items-center gap-1 text-[12px] px-2 py-1 rounded-md" style={{ background: T.navySoft, color: T.navy }}>
                {k}
                <button onClick={() => removeKeyword(k)} aria-label="Hapus keyword"><X size={11} /></button>
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
            placeholder="contoh: pertambangan nikel Sulawesi, ISO 45001, pabrik kimia, geothermal…"
            style={{ ...inputStyle, flex: 1 }}
          />
          <button onClick={() => addKeyword()} disabled={!kwInput.trim()} className="px-3 py-2 rounded-md text-[12px] flex items-center gap-1 flex-shrink-0 disabled:opacity-40" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
            <Plus size={13} /> Tambah
          </button>
          <button onClick={handleSearch} disabled={searching || (keywords.length === 0 && !kwInput.trim())} className="px-4 py-2 rounded-md text-[12px] text-white flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50" style={{ background: T.red }}>
            {searching ? <><Loader2 size={13} className="animate-spin" /> Mencari…</> : <><Crosshair size={13} /> Mulai pencarian</>}
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className="text-[10px]" style={{ color: T.inkFaint }}>Saran cepat:</span>
          {["Pertambangan", "Migas & Geothermal", "Manufaktur", "Konstruksi BUMN", "ISO 45001", "SMK3", "Fire protection", "Pabrik kimia"].map((s) => (
            <button key={s} onClick={() => addKeyword(s)} className="text-[10px] px-2 py-0.5 rounded-md" style={{ background: T.surfaceAlt, color: T.inkSoft, border: `1px solid ${T.ruleSoft}` }}>+ {s}</button>
          ))}
        </div>

        {searchError && (
          <div className="rounded-md p-2.5 mt-3 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
            <AlertCircle size={13} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px]" style={{ color: T.red }}>{searchError}</p>
          </div>
        )}
        {searchResult !== null && !searchError && (
          <div className="rounded-md p-2.5 mt-3 flex items-start gap-2" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
            <CheckCircle2 size={13} style={{ color: T.sage }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px]" style={{ color: T.sage }}>Ditemukan <strong>{searchResult} prospek baru</strong> — sudah ditambahkan ke daftar di bawah (sumber: AI Research). Klik kartu untuk detail, atau "Jadikan klien" untuk konversi.</p>
          </div>
        )}
        <div className="rounded-md p-2.5 mt-3 flex items-start gap-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
          <AlertCircle size={12} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed" style={{ color: T.amber }}>Hasil AI bersifat <strong>rekomendasi awal</strong> untuk riset — verifikasi kontak & kebutuhan aktual sebelum outreach. <strong>Production:</strong> sambungkan scraper nyata (LinkedIn, LPSE/INAPROC, news API) di <span style={{ fontFamily: FONT_MONO }}>/api/hunter/search</span> untuk sinyal real-time.</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <MetricCard label="Total sinyal" value={stats.total} sub="dari semua sumber" icon={Radar} accent={T.red} />
        <MetricCard label="Baru" value={stats.newCount} sub="belum ditindaklanjuti" icon={Zap} accent={T.amber} />
        <MetricCard label="Converted" value={stats.converted} sub="jadi klien aktif" icon={CheckCircle2} accent={T.sage} />
        <MetricCard label="Dismissed" value={stats.dismissed} sub="tidak relevan" icon={TrendingDown} accent={T.inkSoft} />
        <MetricCard label="Avg AI score" value={stats.avgScore} sub="kualitas pipeline" icon={Award} accent={T.navy} />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Source:</span>
        {sources.map((s) => (
          <button key={s} onClick={() => setFilterSource(s)} className="px-2.5 py-1 rounded-md text-[11px] capitalize" style={{ background: filterSource === s ? T.navy : T.surface, color: filterSource === s ? "#fff" : T.inkSoft, border: `1px solid ${filterSource === s ? T.navy : T.rule}` }}>
            {s === "all" ? "Semua" : s.replace("_", " ")}
          </button>
        ))}
        <span className="text-[11px] uppercase tracking-wider ml-3" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Status:</span>
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className="px-2.5 py-1 rounded-md text-[11px] capitalize" style={{ background: filterStatus === s ? T.navy : T.surface, color: filterStatus === s ? "#fff" : T.inkSoft, border: `1px solid ${filterStatus === s ? T.navy : T.rule}` }}>
            {s === "all" ? "Semua" : s}
          </button>
        ))}
        <div className="flex-1" />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2.5 py-1 rounded-md text-[11px]" style={{ background: T.surface, color: T.ink, border: `1px solid ${T.rule}` }}>
          <option value="score">Sort: AI score</option>
          <option value="date">Sort: Tanggal terbaru</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
          <Radar size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Tidak ada sinyal yang cocok</p>
          <p className="text-xs" style={{ color: T.inkSoft }}>Coba ubah filter di atas</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((s) => (
            <SignalCard
              key={s.id}
              signal={s}
              relatedClient={clients.find((c) => c.id === s.relatedClientId)}
              onOpen={() => setSelectedSignal(s)}
              onConvert={() => setConvertingSignal(s)}
              onDismiss={() => handleDismiss(s.id)}
              onAi={() => onOpenAi({ type: "quick", prompt: `Analisa sinyal ini dan saran strategi outreach 14 hari:\n\nSumber: ${s.source}\nJudul: ${s.title}\nPerusahaan: ${s.companyName}\nIndustri: ${s.industry}\nDeskripsi: ${s.description}\nAI score saat ini: ${s.aiScore}\n\nBerikan: (1) Kenapa sinyal ini menarik untuk Nusa Safety, (2) Decision maker yang harus didekati, (3) Sequence outreach konkrit 14 hari, (4) Risiko atau red flag.` })}
              onRescore={() => handleRescore(s)}
              scoring={scoringId === s.id}
              onOpenClient={onOpenClient}
            />
          ))}
        </div>
      )}

      {selectedSignal && <SignalDetailModal signal={selectedSignal} relatedClient={clients.find((c) => c.id === selectedSignal.relatedClientId)} onClose={() => setSelectedSignal(null)} onConvert={() => { setConvertingSignal(selectedSignal); setSelectedSignal(null); }} onAi={() => { onOpenAi({ type: "quick", prompt: `Analisa mendalam sinyal:\n\n${selectedSignal.title}\n\n${selectedSignal.description}\n\nAI reasoning sebelumnya: ${selectedSignal.aiReasoning}` }); setSelectedSignal(null); }} onUpdateStatus={(status) => { handleUpdateStatus(selectedSignal.id, status); setSelectedSignal(null); }} onOpenClient={onOpenClient} />}
      {convertingSignal && <ConvertSignalModal signal={convertingSignal} onConvert={handleConvert} onClose={() => setConvertingSignal(null)} />}
    </div>
  );
}

/* ============== SIGNAL CARD ============== */
function SignalCard({ signal, relatedClient, onOpen, onConvert, onDismiss, onAi, onRescore, scoring, onOpenClient }) {
  const sourceConf = {
    ai_research: { label: "AI Research", color: T.navy, bg: T.navySoft, Icon: Sparkles },
    linkedin: { label: "LinkedIn", color: "#0A66C2", bg: "#E7EEF6", Icon: Linkedin },
    lpse: { label: "LPSE", color: T.navy, bg: T.navySoft, Icon: FileSpreadsheet },
    inaproc: { label: "INAPROC", color: T.amber, bg: T.amberSoft, Icon: FileSearch },
    news: { label: "News", color: T.red, bg: T.redSoft, Icon: Newspaper },
    vendor_portal: { label: "Vendor", color: T.sage, bg: T.sageSoft, Icon: Globe },
  }[signal.source] || { label: signal.source, color: T.inkSoft, bg: T.ruleSoft, Icon: Radar };
  const SourceIcon = sourceConf.Icon;

  const scoreColor = signal.aiScore >= 85 ? T.sage : signal.aiScore >= 70 ? T.amber : signal.aiScore >= 50 ? T.navy : T.inkSoft;
  const scoreBg = signal.aiScore >= 85 ? T.sageSoft : signal.aiScore >= 70 ? T.amberSoft : signal.aiScore >= 50 ? T.navySoft : T.ruleSoft;

  const statusConf = {
    new: { label: "Baru", color: T.red, bg: T.redSoft },
    reviewed: { label: "Reviewed", color: T.navy, bg: T.navySoft },
    converted: { label: "Converted", color: T.sage, bg: T.sageSoft },
    dismissed: { label: "Dismissed", color: T.inkSoft, bg: T.ruleSoft },
  }[signal.status] || { label: signal.status, color: T.inkSoft, bg: T.ruleSoft };

  return (
    <div className="rounded-xl p-4 group transition-all hover:shadow-sm" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: sourceConf.bg }}>
          <SourceIcon size={16} style={{ color: sourceConf.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: sourceConf.color, background: sourceConf.bg, fontFamily: FONT_MONO }}>{sourceConf.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: statusConf.color, background: statusConf.bg, fontFamily: FONT_MONO }}>{statusConf.label}</span>
          </div>
          <button onClick={onOpen} className="text-left">
            <p className="text-[13px] font-medium leading-tight" style={{ color: T.ink }}>{signal.title}</p>
          </button>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: T.inkSoft }}>{signal.companyName}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: scoreBg }}>
            <Award size={11} style={{ color: scoreColor }} />
            <span className="text-[13px] font-semibold" style={{ color: scoreColor, fontFamily: FONT_MONO }}>{signal.aiScore}</span>
          </div>
        </div>
      </div>
      <p className="text-[11px] leading-relaxed line-clamp-2 mb-2" style={{ color: T.inkSoft }}>{signal.description}</p>
      <p className="text-[10px] mb-3" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{signal.industry} · {signal.location} · {timeAgo(signal.signalDate)}</p>
      {relatedClient && (
        <button onClick={() => onOpenClient(relatedClient.id)} className="flex items-center gap-1 mb-3 text-[11px]" style={{ color: T.navy }}>
          <ArrowUpRight size={11} /> Linked: {relatedClient.name}
        </button>
      )}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        <div className="flex items-center gap-1">
          <button onClick={onAi} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: T.navySoft, color: T.navy }}>
            <Sparkles size={11} /> AI strategi
          </button>
          {signal.status !== "converted" && !relatedClient && (
            <button onClick={onConvert} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: T.sageSoft, color: T.sage }}>
              <ArrowUpRight size={11} /> Jadikan klien
            </button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onRescore} disabled={scoring} className="p-1.5 rounded-md disabled:opacity-50" style={{ background: T.surfaceAlt }} title="Re-score dengan AI" aria-label="Rescore">
            {scoring ? <Loader2 size={11} className="animate-spin" style={{ color: T.navy }} /> : <Zap size={11} style={{ color: T.navy }} />}
          </button>
          {signal.status !== "dismissed" && (
            <button onClick={onDismiss} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} title="Dismiss" aria-label="Dismiss"><X size={11} style={{ color: T.inkSoft }} /></button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============== SIGNAL DETAIL MODAL ============== */
function SignalDetailModal({ signal, relatedClient, onClose, onConvert, onAi, onUpdateStatus, onOpenClient }) {
  const sourceColor = {
    linkedin: "#0A66C2", lpse: T.navy, inaproc: T.amber, news: T.red, vendor_portal: T.sage,
  }[signal.source] || T.inkSoft;
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: sourceColor + "15" }}>
            <Radar size={15} style={{ color: sourceColor }} />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Detail sinyal</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{signal.source.toUpperCase()} · {timeAgo(signal.signalDate)}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[16px] font-semibold mb-1" style={{ color: T.ink }}>{signal.title}</p>
          <p className="text-[12px]" style={{ color: T.inkSoft }}>{signal.companyName} · {signal.industry} · {signal.location}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Deskripsi sinyal</p>
          <p className="text-[13px] leading-relaxed" style={{ color: T.ink }}>{signal.description}</p>
        </div>
        <div className="rounded-md p-3" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] uppercase tracking-wider flex items-center gap-1" style={{ color: T.navy, fontFamily: FONT_MONO }}>
              <Award size={11} /> AI Score · {signal.aiScore}/100
            </p>
            <span className="text-[10px] uppercase tracking-wider" style={{ color: T.navy, fontFamily: FONT_MONO }}>Claude Sonnet 4.6</span>
          </div>
          <p className="text-[12px] leading-relaxed" style={{ color: T.navy }}>{signal.aiReasoning}</p>
        </div>
        {signal.sourceUrl && (
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Source URL</p>
            <p className="text-[12px]" style={{ color: T.navy, fontFamily: FONT_MONO }}>{signal.sourceUrl}</p>
          </div>
        )}
        {relatedClient && (
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Linked klien existing</p>
            <button onClick={() => { onOpenClient(relatedClient.id); onClose(); }} className="flex items-center gap-2 px-3 py-2 rounded-md w-full text-left" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
              <Building2 size={14} style={{ color: T.navy }} />
              <span className="flex-1 text-[13px]" style={{ color: T.ink }}>{relatedClient.name}</span>
              <ArrowUpRight size={13} style={{ color: T.inkSoft }} />
            </button>
          </div>
        )}
      </div>
      <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2">
          <button onClick={() => onUpdateStatus("reviewed")} className="px-3 py-1.5 rounded-md text-[12px]" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>Mark reviewed</button>
          <button onClick={() => onUpdateStatus("dismissed")} className="px-3 py-1.5 rounded-md text-[12px]" style={{ background: T.surface, color: T.red, border: `1px solid ${T.rule}` }}>Dismiss</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onAi} className="px-3 py-1.5 rounded-md text-[12px] flex items-center gap-1.5" style={{ background: T.navySoft, color: T.navy }}>
            <Sparkles size={12} /> Tanya AI
          </button>
          {!relatedClient && signal.status !== "converted" && (
            <button onClick={onConvert} className="px-3 py-1.5 rounded-md text-[12px] text-white flex items-center gap-1.5" style={{ background: T.sage }}>
              <ArrowUpRight size={12} /> Jadikan klien
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ============== CONVERT SIGNAL MODAL ============== */
function ConvertSignalModal({ signal, onConvert, onClose }) {
  const [form, setForm] = useState({
    name: signal.companyName,
    industry: signal.industry,
    country: "Indonesia",
    city: signal.location.split(",")[0].trim(),
    website: "",
    employees: "1000-5000",
    tags: [signal.source.toUpperCase(), "From Hunter"],
    health: signal.aiScore >= 80 ? "hot" : signal.aiScore >= 60 ? "warm" : "cold",
    source: signal.source === "lpse" ? "LPSE" : signal.source === "inaproc" ? "INAPROC" : signal.source === "linkedin" ? "LinkedIn signal" : "Manual",
    notes: `Dari sinyal Hunter (AI score ${signal.aiScore}):\n\n${signal.title}\n\n${signal.description}\n\nAI reasoning: ${signal.aiReasoning}`,
  });
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.sageSoft }}>
            <ArrowUpRight size={15} style={{ color: T.sage }} />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Jadikan klien dari sinyal</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>AI score {signal.aiScore} · auto-fill dari data sinyal</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Nama perusahaan" required>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Industri">
            <input type="text" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Health status">
            <select value={form.health} onChange={(e) => setForm({ ...form, health: e.target.value })} style={inputStyle}>
              <option value="hot">Hot (urgensi tinggi)</option>
              <option value="warm">Warm (potensi sedang)</option>
              <option value="cold">Cold (perlu nurture)</option>
            </select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kota">
            <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} style={inputStyle} />
          </FormField>
          <FormField label="Karyawan">
            <select value={form.employees} onChange={(e) => setForm({ ...form, employees: e.target.value })} style={inputStyle}>
              <option>1-50</option><option>50-100</option><option>100-500</option><option>500-1000</option><option>1000-5000</option><option>5000+</option>
            </select>
          </FormField>
        </div>
        <FormField label="Catatan & briefing (auto-isi dari sinyal)">
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={6} style={{ ...inputStyle, resize: "vertical", minHeight: "140px", fontSize: "12px" }} />
        </FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onConvert(form)} disabled={!form.name.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.sage, opacity: form.name.trim() ? 1 : 0.5 }}>
          <ArrowUpRight size={13} /> Konversi ke klien
        </button>
      </div>
    </Modal>
  );
}

/* ============== INBOX VIEW (replies from prospects) ============== */
function InboxView({ replies, setReplies, clients, campaigns, currentUser, onOpenClient, onOpenAi }) {
  const [filterChannel, setFilterChannel] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReply, setSelectedReply] = useState(null);

  const filtered = useMemo(() => {
    let result = replies;
    if (filterChannel !== "all") result = result.filter((r) => r.channel === filterChannel);
    if (filterStatus !== "all") result = result.filter((r) => r.status === filterStatus);
    return [...result].sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt));
  }, [replies, filterChannel, filterStatus]);

  const stats = {
    total: replies.length,
    unread: replies.filter((r) => r.status === "unread").length,
    positive: replies.filter((r) => r.sentiment === "positive").length,
    neutral: replies.filter((r) => r.sentiment === "neutral").length,
    negative: replies.filter((r) => r.sentiment === "negative").length,
  };

  const handleMarkRead = (id) => {
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, status: "read" } : r)));
  };

  const handleOpenReply = (reply) => {
    if (reply.status === "unread") handleMarkRead(reply.id);
    setSelectedReply(reply);
  };

  const handleAiDraft = (reply) => {
    const client = clients.find((c) => c.id === reply.clientId);
    onOpenAi({
      type: "quick",
      prompt: `Saya menerima balasan dari prospek. Tolong drafting reply yang tepat (Bahasa Indonesia profesional, tidak terlalu kaku, langsung ke poin).\n\nKonteks klien: ${client ? `${client.name} (${client.industry})` : "Tidak terdata"}\nChannel: ${reply.channel}\nSentiment: ${reply.sentiment}\n${reply.subject ? `Subject: ${reply.subject}\n` : ""}\nPesan dari ${reply.fromName}:\n"${reply.body}"\n\nDraft 2 versi reply: (1) yang langsung commit ke next step, (2) yang lebih hati-hati & ask follow-up question. Sertakan rekomendasi mana yang dipilih.`,
    });
    setSelectedReply(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Inbox size={22} style={{ color: T.amber }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Inbox</h1>
            {stats.unread > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: T.amber, color: "#fff", fontFamily: FONT_MONO }}>
                {stats.unread} UNREAD
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>Balasan email & WhatsApp dari prospek — diurutkan terbaru di atas</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        <MetricCard label="Total balasan" value={stats.total} sub="dari semua channel" icon={Inbox} accent={T.navy} />
        <MetricCard label="Belum dibaca" value={stats.unread} sub="butuh response" icon={Reply} accent={T.amber} />
        <MetricCard label="Positive" value={stats.positive} sub="sinyal beli" icon={TrendingUp} accent={T.sage} />
        <MetricCard label="Neutral" value={stats.neutral} sub="perlu nurture" icon={Activity} accent={T.navy} />
        <MetricCard label="Negative" value={stats.negative} sub="rejection/delay" icon={TrendingDown} accent={T.red} />
      </div>

      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Channel:</span>
        {["all", "email", "whatsapp"].map((c) => (
          <button key={c} onClick={() => setFilterChannel(c)} className="px-2.5 py-1 rounded-md text-[11px] capitalize" style={{ background: filterChannel === c ? T.navy : T.surface, color: filterChannel === c ? "#fff" : T.inkSoft, border: `1px solid ${filterChannel === c ? T.navy : T.rule}` }}>
            {c === "all" ? "Semua" : c}
          </button>
        ))}
        <span className="text-[11px] uppercase tracking-wider ml-3" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Status:</span>
        {["all", "unread", "read"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className="px-2.5 py-1 rounded-md text-[11px] capitalize" style={{ background: filterStatus === s ? T.navy : T.surface, color: filterStatus === s ? "#fff" : T.inkSoft, border: `1px solid ${filterStatus === s ? T.navy : T.rule}` }}>
            {s === "all" ? "Semua" : s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
          <Inbox size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Inbox kosong</p>
          <p className="text-xs" style={{ color: T.inkSoft }}>Tidak ada balasan yang cocok dengan filter</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          {filtered.map((r, idx) => (
            <ReplyCard
              key={r.id}
              reply={r}
              client={clients.find((c) => c.id === r.clientId)}
              campaign={campaigns.find((c) => c.id === r.campaignId)}
              isFirst={idx === 0}
              onOpen={() => handleOpenReply(r)}
              onOpenClient={onOpenClient}
            />
          ))}
        </div>
      )}

      {selectedReply && <ReplyDetailModal reply={selectedReply} client={clients.find((c) => c.id === selectedReply.clientId)} campaign={campaigns.find((c) => c.id === selectedReply.campaignId)} onClose={() => setSelectedReply(null)} onAiDraft={() => handleAiDraft(selectedReply)} onOpenClient={(id) => { setSelectedReply(null); onOpenClient(id); }} />}
    </div>
  );
}

/* ============== REPLY CARD (row in inbox table) ============== */
function ReplyCard({ reply, client, campaign, isFirst, onOpen, onOpenClient }) {
  const channelConf = {
    email: { Icon: Mail, color: T.navy, bg: T.navySoft },
    whatsapp: { Icon: MessageCircle, color: T.sage, bg: T.sageSoft },
  }[reply.channel] || { Icon: MessageSquare, color: T.inkSoft, bg: T.ruleSoft };

  const sentimentConf = {
    positive: { label: "Positive", color: T.sage, bg: T.sageSoft },
    neutral: { label: "Neutral", color: T.inkSoft, bg: T.ruleSoft },
    negative: { label: "Negative", color: T.red, bg: T.redSoft },
  }[reply.sentiment] || { label: reply.sentiment, color: T.inkSoft, bg: T.ruleSoft };

  const isUnread = reply.status === "unread";

  return (
    <button onClick={onOpen} className="w-full flex items-start gap-3 p-4 text-left group transition-colors hover:bg-gray-50" style={{ background: isUnread ? T.surfaceAlt : T.surface, borderTop: isFirst ? "none" : `1px solid ${T.ruleSoft}` }}>
      <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 relative" style={{ background: channelConf.bg }}>
        <channelConf.Icon size={14} style={{ color: channelConf.color }} />
        {isUnread && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full" style={{ background: T.amber, border: `1.5px solid ${T.surface}` }} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-[13px]" style={{ color: T.ink, fontWeight: isUnread ? 600 : 400 }}>{reply.fromName}</p>
          {client && <span className="text-[11px]" style={{ color: T.inkFaint }}>· {client.name}</span>}
        </div>
        {reply.subject && <p className="text-[12px] mb-0.5 truncate" style={{ color: T.ink, fontWeight: isUnread ? 500 : 400 }}>{reply.subject}</p>}
        <p className="text-[11px] line-clamp-1" style={{ color: T.inkSoft }}>{reply.body}</p>
        {campaign && (
          <p className="text-[10px] mt-1 inline-flex items-center gap-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>
            <Megaphone size={9} /> {campaign.name}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{timeAgo(reply.receivedAt)}</p>
        <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: sentimentConf.color, background: sentimentConf.bg, fontFamily: FONT_MONO }}>{sentimentConf.label}</span>
      </div>
    </button>
  );
}

/* ============== REPLY DETAIL MODAL ============== */
function ReplyDetailModal({ reply, client, campaign, onClose, onAiDraft, onOpenClient }) {
  const channelConf = {
    email: { Icon: Mail, color: T.navy, bg: T.navySoft, label: "Email" },
    whatsapp: { Icon: MessageCircle, color: T.sage, bg: T.sageSoft, label: "WhatsApp" },
  }[reply.channel] || { Icon: MessageSquare, color: T.inkSoft, bg: T.ruleSoft, label: reply.channel };

  const sentimentConf = {
    positive: { label: "Positive", color: T.sage, bg: T.sageSoft },
    neutral: { label: "Neutral", color: T.inkSoft, bg: T.ruleSoft },
    negative: { label: "Negative", color: T.red, bg: T.redSoft },
  }[reply.sentiment] || { label: reply.sentiment, color: T.inkSoft, bg: T.ruleSoft };

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: channelConf.bg }}>
            <channelConf.Icon size={15} style={{ color: channelConf.color }} />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{reply.fromName}</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{channelConf.label.toUpperCase()} · {formatDateTime(reply.receivedAt)}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: sentimentConf.color, background: sentimentConf.bg, fontFamily: FONT_MONO }}>{sentimentConf.label} sentiment</span>
          {client && (
            <button onClick={() => onOpenClient(client.id)} className="text-[11px] px-1.5 py-0.5 rounded inline-flex items-center gap-1 hover:underline" style={{ color: T.navy, background: T.navySoft, fontFamily: FONT_MONO }}>
              <Building2 size={10} /> {client.name}
            </button>
          )}
          {campaign && <span className="text-[11px] px-1.5 py-0.5 rounded inline-flex items-center gap-1" style={{ color: T.inkSoft, background: T.surfaceAlt, fontFamily: FONT_MONO }}><Megaphone size={10} /> {campaign.name}</span>}
        </div>
        <div className="text-[11px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>From: {reply.from}</div>
        {reply.subject && (
          <div>
            <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Subject</p>
            <p className="text-[14px] font-medium" style={{ color: T.ink }}>{reply.subject}</p>
          </div>
        )}
        <div>
          <p className="text-[11px] uppercase tracking-wider mb-1.5" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Pesan</p>
          <div className="rounded-md p-4 max-h-[300px] overflow-y-auto" style={{ background: T.surfaceAlt, border: `1px solid ${T.ruleSoft}` }}>
            <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{reply.body}</p>
          </div>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Tutup</button>
        {client && (
          <button onClick={() => onOpenClient(client.id)} className="px-4 py-2 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
            <Building2 size={13} /> Lihat klien
          </button>
        )}
        <button onClick={onAiDraft} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy }}>
          <Sparkles size={13} /> Draft reply dengan AI
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================================
   PROPOSAL ENGINE (v1.1) — HPP, margin, cost operasional, AI drafting, numbering
   ============================================================================ */

const ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const COST_CATEGORIES = {
  direct: [
    "Tenaga Ahli / Lead Auditor", "Konsultan QHSE", "Sertifikasi & Lisensi",
    "Perjalanan Dinas", "Akomodasi & Konsumsi", "Equipment & Tools",
    "Dokumentasi & Reporting", "Training & Materials", "Subkontraktor",
  ],
  operational: ["Overhead Kantor", "Admin & Finance", "Marketing Allocation", "Contingency"],
};

const COST_UNITS = ["man-day", "hari", "trip", "paket", "unit", "lumpsum", "bulan", "orang"];

const formatFullIDR = (n) => {
  if (!n && n !== 0) return "—";
  return "Rp " + Math.round(n).toLocaleString("id-ID");
};

/* ============== BILLING / INVOICE HELPERS ============== */
const TERM_TEMPLATES = [
  { id: "tpl_dp_pelunasan", label: "DP 50% + Pelunasan 50%", terms: [{ label: "DP / Uang Muka", percentage: 50 }, { label: "Pelunasan", percentage: 50 }] },
  { id: "tpl_dp30", label: "DP 30% + Progress 40% + Pelunasan 30%", terms: [{ label: "DP / Uang Muka", percentage: 30 }, { label: "Termin 2 (Progress)", percentage: 40 }, { label: "Pelunasan", percentage: 30 }] },
  { id: "tpl_termin4", label: "4 Termin (25% rata)", terms: [{ label: "DP / Termin 1", percentage: 25 }, { label: "Termin 2", percentage: 25 }, { label: "Termin 3", percentage: 25 }, { label: "Pelunasan", percentage: 25 }] },
  { id: "tpl_full", label: "Lunas di muka (100%)", terms: [{ label: "Pembayaran Penuh", percentage: 100 }] },
];

function generateInvoiceNumber(proposals) {
  const now = new Date();
  const year = now.getFullYear();
  const roman = ROMAN_MONTHS[now.getMonth()];
  let maxSeq = 0;
  (proposals || []).forEach((p) => {
    (p.paymentTerms || []).forEach((t) => {
      if (t.invoiceNumber && t.invoiceNumber.includes(`/${year}/`)) {
        const parts = t.invoiceNumber.split("/");
        const seq = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    });
  });
  return `NS/INV/${roman}/${year}/${String(maxSeq + 1).padStart(3, "0")}`;
}

const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const due = new Date(dateStr); due.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.round((due - today) / 86400000);
};

function termStatusConf(term) {
  if (term.status === "paid") return { key: "paid", label: "Lunas", color: T.sage, bg: T.sageSoft };
  const d = daysUntil(term.dueDate);
  if (d !== null && d < 0) return { key: "overdue", label: `Telat ${Math.abs(d)} hari`, color: T.red, bg: T.redSoft };
  if (term.status === "invoiced") {
    if (d !== null && d <= 7) return { key: "due_soon", label: d === 0 ? "Jatuh tempo hari ini" : `${d} hari lagi`, color: T.amber, bg: T.amberSoft };
    return { key: "invoiced", label: "Terkirim", color: T.navy, bg: T.navySoft };
  }
  return { key: "pending", label: "Belum ditagih", color: T.inkSoft, bg: T.ruleSoft };
}

function computeTermAmounts(term, fin, taxPercent) {
  const gross = (term.amount !== null && term.amount !== undefined && term.amount !== "") ? Number(term.amount) : (fin.total * (Number(term.percentage) || 0) / 100);
  const taxRate = (Number(taxPercent) || 0) / 100;
  const dpp = taxRate > 0 ? gross / (1 + taxRate) : gross;
  const ppn = gross - dpp;
  return { gross, dpp, ppn };
}

function proposalBillingSummary(proposal, fin) {
  const terms = proposal.paymentTerms || [];
  let invoiced = 0, paid = 0, outstanding = 0;
  terms.forEach((t) => {
    const amt = computeTermAmounts(t, fin, proposal.taxPercent).gross;
    if (t.status === "paid") paid += (t.paidAmount !== null && t.paidAmount !== undefined && t.paidAmount !== "") ? Number(t.paidAmount) : amt;
    else {
      outstanding += amt;
      if (t.status === "invoiced") invoiced += amt;
    }
  });
  const allocated = terms.reduce((s, t) => s + computeTermAmounts(t, fin, proposal.taxPercent).gross, 0);
  return { invoiced, paid, outstanding, allocated, contractValue: fin.total, unallocated: fin.total - allocated };
}

function generateProposalNumber(proposals) {
  const now = new Date();
  const year = now.getFullYear();
  const roman = ROMAN_MONTHS[now.getMonth()];
  let maxSeq = 0;
  (proposals || []).forEach((p) => {
    if (p.number && p.number.includes(`/${year}/`)) {
      const parts = p.number.split("/");
      const seq = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  });
  return `NS/PRP/${roman}/${year}/${String(maxSeq + 1).padStart(3, "0")}`;
}

function calcProposalFinancials(proposal) {
  const items = proposal.costItems || [];
  const directCost = items.filter((i) => i.type === "direct").reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const operationalCost = items.filter((i) => i.type === "operational").reduce((s, i) => s + i.quantity * i.unitCost, 0);
  const totalCost = directCost + operationalCost;
  let marginAmount = 0;
  if (proposal.marginType === "percentage") {
    const m = (proposal.marginValue || 0) / 100;
    const selling = m < 1 ? totalCost / (1 - m) : totalCost;
    marginAmount = selling - totalCost;
  } else {
    marginAmount = totalCost * ((proposal.marginValue || 0) / 100);
  }
  const sellingBeforeTax = totalCost + marginAmount;
  const taxAmount = sellingBeforeTax * ((proposal.taxPercent || 0) / 100);
  const total = sellingBeforeTax + taxAmount;
  const actualMarginPct = sellingBeforeTax > 0 ? (marginAmount / sellingBeforeTax) * 100 : 0;
  return { directCost, operationalCost, totalCost, marginAmount, sellingBeforeTax, taxAmount, total, actualMarginPct };
}

function proposalStatusConf(status) {
  return {
    draft: { label: "Draft", color: T.inkSoft, bg: T.ruleSoft },
    review: { label: "Review", color: T.navy, bg: T.navySoft },
    sent: { label: "Terkirim", color: T.amber, bg: T.amberSoft },
    negotiation: { label: "Negosiasi", color: "#8B5A1F", bg: "#F6E6CF" },
    won: { label: "Menang", color: T.sage, bg: T.sageSoft },
    lost: { label: "Kalah", color: T.red, bg: T.redSoft },
    on_hold: { label: "On Hold", color: T.inkSoft, bg: T.ruleSoft },
  }[status] || { label: status, color: T.inkSoft, bg: T.ruleSoft };
}

const SEED_PROPOSALS = [
  {
    id: "prop_001", number: "NS/PRP/VI/2026/001",
    title: "Konsultansi HSE PLTP Kamojang Ekspansi Unit 4",
    clientId: "cl_001", dealId: "dl_001", ownerId: "u_admin",
    status: "sent", createdAt: "2026-06-09T08:00:00Z", sentAt: "2026-06-11T10:00:00Z", validUntil: "2026-07-15",
    sections: [
      { id: "sec_1", order: 1, title: "Ringkasan Eksekutif", content: "PT. Nusa Rendra Jayatama (Nusa Safety) dengan hormat mengajukan proposal layanan konsultansi HSE untuk mendukung ekspansi PLTP Kamojang Unit 4. Dengan pengalaman pada proyek geothermal dan sertifikasi ISO 45001 serta SMK3, kami berkomitmen memberikan layanan risk assessment dan compliance yang komprehensif sesuai standar nasional dan internasional." },
      { id: "sec_2", order: 2, title: "Ruang Lingkup Pekerjaan", content: "1. HAZID & HAZOP untuk fasilitas ekspansi Unit 4\n2. Risk assessment komprehensif (kualitatif & semi-kuantitatif)\n3. Review & gap analysis sistem manajemen K3 terhadap ISO 45001:2018\n4. Audit fire protection sesuai NFPA standards\n5. Penyusunan dokumen SECE (Safety & Environmental Critical Elements)\n6. Pendampingan implementasi & training awareness" },
      { id: "sec_3", order: 3, title: "Metodologi & Pendekatan", content: "Pendekatan kami mengikuti siklus PDCA dengan tahapan: (1) Mobilisasi & kick-off, (2) Site survey & data collection, (3) Workshop HAZID/HAZOP dengan tim multidisiplin, (4) Analisis & penyusunan rekomendasi, (5) Penyusunan laporan & presentasi, (6) Pendampingan implementasi. Setiap tahapan disertai milestone dan deliverable yang terukur." },
    ],
    costItems: [
      { id: "ci_1", category: "Tenaga Ahli / Lead Auditor", description: "Lead Auditor ISO 45001 (senior)", type: "direct", unit: "man-day", quantity: 20, unitCost: 4500000 },
      { id: "ci_2", category: "Konsultan QHSE", description: "Konsultan QHSE (2 orang)", type: "direct", unit: "man-day", quantity: 40, unitCost: 3000000 },
      { id: "ci_3", category: "Tenaga Ahli / Lead Auditor", description: "HAZID/HAZOP Facilitator", type: "direct", unit: "man-day", quantity: 10, unitCost: 5000000 },
      { id: "ci_4", category: "Perjalanan Dinas", description: "Tiket PP Jakarta-Bandung + transport lokal", type: "direct", unit: "trip", quantity: 6, unitCost: 8000000 },
      { id: "ci_5", category: "Akomodasi & Konsumsi", description: "Hotel & konsumsi tim selama on-site", type: "direct", unit: "hari", quantity: 30, unitCost: 1200000 },
      { id: "ci_6", category: "Dokumentasi & Reporting", description: "Penyusunan laporan teknis & dokumen SECE", type: "direct", unit: "lumpsum", quantity: 1, unitCost: 25000000 },
      { id: "ci_7", category: "Overhead Kantor", description: "Alokasi overhead operasional kantor", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 45000000 },
      { id: "ci_8", category: "Admin & Finance", description: "Administrasi proyek & finance", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 20000000 },
    ],
    marginType: "markup", marginValue: 35, taxPercent: 11,
    clientNotes: "VP HSE (Budi Santoso) sudah konfirmasi proposal diterima. Tim procurement sedang review komersial. Kemungkinan ada nego di harga akomodasi.",
    progressLog: [
      { id: "pl_1", status: "draft", note: "Proposal dibuat berdasarkan brief kick-off meeting.", at: "2026-06-09T08:00:00Z", by: "Daddy" },
      { id: "pl_2", status: "review", note: "Review internal margin & scope dengan tim teknis.", at: "2026-06-10T14:00:00Z", by: "Daddy" },
      { id: "pl_3", status: "sent", note: "Proposal dikirim ke b.santoso@pge.pertamina.com via email.", at: "2026-06-11T10:00:00Z", by: "Daddy" },
    ],
  },
  {
    id: "prop_002", number: "NS/PRP/VI/2026/002",
    title: "Implementasi SMK3 & Sertifikasi ISO 45001 — Sorowako",
    clientId: "cl_003", dealId: "dl_003", ownerId: "u_admin",
    status: "draft", createdAt: "2026-06-11T09:00:00Z", sentAt: null, validUntil: "2026-08-30",
    sections: [
      { id: "sec_v1", order: 1, title: "Ringkasan Eksekutif", content: "Nusa Safety mengajukan proposal implementasi penuh Sistem Manajemen Keselamatan dan Kesehatan Kerja (SMK3) PP 50/2012 serta persiapan sertifikasi ISO 45001:2018 untuk operasi tambang nikel Vale Indonesia di Sorowako." },
      { id: "sec_v2", order: 2, title: "Ruang Lingkup Pekerjaan", content: "Gap analysis, penyusunan dokumentasi sistem, implementasi 12 elemen SMK3, internal audit, manajemen review, hingga pendampingan sertifikasi eksternal." },
    ],
    costItems: [
      { id: "civ_1", category: "Tenaga Ahli / Lead Auditor", description: "Lead Consultant SMK3 (senior)", type: "direct", unit: "man-day", quantity: 45, unitCost: 4500000 },
      { id: "civ_2", category: "Konsultan QHSE", description: "Konsultan implementasi (3 orang)", type: "direct", unit: "man-day", quantity: 90, unitCost: 3000000 },
      { id: "civ_3", category: "Perjalanan Dinas", description: "Tiket PP Jakarta-Sorowako", type: "direct", unit: "trip", quantity: 8, unitCost: 12000000 },
      { id: "civ_4", category: "Akomodasi & Konsumsi", description: "Akomodasi tim di site remote", type: "direct", unit: "hari", quantity: 60, unitCost: 1500000 },
      { id: "civ_5", category: "Training & Materials", description: "Training awareness & materi SMK3", type: "direct", unit: "paket", quantity: 1, unitCost: 35000000 },
      { id: "civ_6", category: "Overhead Kantor", description: "Alokasi overhead", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 75000000 },
      { id: "civ_7", category: "Contingency", description: "Contingency proyek remote area", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 40000000 },
    ],
    marginType: "markup", marginValue: 40, taxPercent: 11,
    clientNotes: "Belum dikirim. Menunggu konfirmasi scope final dari GM Operations (David Tjandra). Perlu pertimbangkan biaya remote area Sorowako yang tinggi.",
    progressLog: [
      { id: "plv_1", status: "draft", note: "Draft awal disusun dari sinyal hiring SHE Manager.", at: "2026-06-11T09:00:00Z", by: "Daddy" },
    ],
  },
  {
    id: "prop_003", number: "NS/PRP/V/2026/018",
    title: "Renewal Audit SMK3 Tahunan 2026 — Adaro",
    clientId: "cl_004", dealId: "dl_004", ownerId: "u_admin",
    status: "won", createdAt: "2026-05-10T08:00:00Z", sentAt: "2026-05-12T10:00:00Z", validUntil: "2026-06-30",
    sections: [
      { id: "sec_a1", order: 1, title: "Ringkasan Eksekutif", content: "Sebagai mitra terpercaya Adaro Energy selama 3 tahun, Nusa Safety mengajukan proposal renewal audit SMK3 tahunan untuk memastikan keberlanjutan sertifikasi dan continuous improvement sistem K3." },
    ],
    costItems: [
      { id: "cia_1", category: "Tenaga Ahli / Lead Auditor", description: "Lead Auditor SMK3", type: "direct", unit: "man-day", quantity: 15, unitCost: 4500000 },
      { id: "cia_2", category: "Konsultan QHSE", description: "Auditor pendamping", type: "direct", unit: "man-day", quantity: 20, unitCost: 3000000 },
      { id: "cia_3", category: "Perjalanan Dinas", description: "Tiket & transport", type: "direct", unit: "trip", quantity: 4, unitCost: 7000000 },
      { id: "cia_4", category: "Dokumentasi & Reporting", description: "Laporan audit & sertifikat", type: "direct", unit: "lumpsum", quantity: 1, unitCost: 15000000 },
      { id: "cia_5", category: "Overhead Kantor", description: "Overhead", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 30000000 },
    ],
    marginType: "markup", marginValue: 38, taxPercent: 11,
    clientNotes: "MENANG. PO sudah terbit. Kontrak ditandatangani Ibu Maria Lestari. Mulai eksekusi Juli 2026.",
    paymentTerms: [
      { id: "pt_a1", label: "DP / Uang Muka", percentage: 30, amount: null, dueDate: "2026-06-05", status: "paid", invoiceNumber: "NS/INV/V/2026/001", invoiceDate: "2026-05-29", paidDate: "2026-06-02", paidAmount: 92137770, paymentMethod: "Transfer Bank Mandiri", notes: "DP diterima sesuai kontrak. Bukti transfer dari Adaro Finance." },
      { id: "pt_a2", label: "Termin 2 (Progress 50%)", percentage: 40, amount: null, dueDate: "2026-06-16", status: "invoiced", invoiceNumber: "NS/INV/VI/2026/002", invoiceDate: "2026-06-09", paidDate: null, paidAmount: null, paymentMethod: "", notes: "Invoice dikirim ke procurement. Menunggu pembayaran." },
      { id: "pt_a3", label: "Pelunasan", percentage: 30, amount: null, dueDate: "2026-09-15", status: "pending", invoiceNumber: null, invoiceDate: null, paidDate: null, paidAmount: null, paymentMethod: "", notes: "Ditagih setelah serah terima laporan audit final." },
    ],
    progressLog: [
      { id: "pla_1", status: "draft", note: "Renewal proposal disiapkan.", at: "2026-05-10T08:00:00Z", by: "Daddy" },
      { id: "pla_2", status: "sent", note: "Dikirim ke procurement Adaro.", at: "2026-05-12T10:00:00Z", by: "Daddy" },
      { id: "pla_3", status: "negotiation", note: "Nego minor di jadwal pelaksanaan.", at: "2026-05-20T14:00:00Z", by: "Daddy" },
      { id: "pla_4", status: "won", note: "PO terbit, kontrak ditandatangani. WON!", at: "2026-05-28T11:00:00Z", by: "Daddy" },
    ],
  },
  {
    id: "prop_004", number: "NS/PRP/VI/2026/003",
    title: "Audit & Redesign Fire Protection System — HSM Krakatau Steel",
    clientId: "cl_002", dealId: "dl_002", ownerId: "u_sales1",
    status: "negotiation", createdAt: "2026-06-06T08:00:00Z", sentAt: "2026-06-08T10:00:00Z", validUntil: "2026-07-20",
    sections: [
      { id: "sec_k1", order: 1, title: "Ringkasan Eksekutif", content: "Nusa Safety mengajukan proposal audit dan redesign sistem fire protection untuk Hot Strip Mill (HSM) Krakatau Steel sesuai standar NFPA, mendukung rencana ekspansi mill tahap 2." },
    ],
    costItems: [
      { id: "cik_1", category: "Tenaga Ahli / Lead Auditor", description: "Fire Protection Engineer (NFPA certified)", type: "direct", unit: "man-day", quantity: 25, unitCost: 5000000 },
      { id: "cik_2", category: "Konsultan QHSE", description: "Konsultan teknis", type: "direct", unit: "man-day", quantity: 30, unitCost: 3000000 },
      { id: "cik_3", category: "Equipment & Tools", description: "Sewa alat ukur & testing", type: "direct", unit: "paket", quantity: 1, unitCost: 30000000 },
      { id: "cik_4", category: "Perjalanan Dinas", description: "Transport Jakarta-Cilegon", type: "direct", unit: "trip", quantity: 10, unitCost: 3000000 },
      { id: "cik_5", category: "Dokumentasi & Reporting", description: "Engineering drawing & laporan", type: "direct", unit: "lumpsum", quantity: 1, unitCost: 28000000 },
      { id: "cik_6", category: "Overhead Kantor", description: "Overhead", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 40000000 },
      { id: "cik_7", category: "Admin & Finance", description: "Admin proyek", type: "operational", unit: "lumpsum", quantity: 1, unitCost: 15000000 },
    ],
    marginType: "markup", marginValue: 32, taxPercent: 11,
    clientNotes: "SHE Manager (Ahmad Hidayat) minta penyesuaian: breakdown biaya equipment lebih detail dan opsi pembayaran termin. Sedang revisi komersial.",
    progressLog: [
      { id: "plk_1", status: "draft", note: "Proposal disusun pasca sync meeting.", at: "2026-06-06T08:00:00Z", by: "Ahmad Sutanto" },
      { id: "plk_2", status: "sent", note: "Dikirim ke a.hidayat@krakatausteel.com.", at: "2026-06-08T10:00:00Z", by: "Ahmad Sutanto" },
      { id: "plk_3", status: "negotiation", note: "Klien minta revisi breakdown equipment & opsi termin.", at: "2026-06-11T15:00:00Z", by: "Ahmad Sutanto" },
    ],
  },
];

/* ============== BREAKDOWN ROW (financial summary line) ============== */
function BreakdownRow({ label, value, light, bold, accent }) {
  const labelColor = light ? "rgba(255,255,255,0.85)" : T.inkSoft;
  const valueColor = accent || (light ? "#fff" : T.ink);
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px]" style={{ color: labelColor, fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span className="text-[13px]" style={{ color: valueColor, fontWeight: bold ? 700 : 500, fontFamily: FONT_MONO }}>{formatFullIDR(value)}</span>
    </div>
  );
}

/* ============== PROPOSALS VIEW ============== */
function ProposalsView({ proposals, setProposals, clients, deals, contacts, confirm, currentUser, users, onOpenClient, onOpenAi, openProposalId, onProposalOpened }) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProposal, setEditingProposal] = useState(null);

  useEffect(() => {
    if (openProposalId) {
      setSelectedId(openProposalId);
      if (onProposalOpened) onProposalOpened();
    }
  }, [openProposalId, onProposalOpened]);

  const stats = useMemo(() => {
    let activeValue = 0, wonValue = 0, marginSum = 0;
    proposals.forEach((p) => {
      const fin = calcProposalFinancials(p);
      if (p.status === "won") wonValue += fin.total;
      else if (p.status !== "lost") activeValue += fin.total;
      marginSum += fin.actualMarginPct;
    });
    const decided = proposals.filter((p) => p.status === "won" || p.status === "lost");
    const winRate = decided.length ? (proposals.filter((p) => p.status === "won").length / decided.length) * 100 : 0;
    return { activeValue, wonValue, avgMargin: proposals.length ? marginSum / proposals.length : 0, winRate };
  }, [proposals]);

  const filtered = useMemo(() => {
    return proposals.filter((p) => {
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const client = clients.find((c) => c.id === p.clientId);
      return p.title.toLowerCase().includes(q) || p.number.toLowerCase().includes(q) || (client && client.name.toLowerCase().includes(q));
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [proposals, searchQuery, filterStatus, clients]);

  const selectedProposal = proposals.find((p) => p.id === selectedId);
  const canEditSelected = selectedProposal && (currentUser.role === "admin" || selectedProposal.ownerId === currentUser.id);

  const handleSave = (data) => {
    if (data.id) {
      setProposals((prev) => prev.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
    } else {
      const np = {
        ...data, id: newId("prop"), number: generateProposalNumber(proposals),
        ownerId: currentUser.id, status: "draft", createdAt: new Date().toISOString(), sentAt: null,
        sections: [], costItems: [], marginType: "markup", marginValue: 35, taxPercent: 11,
        clientNotes: "", progressLog: [{ id: newId("pl"), status: "draft", note: "Proposal dibuat.", at: new Date().toISOString(), by: currentUser.name }],
      };
      setProposals((prev) => [np, ...prev]);
    }
    setShowAddModal(false);
    setEditingProposal(null);
  };

  const handleDelete = async (id) => {
    const target = proposals.find((p) => p.id === id);
    if (!target) return;
    if (currentUser.role !== "admin" && target.ownerId !== currentUser.id) return;
    const ok = await confirm(`Hapus proposal "${target.number}"? Tindakan ini permanen.`);
    if (!ok) return;
    setProposals((prev) => prev.filter((p) => p.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  if (selectedProposal) {
    if (currentUser.role !== "admin" && selectedProposal.ownerId !== currentUser.id) {
      return (
        <div className="rounded-xl p-12 text-center" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <Lock size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Akses tidak diizinkan</p>
          <p className="text-xs mb-4" style={{ color: T.inkSoft }}>Proposal ini bukan milik Anda.</p>
          <button onClick={() => setSelectedId(null)} className="px-4 py-2 rounded-md text-sm" style={{ background: T.navy, color: "#fff" }}>Kembali</button>
        </div>
      );
    }
    return (
      <ProposalDetail
        proposal={selectedProposal} setProposals={setProposals} allProposals={proposals}
        client={clients.find((c) => c.id === selectedProposal.clientId)}
        deal={deals.find((d) => d.id === selectedProposal.dealId)}
        contacts={contacts} users={users} currentUser={currentUser} canEdit={canEditSelected}
        onBack={() => setSelectedId(null)}
        onEdit={() => canEditSelected && setEditingProposal(selectedProposal)}
        onDelete={() => canEditSelected && handleDelete(selectedProposal.id)}
        onOpenClient={onOpenClient} onOpenAi={onOpenAi} confirm={confirm}
        modalOpen={editingProposal !== null} editingProposal={editingProposal}
        onSaveEdit={handleSave} onCloseEdit={() => setEditingProposal(null)}
      />
    );
  }

  const statuses = ["all", "draft", "review", "sent", "negotiation", "won", "lost"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList size={22} style={{ color: T.navy }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Proposal</h1>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>{proposals.length} proposal · penomoran otomatis · HPP, margin & cost engine terintegrasi</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-md text-white text-sm font-medium flex items-center gap-2" style={{ background: T.navy }}>
          <Plus size={14} /> Proposal baru
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <MetricCard label="Nilai proposal aktif" value={formatIDR(stats.activeValue)} sub="belum diputuskan" icon={ClipboardList} accent={T.amber} />
        <MetricCard label="Nilai menang" value={formatIDR(stats.wonValue)} sub="proposal won" icon={CheckCircle2} accent={T.sage} />
        <MetricCard label="Win rate" value={`${stats.winRate.toFixed(0)}%`} sub="dari yang diputuskan" icon={TrendingUp} accent={T.navy} />
        <MetricCard label="Avg margin" value={`${stats.avgMargin.toFixed(1)}%`} sub="rata-rata semua" icon={Percent} accent={T.sage} />
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[260px] flex items-center gap-2 px-3 py-2 rounded-md" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <Search size={14} style={{ color: T.inkFaint }} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari judul, nomor, atau klien…" className="flex-1 bg-transparent text-sm outline-none" style={{ color: T.ink }} />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {statuses.map((s) => {
            const conf = s === "all" ? { label: "Semua" } : proposalStatusConf(s);
            return (
              <button key={s} onClick={() => setFilterStatus(s)} className="px-2.5 py-1.5 rounded-md text-[11px]" style={{ background: filterStatus === s ? T.navy : T.surface, color: filterStatus === s ? "#fff" : T.inkSoft, border: `1px solid ${filterStatus === s ? T.navy : T.rule}` }}>
                {conf.label}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
          <ClipboardList size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Belum ada proposal</p>
          <p className="text-xs" style={{ color: T.inkSoft }}>Buat proposal pertama — nomor akan di-generate otomatis</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => (
            <ProposalCard key={p.id} proposal={p} client={clients.find((c) => c.id === p.clientId)} owner={users.find((u) => u.id === p.ownerId)} onClick={() => setSelectedId(p.id)} showOwner={currentUser.role === "admin"} />
          ))}
        </div>
      )}

      {(showAddModal || editingProposal) && <ProposalModal proposal={editingProposal} clients={clients} deals={deals} onSave={handleSave} onClose={() => { setShowAddModal(false); setEditingProposal(null); }} />}
    </div>
  );
}

/* ============== PROPOSAL CARD ============== */
function ProposalCard({ proposal, client, owner, onClick, showOwner }) {
  const conf = proposalStatusConf(proposal.status);
  const fin = calcProposalFinancials(proposal);
  return (
    <div onClick={onClick} className="rounded-xl p-4 cursor-pointer transition-all hover:shadow-sm" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
          <ClipboardList size={18} style={{ color: T.navy }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] mb-0.5" style={{ color: T.navy, fontFamily: FONT_MONO }}>{proposal.number}</p>
          <p className="text-[13px] font-medium leading-tight" style={{ color: T.ink }}>{proposal.title}</p>
          <p className="text-[11px] mt-0.5 truncate" style={{ color: T.inkSoft }}>{client ? client.name : "Tanpa klien"}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: conf.color, background: conf.bg, fontFamily: FONT_MONO }}>{conf.label}</span>
          {showOwner && owner && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium" style={{ background: owner.role === "admin" ? T.navySoft : T.sageSoft, color: owner.role === "admin" ? T.navy : T.sage }} title={owner.name}>
              {getUserInitials(owner.name)}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 py-3 border-t border-b" style={{ borderColor: T.ruleSoft }}>
        <div>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Nilai total</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatIDR(fin.total)}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Margin</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: T.sage, fontFamily: FONT_MONO }}>{fin.actualMarginPct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Items</p>
          <p className="text-[13px] font-semibold mt-0.5" style={{ color: T.ink, fontFamily: FONT_MONO }}>{proposal.costItems.length}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3">
        <span className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{proposal.sections.length} section · dibuat {formatDate(proposal.createdAt)}</span>
        <span className="text-[10px]" style={{ color: T.inkFaint }}>Valid s/d {formatDate(proposal.validUntil)}</span>
      </div>
    </div>
  );
}

/* ============== PROPOSAL DETAIL ============== */
function ProposalDetail({ proposal, setProposals, allProposals, client, deal, contacts, users, currentUser, canEdit, onBack, onEdit, onDelete, onOpenClient, onOpenAi, confirm, modalOpen, editingProposal, onSaveEdit, onCloseEdit }) {
  const [tab, setTab] = useState("ringkasan");
  const [editingSection, setEditingSection] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [addItemType, setAddItemType] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editingTerm, setEditingTerm] = useState(null);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [showSetupTerms, setShowSetupTerms] = useState(false);
  const [payingTerm, setPayingTerm] = useState(null);
  const [invoiceTerm, setInvoiceTerm] = useState(null);
  const [emailTerm, setEmailTerm] = useState(null);

  const conf = proposalStatusConf(proposal.status);
  const fin = calcProposalFinancials(proposal);
  const owner = users.find((u) => u.id === proposal.ownerId);

  const update = (patch) => setProposals((prev) => prev.map((p) => (p.id === proposal.id ? { ...p, ...patch } : p)));

  const handleSaveSection = (data) => {
    if (data.id) update({ sections: proposal.sections.map((s) => (s.id === data.id ? { ...s, ...data } : s)) });
    else update({ sections: [...proposal.sections, { ...data, id: newId("sec"), order: proposal.sections.length + 1 }] });
    setShowAddSection(false);
    setEditingSection(null);
  };
  const handleDeleteSection = async (id) => {
    const ok = await confirm("Hapus section ini dari proposal?");
    if (!ok) return;
    update({ sections: proposal.sections.filter((s) => s.id !== id).map((s, i) => ({ ...s, order: i + 1 })) });
  };
  const handleMoveSection = (id, dir) => {
    const idx = proposal.sections.findIndex((s) => s.id === id);
    const newIdx = dir === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= proposal.sections.length) return;
    const arr = [...proposal.sections];
    const tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp;
    update({ sections: arr.map((s, i) => ({ ...s, order: i + 1 })) });
  };

  const handleSaveItem = (data) => {
    if (data.id) update({ costItems: proposal.costItems.map((c) => (c.id === data.id ? { ...c, ...data } : c)) });
    else update({ costItems: [...proposal.costItems, { ...data, id: newId("ci") }] });
    setEditingItem(null);
    setAddItemType(null);
  };
  const handleDeleteItem = async (id) => {
    const ok = await confirm("Hapus item biaya ini?");
    if (!ok) return;
    update({ costItems: proposal.costItems.filter((c) => c.id !== id) });
  };

  const handleAddProgress = (entry) => {
    update({
      progressLog: [{ ...entry, id: newId("pl"), at: new Date().toISOString(), by: currentUser.name }, ...proposal.progressLog],
      status: entry.status,
      sentAt: entry.status === "sent" && !proposal.sentAt ? new Date().toISOString() : proposal.sentAt,
    });
    setShowProgressModal(false);
  };

  /* ----- Billing handlers ----- */
  const terms = proposal.paymentTerms || [];
  const billing = proposalBillingSummary(proposal, fin);

  const handleSetupTerms = (templateTerms) => {
    const startDate = new Date();
    const newTerms = templateTerms.map((t, i) => {
      const due = new Date(startDate); due.setDate(due.getDate() + (i === 0 ? 14 : 30 + i * 30));
      return { id: newId("pt"), label: t.label, percentage: t.percentage, amount: null, dueDate: due.toISOString().slice(0, 10), status: "pending", invoiceNumber: null, invoiceDate: null, paidDate: null, paidAmount: null, paymentMethod: "", notes: "" };
    });
    update({ paymentTerms: newTerms });
    setShowSetupTerms(false);
  };

  const handleSaveTerm = (data) => {
    if (data.id) update({ paymentTerms: terms.map((t) => (t.id === data.id ? { ...t, ...data } : t)) });
    else update({ paymentTerms: [...terms, { ...data, id: newId("pt"), status: "pending", invoiceNumber: null, invoiceDate: null, paidDate: null, paidAmount: null }] });
    setShowAddTerm(false);
    setEditingTerm(null);
  };

  const handleDeleteTerm = async (id) => {
    const ok = await confirm("Hapus termin pembayaran ini?");
    if (!ok) return;
    update({ paymentTerms: terms.filter((t) => t.id !== id) });
  };

  const handleGenerateInvoice = (term) => {
    setProposals((prev) => {
      const invNo = generateInvoiceNumber(prev);
      return prev.map((p) => (p.id === proposal.id ? { ...p, paymentTerms: (p.paymentTerms || []).map((t) => (t.id === term.id ? { ...t, status: t.status === "paid" ? "paid" : "invoiced", invoiceNumber: t.invoiceNumber || invNo, invoiceDate: t.invoiceDate || new Date().toISOString().slice(0, 10) } : t)) } : p));
    });
  };

  const handleRecordPayment = (term, paymentData) => {
    update({ paymentTerms: terms.map((t) => (t.id === term.id ? { ...t, status: "paid", paidDate: paymentData.paidDate, paidAmount: paymentData.paidAmount, paymentMethod: paymentData.paymentMethod, notes: paymentData.notes || t.notes } : t)) });
    setPayingTerm(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <button onClick={onBack} className="flex items-center gap-2 text-sm hover:opacity-80" style={{ color: T.inkSoft }}>
          <ChevronLeft size={16} /> Kembali ke daftar proposal
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => onOpenAi({ type: "quick", prompt: `Review proposal QHSE ini dan beri masukan:\n\nJudul: ${proposal.title}\nKlien: ${client ? client.name : "—"}\nNilai total: ${formatFullIDR(fin.total)}\nMargin aktual: ${fin.actualMarginPct.toFixed(1)}%\nHPP: ${formatFullIDR(fin.directCost)}, Operasional: ${formatFullIDR(fin.operationalCost)}\n\nSection yang ada: ${proposal.sections.map((s) => s.title).join(", ")}\n\nBeri: (1) Apakah margin sehat untuk proyek konsultan QHSE seperti ini, (2) Section apa yang masih kurang, (3) Saran strategi pricing/negosiasi.` })} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
            <Sparkles size={13} /> Review AI
          </button>
          {canEdit && (
            <>
              <button onClick={onEdit} className="p-2 rounded-md" style={{ background: T.surface, color: T.inkSoft, border: `1px solid ${T.rule}` }} aria-label="Edit"><Edit3 size={14} /></button>
              <button onClick={onDelete} className="p-2 rounded-md" style={{ background: T.surface, color: T.red, border: `1px solid ${T.rule}` }} aria-label="Delete"><Trash2 size={14} /></button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl p-6 mb-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: T.navySoft }}>
            <ClipboardList size={24} style={{ color: T.navy }} />
          </div>
          <div className="flex-1">
            <p className="text-[12px] mb-1" style={{ color: T.navy, fontFamily: FONT_MONO }}>{proposal.number}</p>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: T.ink }}>{proposal.title}</h1>
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: conf.color, background: conf.bg, fontFamily: FONT_MONO }}>{conf.label}</span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[12px] flex-wrap" style={{ color: T.inkSoft }}>
              {client && <button onClick={() => onOpenClient(client.id)} className="flex items-center gap-1 hover:underline" style={{ color: T.navy }}><Building2 size={11} />{client.name}</button>}
              {deal && <span className="flex items-center gap-1"><Briefcase size={11} />{deal.title}</span>}
              <span className="flex items-center gap-1"><Calendar size={11} />Valid s/d {formatDate(proposal.validUntil)}</span>
              {owner && <span className="flex items-center gap-1"><UserCheck size={11} />{owner.name}</span>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Total nilai</p>
            <p className="text-[22px] font-bold" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatIDR(fin.total)}</p>
            <p className="text-[11px]" style={{ color: T.sage, fontFamily: FONT_MONO }}>margin {fin.actualMarginPct.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b" style={{ borderColor: T.rule }}>
        {[
          { id: "ringkasan", label: "Ringkasan", icon: FileText },
          { id: "konten", label: `Konten (${proposal.sections.length})`, icon: PenLine },
          { id: "perhitungan", label: "Perhitungan HPP", icon: Calculator },
          { id: "penagihan", label: `Penagihan${terms.length ? ` (${terms.length})` : ""}`, icon: Wallet },
          { id: "progress", label: `Progress (${proposal.progressLog.length})`, icon: ListChecks },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} className="px-4 py-2.5 text-[13px] flex items-center gap-1.5" style={{ color: tab === t.id ? T.navy : T.inkSoft, fontWeight: tab === t.id ? 500 : 400, borderBottom: tab === t.id ? `2px solid ${T.navy}` : "2px solid transparent", marginBottom: "-1px" }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "ringkasan" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 space-y-3">
            <Panel title="Ringkasan finansial" icon={Calculator} accent={T.navy}>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: T.navySoft }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.navy, fontFamily: FONT_MONO }}>HPP / Biaya Langsung</p>
                  <p className="text-[16px] font-semibold" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatIDR(fin.directCost)}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: T.amberSoft }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.amber, fontFamily: FONT_MONO }}>Biaya Operasional</p>
                  <p className="text-[16px] font-semibold" style={{ color: T.amber, fontFamily: FONT_MONO }}>{formatIDR(fin.operationalCost)}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: T.sageSoft }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.sage, fontFamily: FONT_MONO }}>Margin</p>
                  <p className="text-[16px] font-semibold" style={{ color: T.sage, fontFamily: FONT_MONO }}>{formatIDR(fin.marginAmount)}</p>
                </div>
                <div className="rounded-lg p-3" style={{ background: T.surfaceAlt }}>
                  <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>Total + PPN</p>
                  <p className="text-[16px] font-semibold" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatIDR(fin.total)}</p>
                </div>
              </div>
              <button onClick={() => setTab("perhitungan")} className="w-full mt-3 py-2 rounded-md text-[12px] flex items-center justify-center gap-1.5" style={{ background: T.surfaceAlt, color: T.navy }}>
                <Calculator size={12} /> Lihat detail perhitungan HPP →
              </button>
            </Panel>
            <Panel title="Catatan & info dari klien" icon={MessageSquare} accent={T.amber}>
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{proposal.clientNotes || "Belum ada catatan dari klien."}</p>
            </Panel>
          </div>
          <Panel title="Info proposal" icon={FileText} accent={T.navy}>
            <div className="space-y-2.5">
              <Stat label="Nomor" value={proposal.number} />
              <Stat label="Status" value={conf.label} />
              <Stat label="Dibuat" value={formatDate(proposal.createdAt)} />
              <Stat label="Dikirim" value={proposal.sentAt ? formatDate(proposal.sentAt) : "—"} />
              <Stat label="Valid s/d" value={formatDate(proposal.validUntil)} />
              <Stat label="Jumlah section" value={`${proposal.sections.length}`} />
              <Stat label="Item biaya" value={`${proposal.costItems.length}`} />
              <Stat label="Margin aktual" value={`${fin.actualMarginPct.toFixed(1)}%`} />
            </div>
          </Panel>
        </div>
      )}

      {tab === "konten" && (
        <div>
          {canEdit && (
            <div className="flex justify-end mb-3">
              <button onClick={() => setShowAddSection(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                <Plus size={13} /> Tambah section
              </button>
            </div>
          )}
          {proposal.sections.length === 0 ? (
            <div className="py-12 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <PenLine size={24} style={{ color: T.inkFaint }} className="mx-auto mb-2" />
              <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Belum ada konten</p>
              <p className="text-xs" style={{ color: T.inkSoft }}>Tambah section — bisa dibantu AI untuk drafting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {proposal.sections.map((s, idx) => (
                <div key={s.id} className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-semibold" style={{ background: T.navySoft, color: T.navy, fontFamily: FONT_MONO }}>{s.order}</span>
                      <h3 className="text-[15px] font-semibold" style={{ color: T.ink }}>{s.title}</h3>
                    </div>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleMoveSection(s.id, "up")} disabled={idx === 0} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surfaceAlt }} aria-label="Up"><ChevronUp size={11} style={{ color: T.inkSoft }} /></button>
                        <button onClick={() => handleMoveSection(s.id, "down")} disabled={idx === proposal.sections.length - 1} className="p-1.5 rounded-md disabled:opacity-30" style={{ background: T.surfaceAlt }} aria-label="Down"><ChevronDown size={11} style={{ color: T.inkSoft }} /></button>
                        <button onClick={() => setEditingSection(s)} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
                        <button onClick={() => handleDeleteSection(s.id)} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{s.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "perhitungan" && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            {canEdit && (
              <div className="grid grid-cols-3 gap-3 rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
                <FormField label="Tipe margin">
                  <select value={proposal.marginType} onChange={(e) => update({ marginType: e.target.value })} style={inputStyle}>
                    <option value="markup">Markup (% dari biaya)</option>
                    <option value="percentage">Margin (% dari harga jual)</option>
                  </select>
                </FormField>
                <FormField label="Nilai margin (%)">
                  <input type="number" min="0" max="100" value={proposal.marginValue} onChange={(e) => update({ marginValue: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                </FormField>
                <FormField label="PPN (%)">
                  <input type="number" min="0" max="100" value={proposal.taxPercent} onChange={(e) => update({ taxPercent: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                </FormField>
              </div>
            )}

            {["direct", "operational"].map((groupType) => {
              const groupItems = proposal.costItems.filter((c) => c.type === groupType);
              const groupTotal = groupItems.reduce((s, c) => s + c.quantity * c.unitCost, 0);
              const isDirect = groupType === "direct";
              return (
                <div key={groupType} className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
                  <div className="px-4 py-3 flex items-center justify-between" style={{ background: isDirect ? T.navySoft : T.amberSoft }}>
                    <p className="text-[12px] font-semibold flex items-center gap-1.5" style={{ color: isDirect ? T.navy : T.amber }}>
                      {isDirect ? <Coins size={13} /> : <Receipt size={13} />}
                      {isDirect ? "HPP / Biaya Langsung" : "Biaya Operasional"} ({groupItems.length})
                    </p>
                    <p className="text-[13px] font-bold" style={{ color: isDirect ? T.navy : T.amber, fontFamily: FONT_MONO }}>{formatFullIDR(groupTotal)}</p>
                  </div>
                  {groupItems.length === 0 ? (
                    <div className="py-6 text-center"><p className="text-[12px]" style={{ color: T.inkFaint }}>Belum ada item</p></div>
                  ) : (
                    <div>
                      {groupItems.map((c, idx) => (
                        <CostItemRow key={c.id} item={c} isFirst={idx === 0} canEdit={canEdit} onEdit={() => setEditingItem(c)} onDelete={() => handleDeleteItem(c.id)} />
                      ))}
                    </div>
                  )}
                  {canEdit && (
                    <button onClick={() => setAddItemType(groupType)} className="w-full py-2.5 text-[12px] flex items-center justify-center gap-1.5 border-t" style={{ borderColor: T.ruleSoft, color: T.navy }}>
                      <Plus size={12} /> Tambah item {isDirect ? "biaya langsung" : "operasional"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div>
            <div className="rounded-xl p-5 sticky top-4" style={{ background: T.navy }}>
              <p className="text-[11px] uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT_MONO }}>Rekapitulasi Perhitungan</p>
              <div className="space-y-2.5">
                <BreakdownRow label="HPP / Biaya Langsung" value={fin.directCost} light />
                <BreakdownRow label="Biaya Operasional" value={fin.operationalCost} light />
                <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                  <BreakdownRow label="Total Biaya (Cost)" value={fin.totalCost} light bold />
                </div>
                <BreakdownRow label={`Margin (${proposal.marginValue}% ${proposal.marginType === "markup" ? "markup" : "dari harga"})`} value={fin.marginAmount} light accent="#7FD1AE" />
                <div className="border-t pt-2.5" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                  <BreakdownRow label="Harga Jual (sblm PPN)" value={fin.sellingBeforeTax} light bold />
                </div>
                <BreakdownRow label={`PPN ${proposal.taxPercent}%`} value={fin.taxAmount} light />
                <div className="border-t-2 pt-3" style={{ borderColor: "rgba(255,255,255,0.4)" }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-white">TOTAL NILAI</span>
                    <span className="text-[16px] font-bold text-white" style={{ fontFamily: FONT_MONO }}>{formatFullIDR(fin.total)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                <span className="text-[12px]" style={{ color: "rgba(255,255,255,0.7)" }}>Margin aktual</span>
                <span className="text-[14px] font-semibold" style={{ color: "#7FD1AE", fontFamily: FONT_MONO }}>{fin.actualMarginPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "penagihan" && (
        <div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Nilai kontrak</p>
              <p className="text-[18px] font-bold" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatIDR(billing.contractValue)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: T.inkFaint }}>termasuk PPN</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.sage, fontFamily: FONT_MONO }}>Sudah dibayar</p>
              <p className="text-[18px] font-bold" style={{ color: T.sage, fontFamily: FONT_MONO }}>{formatIDR(billing.paid)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: T.sage }}>{billing.contractValue > 0 ? ((billing.paid / billing.contractValue) * 100).toFixed(0) : 0}% dari kontrak</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.amber, fontFamily: FONT_MONO }}>Outstanding</p>
              <p className="text-[18px] font-bold" style={{ color: T.amber, fontFamily: FONT_MONO }}>{formatIDR(billing.outstanding)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: T.amber }}>{formatIDR(billing.invoiced)} sudah ditagih</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: Math.abs(billing.unallocated) > 1000 ? T.redSoft : T.surfaceAlt, border: `1px solid ${Math.abs(billing.unallocated) > 1000 ? T.red : T.rule}` }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: Math.abs(billing.unallocated) > 1000 ? T.red : T.inkSoft, fontFamily: FONT_MONO }}>Belum dialokasi</p>
              <p className="text-[18px] font-bold" style={{ color: Math.abs(billing.unallocated) > 1000 ? T.red : T.inkSoft, fontFamily: FONT_MONO }}>{formatIDR(billing.unallocated)}</p>
              <p className="text-[10px] mt-0.5" style={{ color: Math.abs(billing.unallocated) > 1000 ? T.red : T.inkFaint }}>{Math.abs(billing.unallocated) > 1000 ? "termin belum 100%" : "teralokasi penuh ✓"}</p>
            </div>
          </div>

          {proposal.status !== "won" && (
            <div className="rounded-md p-3 mb-4 flex items-start gap-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
              <AlertCircle size={13} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed" style={{ color: T.amber }}>Proposal ini statusnya <strong>{conf.label}</strong>, belum "Menang". Penagihan biasanya dimulai setelah proposal dimenangkan & PO terbit. Daddy tetap bisa menyiapkan skema termin dari sekarang.</p>
            </div>
          )}

          {terms.length === 0 ? (
            <div className="py-12 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
              <Wallet size={26} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
              <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Belum ada skema pembayaran</p>
              <p className="text-xs mb-4" style={{ color: T.inkSoft }}>Buat termin pembayaran (DP, progress, pelunasan) untuk mulai menagih</p>
              {canEdit && (
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setShowSetupTerms(true)} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy }}>
                    <Layers size={13} /> Setup termin cepat
                  </button>
                  <button onClick={() => setShowAddTerm(true)} className="px-4 py-2 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
                    <Plus size={13} /> Tambah manual
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Termin pembayaran ({terms.length})</p>
                {canEdit && (
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowSetupTerms(true)} className="px-2.5 py-1.5 rounded-md text-[12px] flex items-center gap-1.5" style={{ background: T.surface, color: T.inkSoft, border: `1px solid ${T.rule}` }}>
                      <Layers size={12} /> Reset skema
                    </button>
                    <button onClick={() => setShowAddTerm(true)} className="px-2.5 py-1.5 rounded-md text-[12px] text-white flex items-center gap-1.5" style={{ background: T.navy }}>
                      <Plus size={12} /> Tambah termin
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-2.5">
                {terms.map((t, idx) => (
                  <PaymentTermRow
                    key={t.id}
                    term={t}
                    index={idx}
                    fin={fin}
                    taxPercent={proposal.taxPercent}
                    canEdit={canEdit}
                    onEdit={() => setEditingTerm(t)}
                    onDelete={() => handleDeleteTerm(t.id)}
                    onInvoice={() => setInvoiceTerm(t)}
                    onPay={() => setPayingTerm(t)}
                    onEmail={() => setEmailTerm(t)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "progress" && (
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            {canEdit && (
              <div className="flex justify-end mb-3">
                <button onClick={() => setShowProgressModal(true)} className="px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                  <Plus size={13} /> Update progress / status
                </button>
              </div>
            )}
            <div className="rounded-xl p-5" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
              {proposal.progressLog.length === 0 ? (
                <p className="text-[12px] text-center py-6" style={{ color: T.inkFaint }}>Belum ada riwayat progress</p>
              ) : (
                <div className="relative">
                  {proposal.progressLog.map((log, idx) => {
                    const lConf = proposalStatusConf(log.status);
                    return (
                      <div key={log.id} className="flex gap-3 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: lConf.bg }}>
                            <Circle size={10} style={{ color: lConf.color, fill: lConf.color }} />
                          </div>
                          {idx !== proposal.progressLog.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: T.ruleSoft, minHeight: "20px" }} />}
                        </div>
                        <div className="flex-1 pb-2">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: lConf.color, background: lConf.bg, fontFamily: FONT_MONO }}>{lConf.label}</span>
                            <span className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{formatDateTime(log.at)}</span>
                          </div>
                          <p className="text-[13px] leading-relaxed" style={{ color: T.ink }}>{log.note}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: T.inkFaint }}>oleh {log.by}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <Panel title="Info & catatan klien" icon={MessageSquare} accent={T.amber}>
            {canEdit ? (
              <textarea value={proposal.clientNotes} onChange={(e) => update({ clientNotes: e.target.value })} rows={8} placeholder="Catat feedback, permintaan revisi, atau info penting dari klien…" style={{ ...inputStyle, resize: "vertical", minHeight: "160px", fontSize: "12px" }} />
            ) : (
              <p className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: T.ink }}>{proposal.clientNotes || "Belum ada catatan."}</p>
            )}
          </Panel>
        </div>
      )}

      {modalOpen && <ProposalModal proposal={editingProposal} clients={[]} deals={[]} onSave={onSaveEdit} onClose={onCloseEdit} editMetaOnly />}
      {(showAddSection || editingSection) && <SectionEditorModal section={editingSection} proposal={proposal} client={client} onSave={handleSaveSection} onClose={() => { setShowAddSection(false); setEditingSection(null); }} />}
      {(editingItem || addItemType) && <CostItemModal item={editingItem} defaultType={addItemType} onSave={handleSaveItem} onClose={() => { setEditingItem(null); setAddItemType(null); }} />}
      {showProgressModal && <ProgressLogModal currentStatus={proposal.status} onSave={handleAddProgress} onClose={() => setShowProgressModal(false)} />}
      {showSetupTerms && <SetupTermsModal onApply={handleSetupTerms} onClose={() => setShowSetupTerms(false)} />}
      {(showAddTerm || editingTerm) && <PaymentTermModal term={editingTerm} fin={fin} taxPercent={proposal.taxPercent} onSave={handleSaveTerm} onClose={() => { setShowAddTerm(false); setEditingTerm(null); }} />}
      {payingTerm && <RecordPaymentModal term={payingTerm} fin={fin} taxPercent={proposal.taxPercent} onSave={handleRecordPayment} onClose={() => setPayingTerm(null)} />}
      {invoiceTerm && <InvoiceModal term={invoiceTerm} proposal={proposal} allProposals={allProposals} client={client} fin={fin} currentUser={currentUser} onGenerate={() => handleGenerateInvoice(invoiceTerm)} onEmail={() => { setEmailTerm(invoiceTerm); setInvoiceTerm(null); }} onClose={() => setInvoiceTerm(null)} />}
      {emailTerm && <InvoiceEmailModal term={emailTerm} proposal={proposal} client={client} fin={fin} contacts={contacts} currentUser={currentUser} onClose={() => setEmailTerm(null)} />}
    </div>
  );
}

/* ============== COST ITEM ROW ============== */
function CostItemRow({ item, isFirst, canEdit, onEdit, onDelete }) {
  const subtotal = item.quantity * item.unitCost;
  return (
    <div className="px-4 py-3 flex items-center gap-3 group" style={{ borderTop: isFirst ? "none" : `1px solid ${T.ruleSoft}` }}>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium" style={{ color: T.ink }}>{item.description}</p>
        <p className="text-[10px] mt-0.5" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{item.category} · {item.quantity} {item.unit} × {formatFullIDR(item.unitCost)}</p>
      </div>
      <p className="text-[13px] font-semibold flex-shrink-0" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatFullIDR(subtotal)}</p>
      {canEdit && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
          <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
        </div>
      )}
    </div>
  );
}

/* ============== PROPOSAL MODAL (metadata) ============== */
function ProposalModal({ proposal, clients, deals, onSave, onClose, editMetaOnly }) {
  const [form, setForm] = useState(proposal || {
    title: "", clientId: "", dealId: "", validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  });
  const clientDeals = form.clientId ? deals.filter((d) => d.clientId === form.clientId) : [];
  return (
    <Modal onClose={onClose} maxWidth="max-w-xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{proposal ? "Edit info proposal" : "Proposal baru"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        {!proposal && (
          <div className="rounded-md p-3" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
            <div className="flex items-start gap-2">
              <Hash size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed" style={{ color: T.navy }}>
                Nomor proposal akan di-generate otomatis dengan format <strong>NS/PRP/[bulan-romawi]/[tahun]/[urut]</strong> saat disimpan.
              </p>
            </div>
          </div>
        )}
        <FormField label="Judul proposal" required>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="contoh: Konsultansi HSE PLTP Kamojang" />
        </FormField>
        {!editMetaOnly && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Klien">
              <select value={form.clientId || ""} onChange={(e) => setForm({ ...form, clientId: e.target.value, dealId: "" })} style={inputStyle}>
                <option value="">— Pilih klien —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Link ke deal (opsional)">
              <select value={form.dealId || ""} onChange={(e) => setForm({ ...form, dealId: e.target.value })} style={inputStyle} disabled={!form.clientId}>
                <option value="">— Tanpa deal —</option>
                {clientDeals.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </FormField>
          </div>
        )}
        <FormField label="Berlaku sampai">
          <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} style={inputStyle} />
        </FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.title.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.title.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan
        </button>
      </div>
    </Modal>
  );
}

/* ============== COST ITEM MODAL ============== */
function CostItemModal({ item, defaultType, onSave, onClose }) {
  const [form, setForm] = useState(item || {
    category: defaultType === "operational" ? COST_CATEGORIES.operational[0] : COST_CATEGORIES.direct[0],
    description: "", type: defaultType || "direct", unit: "man-day", quantity: 1, unitCost: 0,
  });
  const categoryOptions = form.type === "operational" ? COST_CATEGORIES.operational : COST_CATEGORIES.direct;
  const subtotal = form.quantity * form.unitCost;
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{item ? "Edit item biaya" : "Tambah item biaya"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Tipe biaya" required>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setForm({ ...form, type: "direct", category: COST_CATEGORIES.direct[0] })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm" style={{ background: form.type === "direct" ? T.navy : T.surface, color: form.type === "direct" ? "#fff" : T.inkSoft, border: `1px solid ${form.type === "direct" ? T.navy : T.rule}` }}>
              <Coins size={14} /> Langsung (HPP)
            </button>
            <button onClick={() => setForm({ ...form, type: "operational", category: COST_CATEGORIES.operational[0] })} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm" style={{ background: form.type === "operational" ? T.amber : T.surface, color: form.type === "operational" ? "#fff" : T.inkSoft, border: `1px solid ${form.type === "operational" ? T.amber : T.rule}` }}>
              <Receipt size={14} /> Operasional
            </button>
          </div>
        </FormField>
        <FormField label="Kategori" required>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
        <FormField label="Deskripsi" required>
          <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inputStyle} placeholder="contoh: Lead Auditor ISO 45001 (senior)" />
        </FormField>
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Satuan">
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} style={inputStyle}>
              {COST_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </FormField>
          <FormField label="Qty">
            <input type="number" min="0" step="0.5" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })} style={inputStyle} />
          </FormField>
          <FormField label="Harga satuan">
            <input type="number" min="0" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: parseFloat(e.target.value) || 0 })} style={inputStyle} />
          </FormField>
        </div>
        <div className="rounded-md p-3 flex items-center justify-between" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
          <span className="text-[12px]" style={{ color: T.inkSoft }}>Subtotal item</span>
          <span className="text-[15px] font-bold" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatFullIDR(subtotal)}</span>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.description.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.description.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan item
        </button>
      </div>
    </Modal>
  );
}

/* ============== SECTION EDITOR MODAL (with AI drafting) ============== */
function SectionEditorModal({ section, proposal, client, onSave, onClose }) {
  const [form, setForm] = useState(section || { title: "", content: "" });
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError] = useState(null);

  const sectionSuggestions = [
    "Ringkasan Eksekutif", "Latar Belakang & Pemahaman Kebutuhan", "Ruang Lingkup Pekerjaan",
    "Metodologi & Pendekatan", "Standar & Regulasi Acuan", "Timeline & Milestone",
    "Tim & Kualifikasi", "Deliverables", "Profil Perusahaan", "Syarat & Ketentuan",
  ];

  const handleGenerate = async () => {
    if (!form.title.trim()) { setAiError("Isi judul section dulu sebelum generate."); return; }
    setGenerating(true);
    setAiError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1200,
          system: NUSA_SAFETY_CONTEXT + "\n\nAnda sedang membantu menyusun satu section proposal QHSE. Tulis konten profesional, spesifik, dan siap pakai dalam Bahasa Indonesia formal. JANGAN gunakan markdown heading atau tanda **. Langsung tulis isi konten section yang diminta. Buat padat namun lengkap.",
          messages: [{ role: "user", content: `Proposal: "${proposal.title}"\nNomor: ${proposal.number}\nKlien: ${client ? `${client.name} (${client.industry}, ${client.city})` : "—"}\n\nTulis konten untuk section berjudul: "${form.title}"\n\n${form.content ? `Konten saat ini (perbaiki & lengkapi):\n${form.content}` : "Buat dari awal sesuai konteks klien dan layanan Nusa Safety."}` }],
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "";
      if (!text) throw new Error("Respons AI kosong");
      setForm((f) => ({ ...f, content: text }));
    } catch (err) {
      setAiError(`Gagal generate: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{section ? "Edit section" : "Tambah section"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Judul section" required>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="contoh: Ruang Lingkup Pekerjaan" list="section-suggestions" />
          <datalist id="section-suggestions">
            {sectionSuggestions.map((s) => <option key={s} value={s} />)}
          </datalist>
          <div className="flex flex-wrap gap-1 mt-2">
            {sectionSuggestions.slice(0, 6).map((s) => (
              <button key={s} onClick={() => setForm({ ...form, title: s })} className="text-[10px] px-2 py-0.5 rounded" style={{ background: T.surfaceAlt, color: T.inkSoft, border: `1px solid ${T.ruleSoft}` }}>{s}</button>
            ))}
          </div>
        </FormField>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[12px] font-medium" style={{ color: T.ink }}>Konten</label>
            <button onClick={handleGenerate} disabled={generating} className="text-[11px] flex items-center gap-1.5 px-2.5 py-1 rounded-md disabled:opacity-60" style={{ background: T.navy, color: "#fff" }}>
              {generating ? <><Loader2 size={11} className="animate-spin" /> Menulis…</> : <><Wand2 size={11} /> {form.content ? "Perbaiki dengan AI" : "Draft dengan AI"}</>}
            </button>
          </div>
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={12} style={{ ...inputStyle, resize: "vertical", minHeight: "240px", fontSize: "12px", lineHeight: "1.6" }} placeholder="Tulis konten section, atau klik 'Draft dengan AI' untuk biar Claude yang menyusun…" />
          {aiError && (
            <div className="mt-2 rounded-md p-2.5 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
              <AlertCircle size={13} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[12px]" style={{ color: T.red }}>{aiError}</p>
            </div>
          )}
          <p className="text-[10px] mt-1.5" style={{ color: T.inkFaint }}>AI tahu konteks klien, layanan Nusa Safety, dan judul section ini. Hasil bisa Daddy edit lagi sebelum simpan.</p>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.title.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.title.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan section
        </button>
      </div>
    </Modal>
  );
}

/* ============== PROGRESS LOG MODAL ============== */
function ProgressLogModal({ currentStatus, onSave, onClose }) {
  const [form, setForm] = useState({ status: currentStatus, note: "" });
  const statusOptions = [
    { id: "draft", label: "Draft" }, { id: "review", label: "Review internal" },
    { id: "sent", label: "Terkirim ke klien" }, { id: "negotiation", label: "Negosiasi" },
    { id: "won", label: "Menang (Won)" }, { id: "lost", label: "Kalah (Lost)" },
    { id: "on_hold", label: "On Hold" },
  ];
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Update progress & status</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Status proposal" required>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>
            {statusOptions.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </FormField>
        <FormField label="Catatan progress / info dari klien" required>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} placeholder="contoh: Klien minta revisi harga akomodasi. Tim procurement akan finalisasi minggu depan." />
        </FormField>
        <div className="rounded-md p-3" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
          <p className="text-[11px] leading-relaxed" style={{ color: T.inkSoft }}>
            Update ini akan tercatat di timeline progress dengan timestamp & nama Anda, sekaligus mengubah status proposal.
          </p>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(form)} disabled={!form.note.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: form.note.trim() ? 1 : 0.5 }}>
          <Save size={13} /> Simpan update
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================================
   BILLING / PENAGIHAN COMPONENTS (v1.2)
   ============================================================================ */

/* ============== PAYMENT TERM ROW ============== */
function PaymentTermRow({ term, index, fin, taxPercent, canEdit, onEdit, onDelete, onInvoice, onPay, onEmail }) {
  const amts = computeTermAmounts(term, fin, taxPercent);
  const sc = termStatusConf(term);
  const isPaid = term.status === "paid";
  const hasInvoice = !!term.invoiceNumber;
  return (
    <div className="rounded-xl p-4 group" style={{ background: T.surface, border: `1px solid ${sc.key === "overdue" ? T.red : T.rule}`, borderLeftWidth: "3px", borderLeftColor: sc.color }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: sc.bg }}>
          {isPaid ? <CheckCircle2 size={16} style={{ color: sc.color }} /> : <Coins size={16} style={{ color: sc.color }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="text-[13px] font-medium" style={{ color: T.ink }}>{term.label}</p>
            <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: sc.color, background: sc.bg, fontFamily: FONT_MONO }}>{sc.label}</span>
            {term.percentage ? <span className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{term.percentage}%</span> : null}
          </div>
          <div className="flex items-center gap-3 text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>
            <span className="flex items-center gap-1"><CalendarClock size={9} /> Jatuh tempo {formatDate(term.dueDate)}</span>
            {hasInvoice && <span className="flex items-center gap-1"><Receipt size={9} /> {term.invoiceNumber}</span>}
            {isPaid && term.paidDate && <span className="flex items-center gap-1" style={{ color: T.sage }}><CheckCircle2 size={9} /> Dibayar {formatDate(term.paidDate)}</span>}
          </div>
          {term.notes && <p className="text-[11px] mt-1.5 leading-relaxed line-clamp-1" style={{ color: T.inkSoft }}>{term.notes}</p>}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-bold" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatFullIDR(amts.gross)}</p>
          <p className="text-[9px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>DPP {formatFullIDR(amts.dpp)} + PPN {formatFullIDR(amts.ppn)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 mt-3 border-t" style={{ borderColor: T.ruleSoft }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {!isPaid && (
            <button onClick={onInvoice} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: hasInvoice ? T.surfaceAlt : T.navySoft, color: T.navy }}>
              <Receipt size={11} /> {hasInvoice ? "Lihat invoice" : "Buat invoice"}
            </button>
          )}
          {isPaid && (
            <button onClick={onInvoice} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: T.surfaceAlt, color: T.inkSoft }}>
              <Receipt size={11} /> Invoice
            </button>
          )}
          {!isPaid && (
            <button onClick={onEmail} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: T.sageSoft, color: T.sage }}>
              <Sparkles size={11} /> Email tagihan AI
            </button>
          )}
          {!isPaid && canEdit && (
            <button onClick={onPay} className="text-[11px] flex items-center gap-1 px-2 py-1 rounded-md text-white" style={{ background: T.sage }}>
              <Banknote size={11} /> Catat pembayaran
            </button>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Edit"><Edit3 size={11} style={{ color: T.inkSoft }} /></button>
            <button onClick={onDelete} className="p-1.5 rounded-md" style={{ background: T.surfaceAlt }} aria-label="Delete"><Trash2 size={11} style={{ color: T.red }} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============== SETUP TERMS MODAL (templates) ============== */
function SetupTermsModal({ onApply, onClose }) {
  const [selected, setSelected] = useState(TERM_TEMPLATES[1].id);
  const tpl = TERM_TEMPLATES.find((t) => t.id === selected);
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.navySoft }}><Layers size={15} style={{ color: T.navy }} /></div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Setup skema termin</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>Pilih template — due date otomatis dihitung dari hari ini</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-2.5">
        <div className="rounded-md p-3 mb-2 flex items-start gap-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
          <AlertCircle size={13} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: T.amber }}>Menerapkan template akan <strong>menimpa</strong> semua termin yang ada. Persentase dihitung dari nilai kontrak (termasuk PPN).</p>
        </div>
        {TERM_TEMPLATES.map((t) => (
          <button key={t.id} onClick={() => setSelected(t.id)} className="w-full text-left p-3 rounded-lg transition-all" style={{ background: selected === t.id ? T.navySoft : T.surface, border: `1px solid ${selected === t.id ? T.navy : T.rule}` }}>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ border: `2px solid ${selected === t.id ? T.navy : T.rule}` }}>
                {selected === t.id && <div className="w-2 h-2 rounded-full" style={{ background: T.navy }} />}
              </div>
              <p className="text-[13px] font-medium" style={{ color: T.ink }}>{t.label}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-2 ml-6 flex-wrap">
              {t.terms.map((term, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded" style={{ background: T.surfaceAlt, color: T.inkSoft, fontFamily: FONT_MONO }}>{term.label} · {term.percentage}%</span>
              ))}
            </div>
          </button>
        ))}
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onApply(tpl.terms)} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy }}>
          <CheckCircle2 size={13} /> Terapkan {tpl.terms.length} termin
        </button>
      </div>
    </Modal>
  );
}

/* ============== PAYMENT TERM MODAL (add/edit) ============== */
function PaymentTermModal({ term, fin, taxPercent, onSave, onClose }) {
  const [form, setForm] = useState(term || { label: "", percentage: 30, amount: null, dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10), notes: "" });
  const [mode, setMode] = useState(term && term.amount !== null && term.amount !== undefined && term.amount !== "" ? "amount" : "percentage");
  const preview = computeTermAmounts({ percentage: form.percentage, amount: mode === "amount" ? form.amount : null }, fin, taxPercent);
  const isValid = form.label.trim() && form.dueDate && (mode === "percentage" ? form.percentage > 0 : Number(form.amount) > 0);
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{term ? "Edit termin" : "Tambah termin pembayaran"}</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Label termin" required>
          <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} style={inputStyle} placeholder="contoh: DP / Uang Muka, Termin 2, Pelunasan" />
        </FormField>
        <FormField label="Dasar perhitungan">
          <div className="flex items-center gap-2">
            <button onClick={() => setMode("percentage")} className="flex-1 py-2 rounded-md text-[12px] flex items-center justify-center gap-1.5" style={{ background: mode === "percentage" ? T.navy : T.surface, color: mode === "percentage" ? "#fff" : T.inkSoft, border: `1px solid ${mode === "percentage" ? T.navy : T.rule}` }}>
              <Percent size={12} /> Persentase
            </button>
            <button onClick={() => setMode("amount")} className="flex-1 py-2 rounded-md text-[12px] flex items-center justify-center gap-1.5" style={{ background: mode === "amount" ? T.navy : T.surface, color: mode === "amount" ? "#fff" : T.inkSoft, border: `1px solid ${mode === "amount" ? T.navy : T.rule}` }}>
              <Coins size={12} /> Nominal tetap
            </button>
          </div>
        </FormField>
        {mode === "percentage" ? (
          <FormField label="Persentase dari nilai kontrak (%)" required>
            <input type="number" min="1" max="100" value={form.percentage} onChange={(e) => setForm({ ...form, percentage: parseFloat(e.target.value) || 0, amount: null })} style={inputStyle} />
          </FormField>
        ) : (
          <FormField label="Nominal tagihan (termasuk PPN, Rp)" required>
            <input type="number" min="0" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} style={inputStyle} placeholder="contoh: 50000000" />
          </FormField>
        )}
        <FormField label="Tanggal jatuh tempo" required>
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
        </FormField>
        <FormField label="Catatan (opsional)">
          <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} placeholder="Syarat penagihan, milestone terkait, dll." />
        </FormField>
        <div className="rounded-md p-3" style={{ background: T.navySoft }}>
          <p className="text-[10px] uppercase tracking-wider mb-2" style={{ color: T.navy, fontFamily: FONT_MONO }}>Preview nilai termin</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span className="text-[11px]" style={{ color: T.navy }}>DPP (sebelum PPN)</span><span className="text-[12px] font-medium" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatFullIDR(preview.dpp)}</span></div>
            <div className="flex items-center justify-between"><span className="text-[11px]" style={{ color: T.navy }}>PPN {taxPercent || 0}%</span><span className="text-[12px] font-medium" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatFullIDR(preview.ppn)}</span></div>
            <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: "rgba(31,56,100,0.2)" }}><span className="text-[12px] font-semibold" style={{ color: T.navy }}>Total tagihan</span><span className="text-[14px] font-bold" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatFullIDR(preview.gross)}</span></div>
          </div>
        </div>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave({ ...form, amount: mode === "amount" ? Number(form.amount) : null })} disabled={!isValid} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy, opacity: isValid ? 1 : 0.5 }}>
          <Save size={13} /> Simpan termin
        </button>
      </div>
    </Modal>
  );
}

/* ============== RECORD PAYMENT MODAL (DP & termin) ============== */
function RecordPaymentModal({ term, fin, taxPercent, onSave, onClose }) {
  const amts = computeTermAmounts(term, fin, taxPercent);
  const [form, setForm] = useState({
    paidDate: new Date().toISOString().slice(0, 10),
    paidAmount: Math.round(amts.gross),
    paymentMethod: "Transfer Bank",
    notes: "",
  });
  const isValid = form.paidDate && Number(form.paidAmount) > 0;
  const isPartial = Number(form.paidAmount) < amts.gross - 1;
  return (
    <Modal onClose={onClose}>
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.sageSoft }}><Banknote size={15} style={{ color: T.sage }} /></div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Catat pembayaran</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>{term.label} · tagihan {formatFullIDR(amts.gross)}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        <FormField label="Tanggal pembayaran diterima" required>
          <input type="date" value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} style={inputStyle} />
        </FormField>
        <FormField label="Jumlah diterima (Rp)" required>
          <input type="number" min="0" value={form.paidAmount} onChange={(e) => setForm({ ...form, paidAmount: e.target.value })} style={inputStyle} />
        </FormField>
        {isPartial && (
          <div className="rounded-md p-2.5 flex items-start gap-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
            <AlertCircle size={12} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px]" style={{ color: T.amber }}>Pembayaran sebagian. Sisa {formatFullIDR(amts.gross - Number(form.paidAmount))} — pertimbangkan buat termin baru untuk sisanya.</p>
          </div>
        )}
        <FormField label="Metode pembayaran">
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} style={inputStyle}>
            <option>Transfer Bank</option>
            <option>Transfer Bank Mandiri</option>
            <option>Cek / Giro</option>
            <option>Virtual Account</option>
            <option>Tunai</option>
            <option>Lainnya</option>
          </select>
        </FormField>
        <FormField label="Catatan pembayaran (opsional)">
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} placeholder="No. referensi transfer, nama pengirim, dll." />
        </FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={() => onSave(term, { ...form, paidAmount: Number(form.paidAmount) })} disabled={!isValid} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.sage, opacity: isValid ? 1 : 0.5 }}>
          <CheckCircle2 size={13} /> Tandai lunas
        </button>
      </div>
    </Modal>
  );
}

/* ============== INVOICE MODAL (auto-generated invoice) ============== */
function InvoiceModal({ term, proposal, allProposals, client, fin, currentUser, onGenerate, onEmail, onClose }) {
  const amts = computeTermAmounts(term, fin, proposal.taxPercent);
  const hasInvoice = !!term.invoiceNumber;
  const previewNumber = hasInvoice ? term.invoiceNumber : generateInvoiceNumber(allProposals || [proposal]);
  const invoiceDate = term.invoiceDate || new Date().toISOString().slice(0, 10);

  const handleCreate = () => { onGenerate(); };

  return (
    <Modal onClose={onClose} maxWidth="max-w-3xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.navySoft }}><Receipt size={15} style={{ color: T.navy }} /></div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>{hasInvoice ? "Invoice" : "Generate invoice"}</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>{term.label}{hasInvoice ? ` · ${term.invoiceNumber}` : " · nomor otomatis"}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5">
        {/* Invoice preview document */}
        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${T.rule}` }}>
          {/* Header */}
          <div className="p-5" style={{ background: T.navy }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}><NusaSnipeLogo size={24} color="#fff" /></div>
                <div>
                  <p className="text-[15px] font-bold text-white leading-tight">{COMPANY_CONFIG.legalName}</p>
                  <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.8)" }}>{COMPANY_CONFIG.tagline}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[20px] font-bold text-white tracking-tight">INVOICE</p>
                <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.85)", fontFamily: FONT_MONO }}>{previewNumber}</p>
              </div>
            </div>
          </div>
          {/* Body */}
          <div className="p-5" style={{ background: "#fff" }}>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Ditagihkan kepada</p>
                <p className="text-[13px] font-semibold" style={{ color: T.ink }}>{client ? client.name : "—"}</p>
                <p className="text-[11px]" style={{ color: T.inkSoft }}>{client ? `${client.city || ""}${client.city ? ", " : ""}${client.country || ""}` : ""}</p>
                <p className="text-[11px] mt-1" style={{ color: T.inkSoft }}>Ref. Proposal: {proposal.number}</p>
              </div>
              <div className="text-right">
                <div className="inline-block text-left">
                  <div className="flex justify-between gap-6 mb-1"><span className="text-[10px]" style={{ color: T.inkFaint }}>Tanggal invoice</span><span className="text-[11px] font-medium" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatDate(invoiceDate)}</span></div>
                  <div className="flex justify-between gap-6 mb-1"><span className="text-[10px]" style={{ color: T.inkFaint }}>Jatuh tempo</span><span className="text-[11px] font-medium" style={{ color: T.red, fontFamily: FONT_MONO }}>{formatDate(term.dueDate)}</span></div>
                  <div className="flex justify-between gap-6"><span className="text-[10px]" style={{ color: T.inkFaint }}>Termin</span><span className="text-[11px] font-medium" style={{ color: T.ink, fontFamily: FONT_MONO }}>{term.label}</span></div>
                </div>
              </div>
            </div>
            {/* Line item */}
            <table className="w-full mb-4">
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.navy}` }}>
                  <th className="text-left py-2 text-[10px] uppercase tracking-wider" style={{ color: T.navy, fontFamily: FONT_MONO }}>Deskripsi</th>
                  <th className="text-right py-2 text-[10px] uppercase tracking-wider" style={{ color: T.navy, fontFamily: FONT_MONO }}>Jumlah</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid ${T.ruleSoft}` }}>
                  <td className="py-3">
                    <p className="text-[12px] font-medium" style={{ color: T.ink }}>{proposal.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: T.inkSoft }}>{term.label}{term.percentage ? ` — ${term.percentage}% dari nilai kontrak` : ""}</p>
                  </td>
                  <td className="py-3 text-right text-[12px] font-medium" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatFullIDR(amts.dpp)}</td>
                </tr>
              </tbody>
            </table>
            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5">
                <div className="flex justify-between"><span className="text-[11px]" style={{ color: T.inkSoft }}>DPP (Dasar Pengenaan Pajak)</span><span className="text-[12px]" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatFullIDR(amts.dpp)}</span></div>
                <div className="flex justify-between"><span className="text-[11px]" style={{ color: T.inkSoft }}>PPN {proposal.taxPercent || 0}%</span><span className="text-[12px]" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatFullIDR(amts.ppn)}</span></div>
                <div className="flex justify-between pt-2 mt-1" style={{ borderTop: `2px solid ${T.navy}` }}><span className="text-[13px] font-bold" style={{ color: T.navy }}>TOTAL TAGIHAN</span><span className="text-[15px] font-bold" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatFullIDR(amts.gross)}</span></div>
              </div>
            </div>
            {/* Payment info */}
            <div className="mt-5 pt-4 grid grid-cols-2 gap-4" style={{ borderTop: `1px solid ${T.ruleSoft}` }}>
              <div>
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Pembayaran transfer ke</p>
                <p className="text-[11px] font-medium" style={{ color: T.ink }}>{COMPANY_CONFIG.bankName}</p>
                <p className="text-[11px]" style={{ color: T.inkSoft, fontFamily: FONT_MONO }}>{COMPANY_CONFIG.bankAccount}</p>
                <p className="text-[11px]" style={{ color: T.inkSoft }}>a.n. {COMPANY_CONFIG.bankHolder}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Hormat kami</p>
                <p className="text-[11px] font-medium" style={{ color: T.ink }}>{currentUser.name}</p>
                {currentUser.position && <p className="text-[10px]" style={{ color: T.inkSoft }}>{currentUser.position}</p>}
                <p className="text-[10px]" style={{ color: T.inkSoft }}>{COMPANY_CONFIG.brandName}</p>
                {currentUser.phone && <p className="text-[10px]" style={{ color: T.inkSoft }}>{currentUser.phone}</p>}
                <p className="text-[10px]" style={{ color: T.inkSoft }}>{COMPANY_CONFIG.financeEmail}</p>
              </div>
            </div>
          </div>
        </div>

        {!hasInvoice && (
          <div className="rounded-md p-3 mt-4 flex items-start gap-2" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
            <AlertCircle size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed" style={{ color: T.navy }}>Invoice belum di-finalisasi. Klik <strong>"Terbitkan invoice"</strong> untuk mengunci nomor <strong>{previewNumber}</strong> dan menandai termin sebagai "Terkirim". Setelah itu Daddy bisa draft email tagihan dengan AI.</p>
          </div>
        )}
        <div className="rounded-md p-3 mt-3 flex items-start gap-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
          <AlertCircle size={12} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed" style={{ color: T.amber }}><strong>Production:</strong> tombol export PDF invoice resmi (dengan e-Faktur/QR pajak) akan di-render server-side via endpoint /api/invoice/[id]/pdf. Versi ini adalah preview layout.</p>
        </div>
      </div>
      <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Tutup</button>
        <div className="flex items-center gap-2">
          {hasInvoice && (
            <button onClick={onEmail} className="px-4 py-2 rounded-md text-sm flex items-center gap-1.5" style={{ background: T.sageSoft, color: T.sage }}>
              <Sparkles size={13} /> Draft email tagihan AI
            </button>
          )}
          {!hasInvoice && (
            <button onClick={handleCreate} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy }}>
              <FileCheck size={13} /> Terbitkan invoice
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ============== INVOICE EMAIL MODAL (AI-drafted billing email) ============== */
function InvoiceEmailModal({ term, proposal, client, fin, contacts, currentUser, onClose }) {
  const amts = computeTermAmounts(term, fin, proposal.taxPercent);
  const sc = termStatusConf(term);
  const isOverdue = sc.key === "overdue";
  const clientContacts = client ? (contacts || []).filter((c) => c.clientId === client.id) : [];
  const primaryContact = clientContacts.find((c) => c.isPrimary) || clientContacts[0];

  const [tone, setTone] = useState(isOverdue ? "firm" : "standard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [copied, setCopied] = useState(false);

  const toneLabels = {
    gentle: "Halus / pengingat awal",
    standard: "Standar profesional",
    firm: "Tegas (jatuh tempo/telat)",
  };

  const generate = useCallback(async (selectedTone) => {
    setLoading(true);
    setError(null);
    try {
      const toneInstruction = {
        gentle: "Nada sangat sopan dan ramah, sekadar pengingat lembut. Tidak menekan.",
        standard: "Nada profesional standar, jelas, sopan, langsung ke poin.",
        firm: "Nada tegas namun tetap profesional dan menjaga hubungan baik. Tekankan bahwa pembayaran sudah/mendekati jatuh tempo dan minta konfirmasi jadwal pembayaran.",
      }[selectedTone] || "Nada profesional standar.";

      const dueInfo = isOverdue ? `SUDAH LEWAT jatuh tempo (${formatDate(term.dueDate)}, telat ${Math.abs(daysUntil(term.dueDate))} hari)` : `jatuh tempo ${formatDate(term.dueDate)} (${daysUntil(term.dueDate)} hari lagi)`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 900,
          system: `Anda staff finance ${COMPANY_CONFIG.legalName} (brand "${COMPANY_CONFIG.brandName}"), konsultan QHSE Indonesia. Tugas Anda menulis email penagihan (invoice) ke klien dalam Bahasa Indonesia bisnis yang profesional. ${toneInstruction}

Output STRICT JSON tanpa teks lain: {"subject": "<subjek email>", "body": "<isi email lengkap dengan salam pembuka, isi, dan penutup/signature>"}.

Signature gunakan:
${currentUser.name}
${currentUser.position || COMPANY_CONFIG.brandName + " — Finance"}
${COMPANY_CONFIG.brandName}${currentUser.phone ? " · " + currentUser.phone : ""}
${currentUser.email}
${COMPANY_CONFIG.website}

Cantumkan info pembayaran: ${COMPANY_CONFIG.bankName} ${COMPANY_CONFIG.bankAccount} a.n. ${COMPANY_CONFIG.bankHolder}. JANGAN tulis apapun selain JSON.`,
          messages: [{ role: "user", content: `Tulis email penagihan:
- Klien: ${client ? client.name : "—"}
- Penerima (PIC): ${primaryContact ? `${primaryContact.name} (${primaryContact.role})` : "Bapak/Ibu yang terhormat"}
- Nomor invoice: ${term.invoiceNumber || "(akan diterbitkan)"}
- Proyek/proposal: ${proposal.title} (Ref: ${proposal.number})
- Termin: ${term.label}${term.percentage ? ` (${term.percentage}% dari nilai kontrak)` : ""}
- Nilai tagihan: ${formatFullIDR(amts.gross)} (DPP ${formatFullIDR(amts.dpp)} + PPN ${formatFullIDR(amts.ppn)})
- Status: ${dueInfo}

Buat email yang siap kirim.` }],
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      const text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Format respons AI tidak valid");
      const parsed = JSON.parse(jsonMatch[0]);
      setSubject(parsed.subject || `Invoice ${term.invoiceNumber || ""} — ${proposal.title}`);
      setBody(parsed.body || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [term, proposal, client, primaryContact, amts, isOverdue, currentUser]);

  useEffect(() => { generate(tone); /* eslint-disable-next-line */ }, []);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const mailto = () => {
    const to = primaryContact ? primaryContact.email : "";
    const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof window !== "undefined") window.open(url, "_blank");
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: T.sageSoft }}><Sparkles size={15} style={{ color: T.sage }} /></div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Email tagihan — AI draft</h2>
            <p className="text-[11px]" style={{ color: T.inkSoft }}>{term.label} · {formatFullIDR(amts.gross)} · {term.invoiceNumber || "draft"}</p>
          </div>
        </div>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4">
        {isOverdue && (
          <div className="rounded-md p-2.5 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
            <AlertCircle size={13} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[11px]" style={{ color: T.red }}>Tagihan ini sudah <strong>telat {Math.abs(daysUntil(term.dueDate))} hari</strong>. AI menggunakan nada tegas secara default.</p>
          </div>
        )}
        <FormField label="Nada email">
          <div className="flex items-center gap-2">
            {["gentle", "standard", "firm"].map((tn) => (
              <button key={tn} onClick={() => { setTone(tn); generate(tn); }} disabled={loading} className="flex-1 py-2 rounded-md text-[11px] disabled:opacity-50" style={{ background: tone === tn ? T.navy : T.surface, color: tone === tn ? "#fff" : T.inkSoft, border: `1px solid ${tone === tn ? T.navy : T.rule}` }}>
                {toneLabels[tn]}
              </button>
            ))}
          </div>
        </FormField>

        {loading ? (
          <div className="py-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: T.navy }} />
            <p className="text-sm" style={{ color: T.inkSoft }}>AI sedang menyusun email tagihan…</p>
          </div>
        ) : error ? (
          <div className="rounded-md p-3 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
            <AlertCircle size={14} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-medium" style={{ color: T.red }}>Gagal generate: {error}</p>
              <button onClick={() => generate(tone)} className="text-[11px] mt-1 underline" style={{ color: T.red }}>Coba lagi</button>
            </div>
          </div>
        ) : (
          <>
            <FormField label="Penerima">
              <input type="text" value={primaryContact ? `${primaryContact.name} <${primaryContact.email}>` : "Belum ada kontak klien"} readOnly style={{ ...inputStyle, color: T.inkSoft, background: T.surfaceAlt }} />
            </FormField>
            <FormField label="Subjek">
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} style={inputStyle} />
            </FormField>
            <FormField label="Isi email (bisa diedit)">
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} style={{ ...inputStyle, resize: "vertical", minHeight: "260px", fontSize: "12px", lineHeight: "1.6" }} />
            </FormField>
          </>
        )}
      </div>
      <div className="p-5 border-t flex items-center justify-between" style={{ borderColor: T.rule }}>
        <button onClick={() => generate(tone)} disabled={loading} className="px-3 py-2 rounded-md text-sm flex items-center gap-1.5 disabled:opacity-50" style={{ background: T.surface, color: T.navy, border: `1px solid ${T.rule}` }}>
          <Wand2 size={13} /> Regenerate
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} disabled={loading || !body} className="px-3 py-2 rounded-md text-sm flex items-center gap-1.5 disabled:opacity-50" style={{ background: copied ? T.sage : T.surfaceAlt, color: copied ? "#fff" : T.ink }}>
            {copied ? <><CheckCircle2 size={13} /> Tersalin</> : <><Copy size={13} /> Salin</>}
          </button>
          <button onClick={mailto} disabled={loading || !body} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5 disabled:opacity-50" style={{ background: T.navy }}>
            <Send size={13} /> Buka di email
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ============================================================================
   BILLING VIEW — cross-proposal payment reminder dashboard
   ============================================================================ */
function BillingView({ proposals, clients, currentUser, onOpenProposal, onOpenClient }) {
  const [filter, setFilter] = useState("all");

  /* Flatten all terms across proposals */
  const allTerms = useMemo(() => {
    const rows = [];
    proposals.forEach((p) => {
      const fin = calcProposalFinancials(p);
      (p.paymentTerms || []).forEach((t) => {
        const amts = computeTermAmounts(t, fin, p.taxPercent);
        const sc = termStatusConf(t);
        rows.push({ term: t, proposal: p, client: clients.find((c) => c.id === p.clientId), amts, sc, dueIn: daysUntil(t.dueDate) });
      });
    });
    return rows.sort((a, b) => {
      if (a.term.status === "paid" && b.term.status !== "paid") return 1;
      if (a.term.status !== "paid" && b.term.status === "paid") return -1;
      return (a.dueIn === null ? 9999 : a.dueIn) - (b.dueIn === null ? 9999 : b.dueIn);
    });
  }, [proposals, clients]);

  const stats = useMemo(() => {
    let outstanding = 0, overdueVal = 0, overdueCount = 0, dueSoonVal = 0, dueSoonCount = 0, paidThisMonth = 0;
    const now = new Date();
    allTerms.forEach((r) => {
      if (r.term.status === "paid") {
        if (r.term.paidDate) {
          const pd = new Date(r.term.paidDate);
          if (pd.getMonth() === now.getMonth() && pd.getFullYear() === now.getFullYear()) {
            paidThisMonth += (r.term.paidAmount !== null && r.term.paidAmount !== undefined && r.term.paidAmount !== "") ? Number(r.term.paidAmount) : r.amts.gross;
          }
        }
        return;
      }
      outstanding += r.amts.gross;
      if (r.sc.key === "overdue") { overdueVal += r.amts.gross; overdueCount += 1; }
      else if (r.dueIn !== null && r.dueIn <= 7) { dueSoonVal += r.amts.gross; dueSoonCount += 1; }
    });
    return { outstanding, overdueVal, overdueCount, dueSoonVal, dueSoonCount, paidThisMonth };
  }, [allTerms]);

  const reminders = allTerms.filter((r) => r.term.status !== "paid" && (r.sc.key === "overdue" || (r.dueIn !== null && r.dueIn <= 7)));

  const filtered = useMemo(() => {
    if (filter === "all") return allTerms;
    if (filter === "reminder") return reminders;
    return allTerms.filter((r) => r.sc.key === filter);
  }, [allTerms, filter, reminders]);

  const filters = [
    { id: "all", label: "Semua" },
    { id: "reminder", label: `Perlu ditagih (${reminders.length})` },
    { id: "overdue", label: "Telat" },
    { id: "invoiced", label: "Terkirim" },
    { id: "paid", label: "Lunas" },
    { id: "pending", label: "Belum ditagih" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet size={22} style={{ color: T.navy }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Penagihan</h1>
            {stats.overdueCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1" style={{ background: T.red, color: "#fff", fontFamily: FONT_MONO }}>
                <BellRing size={10} /> {stats.overdueCount} telat
              </span>
            )}
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>Pantau DP, termin, jatuh tempo & status pembayaran semua proyek</p>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          <div className="flex items-center gap-1.5 mb-1"><CircleDollarSign size={13} style={{ color: T.amber }} /><p className="text-[10px] uppercase tracking-wider" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Total outstanding</p></div>
          <p className="text-[19px] font-bold" style={{ color: T.amber, fontFamily: FONT_MONO }}>{formatIDR(stats.outstanding)}</p>
          <p className="text-[10px] mt-0.5" style={{ color: T.inkFaint }}>belum dibayar klien</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: stats.overdueCount > 0 ? T.redSoft : T.surface, border: `1px solid ${stats.overdueCount > 0 ? T.red : T.rule}` }}>
          <div className="flex items-center gap-1.5 mb-1"><AlertCircle size={13} style={{ color: T.red }} /><p className="text-[10px] uppercase tracking-wider" style={{ color: stats.overdueCount > 0 ? T.red : T.inkFaint, fontFamily: FONT_MONO }}>Telat bayar</p></div>
          <p className="text-[19px] font-bold" style={{ color: T.red, fontFamily: FONT_MONO }}>{formatIDR(stats.overdueVal)}</p>
          <p className="text-[10px] mt-0.5" style={{ color: stats.overdueCount > 0 ? T.red : T.inkFaint }}>{stats.overdueCount} tagihan overdue</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: stats.dueSoonCount > 0 ? T.amberSoft : T.surface, border: `1px solid ${stats.dueSoonCount > 0 ? T.amber : T.rule}` }}>
          <div className="flex items-center gap-1.5 mb-1"><CalendarClock size={13} style={{ color: T.amber }} /><p className="text-[10px] uppercase tracking-wider" style={{ color: stats.dueSoonCount > 0 ? T.amber : T.inkFaint, fontFamily: FONT_MONO }}>Jatuh tempo ≤7 hari</p></div>
          <p className="text-[19px] font-bold" style={{ color: T.amber, fontFamily: FONT_MONO }}>{formatIDR(stats.dueSoonVal)}</p>
          <p className="text-[10px] mt-0.5" style={{ color: stats.dueSoonCount > 0 ? T.amber : T.inkFaint }}>{stats.dueSoonCount} tagihan segera</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
          <div className="flex items-center gap-1.5 mb-1"><Banknote size={13} style={{ color: T.sage }} /><p className="text-[10px] uppercase tracking-wider" style={{ color: T.sage, fontFamily: FONT_MONO }}>Diterima bulan ini</p></div>
          <p className="text-[19px] font-bold" style={{ color: T.sage, fontFamily: FONT_MONO }}>{formatIDR(stats.paidThisMonth)}</p>
          <p className="text-[10px] mt-0.5" style={{ color: T.sage }}>cash masuk</p>
        </div>
      </div>

      {/* Reminder banner */}
      {reminders.length > 0 && (
        <div className="rounded-xl p-4 mb-6" style={{ background: T.navy }}>
          <div className="flex items-center gap-2 mb-3">
            <BellRing size={16} className="text-white" />
            <p className="text-[14px] font-semibold text-white">Reminder tim — {reminders.length} tagihan butuh perhatian</p>
          </div>
          <div className="space-y-2">
            {reminders.slice(0, 5).map((r) => (
              <div key={r.term.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: r.sc.key === "overdue" ? "rgba(192,0,0,0.25)" : "rgba(181,104,31,0.25)" }}>
                  {r.sc.key === "overdue" ? <AlertCircle size={14} className="text-white" /> : <CalendarClock size={14} className="text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white truncate">{r.client ? r.client.name : "—"} · {r.term.label}</p>
                  <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.7)", fontFamily: FONT_MONO }}>{r.proposal.number} · jatuh tempo {formatDate(r.term.dueDate)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[13px] font-bold text-white" style={{ fontFamily: FONT_MONO }}>{formatIDR(r.amts.gross)}</p>
                  <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: r.sc.key === "overdue" ? T.red : T.amber, color: "#fff", fontFamily: FONT_MONO }}>{r.sc.label}</span>
                </div>
                <button onClick={() => onOpenProposal(r.proposal.id)} className="px-2.5 py-1.5 rounded-md text-[11px] flex items-center gap-1 flex-shrink-0" style={{ background: "#fff", color: T.navy }}>
                  Buka <ArrowUpRight size={11} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter + full list */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {filters.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className="px-2.5 py-1 rounded-md text-[11px]" style={{ background: filter === f.id ? T.navy : T.surface, color: filter === f.id ? "#fff" : T.inkSoft, border: `1px solid ${filter === f.id ? T.navy : T.rule}` }}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl" style={{ background: T.surface, border: `1px dashed ${T.rule}` }}>
          <Wallet size={28} style={{ color: T.inkFaint }} className="mx-auto mb-3" />
          <p className="text-sm font-medium mb-1" style={{ color: T.ink }}>Tidak ada tagihan</p>
          <p className="text-xs" style={{ color: T.inkSoft }}>{filter === "all" ? "Belum ada termin pembayaran di proposal manapun. Buat skema termin di tab Penagihan dalam proposal." : "Tidak ada tagihan yang cocok dengan filter ini."}</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
          {filtered.map((r, idx) => (
            <div key={r.term.id} className="flex items-center gap-3 p-4" style={{ borderTop: idx === 0 ? "none" : `1px solid ${T.ruleSoft}` }}>
              <div className="w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: r.sc.bg }}>
                {r.term.status === "paid" ? <CheckCircle2 size={15} style={{ color: r.sc.color }} /> : <Coins size={15} style={{ color: r.sc.color }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {r.client ? <button onClick={() => onOpenClient(r.client.id)} className="text-[13px] font-medium hover:underline" style={{ color: T.navy }}>{r.client.name}</button> : <span className="text-[13px]" style={{ color: T.inkFaint }}>—</span>}
                  <span className="text-[11px]" style={{ color: T.inkSoft }}>· {r.term.label}</span>
                </div>
                <p className="text-[10px] truncate" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{r.proposal.number} · {r.proposal.title}</p>
              </div>
              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>Jatuh tempo</p>
                <p className="text-[11px] font-medium" style={{ color: r.sc.key === "overdue" ? T.red : T.ink, fontFamily: FONT_MONO }}>{formatDate(r.term.dueDate)}</p>
              </div>
              <div className="text-right flex-shrink-0 w-32">
                <p className="text-[14px] font-bold" style={{ color: T.ink, fontFamily: FONT_MONO }}>{formatFullIDR(r.amts.gross)}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ color: r.sc.color, background: r.sc.bg, fontFamily: FONT_MONO }}>{r.sc.label}</span>
              </div>
              <button onClick={() => onOpenProposal(r.proposal.id)} className="p-2 rounded-md flex-shrink-0" style={{ background: T.surfaceAlt }} aria-label="Buka proposal"><ArrowUpRight size={14} style={{ color: T.navy }} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md p-3 mt-4 flex items-start gap-2" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
        <BellRing size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed" style={{ color: T.navy }}><strong>Production:</strong> reminder otomatis ke tim (email/WhatsApp/Slack) dijalankan via cron job harian di <span style={{ fontFamily: FONT_MONO }}>/api/billing/reminders</span> yang scan termin dengan jatuh tempo H-7, H-3, H-1, dan overdue, lalu kirim notifikasi ke owner proposal + finance. Badge merah di sidebar sudah live mengikuti data ini.</p>
      </div>
    </div>
  );
}

/* ============================================================================
   REPORTING ENGINE (v1.3) — monthly / quarterly / yearly, Excel + PDF
   ============================================================================ */
const MONTH_NAMES_ID = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const QUARTER_LABELS = ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Okt–Des)"];

function getPeriodRange(type, year, idx) {
  if (type === "year") return { start: new Date(year, 0, 1, 0, 0, 0), end: new Date(year, 11, 31, 23, 59, 59) };
  if (type === "quarter") { const sm = idx * 3; return { start: new Date(year, sm, 1, 0, 0, 0), end: new Date(year, sm + 3, 0, 23, 59, 59) }; }
  return { start: new Date(year, idx, 1, 0, 0, 0), end: new Date(year, idx + 1, 0, 23, 59, 59) };
}

function getPrevPeriodRange(type, year, idx) {
  if (type === "year") return getPeriodRange("year", year - 1, 0);
  if (type === "quarter") { return idx === 0 ? getPeriodRange("quarter", year - 1, 3) : getPeriodRange("quarter", year, idx - 1); }
  return idx === 0 ? getPeriodRange("month", year - 1, 11) : getPeriodRange("month", year, idx - 1);
}

function periodLabel(type, year, idx) {
  if (type === "year") return `Tahun ${year}`;
  if (type === "quarter") return `${QUARTER_LABELS[idx]} ${year}`;
  return `${MONTH_NAMES_ID[idx]} ${year}`;
}

function classifyService(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("hazid") || t.includes("hazop")) return "HAZID / HAZOP";
  if (t.includes("fire") || t.includes("kebakaran")) return "Fire Protection";
  if (t.includes("iso 45001")) return "ISO 45001";
  if (t.includes("smk3")) return "SMK3 / Audit K3";
  if (t.includes("audit")) return "Audit & Assessment";
  if (t.includes("training") || t.includes("pelatihan")) return "Training";
  return "Konsultansi Lainnya";
}

function computeReport(ctx, range, prevRange) {
  const { proposals, clients, deals, signals, bookings, campaigns, replies, users } = ctx;
  const inR = (d, r) => { if (!d || !r) return false; const x = new Date(d); return x >= r.start && x <= r.end; };
  const finOf = (p) => calcProposalFinancials(p);
  const wonAt = (p) => { const e = (p.progressLog || []).filter((l) => l.status === "won").pop(); return e ? e.at : null; };
  const lostAt = (p) => { const e = (p.progressLog || []).filter((l) => l.status === "lost").pop(); return e ? e.at : null; };
  const paidVal = (t, fin, tax) => (t.paidAmount !== null && t.paidAmount !== undefined && t.paidAmount !== "") ? Number(t.paidAmount) : computeTermAmounts(t, fin, tax).gross;

  const created = proposals.filter((p) => inR(p.createdAt, range));
  const sent = proposals.filter((p) => inR(p.sentAt, range));
  const wonList = proposals.filter((p) => p.status === "won" && inR(wonAt(p) || p.sentAt || p.createdAt, range));
  const lostList = proposals.filter((p) => p.status === "lost" && inR(lostAt(p) || p.createdAt, range));

  const contractValueWon = wonList.reduce((s, p) => s + finOf(p).total, 0);
  const totalDecided = wonList.length + lostList.length;
  const winRate = totalDecided > 0 ? (wonList.length / totalDecided) * 100 : 0;
  const avgDealSize = wonList.length ? contractValueWon / wonList.length : 0;
  const avgMargin = wonList.length ? wonList.reduce((s, p) => s + finOf(p).actualMarginPct, 0) / wonList.length : 0;

  const activeDeals = deals.filter((d) => d.stage !== "won");
  const pipelineValue = activeDeals.reduce((s, d) => s + (d.value || 0), 0);
  const weightedPipeline = activeDeals.reduce((s, d) => s + (d.value || 0) * ((d.probability || 0) / 100), 0);

  let invoicedInPeriod = 0, collectedInPeriod = 0, outstandingNow = 0, overdueNow = 0;
  proposals.forEach((p) => {
    const fin = finOf(p);
    (p.paymentTerms || []).forEach((t) => {
      const amt = computeTermAmounts(t, fin, p.taxPercent).gross;
      if (inR(t.invoiceDate, range)) invoicedInPeriod += amt;
      if (t.status === "paid" && inR(t.paidDate, range)) collectedInPeriod += paidVal(t, fin, p.taxPercent);
      if (t.status !== "paid") { outstandingNow += amt; const d = daysUntil(t.dueDate); if (d !== null && d < 0) overdueNow += amt; }
    });
  });
  const collectionRate = invoicedInPeriod > 0 ? (collectedInPeriod / invoicedInPeriod) * 100 : 0;

  const signalsCaptured = signals.filter((s) => inR(s.signalDate, range));
  const signalsConverted = signals.filter((s) => s.status === "converted" && inR(s.signalDate, range));
  const avgSignalScore = signalsCaptured.length ? signalsCaptured.reduce((s, x) => s + (x.aiScore || 0), 0) / signalsCaptured.length : 0;
  const bookingsHeld = bookings.filter((b) => inR(b.scheduledAt, range));
  const repliesReceived = (replies || []).filter((r) => inR(r.receivedAt || r.createdAt, range));

  const byClientMap = {};
  wonList.forEach((p) => {
    const c = clients.find((x) => x.id === p.clientId);
    if (!byClientMap[p.clientId]) byClientMap[p.clientId] = { name: c ? c.name : "—", wonValue: 0, count: 0 };
    byClientMap[p.clientId].wonValue += finOf(p).total; byClientMap[p.clientId].count += 1;
  });
  const byClient = Object.values(byClientMap).sort((a, b) => b.wonValue - a.wonValue);

  const bySalesMap = {};
  users.forEach((u) => { bySalesMap[u.id] = { name: u.name, role: u.role, created: 0, wonCount: 0, wonValue: 0, collected: 0 }; });
  created.forEach((p) => { if (bySalesMap[p.ownerId]) bySalesMap[p.ownerId].created += 1; });
  wonList.forEach((p) => { if (bySalesMap[p.ownerId]) { bySalesMap[p.ownerId].wonCount += 1; bySalesMap[p.ownerId].wonValue += finOf(p).total; } });
  proposals.forEach((p) => { const fin = finOf(p); (p.paymentTerms || []).forEach((t) => { if (t.status === "paid" && inR(t.paidDate, range) && bySalesMap[p.ownerId]) bySalesMap[p.ownerId].collected += paidVal(t, fin, p.taxPercent); }); });
  const bySales = Object.values(bySalesMap).filter((s) => s.created || s.wonCount || s.collected).sort((a, b) => b.wonValue - a.wonValue);

  const byServiceMap = {};
  wonList.forEach((p) => { const cat = classifyService(p.title); if (!byServiceMap[cat]) byServiceMap[cat] = { category: cat, count: 0, value: 0 }; byServiceMap[cat].count += 1; byServiceMap[cat].value += finOf(p).total; });
  const byService = Object.values(byServiceMap).sort((a, b) => b.value - a.value);

  const pipelineByStage = PIPELINE_STAGES.map((st) => { const ds = deals.filter((d) => d.stage === st.id); return { stage: st.label, count: ds.length, value: ds.reduce((s, d) => s + (d.value || 0), 0) }; });

  let prev = null;
  if (prevRange) {
    const pWon = proposals.filter((p) => p.status === "won" && inR(wonAt(p) || p.sentAt || p.createdAt, prevRange));
    let pCollected = 0;
    proposals.forEach((p) => { const fin = finOf(p); (p.paymentTerms || []).forEach((t) => { if (t.status === "paid" && inR(t.paidDate, prevRange)) pCollected += paidVal(t, fin, p.taxPercent); }); });
    prev = { contractValueWon: pWon.reduce((s, p) => s + finOf(p).total, 0), proposalsWon: pWon.length, collected: pCollected };
  }

  return {
    sales: { created: created.length, sent: sent.length, won: wonList.length, lost: lostList.length, winRate, contractValueWon, avgDealSize, avgMargin, pipelineValue, weightedPipeline },
    billing: { invoicedInPeriod, collectedInPeriod, outstandingNow, overdueNow, collectionRate },
    marketing: { signalsCaptured: signalsCaptured.length, signalsConverted: signalsConverted.length, avgSignalScore, bookingsHeld: bookingsHeld.length, repliesReceived: repliesReceived.length, campaignsActive: (campaigns || []).length },
    byClient, bySales, byService, pipelineByStage, prev,
    lists: { created, sent, wonList, lostList },
    finOf,
  };
}

function growthPct(cur, prev) {
  if (!prev || prev === 0) return cur > 0 ? 100 : 0;
  return ((cur - prev) / prev) * 100;
}

/* ============== EXPORT: EXCEL (SheetJS multi-sheet) ============== */
function exportReportToExcel(report, meta) {
  const wb = XLSX.utils.book_new();
  const title = `Laporan ${meta.typeLabel} — ${meta.periodLabel}`;
  const num = (n) => Math.round(Number(n) || 0);

  const sumAoa = [
    [COMPANY_CONFIG.legalName],
    [COMPANY_CONFIG.tagline],
    [title],
    [`Dibuat: ${formatDateTime(new Date().toISOString())} · oleh ${meta.author}`],
    [],
    ["RINGKASAN PENJUALAN", ""],
    ["Proposal dibuat", report.sales.created],
    ["Proposal dikirim", report.sales.sent],
    ["Proposal menang", report.sales.won],
    ["Proposal kalah", report.sales.lost],
    ["Win rate (%)", Number(report.sales.winRate.toFixed(1))],
    ["Nilai kontrak menang (Rp)", num(report.sales.contractValueWon)],
    ["Rata-rata nilai proyek (Rp)", num(report.sales.avgDealSize)],
    ["Rata-rata margin (%)", Number(report.sales.avgMargin.toFixed(1))],
    ["Pipeline aktif (Rp)", num(report.sales.pipelineValue)],
    ["Pipeline tertimbang (Rp)", num(report.sales.weightedPipeline)],
    [],
    ["RINGKASAN PENAGIHAN", ""],
    ["Ditagih periode ini (Rp)", num(report.billing.invoicedInPeriod)],
    ["Cash masuk / diterima (Rp)", num(report.billing.collectedInPeriod)],
    ["Collection rate (%)", Number(report.billing.collectionRate.toFixed(1))],
    ["Outstanding saat ini (Rp)", num(report.billing.outstandingNow)],
    ["Overdue saat ini (Rp)", num(report.billing.overdueNow)],
    [],
    ["RINGKASAN MARKETING & PROSPECTING", ""],
    ["Sinyal prospek masuk", report.marketing.signalsCaptured],
    ["Sinyal terkonversi", report.marketing.signalsConverted],
    ["Rata-rata skor AI sinyal", Number(report.marketing.avgSignalScore.toFixed(0))],
    ["Meeting / booking", report.marketing.bookingsHeld],
    ["Balasan diterima", report.marketing.repliesReceived],
    ["Kampanye aktif", report.marketing.campaignsActive],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(sumAoa);
  ws1["!cols"] = [{ wch: 40 }, { wch: 26 }];
  XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan");

  const salesAoa = [["No. Proposal", "Judul", "Klien", "Status", "Tgl Dibuat", "Nilai Total (Rp)", "Margin (%)"]];
  const statusName = { won: "Menang", lost: "Kalah", sent: "Terkirim", draft: "Draft", review: "Review", negotiation: "Negosiasi", on_hold: "On Hold" };
  report.lists.wonList.forEach((p) => { const fin = report.finOf(p); const c = meta.clients.find((x) => x.id === p.clientId); salesAoa.push([p.number, p.title, c ? c.name : "—", "Menang", formatDate(p.createdAt), num(fin.total), Number(fin.actualMarginPct.toFixed(1))]); });
  report.lists.created.filter((p) => p.status !== "won").forEach((p) => { const fin = report.finOf(p); const c = meta.clients.find((x) => x.id === p.clientId); salesAoa.push([p.number, p.title, c ? c.name : "—", statusName[p.status] || p.status, formatDate(p.createdAt), num(fin.total), Number(fin.actualMarginPct.toFixed(1))]); });
  if (salesAoa.length === 1) salesAoa.push(["—", "Tidak ada proposal pada periode ini", "", "", "", "", ""]);
  const ws2 = XLSX.utils.aoa_to_sheet(salesAoa);
  ws2["!cols"] = [{ wch: 20 }, { wch: 44 }, { wch: 26 }, { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Penjualan");

  const billAoa = [["Klien", "No. Proposal", "Termin", "No. Invoice", "Tgl Invoice", "Jatuh Tempo", "Status", "DPP (Rp)", "PPN (Rp)", "Total (Rp)", "Dibayar (Rp)"]];
  meta.proposals.forEach((p) => {
    const fin = report.finOf(p); const c = meta.clients.find((x) => x.id === p.clientId);
    (p.paymentTerms || []).forEach((t) => {
      const a = computeTermAmounts(t, fin, p.taxPercent);
      const sc = termStatusConf(t);
      billAoa.push([c ? c.name : "—", p.number, t.label, t.invoiceNumber || "—", formatDate(t.invoiceDate), formatDate(t.dueDate), sc.label, num(a.dpp), num(a.ppn), num(a.gross), t.status === "paid" ? num(t.paidAmount || a.gross) : 0]);
    });
  });
  if (billAoa.length === 1) billAoa.push(["—", "Belum ada data penagihan", "", "", "", "", "", "", "", "", ""]);
  const ws3 = XLSX.utils.aoa_to_sheet(billAoa);
  ws3["!cols"] = [{ wch: 26 }, { wch: 20 }, { wch: 22 }, { wch: 20 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws3, "Penagihan");

  const pipeAoa = [["Stage", "Jumlah Deal", "Nilai (Rp)"]];
  report.pipelineByStage.forEach((s) => pipeAoa.push([s.stage, s.count, num(s.value)]));
  const ws4 = XLSX.utils.aoa_to_sheet(pipeAoa);
  ws4["!cols"] = [{ wch: 18 }, { wch: 14 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws4, "Pipeline");

  const clientAoa = [["Klien", "Proyek Menang", "Nilai Kontrak (Rp)"]];
  report.byClient.forEach((c) => clientAoa.push([c.name, c.count, num(c.wonValue)]));
  if (clientAoa.length === 1) clientAoa.push(["Belum ada proyek menang periode ini", 0, 0]);
  const ws5 = XLSX.utils.aoa_to_sheet(clientAoa);
  ws5["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws5, "Per Klien");

  const salesPerAoa = [["Sales", "Role", "Proposal Dibuat", "Proyek Menang", "Nilai Menang (Rp)", "Cash Masuk (Rp)"]];
  report.bySales.forEach((s) => salesPerAoa.push([s.name, s.role, s.created, s.wonCount, num(s.wonValue), num(s.collected)]));
  if (salesPerAoa.length === 1) salesPerAoa.push(["Belum ada aktivitas", "", 0, 0, 0, 0]);
  const ws6 = XLSX.utils.aoa_to_sheet(salesPerAoa);
  ws6["!cols"] = [{ wch: 24 }, { wch: 10 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws6, "Per Sales");

  const svcAoa = [["Kategori Layanan", "Jumlah Proyek", "Nilai (Rp)"]];
  report.byService.forEach((s) => svcAoa.push([s.category, s.count, num(s.value)]));
  if (svcAoa.length === 1) svcAoa.push(["Belum ada proyek menang periode ini", 0, 0]);
  const ws7 = XLSX.utils.aoa_to_sheet(svcAoa);
  ws7["!cols"] = [{ wch: 28 }, { wch: 16 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws7, "Per Layanan");

  const fname = `Laporan_NusaSafety_${meta.typeLabel}_${meta.periodSlug}.xlsx`;
  XLSX.writeFile(wb, fname);
}

/* ============== EXPORT: PDF (branded print-ready HTML) ============== */
function buildReportHTML(report, meta) {
  const fmt = (n) => "Rp " + Math.round(Number(n) || 0).toLocaleString("id-ID");
  const today = new Date().toLocaleString("id-ID", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const g = report.prev ? growthPct(report.sales.contractValueWon, report.prev.contractValueWon) : null;
  const gC = report.prev ? growthPct(report.billing.collectedInPeriod, report.prev.collected) : null;
  const statusName = { won: "Menang", lost: "Kalah", sent: "Terkirim", draft: "Draft", review: "Review", negotiation: "Negosiasi", on_hold: "On Hold" };
  const maxStage = Math.max(1, ...report.pipelineByStage.map((s) => s.value));

  const metric = (label, value, sub) => `<div class="m"><div class="ml">${label}</div><div class="mv">${value}</div>${sub ? `<div class="ms">${sub}</div>` : ""}</div>`;
  const growthBadge = (val) => val === null ? "" : `<span class="g ${val >= 0 ? "up" : "dn"}">${val >= 0 ? "▲" : "▼"} ${Math.abs(val).toFixed(0)}% vs periode lalu</span>`;

  const salesRows = [...report.lists.wonList, ...report.lists.created.filter((p) => p.status !== "won")].map((p) => {
    const fin = report.finOf(p); const c = meta.clients.find((x) => x.id === p.clientId);
    return `<tr><td class="mono">${p.number}</td><td>${p.title}</td><td>${c ? c.name : "—"}</td><td><span class="pill ${p.status === "won" ? "win" : ""}">${statusName[p.status] || p.status}</span></td><td class="r mono">${fmt(fin.total)}</td><td class="r mono">${fin.actualMarginPct.toFixed(1)}%</td></tr>`;
  }).join("") || `<tr><td colspan="6" class="empty">Tidak ada proposal pada periode ini</td></tr>`;

  const clientRows = report.byClient.map((c) => `<tr><td>${c.name}</td><td class="r">${c.count}</td><td class="r mono">${fmt(c.wonValue)}</td></tr>`).join("") || `<tr><td colspan="3" class="empty">Belum ada proyek menang periode ini</td></tr>`;
  const salesPerRows = report.bySales.map((s) => `<tr><td>${s.name}</td><td>${s.role}</td><td class="r">${s.created}</td><td class="r">${s.wonCount}</td><td class="r mono">${fmt(s.wonValue)}</td><td class="r mono">${fmt(s.collected)}</td></tr>`).join("") || `<tr><td colspan="6" class="empty">Belum ada aktivitas</td></tr>`;
  const svcRows = report.byService.map((s) => `<tr><td>${s.category}</td><td class="r">${s.count}</td><td class="r mono">${fmt(s.value)}</td></tr>`).join("") || `<tr><td colspan="3" class="empty">Belum ada proyek menang periode ini</td></tr>`;
  const pipeRows = report.pipelineByStage.map((s) => `<tr><td>${s.stage}</td><td class="r">${s.count}</td><td class="r mono">${fmt(s.value)}</td><td class="barcell"><div class="bar" style="width:${(s.value / maxStage) * 100}%"></div></td></tr>`).join("");

  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>Laporan ${meta.typeLabel} ${meta.periodLabel} — Nusa Safety</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Calibri, "Segoe UI", Arial, sans-serif; color:#1a1a1a; font-size:11px; line-height:1.5; background:#fff; }
.page { max-width: 800px; margin:0 auto; padding: 28px 32px; }
.mono { font-family: "Consolas", "Courier New", monospace; }
h1,h2,h3 { font-family: Cambria, Georgia, serif; }
.head { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:16px; border-bottom:3px solid #1F3864; margin-bottom:6px; }
.brand { font-size:18px; font-weight:bold; color:#1F3864; }
.brand .red { color:#C00000; }
.tag { font-size:10px; color:#666; margin-top:2px; }
.addr { font-size:9px; color:#888; margin-top:4px; }
.rep-title { text-align:right; }
.rep-title .t { font-size:20px; font-weight:bold; color:#1F3864; }
.rep-title .p { font-size:12px; color:#C00000; font-weight:bold; }
.rep-title .d { font-size:9px; color:#888; margin-top:4px; }
.section { margin-top:22px; page-break-inside: avoid; }
.section-h { font-size:13px; font-weight:bold; color:#1F3864; border-left:4px solid #C00000; padding-left:8px; margin-bottom:10px; text-transform:uppercase; letter-spacing:0.5px; }
.grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; }
.grid3 { display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; }
.m { border:1px solid #ddd; border-radius:6px; padding:10px; background:#fafafa; }
.ml { font-size:8.5px; text-transform:uppercase; letter-spacing:0.4px; color:#888; }
.mv { font-size:16px; font-weight:bold; color:#1F3864; font-family:"Consolas",monospace; margin-top:3px; }
.ms { font-size:8.5px; color:#888; margin-top:2px; }
.g { font-size:8px; padding:1px 5px; border-radius:3px; font-weight:bold; }
.g.up { background:#e3f1e9; color:#1d7a4d; }
.g.dn { background:#fbe4e4; color:#C00000; }
table { width:100%; border-collapse:collapse; margin-top:4px; }
th { background:#1F3864; color:#fff; font-size:9px; text-align:left; padding:6px 8px; text-transform:uppercase; letter-spacing:0.3px; }
th.r, td.r { text-align:right; }
td { padding:6px 8px; border-bottom:1px solid #eee; font-size:10px; }
tr:nth-child(even) td { background:#f9f9f9; }
.pill { font-size:8px; padding:1px 6px; border-radius:3px; background:#eee; color:#666; text-transform:uppercase; }
.pill.win { background:#e3f1e9; color:#1d7a4d; }
.empty { text-align:center; color:#aaa; font-style:italic; padding:14px; }
.barcell { width:120px; }
.bar { height:8px; background:#1F3864; border-radius:2px; min-width:2px; }
.foot { margin-top:30px; padding-top:14px; border-top:1px solid #ddd; display:flex; justify-content:space-between; font-size:9px; color:#888; }
.sig { text-align:right; }
.sig .n { font-weight:bold; color:#333; font-size:10px; margin-top:24px; }
@page { margin: 12mm; }
@media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } .page { padding:0; max-width:100%; } .noprint { display:none; } }
.printbtn { position:fixed; top:16px; right:16px; background:#1F3864; color:#fff; border:none; padding:10px 18px; border-radius:6px; font-size:13px; cursor:pointer; font-family:inherit; box-shadow:0 2px 8px rgba(0,0,0,0.2); }
</style></head><body>
<button class="printbtn noprint" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
<div class="page">
  <div class="head">
    <div>
      <div class="brand">Nusa <span class="red">Safety</span></div>
      <div class="tag">${COMPANY_CONFIG.legalName} · ${COMPANY_CONFIG.tagline}</div>
      <div class="addr">${COMPANY_CONFIG.addressFull} · ${COMPANY_CONFIG.email} · ${COMPANY_CONFIG.website}</div>
    </div>
    <div class="rep-title">
      <div class="t">LAPORAN ${meta.typeLabel.toUpperCase()}</div>
      <div class="p">${meta.periodLabel}</div>
      <div class="d">Dibuat ${today}<br>oleh ${meta.author}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-h">Ringkasan Eksekutif</div>
    <div class="grid">
      ${metric("Nilai Kontrak Menang", fmt(report.sales.contractValueWon), `${report.sales.won} proyek ${growthBadge(g)}`)}
      ${metric("Cash Masuk", fmt(report.billing.collectedInPeriod), growthBadge(gC) || "diterima periode ini")}
      ${metric("Win Rate", report.sales.winRate.toFixed(0) + "%", `${report.sales.won} menang / ${report.sales.lost} kalah`)}
      ${metric("Rata-rata Margin", report.sales.avgMargin.toFixed(1) + "%", "proyek menang")}
      ${metric("Pipeline Aktif", fmt(report.sales.pipelineValue), `tertimbang ${fmt(report.sales.weightedPipeline)}`)}
      ${metric("Outstanding", fmt(report.billing.outstandingNow), `overdue ${fmt(report.billing.overdueNow)}`)}
      ${metric("Sinyal Prospek", String(report.marketing.signalsCaptured), `${report.marketing.signalsConverted} terkonversi`)}
      ${metric("Meeting / Booking", String(report.marketing.bookingsHeld), `${report.marketing.repliesReceived} balasan`)}
    </div>
  </div>

  <div class="section">
    <div class="section-h">Performa Penjualan</div>
    <table><thead><tr><th>No. Proposal</th><th>Judul</th><th>Klien</th><th>Status</th><th class="r">Nilai Total</th><th class="r">Margin</th></tr></thead><tbody>${salesRows}</tbody></table>
  </div>

  <div class="section">
    <div class="section-h">Pipeline per Stage</div>
    <table><thead><tr><th>Stage</th><th class="r">Jumlah</th><th class="r">Nilai</th><th></th></tr></thead><tbody>${pipeRows}</tbody></table>
  </div>

  <div class="section">
    <div class="section-h">Penjualan per Klien</div>
    <table><thead><tr><th>Klien</th><th class="r">Proyek Menang</th><th class="r">Nilai Kontrak</th></tr></thead><tbody>${clientRows}</tbody></table>
  </div>

  <div class="section">
    <div class="section-h">Performa per Sales</div>
    <table><thead><tr><th>Sales</th><th>Role</th><th class="r">Proposal</th><th class="r">Menang</th><th class="r">Nilai Menang</th><th class="r">Cash Masuk</th></tr></thead><tbody>${salesPerRows}</tbody></table>
  </div>

  <div class="section">
    <div class="section-h">Penjualan per Kategori Layanan</div>
    <table><thead><tr><th>Kategori</th><th class="r">Jumlah Proyek</th><th class="r">Nilai</th></tr></thead><tbody>${svcRows}</tbody></table>
  </div>

  <div class="foot">
    <div>Laporan ini digenerate otomatis oleh Nusa Snipe — Marketing & Sales Intelligence Platform.<br>Bersifat rahasia & internal ${COMPANY_CONFIG.brandName}.</div>
    <div class="sig">Hormat kami,<div class="n">${meta.author}</div><div>${meta.authorPosition || COMPANY_CONFIG.brandName}</div></div>
  </div>
</div>
<script>setTimeout(function(){ try { window.print(); } catch(e){} }, 600);</script>
</body></html>`;
}

function exportReportToPDF(report, meta) {
  const html = buildReportHTML(report, meta);
  const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
  if (!win) { if (typeof window !== "undefined") window.alert("Popup diblokir browser. Izinkan popup untuk situs ini agar bisa export PDF, lalu coba lagi."); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/* ============================================================================
   REPORTS VIEW — generate & export monthly/quarterly/yearly reports
   ============================================================================ */
function ReportsView({ proposals, clients, deals, signals, bookings, campaigns, replies, users, currentUser }) {
  const now = new Date();
  const [periodType, setPeriodType] = useState("month");
  const [year, setYear] = useState(now.getFullYear());
  const [monthIdx, setMonthIdx] = useState(now.getMonth());
  const [quarterIdx, setQuarterIdx] = useState(Math.floor(now.getMonth() / 3));
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const idx = periodType === "month" ? monthIdx : periodType === "quarter" ? quarterIdx : 0;
  const range = getPeriodRange(periodType, year, idx);
  const prevRange = getPrevPeriodRange(periodType, year, idx);

  const report = useMemo(
    () => computeReport({ proposals, clients, deals, signals, bookings, campaigns, replies, users }, range, prevRange),
    [proposals, clients, deals, signals, bookings, campaigns, replies, users, periodType, year, idx]
  );

  const typeLabel = periodType === "month" ? "Bulanan" : periodType === "quarter" ? "Kuartal" : "Tahunan";
  const pLabel = periodLabel(periodType, year, idx);
  const periodSlug = periodType === "month" ? `${year}-${String(idx + 1).padStart(2, "0")}` : periodType === "quarter" ? `${year}-Q${idx + 1}` : `${year}`;
  const meta = { typeLabel, periodLabel: pLabel, periodSlug, author: currentUser.name, authorPosition: currentUser.position || "", clients, proposals };

  const yearOptions = [];
  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) yearOptions.push(y);

  const g = report.prev ? growthPct(report.sales.contractValueWon, report.prev.contractValueWon) : null;
  const gC = report.prev ? growthPct(report.billing.collectedInPeriod, report.prev.collected) : null;
  const maxStage = Math.max(1, ...report.pipelineByStage.map((s) => s.value));

  useEffect(() => { setAiSummary(null); setAiError(null); }, [periodType, year, idx]);

  const handleAI = async () => {
    setAiLoading(true); setAiError(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 700,
          system: `Anda analis bisnis ${COMPANY_CONFIG.brandName}, konsultan QHSE Indonesia. Tulis ringkasan eksekutif laporan ${typeLabel.toLowerCase()} dalam Bahasa Indonesia bisnis yang ringkas dan tajam. Format: 1 paragraf narasi kondisi (3-4 kalimat), lalu 3 rekomendasi aksi konkret berbasis data. Jangan pakai markdown heading, cukup paragraf dan poin bernomor.`,
          messages: [{ role: "user", content: `Buat ringkasan eksekutif untuk periode ${pLabel}:
- Nilai kontrak menang: ${formatFullIDR(report.sales.contractValueWon)} (${report.sales.won} proyek)${report.prev ? `, periode lalu ${formatFullIDR(report.prev.contractValueWon)}` : ""}
- Win rate: ${report.sales.winRate.toFixed(0)}% (${report.sales.won} menang, ${report.sales.lost} kalah)
- Rata-rata margin: ${report.sales.avgMargin.toFixed(1)}%
- Cash masuk: ${formatFullIDR(report.billing.collectedInPeriod)}, outstanding ${formatFullIDR(report.billing.outstandingNow)}, overdue ${formatFullIDR(report.billing.overdueNow)}
- Pipeline aktif: ${formatFullIDR(report.sales.pipelineValue)} (tertimbang ${formatFullIDR(report.sales.weightedPipeline)})
- Prospecting: ${report.marketing.signalsCaptured} sinyal masuk, ${report.marketing.signalsConverted} terkonversi, ${report.marketing.bookingsHeld} meeting
- Top klien: ${report.byClient.slice(0, 3).map((c) => `${c.name} (${formatFullIDR(c.wonValue)})`).join(", ") || "—"}` }],
        }),
      });
      if (!response.ok) throw new Error(`API ${response.status}`);
      const data = await response.json();
      setAiSummary(data.content && data.content[0] && data.content[0].text ? data.content[0].text : "");
    } catch (err) { setAiError(err.message); } finally { setAiLoading(false); }
  };

  const Metric = ({ label, value, sub, accent, growth }) => (
    <div className="rounded-xl p-4" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
      <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{label}</p>
      <p className="text-[18px] font-bold" style={{ color: accent || T.navy, fontFamily: FONT_MONO }}>{value}</p>
      <div className="flex items-center gap-1.5 mt-1">
        {growth !== null && growth !== undefined && (
          <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: growth >= 0 ? T.sageSoft : T.redSoft, color: growth >= 0 ? T.sage : T.red, fontFamily: FONT_MONO }}>
            {growth >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />} {Math.abs(growth).toFixed(0)}%
          </span>
        )}
        {sub && <p className="text-[10px]" style={{ color: T.inkFaint }}>{sub}</p>}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={22} style={{ color: T.navy }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Laporan</h1>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>Generate laporan marketing & sales — export ke Excel & PDF</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => exportReportToExcel(report, meta)} className="px-4 py-2.5 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.sage }}>
            <FileSpreadsheet size={15} /> Export Excel
          </button>
          <button onClick={() => exportReportToPDF(report, meta)} className="px-4 py-2.5 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.red }}>
            <FileText size={15} /> Export PDF
          </button>
        </div>
      </div>

      {/* Period selector */}
      <div className="rounded-xl p-4 mb-6" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: T.surfaceAlt }}>
            {[{ id: "month", label: "Bulanan" }, { id: "quarter", label: "Kuartal" }, { id: "year", label: "Tahunan" }].map((t) => (
              <button key={t.id} onClick={() => setPeriodType(t.id)} className="px-3 py-1.5 rounded-md text-[12px] font-medium" style={{ background: periodType === t.id ? T.navy : "transparent", color: periodType === t.id ? "#fff" : T.inkSoft }}>{t.label}</button>
            ))}
          </div>
          {periodType === "month" && (
            <select value={monthIdx} onChange={(e) => setMonthIdx(Number(e.target.value))} style={{ ...inputStyle, width: "auto", minWidth: "140px" }}>
              {MONTH_NAMES_ID.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          )}
          {periodType === "quarter" && (
            <select value={quarterIdx} onChange={(e) => setQuarterIdx(Number(e.target.value))} style={{ ...inputStyle, width: "auto", minWidth: "160px" }}>
              {QUARTER_LABELS.map((q, i) => <option key={i} value={i}>{q}</option>)}
            </select>
          )}
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ ...inputStyle, width: "auto", minWidth: "100px" }}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md" style={{ background: T.navySoft }}>
            <Calendar size={13} style={{ color: T.navy }} />
            <span className="text-[12px] font-medium" style={{ color: T.navy }}>{pLabel}</span>
          </div>
        </div>
      </div>

      {/* Executive metrics */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Metric label="Kontrak menang" value={formatIDR(report.sales.contractValueWon)} sub={`${report.sales.won} proyek`} growth={g} />
        <Metric label="Cash masuk" value={formatIDR(report.billing.collectedInPeriod)} sub="diterima" accent={T.sage} growth={gC} />
        <Metric label="Win rate" value={`${report.sales.winRate.toFixed(0)}%`} sub={`${report.sales.won}M / ${report.sales.lost}K`} />
        <Metric label="Margin rata-rata" value={`${report.sales.avgMargin.toFixed(1)}%`} sub="proyek menang" accent={T.sage} />
        <Metric label="Pipeline aktif" value={formatIDR(report.sales.pipelineValue)} sub={`bobot ${formatIDR(report.sales.weightedPipeline)}`} accent={T.amber} />
        <Metric label="Outstanding" value={formatIDR(report.billing.outstandingNow)} sub={`overdue ${formatIDR(report.billing.overdueNow)}`} accent={report.billing.overdueNow > 0 ? T.red : T.amber} />
        <Metric label="Sinyal prospek" value={String(report.marketing.signalsCaptured)} sub={`${report.marketing.signalsConverted} konversi`} />
        <Metric label="Meeting/booking" value={String(report.marketing.bookingsHeld)} sub={`${report.marketing.repliesReceived} balasan`} />
      </div>

      {/* AI executive summary */}
      <div className="rounded-xl p-5 mb-6" style={{ background: T.surface, border: `1px solid ${T.rule}` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: T.sageSoft }}><Sparkles size={14} style={{ color: T.sage }} /></div>
            <p className="text-[14px] font-semibold" style={{ color: T.ink }}>Ringkasan eksekutif AI</p>
          </div>
          <button onClick={handleAI} disabled={aiLoading} className="px-3 py-1.5 rounded-md text-[12px] flex items-center gap-1.5 disabled:opacity-50" style={{ background: aiSummary ? T.surface : T.navy, color: aiSummary ? T.navy : "#fff", border: aiSummary ? `1px solid ${T.rule}` : "none" }}>
            {aiLoading ? <><Loader2 size={12} className="animate-spin" /> Menyusun…</> : aiSummary ? <><Wand2 size={12} /> Regenerate</> : <><Sparkles size={12} /> Generate ringkasan</>}
          </button>
        </div>
        {aiError ? (
          <p className="text-[12px]" style={{ color: T.red }}>Gagal: {aiError}</p>
        ) : aiSummary ? (
          <MarkdownLite text={aiSummary} />
        ) : (
          <p className="text-[12px]" style={{ color: T.inkSoft }}>Klik "Generate ringkasan" agar AI menulis narasi kondisi + rekomendasi aksi berdasarkan data periode ini. Bisa langsung disalin ke laporan PDF/presentasi.</p>
        )}
      </div>

      {/* Detail tables */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Panel title="Pipeline per stage" icon={Workflow} accent={T.navy}>
          <div className="space-y-2.5">
            {report.pipelineByStage.map((s, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px]" style={{ color: T.ink }}>{s.stage} <span style={{ color: T.inkFaint }}>· {s.count}</span></span>
                  <span className="text-[12px] font-medium" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatIDR(s.value)}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: T.surfaceAlt }}>
                  <div className="h-full rounded-full" style={{ width: `${(s.value / maxStage) * 100}%`, background: T.navy }} />
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Penjualan per layanan" icon={Layers} accent={T.amber}>
          {report.byService.length === 0 ? (
            <p className="text-[12px] py-4 text-center" style={{ color: T.inkFaint }}>Belum ada proyek menang periode ini</p>
          ) : (
            <div className="space-y-2">
              {report.byService.map((s, i) => (
                <BreakdownRow key={i} label={`${s.category} (${s.count})`} value={s.value} />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Top klien (nilai menang)" icon={Building2} accent={T.navy}>
          {report.byClient.length === 0 ? (
            <p className="text-[12px] py-4 text-center" style={{ color: T.inkFaint }}>Belum ada proyek menang periode ini</p>
          ) : (
            <div className="space-y-2">
              {report.byClient.slice(0, 6).map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[12px]" style={{ color: T.ink }}>{c.name} <span style={{ color: T.inkFaint }}>· {c.count}</span></span>
                  <span className="text-[12px] font-medium" style={{ color: T.navy, fontFamily: FONT_MONO }}>{formatFullIDR(c.wonValue)}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Performa per sales" icon={UserCheck} accent={T.sage}>
          {report.bySales.length === 0 ? (
            <p className="text-[12px] py-4 text-center" style={{ color: T.inkFaint }}>Belum ada aktivitas periode ini</p>
          ) : (
            <div className="space-y-2.5">
              {report.bySales.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-[12px] font-medium" style={{ color: T.ink }}>{s.name}</p>
                    <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>{s.created} proposal · {s.wonCount} menang</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium" style={{ color: T.sage, fontFamily: FONT_MONO }}>{formatFullIDR(s.wonValue)}</p>
                    <p className="text-[10px]" style={{ color: T.inkFaint, fontFamily: FONT_MONO }}>cash {formatIDR(s.collected)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <div className="rounded-md p-3 mt-5 flex items-start gap-2" style={{ background: T.navySoft, border: `1px solid ${T.navy}` }}>
        <FileSpreadsheet size={13} style={{ color: T.navy }} className="flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed" style={{ color: T.navy }}><strong>Export Excel</strong> menghasilkan workbook 7 sheet (Ringkasan, Penjualan, Penagihan, Pipeline, Per Klien, Per Sales, Per Layanan). <strong>Export PDF</strong> membuka dokumen berkop siap cetak — pilih "Simpan sebagai PDF" di dialog print. <strong>Production:</strong> jadwalkan laporan otomatis terkirim ke email manajemen tiap akhir bulan via cron <span style={{ fontFamily: FONT_MONO }}>/api/reports/schedule</span>.</p>
      </div>
    </div>
  );
}

/* ============================================================================
   COMPANY PROFILE (v1.4) — legal & reference info for proposals/documents
   ============================================================================ */
function CompanyInfoRow({ label, value, mono, copyable }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard && value) {
      navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200);
    }
  };
  return (
    <div className="flex items-start justify-between gap-3 py-2" style={{ borderBottom: `1px solid ${T.ruleSoft}` }}>
      <span className="text-[11px] flex-shrink-0 pt-0.5" style={{ color: T.inkFaint }}>{label}</span>
      <div className="flex items-center gap-2 text-right">
        <span className="text-[12px] font-medium" style={{ color: T.ink, fontFamily: mono ? FONT_MONO : "inherit" }}>{value || "—"}</span>
        {copyable && value && (
          <button onClick={doCopy} className="p-1 rounded flex-shrink-0" style={{ background: copied ? T.sageSoft : T.surfaceAlt }} aria-label="Copy">
            {copied ? <CheckCircle2 size={11} style={{ color: T.sage }} /> : <Copy size={11} style={{ color: T.inkSoft }} />}
          </button>
        )}
      </div>
    </div>
  );
}

function CompanyView({ company, setCompany, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const c = company;

  const referenceBlock = `${c.legalName} (${c.brandName})
${c.tagline}
NIB: ${c.nib}
NPWP: ${c.npwp}
Alamat: ${c.addressFull}
Telp: ${c.phone} · Email: ${c.email} · ${c.website}
Bank: ${c.bankName} ${c.bankBranch ? "(" + c.bankBranch + ")" : ""} No. ${c.bankAccount} a.n. ${c.bankHolder}
Sertifikasi: ${(c.certifications || []).join(", ")}`;

  const copyAll = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(referenceBlock); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 1500);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={22} style={{ color: T.navy }} />
            <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Profil Perusahaan</h1>
            <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ background: T.amberSoft, color: T.amber, fontFamily: FONT_MONO }}><ShieldCheck size={10} /> Admin only</span>
          </div>
          <p className="text-sm" style={{ color: T.inkSoft }}>Referensi resmi untuk proposal, invoice & dokumen — dipakai otomatis di seluruh app</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={copyAll} className="px-3 py-2 rounded-md text-sm flex items-center gap-1.5" style={{ background: copiedAll ? T.sage : T.surface, color: copiedAll ? "#fff" : T.navy, border: `1px solid ${copiedAll ? T.sage : T.rule}` }}>
            {copiedAll ? <><CheckCircle2 size={14} /> Tersalin</> : <><Copy size={14} /> Salin blok referensi</>}
          </button>
          {canEdit && (
            <button onClick={() => setEditing(true)} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy }}>
              <Edit3 size={14} /> Edit profil
            </button>
          )}
        </div>
      </div>

      {/* Hero card */}
      <div className="rounded-xl p-6 mb-4" style={{ background: T.navy }}>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}><NusaSnipeLogo size={34} color="#fff" /></div>
          <div className="flex-1">
            <h2 className="text-[20px] font-bold text-white leading-tight">{c.legalName}</h2>
            <p className="text-[13px]" style={{ color: "rgba(255,255,255,0.85)" }}>{c.brandName} · {c.tagline}</p>
            <div className="flex items-center gap-4 mt-3 flex-wrap text-[11px]" style={{ color: "rgba(255,255,255,0.75)" }}>
              <span className="flex items-center gap-1"><MapPin size={11} /> {c.hq}</span>
              <span className="flex items-center gap-1"><Globe size={11} /> {c.website}</span>
              <span className="flex items-center gap-1"><Calendar size={11} /> Est. {c.establishedYear}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-3 flex-wrap">
              {(c.certifications || []).map((cert, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", fontFamily: FONT_MONO }}>{cert}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Identitas Legal" icon={Hash} accent={T.navy}>
          <CompanyInfoRow label="Nama badan hukum" value={c.legalName} />
          <CompanyInfoRow label="Brand" value={c.brandName} />
          <CompanyInfoRow label="NIB" value={c.nib} mono copyable />
          <CompanyInfoRow label="NPWP" value={c.npwp} mono copyable />
          <CompanyInfoRow label="Penanggung jawab" value={c.director} />
          <CompanyInfoRow label="Tahun berdiri" value={c.establishedYear} mono />
          <CompanyInfoRow label="Bidang usaha (KBLI)" value={c.businessField} />
        </Panel>

        <Panel title="Kontak & Alamat" icon={MapPin} accent={T.amber}>
          <CompanyInfoRow label="Alamat lengkap" value={c.addressFull} copyable />
          <CompanyInfoRow label="Kantor pusat" value={c.hq} />
          <CompanyInfoRow label="Cabang" value={(c.branches || []).join(", ")} />
          <CompanyInfoRow label="Telepon" value={c.phone} mono copyable />
          <CompanyInfoRow label="Email umum" value={c.email} mono copyable />
          <CompanyInfoRow label="Email finance" value={c.financeEmail} mono copyable />
          <CompanyInfoRow label="Website" value={c.website} mono copyable />
        </Panel>

        <Panel title="Rekening Bank" icon={Banknote} accent={T.sage}>
          <CompanyInfoRow label="Nama bank" value={c.bankName} />
          <CompanyInfoRow label="Cabang" value={c.bankBranch} />
          <CompanyInfoRow label="No. rekening" value={c.bankAccount} mono copyable />
          <CompanyInfoRow label="Atas nama" value={c.bankHolder} copyable />
          <div className="rounded-md p-2.5 mt-3 flex items-start gap-2" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
            <CircleDollarSign size={12} style={{ color: T.sage }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed" style={{ color: T.sage }}>Info ini otomatis tercantum di setiap invoice yang digenerate dari modul Penagihan.</p>
          </div>
        </Panel>

        <Panel title="Sertifikasi & Profil" icon={ShieldCheck} accent={T.navy}>
          <CompanyInfoRow label="Tagline" value={c.tagline} />
          <div className="py-2">
            <p className="text-[11px] mb-2" style={{ color: T.inkFaint }}>Sertifikasi</p>
            <div className="flex flex-wrap gap-1.5">
              {(c.certifications || []).map((cert, i) => (
                <span key={i} className="text-[11px] px-2 py-1 rounded flex items-center gap-1" style={{ background: T.navySoft, color: T.navy }}><ShieldCheck size={10} /> {cert}</span>
              ))}
              {(c.certifications || []).length === 0 && <span className="text-[11px]" style={{ color: T.inkFaint }}>Belum ada</span>}
            </div>
          </div>
          <div className="rounded-md p-2.5 mt-2 flex items-start gap-2" style={{ background: T.amberSoft, border: `1px solid ${T.amber}` }}>
            <AlertCircle size={12} style={{ color: T.amber }} className="flex-shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed" style={{ color: T.amber }}>Lengkapi NIB, NPWP, no. rekening & alamat dengan data asli Nusa Safety. Nilai default masih placeholder.</p>
          </div>
        </Panel>
      </div>

      {editing && <CompanyModal company={company} onSave={(data) => { setCompany(data); setEditing(false); }} onClose={() => setEditing(false)} />}
    </div>
  );
}

/* ============== COMPANY MODAL (edit) ============== */
function CompanyModal({ company, onSave, onClose }) {
  const [form, setForm] = useState({ ...company, branchesStr: (company.branches || []).join(", "), certificationsStr: (company.certifications || []).join(", ") });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const handleSave = () => {
    const out = { ...form };
    out.branches = form.branchesStr.split(",").map((s) => s.trim()).filter(Boolean);
    out.certifications = form.certificationsStr.split(",").map((s) => s.trim()).filter(Boolean);
    delete out.branchesStr; delete out.certificationsStr;
    onSave(out);
  };
  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: T.rule }}>
        <h2 className="text-[16px] font-semibold" style={{ color: T.ink }}>Edit profil perusahaan</h2>
        <button onClick={onClose} aria-label="Close"><X size={18} style={{ color: T.inkSoft }} /></button>
      </div>
      <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
        <p className="text-[11px] uppercase tracking-wider" style={{ color: T.navy, fontFamily: FONT_MONO }}>Identitas Legal</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama badan hukum"><input type="text" value={form.legalName} onChange={(e) => set("legalName", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Brand"><input type="text" value={form.brandName} onChange={(e) => set("brandName", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="NIB"><input type="text" value={form.nib} onChange={(e) => set("nib", e.target.value)} style={inputStyle} placeholder="13 digit" /></FormField>
          <FormField label="NPWP"><input type="text" value={form.npwp} onChange={(e) => set("npwp", e.target.value)} style={inputStyle} placeholder="XX.XXX.XXX.X-XXX.XXX" /></FormField>
          <FormField label="Penanggung jawab / Direktur"><input type="text" value={form.director} onChange={(e) => set("director", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Tahun berdiri"><input type="text" value={form.establishedYear} onChange={(e) => set("establishedYear", e.target.value)} style={inputStyle} /></FormField>
        </div>
        <FormField label="Bidang usaha (KBLI)"><input type="text" value={form.businessField} onChange={(e) => set("businessField", e.target.value)} style={inputStyle} /></FormField>
        <FormField label="Tagline"><input type="text" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} style={inputStyle} /></FormField>

        <p className="text-[11px] uppercase tracking-wider pt-2" style={{ color: T.navy, fontFamily: FONT_MONO }}>Kontak & Alamat</p>
        <FormField label="Alamat lengkap"><textarea value={form.addressFull} onChange={(e) => set("addressFull", e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: "56px" }} /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kantor pusat (kota)"><input type="text" value={form.hq} onChange={(e) => set("hq", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Cabang (pisahkan koma)"><input type="text" value={form.branchesStr} onChange={(e) => set("branchesStr", e.target.value)} style={inputStyle} placeholder="Bekasi, Surabaya" /></FormField>
          <FormField label="Telepon"><input type="text" value={form.phone} onChange={(e) => set("phone", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Website"><input type="text" value={form.website} onChange={(e) => set("website", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Email umum"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Email finance"><input type="email" value={form.financeEmail} onChange={(e) => set("financeEmail", e.target.value)} style={inputStyle} /></FormField>
        </div>

        <p className="text-[11px] uppercase tracking-wider pt-2" style={{ color: T.navy, fontFamily: FONT_MONO }}>Rekening Bank</p>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama bank"><input type="text" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Cabang bank"><input type="text" value={form.bankBranch} onChange={(e) => set("bankBranch", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="No. rekening"><input type="text" value={form.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} style={inputStyle} /></FormField>
          <FormField label="Atas nama"><input type="text" value={form.bankHolder} onChange={(e) => set("bankHolder", e.target.value)} style={inputStyle} /></FormField>
        </div>

        <p className="text-[11px] uppercase tracking-wider pt-2" style={{ color: T.navy, fontFamily: FONT_MONO }}>Sertifikasi</p>
        <FormField label="Sertifikasi (pisahkan koma)"><input type="text" value={form.certificationsStr} onChange={(e) => set("certificationsStr", e.target.value)} style={inputStyle} placeholder="ISO 45001:2018, SMK3 PP 50/2012" /></FormField>
      </div>
      <div className="p-5 border-t flex justify-end gap-2" style={{ borderColor: T.rule }}>
        <button onClick={onClose} className="px-4 py-2 rounded-md text-sm" style={{ color: T.inkSoft }}>Batal</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: T.navy }}>
          <Save size={13} /> Simpan profil perusahaan
        </button>
      </div>
    </Modal>
  );
}

/* ============================================================================
   PROFILE VIEW — current user edits own profile + password
   ============================================================================ */
function ProfileView({ currentUser, onSave }) {
  const [form, setForm] = useState({ name: currentUser.name, email: currentUser.email, position: currentUser.position || "", phone: currentUser.phone || "", photo: currentUser.photo || "" });
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  const [showPwd, setShowPwd] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState(null);
  const [pwdErr, setPwdErr] = useState(null);

  const dirty = form.name !== currentUser.name || form.email !== currentUser.email || (form.position || "") !== (currentUser.position || "") || (form.phone || "") !== (currentUser.phone || "") || (form.photo || "") !== (currentUser.photo || "");

  const handlePhoto = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    resizeImageFile(file, 256, 0.82, (dataUrl) => { if (dataUrl) setForm((f) => ({ ...f, photo: dataUrl })); });
  };

  const handleSaveProfile = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    onSave({ id: currentUser.id, name: form.name.trim(), email: form.email.trim(), position: form.position.trim(), phone: form.phone.trim(), photo: form.photo });
    setSaved(true); setTimeout(() => setSaved(false), 1800);
  };

  const handleChangePwd = async () => {
    setPwdErr(null); setPwdMsg(null);
    if (newPwd.length < 8) { setPwdErr("Password baru minimal 8 karakter."); return; }
    if (newPwd !== confirmPwd) { setPwdErr("Konfirmasi password tidak cocok."); return; }
    const oldHash = await hashPassword(oldPwd);
    if (oldHash !== currentUser.passwordHash) { setPwdErr("Password lama salah."); return; }
    const newHash = await hashPassword(newPwd);
    onSave({ id: currentUser.id, passwordHash: newHash });
    setOldPwd(""); setNewPwd(""); setConfirmPwd(""); setShowPwd(false);
    setPwdMsg("Password berhasil diubah.");
    setTimeout(() => setPwdMsg(null), 2500);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <UserCheck size={22} style={{ color: T.navy }} />
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: T.ink }}>Profil Saya</h1>
        </div>
        <p className="text-sm" style={{ color: T.inkSoft }}>Nama, foto & kontak Anda tampil di email tagihan dan dokumen proposal</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Panel title="Informasi personil" icon={UserCheck} accent={T.navy}>
            <div className="flex items-center gap-4 mb-4">
              <Avatar user={{ name: form.name || "?", role: currentUser.role, photo: form.photo }} size={72} />
              <div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
                <div className="flex items-center gap-2">
                  <button onClick={() => fileRef.current && fileRef.current.click()} className="px-3 py-1.5 rounded-md text-[12px] flex items-center gap-1.5" style={{ background: T.navy, color: "#fff" }}>
                    <UserPlus size={12} /> {form.photo ? "Ganti foto" : "Upload foto"}
                  </button>
                  {form.photo && <button onClick={() => setForm((f) => ({ ...f, photo: "" }))} className="px-3 py-1.5 rounded-md text-[12px]" style={{ background: T.surface, color: T.red, border: `1px solid ${T.rule}` }}>Hapus</button>}
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: T.inkFaint }}>Foto dikecilkan otomatis ke 256×256 px.</p>
              </div>
            </div>
            <div className="space-y-4">
              <FormField label="Nama lengkap" required>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="contoh: Budi Santoso, S.T." />
              </FormField>
              <FormField label="Jabatan / posisi">
                <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} style={inputStyle} placeholder="contoh: Marketing & Sales Executive" />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Email" required>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
                </FormField>
                <FormField label="No. HP / WhatsApp">
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} placeholder="+62 811-xxxx-xxxx" />
                </FormField>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <button onClick={handleSaveProfile} disabled={!dirty || !form.name.trim() || !form.email.trim()} className="px-4 py-2 rounded-md text-sm text-white flex items-center gap-1.5" style={{ background: saved ? T.sage : T.navy, opacity: (dirty && form.name.trim() && form.email.trim()) || saved ? 1 : 0.5 }}>
                {saved ? <><CheckCircle2 size={13} /> Tersimpan</> : <><Save size={13} /> Simpan perubahan</>}
              </button>
            </div>
          </Panel>

          <Panel title="Keamanan" icon={Lock} accent={T.amber}>
            {!showPwd ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-medium" style={{ color: T.ink }}>Password</p>
                  <p className="text-[11px]" style={{ color: T.inkFaint }}>Ubah password login Anda secara berkala</p>
                </div>
                <button onClick={() => setShowPwd(true)} className="px-3 py-1.5 rounded-md text-[12px] flex items-center gap-1.5" style={{ background: T.surface, color: T.amber, border: `1px solid ${T.rule}` }}>
                  <KeyRound size={12} /> Ubah password
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <FormField label="Password lama" required>
                  <input type="password" value={oldPwd} onChange={(e) => setOldPwd(e.target.value)} style={inputStyle} placeholder="Password saat ini" />
                </FormField>
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Password baru" required>
                    <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} style={inputStyle} placeholder="Min. 8 karakter" />
                  </FormField>
                  <FormField label="Konfirmasi baru" required>
                    <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} style={inputStyle} placeholder="Ulangi password" />
                  </FormField>
                </div>
                {pwdErr && (
                  <div className="rounded-md p-2.5 flex items-start gap-2" style={{ background: T.redSoft, border: `1px solid ${T.red}` }}>
                    <AlertCircle size={12} style={{ color: T.red }} className="flex-shrink-0 mt-0.5" /><p className="text-[11px]" style={{ color: T.red }}>{pwdErr}</p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button onClick={handleChangePwd} disabled={!oldPwd || !newPwd || !confirmPwd} className="px-3 py-1.5 rounded-md text-[12px] text-white flex items-center gap-1.5" style={{ background: T.amber, opacity: oldPwd && newPwd && confirmPwd ? 1 : 0.5 }}>
                    <KeyRound size={12} /> Simpan password baru
                  </button>
                  <button onClick={() => { setShowPwd(false); setOldPwd(""); setNewPwd(""); setConfirmPwd(""); setPwdErr(null); }} className="px-3 py-1.5 rounded-md text-[12px]" style={{ color: T.inkSoft }}>Batal</button>
                </div>
              </div>
            )}
            {pwdMsg && (
              <div className="rounded-md p-2.5 mt-3 flex items-start gap-2" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
                <CheckCircle2 size={12} style={{ color: T.sage }} className="flex-shrink-0 mt-0.5" /><p className="text-[11px]" style={{ color: T.sage }}>{pwdMsg}</p>
              </div>
            )}
          </Panel>
        </div>

        {/* Preview how it appears in documents */}
        <div className="space-y-4">
          <Panel title="Tampilan di dokumen" icon={FileText} accent={T.sage}>
            <p className="text-[11px] mb-3" style={{ color: T.inkFaint }}>Beginilah identitas Anda tampil di tanda tangan email & invoice:</p>
            <div className="rounded-lg p-4" style={{ background: T.surfaceAlt, border: `1px solid ${T.rule}` }}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar user={{ name: form.name || "?", role: currentUser.role, photo: form.photo }} size={44} />
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: T.ink }}>{form.name || "—"}</p>
                  <p className="text-[11px]" style={{ color: T.inkSoft }}>{form.position || roleLabel(currentUser.role)}</p>
                </div>
              </div>
              <div className="space-y-1 text-[11px]" style={{ color: T.inkSoft }}>
                <p className="flex items-center gap-1.5"><Mail size={10} /> {form.email || "—"}</p>
                <p className="flex items-center gap-1.5"><Phone size={10} /> {form.phone || "—"}</p>
                <p className="flex items-center gap-1.5"><Building2 size={10} /> {COMPANY_CONFIG.brandName}</p>
              </div>
            </div>
            <div className="rounded-md p-2.5 mt-3 flex items-start gap-2" style={{ background: T.sageSoft, border: `1px solid ${T.sage}` }}>
              <Sparkles size={12} style={{ color: T.sage }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[10px] leading-relaxed" style={{ color: T.sage }}>Saat Anda kirim email tagihan AI atau buat invoice, nama & jabatan ini otomatis jadi penanda tangan dokumen.</p>
            </div>
          </Panel>
          <Panel title="Akun" icon={ShieldCheck} accent={T.navy}>
            <Stat label="Role" value={roleLabel(currentUser.role)} />
            <Stat label="User ID" value={currentUser.id} />
            <Stat label="Bergabung" value={formatDate(currentUser.createdAt)} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
