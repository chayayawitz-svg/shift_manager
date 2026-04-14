"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import html2canvas from "html2canvas";

const supabase = createClient('https://rbyufhkwrgvywnovdwei.supabase.co', 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u');

const sections = [
  "התמודדות עם שינויים ומצבי לחץ",
  "הנעה והובלה",
  "חשיבה יצירתית וחדשנות",
  "קילריות והובלה ליעדים",
  "יוזמה והשפעה",
  "עבודת צוות",
];

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
      // 1. צילום מפה - גרסת הברזל (עוקף את שגיאת oklab)
      let jpgBase64 = "";
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { 
          scale: 1, 
          useCORS: true, 
          backgroundColor: "#020414",
          onclone: (clonedDoc) => {
            // אנחנו מוצאים את כל הצבעים הבעייתיים ומחליפים אותם בלבן/שחור רגיל
            const allElements = clonedDoc.getElementsByTagName("*");
            for (let i = 0; i < allElements.length; i++) {
              const el = allElements[i] as HTMLElement;
              const style = window.getComputedStyle(el);
              if (style.color.includes("okl") || style.backgroundColor.includes("okl")) {
                el.style.color = "#ffffff";
                if (el.style.backgroundColor) el.style.backgroundColor = "#020414";
              }
            }
          }
        });
        // דחיסה משמעותית כדי שהמייל יעבור חלק
        jpgBase64 = canvas.toDataURL("image/jpeg", 0.4).split(",")[1];
      }

      // 2. שמירה לסופבייס - שמות העמודות המדויקים מהצילום המוצלח שלך!
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
        <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 lg:p-12 flex-1 shadow-2xl w-full border-t-8 border-[#FF3366]">
          <h2 className="text-3xl font-black text-blue-900 mb-6 text-center">מודל הבאלנס</h2>
          <div className="space-y-4 mb-8">
            <input placeholder="שם מלא" className="w-full border-b-2 p-3 font-bold" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="אימייל" className="w-full border-b-2 p-3 font-bold text-left" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-8 max-h-[450px] overflow-y-auto pl-2">
            {sections.map(s => (
              <div key={s} className="border-b pb-4">
                <label className="font-bold text-blue-900 block mb-2">{s}</label>
                <div className="flex gap-1 justify-center">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} type="button" onClick={() => setSkills(p => ({ ...p, [s]: n }))} className="p-1">
                      <Star className={`w-6 h-6 ${n <= skills[s] ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button disabled={isSubmitting} className="w-full mt-8 bg-[#FF3366] text-white py-4 rounded-full font-bold text-xl shadow-lg">
            {isSubmitting ? "שולח..." : "שלחו לי את המפה !"}
          </button>
          {status === "success" && <p className="text-green-600 text-center mt-4 font-bold">✓ נשלח בהצלחה!</p>}
          {status && status !== "success" && <p className="text-red-600 text-center mt-4 text-sm font-bold">{status}</p>}
        </form>

        <div ref={chartRef} className="flex-1 bg-[#020414] rounded-[40px] p-8 flex flex-col items-center justify-center min-h-[600px] border border-white/10">
          <div className="bg-[#FF3366] px-8 py-2 rounded-full mb-8 text-white font-bold text-xl">
             {name ? `המפה של ${name}` : "המפה האישית שלך"}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={sections.map(s => ({ subject: s, value: skills[s] }))}>
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#FF3366" fill="#FF3366" fillOpacity={0.5} strokeWidth={3} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-8 text-white font-bold opacity-50 text-xl">ביטוח ישיר</div>
        </div>
      </div>
    </div>
  );
}
