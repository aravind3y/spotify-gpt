import { NextResponse } from 'next/server';

export const runtime = 'edge'

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  if (!prompt?.startsWith('These are music from my playlist')) {
    return NextResponse.json({
      'message': 'Invalid prompt'
    }, { status: 400 });
  }
  const authOptions = {
    url: 'https://api.openai.com/v1/chat/completions',
    data: {
      "model": "gpt-3.5-turbo",
      "messages": [{"role": "user", "content": prompt}],
    },
    headers: {
      'Authorization': `Bearer ${process.env.OPEN_AI_KEY}`,
      'Content-Type': 'application/json'
    },
  };
  const getCompletion = async () => await
  fetch(authOptions.url, {
    method: "POST",
    body: JSON.stringify(authOptions.data),
    headers: authOptions.headers,
  });

  const response = await getCompletion();
  const data = await response.json();
  const res = {
    content: data
  }
  return NextResponse.json(res);
}
