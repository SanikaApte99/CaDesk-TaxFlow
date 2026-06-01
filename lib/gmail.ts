import { google } from "googleapis";

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID!,
    process.env.GMAIL_CLIENT_SECRET!,
    process.env.GMAIL_REDIRECT_URI!,
  );
}

export function getAuthUrl(): string {
  const oauth2Client = getOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/gmail.readonly"],
  });
}

export async function exchangeCodeForTokens(code: string) {
  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

export async function getValidAccessToken(
  accessToken: string,
  refreshToken: string,
  expiryDate: number,
): Promise<{ accessToken: string; expiryDate: number; refreshed: boolean }> {
  const oauth2Client = getOAuthClient();

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  });

  const isExpiringSoon = expiryDate < Date.now() + 5 * 60 * 1000;

  if (isExpiringSoon) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    return {
      accessToken: credentials.access_token!,
      expiryDate: credentials.expiry_date!,
      refreshed: true,
    };
  }

  return { accessToken, expiryDate, refreshed: false };
}

export async function fetchTaxEmails(accessToken: string) {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  const query = [
    "from:incometax.gov.in",
    "from:gst.gov.in",
    "from:cpc.incometax.gov.in",
    "from:donotreply@incometax.gov.in",
    "subject:notice",
    "subject:intimation",
    "subject:demand",
    "subject:scrutiny",
    "subject:ITR",
    "subject:GST",
  ].join(" OR ");

  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50,
  });

  const messages = listRes.data.messages ?? [];
  if (messages.length === 0) return [];

  const emails = await Promise.all(
    messages.map(async (msg) => {
      const detail = await gmail.users.messages.get({
        userId: "me",
        id: msg.id!,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = detail.data.payload?.headers ?? [];
      const from = headers.find((h) => h.name === "From")?.value ?? "";
      const subject = headers.find((h) => h.name === "Subject")?.value ?? "";
      const date = headers.find((h) => h.name === "Date")?.value ?? "";
      const snippet = detail.data.snippet ?? "";
      const isUnread = detail.data.labelIds?.includes("UNREAD") ?? false;

      return {
        id: msg.id!,
        from,
        subject,
        date,
        snippet,
        isUnread,
        category: categorizeEmail(from, subject),
      };
    }),
  );

  return emails.sort((a, b) => {
    if (a.isUnread && !b.isUnread) return -1;
    if (!a.isUnread && b.isUnread) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

function categorizeEmail(
  from: string,
  subject: string,
): "it-dept" | "gst-dept" | "client" | "other" {
  const f = from.toLowerCase();
  const s = subject.toLowerCase();

  if (f.includes("incometax.gov.in") || f.includes("cpc.incometax"))
    return "it-dept";
  if (f.includes("gst.gov.in")) return "gst-dept";
  if (
    s.includes("itr") ||
    s.includes("notice") ||
    s.includes("demand") ||
    s.includes("intimation")
  )
    return "client";
  return "other";
}
