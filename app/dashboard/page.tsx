"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// התחברות ל-Supabase
const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

const COLORS = ['#FF3366', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#0b1a40'];

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setResults(data || []);
      setIsLoading(false);
    }
    fetchResults();
  }, []);

  const calculateAverages = () => {
    if (results.length === 0) return [];
    const keys = [
      { key: 'cat1_leadership', label: 'הובלה' },
      { key: 'cat2_soul_player', label: 'שחקן נשמה' },
      { key: 'cat3_mutual_guarantee', label: 'ערבות הדדית' },
      { key: 'cat4_professionalism', label: 'מקצועיות' },
      { key: 'cat5_business_connection', label: 'חיבור לביזנס' },
      { key: 'cat6_curiosity', label: 'סקרנות' },
      { key: 'cat7_innovation', label: 'חדשנות' },
      { key: 'cat8_partnership', label: 'שותפויות' }
    ];

    return keys.map(item => {
      const avg = results.reduce((acc, curr) => acc + (curr[item.key] || 0), 0) / results.length;
      return { name: item.label, value: Number(avg.toFixed(1)) };
    });
  };

  const pieData = calculateAverages();

  return (
    <div className="min-h-screen p-8 bg-[#f4f7f6] text-right" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-8 text-center">סיכום תוצאות מודל הבאלנס</h1>
        
        {isLoading ? (
          <p className="text-center mt-10 font-bold text-lg">טוען נתונים מהמערכת...</p>
        ) : (
          <>
            {/* כרטיסי סיכום עליונים */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white p-8 rounded-3xl shadow-lg border-r-8 border-blue-900">
                <p className="text-gray-500 font-bold text-lg">סה"כ משיבים</p>
                <p className="text-5xl font-black text-blue-900">{results.length}</p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-lg border-r-8 border-[#FF3366]">
                <p className="text-gray-500 font-bold text-lg">ממוצע הובלה צוותי</p>
                <p className="text-5xl font-black text-[#FF3366]">
                  {(results.reduce((acc, curr) => acc + (curr.cat1_leadership || 0), 0) / results.length || 0).toFixed(1)}
                </p>
              </div>
            </div>

            {/* גרף עוגה עם תוויות חיצוניות */}
            <div className="bg-white p-10 rounded-[40px] shadow-2xl mb-12 overflow-hidden border border-gray-100">
              <h2 className="text-3xl font-black mb-6 text-blue-900 text-center">התפלגות חוזקות צוותית (ממוצע)</h2>
              <div className="h-[600px] w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 120, bottom: 20, left: 120 }}>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      // פונקציית תווית חיצונית
                      label={({ name, value }) => `${name}: ${value}`}
                      // הגדרת הקו המחבר
                      labelLine={{ stroke: '#4b5563', strokeWidth: 2 }}
                      // רדיוס קטן יותר לעיגול כדי לתת מקום לטקסט
                      outerRadius={90}
                      innerRadius={60}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                        verticalAlign="bottom" 
                        height={50} 
                        iconType="circle"
                        wrapperStyle={{ paddingTop: "60px", fontSize: "14px", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* טבלת הנתונים המלאה */}
            <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-gray-100">
               <div className="bg-[#0b1a40] text-white p-6 font-black text-2xl text-center">פירוט תשובות גולמיות</div>
               <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-blue-900 border-b-2 border-gray-100">
                      <th className="p-5 font-bold">תאריך</th>
                      <th className="p-5 font-bold">שם מלא</th>
                      <th className="p-5 font-bold">הובלה</th>
                      <th className="p-5 font-bold">נשמה</th>
                      <th className="p-5 font-bold">ערבות</th>
                      <th className="p-5 font-bold">מקצועיות</th>
                      <th className="p-5 font-bold">ביזנס</th>
                      <th className="p-5 font-bold">סקרנות</th>
                      <th className="p-5 font-bold">חדשנות</th>
                      <th className="p-5 font-bold">שותפויות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => (
                      <tr key={row.id} className="border-b border-gray-50 hover:bg-blue-50/50 transition-all">
                        <td className="p-5 text-sm text-gray-500">
                          {new Date(row.created_at).toLocaleDateString('he-IL')}
                        </td>
                        <td className="p-5 font-black text-blue-900">{row.full_name}</td>
                        <td className="p-5 font-bold">{row.cat1_leadership}</td>
                        <td className="p-5 font-bold">{row.cat2_soul_player}</td>
                        <td className="p-5 font-bold">{row.cat3_mutual_guarantee}</td>
                        <td className="p-5 font-bold">{row.cat4_professionalism}</td>
                        <td className="p-5 font-bold">{row.cat5_business_connection}</td>
                        <td className="p-5 font-bold">{row.cat6_curiosity}</td>
                        <td className="p-5 font-bold">{row.cat7_innovation}</td>
                        <td className="p-5 font-bold">{row.cat8_partnership}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
