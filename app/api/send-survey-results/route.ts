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

    const emailHtmlUser = `<div dir="rtl" style="font-family: Arial; padding: 20px;">
      <h2 style="color: #0028A5;">שלום ${name}, מפת הבאלנס שלך מוכנה!</h2>
      <ul style="padding: 0;">${skillsListHtml}</ul>
      <p>המפה האישית שלך מצורפת למייל זה.</p>
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
        to: [{ email }, { email: "haya.y@yashir.co.il" }], // שליחה לשניכם בבת אחת
        subject: `מפת הבאלנס של ${name}`,
        htmlContent: emailHtmlUser,
        attachment: [{ name: `Balance_Map_${name}.jpg`, content: chartPngBase64 }]
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
