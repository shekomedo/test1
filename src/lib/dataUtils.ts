import Papa from "papaparse";
import { Profile, Column } from "../types";

/**
 * Safe code sandbox for executing AI-generated transformation code.
 * Rejects any code that tries to access globals, import/require, or use eval/Function.
 * Runs the function inside a try-catch with a forced string return.
 */
export function executeSandboxedTransform(codeBody: string, value: string): string {
  // Block dangerous patterns
  const forbidden = [
    /\bimport\b/, /\brequire\b/, /\beval\b/, /\bFunction\b/, /\bfetch\b/,
    /\bXMLHttpRequest\b/, /\bdocument\b/, /\bwindow\b/, /\bglobal\b/,
    /\bprocess\b/, /\b__proto__\b/, /\bconstructor\b/, /\bprototype\b/,
    /\bthis\b/, /\barguments\b/, /\bnew\b(?!\s+String\b|\s+Number\b|\s+RegExp\b|\s+Array\b)/,
    /setTimeout/, /setInterval/, /Promise/, /async/, /await/,
    /=\s*fetch\s*\(/, /=\s*import\s*\(/,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(codeBody)) {
      throw new Error("Blocked unsafe pattern in AI-generated code");
    }
  }

  // Wrap in an IIFE that only receives 'value' and must return a string
  const wrapped = `(function(value) { ${codeBody} })`;
  try {
    const fn = new Function(`"use strict"; return (${wrapped})(value);`);
    const result = fn(value);
    // Always return a string, never return objects/arrays
    if (typeof result === "string") return result;
    if (typeof result === "number" || typeof result === "boolean") return String(result);
    return String(value); // fallback to original
  } catch {
    return String(value); // if execution fails, keep original
  }
}

export function parseCsv(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export function exportCsv(data: Record<string, any>[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename || 'export.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function profileData(data: Record<string, any>[]): Profile {
  if (!data || data.length === 0) {
    return { rowCount: 0, colCount: 0, missingPercent: 0, duplicateRowsPercent: 0, columns: [] };
  }

  const rowCount = data.length;
  const colNames = Object.keys(data[0]);
  const colCount = colNames.length;

  let totalMissing = 0;
  const columns: Column[] = colNames.map(name => {
    let missingCount = 0;
    const valueCounts: Record<string, number> = {};
    let isNumeric = true;
    let min = Infinity;
    let max = -Infinity;

    for (let i = 0; i < rowCount; i++) {
      const val = data[i][name];
      if (val === null || val === undefined || val === "") {
        missingCount++;
        totalMissing++;
      } else {
        const strVal = String(val);
        valueCounts[strVal] = (valueCounts[strVal] || 0) + 1;
        
        if (isNumeric) {
          const num = Number(val);
          if (isNaN(num)) {
            isNumeric = false;
          } else {
            if (num < min) min = num;
            if (num > max) max = num;
          }
        }
      }
    }

    const uniqueCount = Object.keys(valueCounts).length;
    
    // Quality flag heuristic
    let qualityFlag: "good" | "warning" | "critical" = "good";
    if (missingCount / rowCount > 0.2) qualityFlag = "critical";
    else if (missingCount > 0) qualityFlag = "warning";
    
    // Top values
    const topValues = Object.entries(valueCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));

    return {
      id: name,
      name,
      type: isNumeric && uniqueCount > 0 ? "numeric" : "categorical",
      missingCount,
      uniqueCount,
      qualityFlag,
      min: isNumeric && min !== Infinity ? min : undefined,
      max: isNumeric && max !== -Infinity ? max : undefined,
      topValues
    };
  });

  const missingPercent = totalMissing / (rowCount * colCount);
  
  // Efficient duplicate detection: hash each row and use a Set
  const seenHashes = new Set();
  let duplicates = 0;
  for (const row of data) {
    // Build a compact hash string by concatenating column values directly
    // This avoids the overhead of JSON.stringify on every row
    let hash = "";
    for (let c = 0; c < colNames.length; c++) {
      const val = row[colNames[c]];
      hash += (val === null || val === undefined || val === "") ? "\0" : String(val);
      hash += "\x1F"; // unit separator to avoid false collisions
    }
    if (seenHashes.has(hash)) duplicates++;
    else seenHashes.add(hash);
  }
  const duplicateRowsPercent = duplicates / rowCount;

  return {
    rowCount,
    colCount,
    missingPercent,
    duplicateRowsPercent,
    columns
  };
}
