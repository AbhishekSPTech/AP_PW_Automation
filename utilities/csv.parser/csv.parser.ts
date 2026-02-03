import fs from 'fs';
import path from 'path';
import { parse as syncParse } from 'csv-parse/sync';
import { parse } from 'csv-parse';

export type CSVRow = Record<string, string>;

export function parseCSVSync(filePath: string): CSVRow[] {
  const content = fs.readFileSync(path.resolve(filePath), 'utf-8');
  return syncParse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
}

export async function parseCSV(filePath: string): Promise<CSVRow[]> {
  const rows: CSVRow[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.resolve(filePath))
      .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
      .on('data', (row: CSVRow) => rows.push(row))
      .on('end', () => resolve(rows))
      .on('error', (err) => reject(err));
  });
}