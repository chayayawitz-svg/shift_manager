import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    // 1. הגדרת הלוגו - עדיף להשתמש בקישור ישיר כדי למנוע בעיות קריאת קבצים בשרת
    // החליפי את הקישור למטה בכתובת האמיתית של האתר שלך
    const logoUrl = "https://shift-manager-mu-orcin.vercel.app/bituach-yashir-logo.png";

    const skillsListHtml = Object.entries(skills)
      .map(
        ([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: bold; color: #333; text-align: right; flex: 1;">${skill}</span>
            <span style="background: #0028A5; color: white; padding: 4px 12px; border-radius: 15px; font-size: 14px; margin-right: 10px;">
              ${rating} / 10
            </span>
          </li>`
      )
      .join("");

    const headHtml = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;700&display=swap');
        * { font-family: 'Rubik', Arial, sans-serif; }
      </style>
    `;

    // מייל למשתתף
    const emailHtmlUser = `
      <html dir="rtl">
        <head>${headHtml}</head>
        <body style="margin:0; padding:20px; background-color: #f4f7f9; text-align: right;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e1e4e8;">
            <div style="background: #0028A5; padding: 30px; text-align: center;">
              <img src="${logoUrl}" alt="ביטוח ישיר" style="width: 140px; background: white; padding: 10px; border-radius: 10px;">
              <h1 style="color: white; margin-top: 20px; font-size: 24px;">מפת הבאלנס של ${name}</h1>
            </div>
            <div style="padding: 35px; color: #2d3748;">
              <p style="font-size: 18px;">שלום <strong>${name}</strong>,</p>
              <p>תודה על מילוי הסקר. הנה ריכוז המיומנויות שלך כפי שדורגו:</p>
              <ul style="padding:0; margin: 25px 0;">${skillsListHtml}</ul>
              <p><strong>מפת הבאלנס הוויזואלית שלך מצורפת למייל זה.</strong></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // מייל לחיה (המנהלת)
    const emailHtmlManager = `
      <html dir="rtl">
        <head>${headHtml}</head>
        <body style="margin:0; padding:20px; background-color: #f4f7f9; text-align: right;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e1e4e8;">
            <div style="background: #2d3748; padding: 30px; text-align: center;">
              <img src="${logoUrl}" alt="ביטוח ישיר" style="width: 140px; background: white; padding: 10px; border-radius: 10px;">
              <h1 style="color: white; margin-top: 20px; font-size: 22px;">סקר חדש: ${name}</h1>
            </div>
            <div style="padding: 35px; color: #2d3748;">
              <p>העובד/ת <strong>${name}</strong> (${email}) סיים/ה את מילוי הסקר.</p>
              <ul style="padding:0;">${skillsListHtml}</ul>
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

    // שליחה כפולה - משתמשים ב-Promise.all כדי לוודא ששניהם מסתיימים
    const responses = await Promise.all([
      // שליחה למשתמש
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
      // שליחה לחיה
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "מערכת מודל הבאלנס", email: "chayayawitz@gmail.com" },
          to: [{ email: "haya.y@yashir.co.il" }],
          subject: `סקר חדש הושלם: ${name}`,
          htmlContent: emailHtmlManager,
          attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
        }),
      })
    ]);

    // בדיקה אם השליחות הצליחו
    if (!responses[0].ok || !responses[1].ok) {
        const errorText = await responses[0].text();
        throw new Error(`Brevo Error: ${errorText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Route Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
