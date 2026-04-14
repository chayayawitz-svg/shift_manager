import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills } = await req.json();

    // בניית הנתונים עבור הגרף בשרת
    const labels = Object.keys(skills);
    const data = Object.values(skills);

    // יצירת קישור לתמונה דרך QuickChart (מעוצב בדיוק כמו המפה שלך)
    const chartConfig = {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'מפת הבאלנס',
          data: data,
          backgroundColor: 'rgba(255, 51, 102, 0.4)',
          borderColor: '#FF3366',
          borderWidth: 3,
          pointBackgroundColor: '#FF3366',
          pointRadius: 4
        }]
      },
      options: {
        legend: { display: false },
        scale: {
          gridLines: { color: 'rgba(255, 255, 255, 0.1)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
          ticks: { backdropColor: 'transparent', fontColor: '#fff', min: 0, max: 10, stepSize: 2 },
          pointLabels: { fontColor: '#fff', fontSize: 12 }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&bg=020414`;

    const skillsListHtml = Object.entries(skills)
      .map(([skill, rating]) => `
          <li style="background: #f8f9fa; border-right: 4px solid #0028A5; padding: 10px; margin-bottom: 5px; list-style: none; direction: rtl; text-align: right;">
            <strong>${skill}:</strong> ${rating}/10
          </li>`).join("");

    const emailHtml = `
      <div dir="rtl" style="font-family: Arial; padding: 20px; background: #fff;">
        <h2 style="color: #0028A5;">שלום ${name}, מפת הבאלנס שלך מוכנה!</h2>
        <div style="margin: 20px 0;">
          <img src="${chartUrl}" alt="מפת הבאלנס שלך" style="width: 100%; max-width: 500px; border-radius: 20px;" />
        </div>
        <ul style="padding: 0;">${skillsListHtml}</ul>
      </div>`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
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
        htmlContent: emailHtml
      }),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
