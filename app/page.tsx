"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Radar as RadarComponent } from "recharts";
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
  const [status, setStatus] = useState<any>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !sections.every(s => skills[s] > 0)) {
      alert("נא למלא הכל"); return;
    }
    setIsSubmitting(true); setStatus(null);

    try {
      // 1. צילום
      let png = "";
      if (chartRef.current) {
        const canvas = await html2canvas(chartRef.current, { scale: 2, useCORS: true, backgroundColor: "#020414" });
        png = canvas.toDataURL("image/png", 0.8).split(",")[1];
      }

      // 2. סופבייס (רק 6 עמודות)
      await supabase.from('survey_results').insert([{ 
        full_name: name, email: email, 
        cat1_leadership: skills[sections[0]], cat2_soul_player: skills[sections[1]], 
        cat3_mutual_guarantee: skills[sections[2]], cat4_professionalism: skills[sections[3]], 
        cat5_business_connection: skills[sections[4]], cat6_curiosity: skills[sections[5]]
      }]);

      // 3. מייל
      const res = await fetch("/api/send-survey-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, skills, chartPngBase64: png }),
      });

      if (res.ok) {
        setStatus("success");
        setName(""); setEmail(""); setSkills(Object.fromEntries(sections.map(s => [s, 0])));
      } else { throw new Error("Mail API failed"); }

    } catch (err) { setStatus("error"); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen p-4 bg-[#020414] text-right" dir="rtl">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
            <form onSubmit={handleSubmit} className="bg-white rounded-[40px] p-8 flex-1">
                <h1 className="text-3xl font-black text-blue-900 mb-8 text-center">מודל הבאלנס</h1>
                <input placeholder="שם מלא" className="w-full border-b-2 mb-4 p-2" value={name} onChange={e => setName(e.target.value)} required />
                <input placeholder="אימייל" className="w-full border-b-2 mb-8 p-2" value={email} onChange={e => setEmail(e.target.value)} required />
                <div className="space-y-6">
                    {sections.map(s => (
                        <div key={s} className="border-b pb-4">
                            <label className="font-bold block mb-2">{s}</label>
                            <div className="flex gap-2">
                                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                    <Star key={n} onClick={() => setSkills(p => ({...p, [s]: n}))} className={`cursor-pointer ${skills[s] >= n ? "fill-[#FF3366] text-[#FF3366]" : "text-gray-200"}`} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button disabled={isSubmitting} className="w-full bg-[#FF3366] text-white p-4 rounded-full mt-8 font-bold">
                    {isSubmitting ? "שולח..." : "שלחו לי את המפה!"}
                </button>
                {status === "success" && <p className="text-green-600 text-center mt-4 font-bold">✓ נשלח בהצלחה!</p>}
                {status === "error" && <p className="text-red-600 text-center mt-4">שגיאה בשליחה. נסי שוב.</p>}
            </form>
            <div ref={chartRef} className="flex-1 bg-[#020414] rounded-[40px] p-8 min-h-[500px]">
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={sections.map(s => ({ subject: s, value: skills[s] }))}>
                        <PolarGrid stroke="#4B5563" />
                        <PolarAngleAxis dataKey="subject" tick={{fill: 'white', fontSize: 10}} />
                        <RadarComponent dataKey="value" stroke="#FF3366" fill="#FF3366" fillOpacity={0.5} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
}
