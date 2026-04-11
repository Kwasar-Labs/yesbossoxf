import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, description } = await req.json();
    
    // Call the YesBoss Communication API which talks to OpenClaw
    const token = req.headers.get("Authorization") || "";
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
    
    const prompt = `Generate 2-4 subtasks for the task titled "${title}". Description: "${description}". Respond ONLY with a JSON array of strings (e.g. ["subtask 1", "subtask 2"]). Do NOT include markdown blocks.`;
    
    const aiRes = await fetch(`${apiBase}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ message: prompt, context: { source: "subtasks" } })
    });
    
    if (!aiRes.ok) throw new Error("AI call failed");
    const aiData = await aiRes.json();
    const content = aiData.response || aiData.message || "[]";
    
    let parsed: string[] = [];
    try {
      const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      parsed = [
        `Review requirements for ${title}`,
        "Implement feature"
      ];
    }

    return NextResponse.json({
      subtasks: Array.isArray(parsed) ? parsed.map((t: string) => ({
        id: Math.random().toString(),
        title: t,
        completed: false
      })) : []
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
