import { NextResponse } from "next/server";

export const runtime = 'nodejs'; // מבטיח יציבות בוורסל

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    if (!chartPngBase64) throw new Error("Missing image data");

    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f0f4ff; border-right: 4px solid #0028A5; padding: 10px; margin-bottom: 5px; list-style: none; direction: rtl; text-align: right;">
            <span style="font-weight: bold;">${skill}:</span> ${rating}/10
          </li>`).join("");

    const emailHtml = `<div dir="rtl" style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
      <h2 style="color: #0028A5;">היי ${name}, המפה שלך מוכנה!</h2>
      <ul style="padding: 0;">${skillsListHtml}</ul>
      <p>צירפנו עבורך את המפה האישית כקובץ תמונה.</p>
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
        attachment: [{ name: `map_${name}.jpg`, content: chartPngBase64 }]
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Brevo Error:", errorData);
      return NextResponse.json({ error: "Brevo failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Critical API Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
