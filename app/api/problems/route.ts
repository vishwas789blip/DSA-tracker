import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const USER_ID = 'default-user';

export async function GET() {
  const { data, error } = await supabase
    .from('user_progress')
    .select('solved')
    .eq('user_id', USER_ID)
    .single();

  if (error || !data) {
    return NextResponse.json({ solved: [] });
  }

  return NextResponse.json({ solved: data.solved ?? [] });
}

export async function POST(request: NextRequest) {
  const { problemId, solved: isAdding } = await request.json();

  if (!problemId || typeof isAdding !== 'boolean') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from('user_progress')
    .select('solved')
    .eq('user_id', USER_ID)
    .single();

  const currentSolved: string[] = existing?.solved ?? [];

  const updatedSolved = isAdding
    ? [...new Set([...currentSolved, problemId])]
    : currentSolved.filter((id: string) => id !== problemId);

  const { error } = await supabase
    .from('user_progress')
    .upsert({ user_id: USER_ID, solved: updatedSolved }, { onConflict: 'user_id' });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ solved: updatedSolved });
}