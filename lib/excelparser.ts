import * as XLSX from "xlsx";

export interface ParsedClient {
  name: string;
  pan: string;
  phone: string;
  email: string;
  category: string;
  serviceType: string;
  // validation
  errors: string[];
  valid: boolean;
}

const CATEGORY_MAP: Record<string, string> = {
  individual: "individual",
  person: "individual",
  salaried: "individual",
  business: "business",
  company: "business",
  firm: "business",
  pvt: "business",
  llp: "business",
  nri: "nri",
  "non resident": "nri",
};

const SERVICE_TYPE_MAP: Record<string, string> = {
  "itr salaried": "ITR · Salaried",
  "itr · salaried": "ITR · Salaried",
  salaried: "ITR · Salaried",
  "itr business": "ITR · Business income",
  "itr · business income": "ITR · Business income",
  "business income": "ITR · Business income",
  "capital gains": "ITR · Capital gains",
  "itr capital gains": "ITR · Capital gains",
  professional: "ITR · Professional",
  "itr professional": "ITR · Professional",
  gst: "GST + ITR · Business",
  "gst + itr": "GST + ITR · Business",
  "gst compliance": "GST compliance only",
  partnership: "ITR · Partnership firm",
  "pvt ltd": "ITR · Pvt Ltd",
  startup: "Startup · 80IAC",
  "80iac": "Startup · 80IAC",
  "nri fema": "NRI · FEMA",
  "nri · fema": "NRI · FEMA",
  fema: "NRI · FEMA",
  "nri itr": "NRI · ITR only",
  dtaa: "NRI · DTAA advisory",
};

function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.trim().toUpperCase());
}

function cell(row: Record<string, any>, ...keys: string[]): string {
  for (const key of keys) {
    const val =
      row[key] ??
      row[key.toLowerCase()] ??
      row[key.toUpperCase()] ??
      row[key.trim()];
    if (val !== undefined && val !== null) {
      return String(val).trim();
    }
  }
  return "";
}

export function parseExcelFile(file: File): Promise<ParsedClient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          raw: false,
        });

        if (rows.length === 0) {
          resolve([]);
          return;
        }

        const parsed: ParsedClient[] = rows.map((row) => {
          const errors: string[] = [];

          const name = cell(
            row,
            "Name",
            "Client Name",
            "Full Name",
            "CLIENT NAME",
          );
          if (!name) errors.push("Name is required");

          const pan = cell(
            row,
            "PAN",
            "Pan",
            "PAN Number",
            "pan",
          ).toUpperCase();
          if (!pan) errors.push("PAN is required");
          else if (!isValidPAN(pan)) errors.push(`Invalid PAN: ${pan}`);

          const phone = cell(row, "Phone", "Mobile", "Contact", "Phone Number");

          const email = cell(row, "Email", "Email ID", "Email Address");
          if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push(`Invalid email: ${email}`);
          }

          const rawCategory = cell(
            row,
            "Category",
            "Type",
            "Client Type",
          ).toLowerCase();
          const category = CATEGORY_MAP[rawCategory] ?? "";
          if (!category)
            errors.push(`Unknown category: "${rawCategory || "empty"}"`);

          const rawService = cell(
            row,
            "Service Type",
            "Service",
            "Services",
          ).toLowerCase();
          const serviceType = SERVICE_TYPE_MAP[rawService] ?? rawService;
          if (!serviceType) errors.push("Service type is required");

          return {
            name,
            pan: pan.toUpperCase(),
            phone,
            email,
            category,
            serviceType,
            errors,
            valid: errors.length === 0,
          };
        });

        resolve(parsed);
      } catch (err) {
        reject(
          new Error("Failed to parse Excel file. Please check the format."),
        );
      }
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsArrayBuffer(file);
  });
}
