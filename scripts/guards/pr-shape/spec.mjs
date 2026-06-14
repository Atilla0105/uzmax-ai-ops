import { readFile } from "node:fs/promises";
import path from "node:path";

const SPEC_TYPES = new Set("feature fix refactor cleanup spike docs infra".split(" "));

export function classify(file) {
  if (/package-lock\.json$/.test(file)) return "lock";
  if (/^(docs\/|.*\.md$)/.test(file)) return "docs";
  if (/(\.test\.|\.spec\.|\/tests?\/)/.test(file)) return "test";
  if (
    /(^|\/)(generated|dist|build|coverage)(\/|$)|\.snap$|\.sql$|\.d\.ts$/.test(file)
  ) {
    return "generated";
  }
  if (
    /(^\.github\/|(^|\/)[^/]*(?:config|rc)\.(?:js|cjs|mjs|ts|json)$|\.json$|\.ya?ml$|tsconfig)/.test(
      file
    )
  ) {
    return "config";
  }
  return "source";
}

export async function readSpec(filePath) {
  const text = await readFile(path.join(process.cwd(), filePath), "utf8");
  const specType = readSectionValue(text, "Spec 类型");
  const touchPatterns = readTouchPatterns(text, filePath);

  if (!SPEC_TYPES.has(specType)) {
    throw new Error(`Invalid or missing Spec 类型 in ${filePath}: ${specType}`);
  }

  return { specType, touchPatterns };
}

export function findOutOfScopeFiles(files, touchPatterns) {
  const regexes = touchPatterns.map(patternToRegex);
  return files.filter((file) => !regexes.some((regex) => regex.test(file)));
}

function readSectionValue(text, title) {
  const section = text.split(/^## /m).find((part) => part.startsWith(title));
  if (!section) return "";
  return section
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .find(Boolean);
}

function readTouchPatterns(text, filePath) {
  const section = text.split(/^## /m).find((part) => part.startsWith("触碰模块/文件"));
  if (!section) {
    throw new Error(`Missing touch module section in ${filePath}`);
  }

  return section
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .flatMap((line) => line.slice(2).split("、"))
    .map((line) => line.match(/`([^`]+)`/)?.[1])
    .filter(Boolean);
}

function patternToRegex(pattern) {
  const normalized = pattern.replace(/`/g, "").trim();
  if (normalized.endsWith("/**")) {
    return new RegExp(`^${escapeRegex(normalized.slice(0, -3))}(/|$)`);
  }
  if (normalized.endsWith("/*")) {
    return new RegExp(`^${escapeRegex(normalized.slice(0, -2))}(/|$)`);
  }
  if (normalized.endsWith("/")) {
    return new RegExp(`^${escapeRegex(normalized)}`);
  }
  if (normalized.includes("*")) {
    return new RegExp(`^${escapeRegex(normalized).replaceAll("\\*", ".*")}$`);
  }
  return new RegExp(`^${escapeRegex(normalized)}($|/)`);
}

function escapeRegex(value) {
  return value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");
}
