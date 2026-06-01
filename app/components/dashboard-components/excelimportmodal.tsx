"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useSession } from "next-auth/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ParsedClient, parseExcelFile } from "@/lib/excelparser";

type Step = "upload" | "preview" | "importing" | "done";

function downloadSampleExcel() {
  const rows = [
    ["Name", "PAN", "Phone", "Email", "Category", "Service Type"],
    [
      "Rahul Mehta",
      "RLMEH9012H",
      "+91 98765 43210",
      "rahul@email.com",
      "individual",
      "ITR · Salaried",
    ],
    [
      "AK Exports Pvt",
      "AABCA1234F",
      "+91 91234 56789",
      "ak@exports.in",
      "business",
      "GST + ITR · Business",
    ],
    [
      "Sneha Patil",
      "SNPAT5678G",
      "+91 98123 45678",
      "sneha@email.com",
      "nri",
      "NRI · FEMA",
    ],
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cadesk_clients_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function UploadStep({
  onFile,
  error,
}: {
  onFile: (file: File) => void;
  error: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  function handleFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      alert("Please upload an .xlsx, .xls, or .csv file");
      return;
    }
    onFile(file);
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border-2",
          "border-dashed py-12 cursor-pointer transition-colors",
          drag
            ? "border-gray-400 bg-gray-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
        )}
      >
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <FileSpreadsheet className="h-6 w-6 text-gray-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drop your Excel file here
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse · .xlsx, .xls, .csv supported
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && (
        <div
          className="flex items-center gap-2 text-xs text-red-600
          bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Expected format */}
      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-700">
            Expected column headers
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              downloadSampleExcel();
            }}
            className="inline-flex items-center gap-1 text-[11px] text-blue-600
              hover:underline"
          >
            <Download className="h-3 w-3" />
            Download template
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            "Name*",
            "PAN*",
            "Phone",
            "Email",
            "Category*",
            "Service Type*",
          ].map((col) => (
            <div
              key={col}
              className="text-[11px] font-mono bg-white border
              border-gray-200 rounded px-2 py-1 text-gray-600"
            >
              {col}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2.5">
          * required · Category: individual, business, nri
        </p>
      </div>
    </div>
  );
}

function PreviewStep({
  clients,
  fileName,
}: {
  clients: ParsedClient[];
  fileName: string;
}) {
  const valid = clients.filter((c) => c.valid);
  const invalid = clients.filter((c) => !c.valid);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-1.5 text-xs text-green-700
          bg-green-50 border border-green-200 rounded-lg px-3 py-2"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          {valid.length} ready to import
        </div>
        {invalid.length > 0 && (
          <div
            className="flex items-center gap-1.5 text-xs text-red-600
            bg-red-50 border border-red-200 rounded-lg px-3 py-2"
          >
            <XCircle className="h-3.5 w-3.5" />
            {invalid.length} rows have errors (will be skipped)
          </div>
        )}
        <span className="text-xs text-muted-foreground ml-auto truncate max-w-35">
          {fileName}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden max-h-80 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b sticky top-0">
            <tr>
              <th className="text-left px-3 py-2.5 font-medium text-gray-600 w-6">
                #
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-600">
                Name
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-600">
                PAN
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-600">
                Category
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-600">
                Service type
              </th>
              <th className="text-left px-3 py-2.5 font-medium text-gray-600">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, i) => (
              <tr
                key={i}
                className={cn(
                  "border-b last:border-none",
                  !client.valid && "bg-red-50",
                )}
              >
                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                <td className="px-3 py-2 font-medium text-gray-800">
                  {client.name || (
                    <span className="text-red-500 italic">missing</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-gray-600">
                  {client.pan || (
                    <span className="text-red-500 italic">missing</span>
                  )}
                </td>
                <td className="px-3 py-2 capitalize text-gray-600">
                  {client.category || (
                    <span className="text-red-500 italic">unknown</span>
                  )}
                </td>
                <td className="px-3 py-2 text-gray-600 max-w-35 truncate">
                  {client.serviceType || (
                    <span className="text-red-500 italic">missing</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {client.valid ? (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 border-green-200 text-[10px]"
                    >
                      Ready
                    </Badge>
                  ) : (
                    <div className="group relative">
                      <Badge
                        variant="outline"
                        className="bg-red-100 text-red-700 border-red-200 text-[10px] cursor-help"
                      >
                        Error
                      </Badge>
                      {/* Tooltip with errors */}
                      <div
                        className="absolute bottom-full left-0 mb-1 hidden group-hover:block
                        bg-gray-900 text-white text-[10px] rounded px-2 py-1.5 w-48 z-10
                        leading-relaxed"
                      >
                        {client.errors.join(" · ")}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExcelImportModal({ open, onClose }: ExcelImportModalProps) {
  const { data: session } = useSession();
  const batchCreate = useMutation(api.clients.batchCreate);

  const [step, setStep] = useState<Step>("upload");
  const [clients, setClients] = useState<ParsedClient[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseErr, setParseErr] = useState("");
  const [result, setResult] = useState<{
    inserted: number;
    skipped: number;
  } | null>(null);
  const [parsing, setParsing] = useState(false);

  const firmId = (session?.user as any)?.firmId as Id<"firms"> | undefined;
  const validRows = clients.filter((c) => c.valid);

  async function handleFile(file: File) {
    setParsing(true);
    setParseErr("");
    setFileName(file.name);
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) {
        setParseErr(
          "No data found in the file. Check that the first sheet has rows.",
        );
        return;
      }
      setClients(parsed);
      setStep("preview");
    } catch (err: any) {
      setParseErr(err.message ?? "Failed to parse file");
    } finally {
      setParsing(false);
    }
  }

  async function handleImport() {
    if (!firmId || validRows.length === 0) return;

    setStep("importing");

    try {
      const res = await batchCreate({
        firmId,
        clients: validRows.map((c) => ({
          name: c.name,
          pan: c.pan,
          phone: c.phone || undefined,
          email: c.email || undefined,
          type: c.serviceType,
          category: c.category,
          assignedRole: ["admin", "senior-ca"],
          createdBy: session?.user?.email ?? "admin",
        })),
      });
      setResult(res);
      setStep("done");
    } catch (err) {
      console.error("Import error:", err);
      setParseErr("Import failed. Please try again.");
      setStep("preview");
    }
  }

  function handleClose() {
    setStep("upload");
    setClients([]);
    setFileName("");
    setParseErr("");
    setResult(null);
    setParsing(false);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-4 w-4" />
            Import clients from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          {/* Step — upload */}
          {step === "upload" && (
            <UploadStep onFile={handleFile} error={parseErr} />
          )}

          {/* Parsing spinner */}
          {parsing && (
            <div
              className="flex items-center justify-center gap-2 py-12
              text-sm text-muted-foreground"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Reading file...
            </div>
          )}

          {/* Step — preview */}
          {step === "preview" && (
            <PreviewStep clients={clients} fileName={fileName} />
          )}

          {/* Step — importing */}
          {step === "importing" && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <p className="text-sm text-muted-foreground">
                Importing {validRows.length} clients...
              </p>
            </div>
          )}

          {/* Step — done */}
          {step === "done" && result && (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div
                className="w-14 h-14 rounded-full bg-green-100 flex items-center
                justify-center mb-1"
              >
                <CheckCircle2 className="h-7 w-7 text-green-600" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                Import complete
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-green-600">
                  {result.inserted}
                </span>{" "}
                clients added
                {result.skipped > 0 && (
                  <span>
                    {" "}
                    · <span className="text-amber-600">
                      {result.skipped}
                    </span>{" "}
                    skipped (duplicate PAN)
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Your client table has been updated in real time.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step === "upload" && (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border text-sm text-muted-foreground
                hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          )}

          {step === "preview" && (
            <>
              <button
                onClick={() => {
                  setStep("upload");
                  setClients([]);
                }}
                className="px-4 py-2 rounded-lg border text-sm text-muted-foreground
                  hover:bg-muted transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleImport}
                disabled={validRows.length === 0}
                className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm
                  font-medium hover:bg-gray-700 transition-colors flex items-center
                  gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="h-3.5 w-3.5" />
                Import {validRows.length} client
                {validRows.length !== 1 ? "s" : ""}
              </button>
            </>
          )}

          {step === "done" && (
            <button
              onClick={handleClose}
              className="px-5 py-2 rounded-lg bg-gray-900 text-white text-sm
                font-medium hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
