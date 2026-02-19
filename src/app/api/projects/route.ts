import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export const dynamic = 'force-dynamic';

const WORKSPACE_DIR =
  process.env.OPENCLAW_WORKSPACE || '/root/.openclaw/workspace';

export async function GET() {
  try {
    const filePath = join(WORKSPACE_DIR, 'projects.json');
    const raw = await readFile(filePath, 'utf-8');
    const projects = JSON.parse(raw);
    return NextResponse.json(projects);
  } catch {
    // projects.json is optional — return empty array if not found
    return NextResponse.json([]);
  }
}
