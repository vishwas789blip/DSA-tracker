import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'solved-problems.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Get all solved problems
function getSolvedProblems(): Set<string> {
  ensureDataDir();
  if (!fs.existsSync(DATA_FILE)) {
    return new Set();
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return new Set(data.solved || []);
  } catch {
    return new Set();
  }
}

// Save solved problems
function saveSolvedProblems(solved: Set<string>) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify({ solved: Array.from(solved) }, null, 2));
}

export async function GET() {
  try {
    const solved = getSolvedProblems();
    return NextResponse.json({ solved: Array.from(solved) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { problemId, solved } = await request.json();

    if (!problemId || typeof solved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const solvedProblems = getSolvedProblems();

    if (solved) {
      solvedProblems.add(problemId);
    } else {
      solvedProblems.delete(problemId);
    }

    saveSolvedProblems(solvedProblems);

    return NextResponse.json({ success: true, solved: Array.from(solvedProblems) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update problems' }, { status: 500 });
  }
}
