import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    const logoUrl = "https://shift-manager-mu-orcin.vercel.app/bituach-yashir-logo.png";

    const skillsListHtml = Object.entries(skills)
      .map(
        ([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #333; text-align: right; flex: 1; margin-left: 10px;">${skill}</span>
            <span style="background: #0028A5; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; white-space: nowrap;">
              ${rating} / 10
            </span>
          </li>`
      )
      .join("");

    const emailHtmlUser = `
      <html dir="rtl">
        <body style="margin:0; padding:20px; background-color: #f4f7f9; text-align: right; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e1e4e8;">
            <div style="background: #0028A5; padding: 30px; text-align: center;">
              <img src="${logoUrl}" alt="ביטוח ישיר" style="width: 140px; background: white; padding: 10px; border-radius: 10px;">
              <h1 style="color: white; margin-top: 20px; font-size: 24px;">מפת הבאלנס של ${name}</h1>
            </div>
            <div style="padding: 35px; color: #2d3748;">
              <p style="font-size: 18px;">שלום <strong>${name}</strong>,</p>
              <p>כל הכבוד על מילוי הסקר! הנה סיכום הדירוגים שלך:</p>
              <ul style="padding:0; margin: 25px 0;">${skillsListHtml}</ul>
              <p style="background: #f0f7ff; padding: 15px; border-radius: 10px; border-right: 4px solid #0028A5;">
                <strong>מצורפת למייל זה המפה הוויזואלית האישית שלך.</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const headers = {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!
    };

    const responses = await Promise.all([
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "מודל הבאלנס | ביטוח ישיר", email: "chayayawitz@gmail.com" },
          to: [{ email }],
          subject: `מפת הבאלנס שלך, ${name}`,
          htmlContent: emailHtmlUser,
          attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
        }),
      }),
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "מערכת מודל הבאלנס", email: "chayayawitz@gmail.com" },
          to: [{ email: "haya.y@yashir.co.il" }],
          subject: `סקר חדש הושלם: ${name}`,
          htmlContent: `<h3>התקבל סקר חדש מ-${name}</h3><ul style="direction:rtl;">${skillsListHtml}</ul>`,
          attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
        }),
      })
    ]);

    if (!responses[0].ok) {
        const err = await responses[0].json();
        throw new Error(JSON.stringify(err));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
