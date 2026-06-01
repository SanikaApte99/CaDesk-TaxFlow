"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Loader2,
  Copy,
  Send,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  FileWarning,
  Paperclip,
  X,
  Plus,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NoticeUrgency = "urgent" | "soon";

interface NoticeDoc {
  _id: Id<"notices">;
  clientName: string;
  initials: string;
  avatarColor: string;
  type: string;
  section: string;
  sub: string;
  dueDate: string;
  urgency: string;
  context: string;
  status: string;
  aiDraft?: string;
  documentStorageId?: Id<"_storage">;
  uploadedFileName?: string;
  createdAt: number;
}
interface NoticeListProps {
  firmId: Id<"firms">;
}

const AVATAR_COLORS = [
  "bg-red-700",
  "bg-amber-700",
  "bg-blue-700",
  "bg-emerald-700",
  "bg-violet-700",
  "bg-rose-700",
];

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}

function pickColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const urgencyConfig: Record<
  NoticeUrgency,
  { badgeCls: string; label: string }
> = {
  urgent: {
    badgeCls: "bg-red-100 text-red-800 border-red-200",
    label: "Urgent",
  },
  soon: {
    badgeCls: "bg-amber-100 text-amber-800 border-amber-200",
    label: "Due soon",
  },
};

interface AddNoticeFormProps {
  onClose: () => void;
  firmId: Id<"firms">;
}

function AddNoticeForm({ firmId, onClose }: AddNoticeFormProps) {
  const [clientName, setClientName] = useState("");
  const [noticeType, setNoticeType] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [urgency, setUrgency] = useState<NoticeUrgency>("soon");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.notices.generateUploadUrl);
  const createNotice = useMutation(api.notices.createNotice);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(f.type)) {
      setError("Only PDF, PNG, or JPG allowed.");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError("File must be under 10 MB.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function handleSubmit() {
    if (!clientName.trim()) {
      setError("Client name is required.");
      return;
    }
    if (!file) {
      setError("Please attach the notice document.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Upload doc to Convex storage
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { storageId } = await res.json();

      const name = clientName.trim();
      await createNotice({
        firmId,
        clientName: name,
        initials: getInitials(name),
        avatarColor: pickColor(name),
        type: noticeType.trim() || "Notice",
        section: "",
        sub: noticeType.trim() || "Notice",
        dueDate: dueDate || "—",
        urgency,
        context: "",
        status: "open",
        documentStorageId: storageId as Id<"_storage">,
        uploadedFileName: file.name,
      });

      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-5 mb-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold text-gray-700 mb-3">New notice</p>

      <div className="flex flex-col gap-2.5">
        {/* Client name */}
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">
            Client name *
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="e.g. Sneha Patil"
            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200
              bg-white focus:outline-none focus:ring-1 focus:ring-gray-300
              placeholder:text-gray-400"
          />
        </div>

        {/* Notice type */}
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">
            Notice type
          </label>
          <input
            type="text"
            value={noticeType}
            onChange={(e) => setNoticeType(e.target.value)}
            placeholder="e.g. 143(1) Intimation, GST Scrutiny…"
            className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200
              bg-white focus:outline-none focus:ring-1 focus:ring-gray-300
              placeholder:text-gray-400"
          />
        </div>

        {/* Due date + urgency */}
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-gray-500 mb-1 block">
              Due date
            </label>
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g. 15 Jun"
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200
                bg-white focus:outline-none focus:ring-1 focus:ring-gray-300
                placeholder:text-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-gray-500 mb-1 block">
              Urgency
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as NoticeUrgency)}
              className="w-full text-xs px-2.5 py-1.5 rounded-md border border-gray-200
                bg-white focus:outline-none focus:ring-1 focus:ring-gray-300"
            >
              <option value="soon">Due soon</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* File upload */}
        <div>
          <label className="text-[11px] text-gray-500 mb-1 block">
            Notice document *
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleFileSelect}
          />
          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium
                px-2.5 py-1.5 rounded-md border border-dashed border-gray-300
                bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700
                hover:bg-gray-50 transition-colors"
            >
              <Paperclip className="h-3 w-3" />
              Attach PDF / image
            </button>
          ) : (
            <div
              className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5
              rounded-md border border-green-200 bg-green-50 text-green-700 font-medium"
            >
              <CheckCircle2 className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-45">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-1 text-green-500 hover:text-green-700"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-[11px] text-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-0.5">
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium
              px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-700
              transition-colors disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving…
              </>
            ) : (
              "Add notice"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-[11px] text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function NoticeItem({ notice }: { notice: NoticeDoc }) {
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState(notice.aiDraft ?? "");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const saveAiDraft = useMutation(api.notices.saveAiDraft);
  const deleteNotice = useMutation(api.notices.deleteNotice);
  const documentUrl = useQuery(
    api.notices.getDocumentUrl,
    notice.documentStorageId ? { storageId: notice.documentStorageId } : "skip",
  );

  const hasDoc = Boolean(notice.documentStorageId);
  const hasSavedDraft = Boolean(notice.aiDraft);
  const displayDraft = draft || notice.aiDraft || "";

  const urgency =
    (notice.urgency as NoticeUrgency) in urgencyConfig
      ? (notice.urgency as NoticeUrgency)
      : "soon";
  const config = urgencyConfig[urgency];

  async function generateDraft() {
    if (!documentUrl) return;
    setDraftOpen(true);
    setGenerating(true);
    setDraft("");
    setGenError("");

    try {
      const fileRes = await fetch(documentUrl);
      if (!fileRes.ok) throw new Error("Could not fetch document");
      const blob = await fileRes.blob();
      const mimeType = blob.type || "application/pdf";
      const buf = await blob.arrayBuffer();
      const uint8 = new Uint8Array(buf);
      let binary = "";
      for (let i = 0; i < uint8.length; i++)
        binary += String.fromCharCode(uint8[i]);
      const fileBase64 = btoa(binary);

      const res = await fetch("/api/ai/draft-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64, mimeType }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            const text = json.delta?.text ?? "";
            full += text;
            setDraft(full);
          } catch {
            /* skip */
          }
        }
      }

      if (full) await saveAiDraft({ noticeId: notice._id, aiDraft: full });
    } catch {
      setGenError("Failed to generate draft. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(displayDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  async function handleDelete() {
    await deleteNotice({ noticeId: notice._id });
  }

  return (
    <div className="py-3.5 border-b last:border-none last:pb-0 first:pt-0">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5",
            "text-[11px] font-semibold text-white",
            notice.avatarColor,
          )}
        >
          {notice.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {notice.clientName}
              </span>
              {notice.type && notice.type !== "Notice" && (
                <>
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    ·
                  </span>
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate">
                    {notice.type}
                  </span>
                </>
              )}
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium shrink-0",
                config.badgeCls,
              )}
            >
              {config.label}
            </Badge>
            {!confirmDel ? (
              <button
                onClick={() => setConfirmDel(true)}
                className="text-gray-300 hover:text-red-500 transition-colors"
                title="Delete notice"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDelete}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded
                      bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            {notice.dueDate && notice.dueDate !== "—" && (
              <span className="text-[11px] text-muted-foreground">
                Due {notice.dueDate}
              </span>
            )}
            {/* Attached doc pill */}
            {hasDoc && notice.uploadedFileName && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5
                rounded bg-gray-100 text-gray-500 font-mono truncate max-w-35"
              >
                <FileText className="h-2.5 w-2.5 shrink-0" />
                {notice.uploadedFileName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI draft section — only if doc is attached */}
      {hasDoc && (
        <div className="mt-2.5 ml-11">
          {!draftOpen && !hasSavedDraft ? (
            <button
              onClick={generateDraft}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium
                px-2.5 py-1.5 rounded-full border border-purple-200 bg-purple-50
                text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Generate AI draft reply
            </button>
          ) : !draftOpen && hasSavedDraft ? (
            <button
              onClick={() => setDraftOpen(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium
                px-2.5 py-1.5 rounded-full border border-purple-200 bg-purple-50
                text-purple-700 hover:bg-purple-100 transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              View saved draft
            </button>
          ) : (
            <div>
              <button
                onClick={() => setDraftOpen(false)}
                className="inline-flex items-center gap-1 text-[11px] text-purple-600
                  hover:text-purple-800 transition-colors mb-2"
              >
                <ChevronUp className="h-3 w-3" />
                Hide draft
              </button>

              <div className="rounded-lg border border-purple-200 bg-purple-50">
                <div className="flex items-center gap-1.5 px-3 pt-3 pb-2 border-b border-purple-100">
                  <Sparkles className="h-3 w-3 text-purple-600 shrink-0" />
                  <span className="text-[10px] font-semibold tracking-widest uppercase text-purple-600">
                    AI generated · review before sending
                  </span>
                  {generating && (
                    <Loader2 className="h-3 w-3 text-purple-400 animate-spin ml-auto" />
                  )}
                </div>

                <div className="px-3 py-2.5">
                  {generating && !displayDraft && (
                    <div className="flex items-center gap-2 text-xs text-purple-500 py-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                      Reading document and drafting reply...
                    </div>
                  )}
                  {genError && (
                    <div
                      className="flex items-start gap-2 text-xs text-red-600
                      bg-red-50 border border-red-200 rounded-md px-2.5 py-2"
                    >
                      <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      {genError}
                    </div>
                  )}
                  {displayDraft && (
                    <p className="text-xs text-purple-900 leading-relaxed whitespace-pre-wrap">
                      {displayDraft}
                      {generating && (
                        <span className="inline-block w-1.5 h-3.5 bg-purple-400 ml-0.5 align-middle animate-pulse" />
                      )}
                    </p>
                  )}
                </div>

                {!generating && displayDraft && (
                  <div className="flex items-center gap-2 px-3 pb-3 pt-2 border-t border-purple-100">
                    <button
                      onClick={copyDraft}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium
                        px-2.5 py-1.5 rounded-md border border-purple-200 bg-white
                        text-purple-700 hover:bg-purple-50 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium
                      px-2.5 py-1.5 rounded-md bg-purple-700 text-white hover:bg-purple-800 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      Send to client
                    </button>
                    <button
                      onClick={generateDraft}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium
                        px-2.5 py-1.5 rounded-md border border-purple-200 bg-white
                        text-purple-700 hover:bg-purple-50 transition-colors ml-auto"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function NoticeSkeleton() {
  return (
    <div className="py-3.5 border-b last:border-none animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-gray-200 rounded w-1/2" />
          <div className="h-3   bg-gray-100 rounded w-1/3" />
        </div>
      </div>
      <div className="mt-2.5 ml-11">
        <div className="h-6 w-36 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export function NoticeList({ firmId }: NoticeListProps) {
  const [showForm, setShowForm] = useState(false);
  const notices = useQuery(api.notices.getNoticesByFirm, { firmId });
  const isLoading = notices === undefined;
  const openNotices = (notices ?? []).filter((n) => n.status === "open");
  const urgentCount = openNotices.filter((n) => n.urgency === "urgent").length;

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">
              Open IT notices
            </CardTitle>
            <FileWarning className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2">
            {urgentCount > 0 && (
              <Badge
                variant="outline"
                className="bg-red-100 text-red-800 border-red-200 text-[11px]"
              >
                {urgentCount} urgent
              </Badge>
            )}
            {openNotices.length > 0 && (
              <Badge
                variant="outline"
                className="bg-gray-100 text-gray-700 border-gray-200 text-[11px]"
              >
                {isLoading ? "…" : `${openNotices.length} open`}
              </Badge>
            )}
            <button
              onClick={() => setShowForm((v) => !v)}
              className="inline-flex items-center gap-1 text-[11px] font-medium
                px-2 py-1 rounded-md border border-gray-200 bg-white text-gray-600
                hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add
            </button>
          </div>
        </div>
      </CardHeader>

      {/* Inline add form */}
      {showForm && (
        <AddNoticeForm firmId={firmId} onClose={() => setShowForm(false)} />
      )}

      <CardContent className="px-5 pb-4">
        {isLoading ? (
          <>
            <NoticeSkeleton />
            <NoticeSkeleton />
          </>
        ) : openNotices.length === 0 && !showForm ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FileWarning className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-gray-600">
                No open notices
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Add a notice when you receive one
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium
                px-3 py-1.5 rounded-md border border-dashed border-gray-300
                bg-white text-gray-500 hover:border-gray-400 hover:text-gray-700
                hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add first notice
            </button>
          </div>
        ) : (
          openNotices.map((notice) => (
            <NoticeItem key={notice._id} notice={notice as NoticeDoc} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
