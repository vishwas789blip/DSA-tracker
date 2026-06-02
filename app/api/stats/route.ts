import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DSA_MONTHS } from '@/lib/dsa-problems';

const DATA_FILE = path.join(process.cwd(), 'data', 'solved-problems.json');

function getSolvedProblems(): Set<string> {
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

export async function GET() {
  try {
    const solved = getSolvedProblems();

    const allProblems = DSA_MONTHS.flatMap((month) =>
      month.weeks.flatMap((week) => week.probs)
    );

    const totalProblems = allProblems.length;

    const solvedCount = solved.size;

    const percentage =
      totalProblems > 0
        ? Math.round((solvedCount / totalProblems) * 100)
        : 0;

    // Difficulty Stats
    const easyProblems = allProblems.filter(
      (p) => p.d === 'easy'
    );

    const mediumProblems = allProblems.filter(
      (p) => p.d === 'med'
    );

    const hardProblems = allProblems.filter(
      (p) => p.d === 'hard'
    );

    const easySolved = easyProblems.filter((p) =>
      solved.has(p.id)
    ).length;

    const mediumSolved = mediumProblems.filter((p) =>
      solved.has(p.id)
    ).length;

    const hardSolved = hardProblems.filter((p) =>
      solved.has(p.id)
    ).length;

    // Month Stats
    const monthStats = DSA_MONTHS.map((month) => {
      const monthProblems =
        month.weeks.flatMap((w) => w.probs);

      const monthSolved =
        monthProblems.filter((p) =>
          solved.has(p.id)
        ).length;

      return {
        id: month.id,
        name: month.name,
        total: monthProblems.length,
        solved: monthSolved,
        percentage:
          monthProblems.length > 0
            ? Math.round(
                (monthSolved /
                  monthProblems.length) *
                  100
              )
            : 0,
      };
    });

    return NextResponse.json({
      totalProblems,
      solvedCount,
      percentage,

      easySolved,
      easyTotal: easyProblems.length,

      mediumSolved,
      mediumTotal: mediumProblems.length,

      hardSolved,
      hardTotal: hardProblems.length,

      monthStats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch stats',
      },
      {
        status: 500,
      }
    );
  }
}
