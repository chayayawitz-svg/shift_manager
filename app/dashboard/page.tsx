"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

  // חישוב ממוצעים לגרף העוגה
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
        <h1 className="text-4xl font-black text-blue-900 mb-8">סיכום תוצאות מודל הבאלנס</h1>
        
        {isLoading ? (
          <p className="text-center mt-10">טוען נתונים...</p>
        ) : (
          <>
            {/* כרטיסי סיכום מהירים */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl shadow-md border-r-4 border-blue-900">
                <p className="text-gray-500 font-bold">סה"כ משיבים</p>
                <p className="text-3xl font-black">{results.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-md border-r-4 border-[#FF3366]">
                <p className="text-gray-500 font-bold">ממוצע הובלה צוותי</p>
                <p className="text-3xl font-black">
                  {(results.reduce((acc, curr) => acc + (curr.cat1_leadership || 0), 0) / results.length || 0).toFixed(1)}
                </p>
              </div>
            </div>

            {/* גרף עוגה מסכם */}
            <div className="bg-white p-8 rounded-2xl shadow-xl mb-10">
              <h2 className="text-2xl font-bold mb-4 text-blue-900">התפלגות חוזקות צוותית (ממוצע)</h2>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* הטבלה המקורית שלך */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
               <div className="bg-[#0b1a40] text-white p-4 font-bold text-xl">פירוט תשובות מלא</div>
               <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-gray-100 text-blue-900">
                      <th className="p-4">תאריך</th>
                      <th className="p-4">שם מלא</th>
                      <th className="p-4">הובלה</th>
                      <th className="p-4">שחקן נשמה</th>
                      <th className="p-4">ערבות</th>
                      <th className="p-4">מקצועיות</th>
                      <th className="p-4">ביזנס</th>
                      <th className="p-4">סקרנות</th>
                      <th className="p-4">חדשנות</th>
                      <th className="p-4">שותפויות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm">{new Date(row.created_at).toLocaleDateString('he-IL')}</td>
                        <td className="p-4 font-bold">{row.full_name}</td>
                        <td className="p-4">{row.cat1_leadership}</td>
                        <td className="p-4">{row.cat2_soul_player}</td>
                        <td className="p-4">{row.cat3_mutual_guarantee}</td>
                        <td className="p-4">{row.cat4_professionalism}</td>
                        <td className="p-4">{row.cat5_business_connection}</td>
                        <td className="p-4">{row.cat6_curiosity}</td>
                        <td className="p-4">{row.cat7_innovation}</td>
                        <td className="p-4">{row.cat8_partnership}</td>
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
