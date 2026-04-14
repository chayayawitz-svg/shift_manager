import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #333;">${skill}:</span> 
            <span style="color: #FF3366; font-weight: bold;">${rating}/10</span>
          </li>`).join("");

    const emailHtml = `<div dir="rtl" style="font-family: Arial; padding: 20px;">
      <h2 style="color: #0028A5;">מפת הבאלנס של ${name}</h2>
      <p>שלום, הנה תוצאות הסקר שלך כפי שדורגו במערכת:</p>
      <ul style="padding: 0;">${skillsListHtml}</ul>
      <p>המפה הוויזואלית מצורפת כקובץ למייל זה.</p>
    </div>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: { name: "מודל הבאלנס | ביטוח ישיר", email: "chayayawitz@gmail.com" },
        to: [{ email }],
        subject: `מפת הבאלנס שלך, ${name}`,
        htmlContent: emailHtml,
        attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
      }),
    });

    if (!res.ok) throw new Error("Mail API Error");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
