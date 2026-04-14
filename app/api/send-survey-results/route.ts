import { NextResponse } from "next/server";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 10px; margin-bottom: 5px; list-style: none; direction: rtl; text-align: right;">
            <span style="font-weight: bold;">${skill}:</span> ${rating}/10
          </li>`).join("");

    const emailHtml = `<div dir="rtl" style="font-family: Arial; padding: 20px;">
      <h2 style="color: #0028A5;">שלום ${name}, מפת הבאלנס שלך מוכנה!</h2>
      <ul style="padding: 0;">${skillsListHtml}</ul>
      <p>המפה האישית מצורפת למייל זה.</p>
    </div>`;

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: { name: "מודל הבאלנס", email: "chayayawitz@gmail.com" },
        to: [{ email }, { email: "haya.y@yashir.co.il" }],
        subject: `מפת הבאלנס של ${name}`,
        htmlContent: emailHtml,
        attachment: [{ name: `Balance_Map_${name}.jpg`, content: chartPngBase64 }]
      }),
    });

    if (!res.ok) throw new Error("Brevo failed");
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
