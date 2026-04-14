"use client";

import { useState, useRef, FormEvent } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import domtoimage from 'dom-to-image-more';

const supabase = createClient('https://rbyufhkwrgvywnovdwei.supabase.co', 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u');

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
  const [status, setStatus] = useState<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !sections.every(s => skills[s] > 0)) {
      alert("נא למלא הכל"); return;
    }
    setIsSubmitting(true); setStatus(null);

    try {
      // 1. צילום המפה עם dom-to-image-more (תומך ב-oklab)
      let jpgBase64 = "";
      if (chartRef.current) {
        const dataUrl = await domtoimage.toJpeg(chartRef.current, {
          quality: 0.4,
          bgcolor: "#020414",
          width: chartRef.current.offsetWidth,
          height: chartRef.current.offsetHeight,
        });
        jpgBase64 = dataUrl.split(",")[1];
      }

      // 2. שמירה לסופבייס
      const { error: dbError } = await supabase.from('survey_results').insert([{
        full_name: name,
        email: email,
        cat1_leadership: skills[sections[0]],
        cat2_soul_player: skills[sections[1]],
        mutual_guarantee: skills[sections[2]],
        cat4_professional: skills[sections[3]],
        cat5_business_co: skills[sections[4]],
        cat6_curiosity: skills[sections[5]]
      }]);

      if (dbError) throw new Error(`Database: ${dbError.message}`);

      // 3. שליחה למייל
      const mailRes = await fetch("/api/send-survey-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, skills, chartPngBase64: jpgBase64 }),
      });

      if (!mailRes.ok) throw new Error("Mail submission failed");

      setStatus("success");
    } catch (err: any) {
      console.error(err);
      setStatus(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-[#020414] text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 items-start">

        {/* טופס הדירוג */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full border-t-8 border-[#FF3366]">
          <h1 className="text-3xl font-black text-blue-900 mb-2 text-center">מודל הבאלנס</h1>
          <p className="text-blue-600 text-center mb-8 font-bold italic underline text-xl">קורס מנהלי משמרת</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <input placeholder="שם מלא" className="w-full border-b-4 p-4 text-xl font-bold bg-gray-50 rounded-t-xl" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="אימייל" className="w-full border-b-4 p-4 text-xl font-bold text-left bg-gray-50 rounded-t-xl" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-10 max-h-[500px] overflow-y-auto pl-4 custom-scrollbar stars-container">
            {sections.map(s => (
              <div key={s} className="border-b border-gray-100 pb-6 text-right">
                <label className="text-xl font-bold text-blue-950 block mb-4">{s}</label>
                <div className="flex gap-2 justify-center flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                    <button key={n} type="button" onClick={() => setSkills(p => ({ ...p, [s]: n }))} className="transition hover:scale-125">
                      <Star className={`w-8 h-8 ${n <= skills[s] ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
                      <span className="text-[10px] block font-bold text-gray-500 mt-1 text-center">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button disabled={isSubmitting} className="w-full mt-10 bg-[#FF3366] text-white py-5 rounded-full font-black text-2xl shadow-xl active:scale-95 transition">
            {isSubmitting ? "מייצר מפה ושולח..." : "שלחו לי את המפה !"}
          </button>

          {status === "success" && <p className="text-green-600 text-center mt-6 font-black text-xl animate-pulse">✓ המפה נשלחה בהצלחה!</p>}
