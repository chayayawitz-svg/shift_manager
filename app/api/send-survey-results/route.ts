import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, skills } = await req.json();

    // בניית הגרף בשרת QuickChart - מעוצב בדיוק כמו המפה שלך
    const chartConfig = {
      type: 'radar',
      data: {
        labels: Object.keys(skills),
        datasets: [{
          data: Object.values(skills),
          backgroundColor: 'rgba(255, 51, 102, 0.4)',
          borderColor: '#FF3366',
          borderWidth: 3,
          pointBackgroundColor: '#FF3366'
        }]
      },
      options: {
        legend: { display: false },
        scale: {
          gridLines: { color: 'rgba(255, 255, 255, 0.2)' },
          angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
          ticks: { display: false, min: 0, max: 10 },
          pointLabels: { fontColor: '#fff', fontSize: 14 }
        }
      }
    };

    const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&bg=020414`;

    const skillsHtml = Object.entries(skills)
      .map(([s, v]) => `<li style="direction:rtl; text-align:right; margin-bottom:5px;"><b>${s}:</b> ${v}/10</li>`).join("");

    const emailHtml = `
      <div dir="rtl" style="font-family: Arial; padding: 20px;">
        <h2 style="color: #0028A5;">היי ${name}, מפת הבאלנס שלך מוכנה!</h2>
        <img src="${chartUrl}" style="width: 100%; max-width: 500px; border-radius: 20px; margin: 20px 0;" />
        <ul style="padding: 0; list-style: none;">${skillsHtml}</ul>
      </div>`;

    await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json", "api-key": process.env.BREVO_API_KEY! },
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
