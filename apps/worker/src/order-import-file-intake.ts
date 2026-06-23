type CsvFileContent = string | Uint8Array;

export type OrderImportCsvFileIntakeInput = {
  content: CsvFileContent;
  fileName: string;
  maxBytes?: number;
  maxRows?: number;
  mediaType?: string;
  sourceRef: string;
};

export type OrderImportCsvFileIntakeResult = {
  byteLength: number;
  csvText: string;
  fileName: string;
  maxRows?: number;
  mediaType: string;
  sourceRef: string;
};

export type OrderImportTableFileIntakeInput = OrderImportCsvFileIntakeInput;

export type OrderImportTableFileIntakeResult = OrderImportCsvFileIntakeResult & {
  delimiter: "tab";
};

const defaultMaxCsvFileBytes = 2_000_000;
const maxCsvFileBytesLimit = 10_000_000;
const csvMediaTypes = new Set([
  "application/csv",
  "application/vnd.ms-excel",
  "text/csv",
  "text/plain"
]);
const tableMediaTypes = new Set(["text/tab-separated-values", "text/plain"]);

export function createOrderImportCsvTextInputFromFile(
  input: OrderImportCsvFileIntakeInput
): OrderImportCsvFileIntakeResult {
  const fileName = csvFileName(input.fileName);
  const mediaType = csvMediaType(input.mediaType);
  const sourceRef = controlledFileRef(input.sourceRef, "sourceRef");
  const content = csvTextContent(input.content);
  const byteLength = csvByteLength(input.content, content);
  const maxBytes = boundedBytes(input.maxBytes);
  if (byteLength > maxBytes) {
    throw new Error("order import CSV file exceeds maxBytes");
  }

  return {
    byteLength,
    csvText: stripByteOrderMark(content),
    fileName,
    maxRows: input.maxRows,
    mediaType,
    sourceRef
  };
}

export function createOrderImportCsvTextInputFromTableFile(
  input: OrderImportTableFileIntakeInput
): OrderImportTableFileIntakeResult {
  const fileName = tableFileName(input.fileName);
  const mediaType = tableMediaType(input.mediaType);
  const sourceRef = controlledFileRef(input.sourceRef, "sourceRef");
  const content = csvTextContent(input.content);
  const byteLength = csvByteLength(input.content, content);
  const maxBytes = boundedBytes(input.maxBytes);
  if (byteLength > maxBytes) {
    throw new Error("order import table file exceeds maxBytes");
  }

  return {
    byteLength,
    csvText: tableTextToCsvText(stripByteOrderMark(content)),
    delimiter: "tab",
    fileName,
    maxRows: input.maxRows,
    mediaType,
    sourceRef
  };
}

function csvFileName(value: unknown): string {
  const fileName = textValue(value, "fileName");
  if (fileName.length > 120 || /[\\/]/.test(fileName)) {
    throw new Error("order import CSV fileName is invalid");
  }
  if (!fileName.toLowerCase().endsWith(".csv")) {
    throw new Error("order import file must be a CSV file");
  }
  return fileName;
}

function tableFileName(value: unknown): string {
  const fileName = textValue(value, "fileName");
  if (fileName.length > 120 || /[\\/]/.test(fileName)) {
    throw new Error("order import table fileName is invalid");
  }
  if (!fileName.toLowerCase().endsWith(".tsv")) {
    throw new Error("order import table file must be TSV");
  }
  return fileName;
}

function csvMediaType(value: unknown): string {
  const mediaType = value === undefined ? "text/csv" : textValue(value, "mediaType");
  const normalized = mediaType.toLowerCase();
  if (!csvMediaTypes.has(normalized)) {
    throw new Error("order import file mediaType must be CSV-compatible");
  }
  return normalized;
}

function tableMediaType(value: unknown): string {
  const mediaType =
    value === undefined ? "text/tab-separated-values" : textValue(value, "mediaType");
  const normalized = mediaType.toLowerCase();
  if (!tableMediaTypes.has(normalized)) {
    throw new Error("order import table file mediaType must be tabular text");
  }
  return normalized;
}

function csvTextContent(value: CsvFileContent): string {
  if (typeof value === "string") return assertTextContent(value);
  if (value instanceof Uint8Array) {
    try {
      return assertTextContent(new TextDecoder("utf-8", { fatal: true }).decode(value));
    } catch {
      throw new Error("order import CSV file must be valid UTF-8");
    }
  }
  throw new Error("order import CSV file content is required");
}

function csvByteLength(source: CsvFileContent, text: string): number {
  return typeof source === "string"
    ? new TextEncoder().encode(text).byteLength
    : source.byteLength;
}

function assertTextContent(value: string): string {
  if (!value.trim()) throw new Error("order import CSV file content is required");
  if (value.includes("\0")) throw new Error("order import CSV file must be text");
  return value;
}

function boundedBytes(value: number | undefined): number {
  if (value === undefined) return defaultMaxCsvFileBytes;
  if (!Number.isInteger(value) || value < 1 || value > maxCsvFileBytesLimit) {
    throw new Error("maxBytes must be an integer from 1 to 10000000");
  }
  return value;
}

function controlledFileRef(value: unknown, name: string): string {
  const text = textValue(value, name);
  if (
    !/^(controlled|import|storage|upload):\/\/[a-z0-9][a-z0-9/._:-]{0,220}$/i.test(text)
  ) {
    throw new Error(`${name} must be a controlled file ref`);
  }
  return text;
}

function textValue(value: unknown, name: string): string {
  if (typeof value !== "string" || !value.trim())
    throw new Error(`${name} is required`);
  return value.trim();
}

function tableTextToCsvText(value: string): string {
  const rows = normalizeLineEndings(value).split("\n");
  const header = rows.find((row) => row.trim()) ?? "";
  if (!header.includes("\t")) {
    throw new Error("order import table file must be tab-delimited");
  }
  return rows.map((row) => row.split("\t").map(csvCell).join(",")).join("\n");
}

function normalizeLineEndings(value: string): string {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function csvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) return value;
  return `"${value.replaceAll('"', '""')}"`;
}

function stripByteOrderMark(value: string): string {
  return value.charCodeAt(0) === 0xfeff ? value.slice(1) : value;
}
