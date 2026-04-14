import { NextResponse } from "next/server";

// הגדרה קריטית להגדלת נפח הנתונים שהשרת מוכן לקבל (חסינות לשגיאה 500)
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

    // יצירת רשימת המיומנויות למייל
    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 10px; margin-bottom: 8px; border-radius: 8px; list-style: none; direction: rtl; text-align: right;">
            <span style="font-weight: bold; color: #333;">${skill}:</span> 
            <span style="color: #FF3366; font-weight: bold;">${rating}/10</span>
          </li>`).join("");

    const emailHtmlUser = `<div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #0028A5;">שלום ${name}, מפת הבאלנס שלך מוכנה!</h2>
      <ul style="padding: 0;">${skillsListHtml}</ul>
      <p>תודה על השתתפותך בסקר "מודל הבאלנס" של קורס מנהלי משמרת בביטוח ישיר.</p>
      <p>המפה הוויזואלית האישית מצורפת למייל זה.</p>
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

    if (!res.ok) {
        const errorText = await res.text();
        // לוג קריטי: אם יש שגיאה מ-Brevo, היא תופיע כאן בלוגים של Vercel
        console.error("Brevo API Error:", errorText);
        throw new Error(errorText);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    // לוג קריטי: אם השרת קורס, זה יגיד לנו למה
    console.error("Internal Server Error in API Route:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
