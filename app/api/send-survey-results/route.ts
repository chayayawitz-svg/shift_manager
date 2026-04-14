import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills, chartPngBase64 } = await req.json();

    // יצירת רשימת המיומנויות למייל בצורה דינמית (מתאים ל-6 מיומנויות)
    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 12px 15px; margin-bottom: 10px; border-radius: 8px; list-style: none; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #333;">${skill}:</span> 
            <span style="color: #FF3366; font-weight: bold;">${rating}/10</span>
          </li>`).join("");

    const emailHtmlUser = `
      <div dir="rtl" style="font-family: Arial; padding: 20px; color: #2d3748;">
        <h2 style="color: #0028A5;">שלום ${name}, מפת הבאלנס שלך מוכנה!</h2>
        <p>תודה על מילוי הסקר. הנה ריכוז הדירוגים שלך:</p>
        <ul style="padding: 0;">${skillsListHtml}</ul>
        <p style="background: #f0f7ff; padding: 10px; border-radius: 8px; border-right: 4px solid #FF3366;">
          <strong>המפה הוויזואלית האישית שלך מצורפת למייל זה.</strong>
        </p>
      </div>`;

    const emailHtmlAdmin = `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2 style="color: #0028A5;">התקבל סקר חדש במערכת</h2>
        <p><strong>שם המשיב:</strong> ${name}</p>
        <p><strong>אימייל:</strong> ${email}</p>
        <hr />
        <h3>פירוט הציונים:</h3>
        <ul style="padding: 0;">${skillsListHtml}</ul>
      </div>`;

    const headers = {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!
    };

    // שליחה כפולה באמצעות Promise.all
    const responses = await Promise.all([
      // 1. מייל למשתמש שביצע את הסקר
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
      // 2. מייל למנהלת (חיה) לעדכון
      fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sender: { name: "מערכת מודל הבאלנס", email: "chayayawitz@gmail.com" },
          to: [{ email: "haya.y@yashir.co.il" }],
          subject: `סקר חדש הושלם: ${name}`,
          htmlContent: emailHtmlAdmin,
          attachment: [{ name: `Balance_Map_${name}.png`, content: chartPngBase64 }]
        }),
      })
    ]);

    // בדיקה אם השליחה הראשונה הצליחה
    if (!responses[0].ok) {
      const errorData = await responses[0].json();
      throw new Error(`Brevo Error: ${JSON.stringify(errorData)}`);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Route Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
