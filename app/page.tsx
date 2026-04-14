"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import html2canvas from "html2canvas";

const supabase = createClient('https://rbyufhkwrgvywnovdwei.supabase.co', 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u');

// רשימת ה-6 המדויקת
const sections = [
  "התמודדות עם שינויים ומצבי לחץ",
  "הנעה והובלה",
  "חשיבה יצירתית וחדשנות",
  "קילריות והובלה ליעדים",
  "יוזמה והשפעה",
  "עבודת צוות",
];

const DotWithValue = (props: any) => {
  const { cx, cy, payload } = props;
  const val = payload?.value;
  if (!val || val === 0) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill="#FF3366" stroke="#fff" strokeWidth={2} />
      <text x={cx} y={cy + 5} fill="#fff" fontSize={11} textAnchor="middle" fontWeight={800}>{val}</text>
    </g>
  );
};

export default function Home() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [skills, setSkills] = useState<Record<string, number>>(Object.fromEntries(sections.map(s => [s, 0])));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !sections.every(s => skills[s] > 0)) {
      alert("נא למלא הכל"); return;
    }
    setIsSubmitting(true); setStatus(null);

    try {
      let png = "";
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, backgroundColor: "#020414" });
        png = canvas.toDataURL("image/png", 0.8).split(",")[1];
      }

      // כאן המשתנים נשלחים לסופבייס - רק 6 עמודות, התאמה מלאה לטבלה החדשה
      const { error: dbError } = await supabase.from('survey_results').insert([{ 
        full_name: name, 
        email: email, 
        cat1_leadership: skills[sections[0]], 
        cat2_soul_player: skills[sections[1]], 
        cat3_mutual_guarantee: skills[sections[2]], 
        cat4_professionalism: skills[sections[3]], 
        cat5_business_connection: skills[sections[4]], 
        cat6_curiosity: skills[sections[5]]
      }]);

      if (dbError) throw dbError;

      const mailRes = await fetch("/api/send-survey-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, skills, chartPngBase64: png }),
      });

      if (mailRes.ok) setStatus("success");
      else throw new Error("Mail error");

    } catch (err) { setStatus("error"); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen p-4 bg-[#020414] text-right" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full border-t-8 border-[#FF3366]">
          <h1 className="text-3xl font-black text-blue-900 mb-2 text-center">מודל הבאלנס</h1>
          <p className="text-blue-600 text-center mb-8 font-bold italic">קורס מנהלי משמרת</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <input placeholder="שם מלא" className="w-full border-b-4 p-4 text-xl font-bold" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="אימייל" className="w-full border-b-4 p-4 text-xl font-bold text-left" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-10 max-h-[500px] overflow-y-auto pl-4 custom-scrollbar">
            {sections.map(s => (
              <div key={s} className="border-b border-gray-100 pb-6 text-right">
                <label className="text-xl font-bold text-blue-950 block mb-4">{s}</label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} type="button" onClick={() => setSkills(p => ({ ...p, [s]: n }))} className="transition hover:scale-125">
                      <Star className={`w-8 h-8 ${n <= skills[s] ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
                      <span className="text-[10px] block font-bold text-gray-500 mt-1">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button disabled={isSubmitting} className="w-full mt-10 bg-[#FF3366] text-white py-5 rounded-full font-black text-2xl shadow-xl">
            {isSubmitting ? "שולח נתונים..." : "שלחו לי את המפה !"}
          </button>
          
          {status === "success" && <p className="text-green-600 text-center mt-6 font-black text-xl animate-pulse">✓ נשלח בהצלחה! התוצאות נשארות לפנייך.</p>}
          {status === "error" && <p className="text-red-600 text-center mt-6 font-bold underline">שגיאה בשליחה. נסי שוב.</p>}
        </form>

        {/* המפה היוקרתית */}
        <div ref={chartRef} className="flex-1 bg-gradient-to-br from-[#3b002a] via-[#050824] to-[#020414] rounded-[40px] p-12 flex flex-col items-center justify-center shadow-2xl min-h-[700px] border-2 border-white/10 relative">
          <div className="bg-[#FF3366] px-10 py-3 rounded-full mb-10 shadow-lg">
            <h2 className="text-2xl lg:text-3xl font-black text-white">{name ? `המפה של ${name}` : "המפה האישית שלך"}</h2>
          </div>
          <ResponsiveContainer width="100%" height={500}>
            <RadarChart cx="50%" cy="50%" outerRadius={180} data={sections.map(s => ({ subject: s, value: skills[s] }))}>
              <PolarGrid gridType="circle" stroke="#4B5563" strokeDasharray="3 3" />
              <PolarRadiusAxis domain={[0, 10]} tickCount={11} tick={false} axisLine={false} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 10, fontWeight: 700 }} />
              <Radar dataKey="value" stroke="#FF3366" fill="#FF3366" fillOpacity={0.4} strokeWidth={4} dot={<DotWithValue />} isAnimationActive={false} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-10">
            <Image src="/bituach-yashir-logo.png" alt="Logo" width={140} height={50} className="brightness-0 invert" />
          </div>
        </div>
      </div>
    </div>
  );
}
