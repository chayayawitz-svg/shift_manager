"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Search, Calendar, RotateCcw, User } from "lucide-react";

const supabaseUrl = 'https://rbyufhkwrgvywnovdwei.supabase.co';
const supabaseKey = 'sb_publishable_Wc1Cj7wgX1oWRZ2x5svXNg_wa2kVU4u';
const supabase = createClient(supabaseUrl, supabaseKey);

const COLORS = ['#FF3366', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const keys = [
  { key: 'cat1_leadership', label: 'שינויים ומצבי לחץ' },
  { key: 'cat2_soul_player', label: 'הנעה והובלה' },
  { key: 'cat3_mutual_guarantee', label: 'חשיבה יצירתית וחדשנות' },
  { key: 'cat4_professionalism', label: 'קילריות ויעדים' },
  { key: 'cat5_business_connection', label: 'יוזמה והשפעה' },
  { key: 'cat6_curiosity', label: 'עבודת צוות' }
];

export default function DashboardPage() {
  const [results, setResults] = useState<any[]>([]);
  const [filteredResults, setFilteredResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    async function fetchResults() {
      const { data, error } = await supabase
        .from('survey_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) {
        setResults(data || []);
        setFilteredResults(data || []);
      }
      setIsLoading(false);
    }
    fetchResults();
  }, []);

  useEffect(() => {
    let temp = [...results];
    if (searchTerm) temp = temp.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (startDate) temp = temp.filter(r => new Date(r.created_at) >= new Date(startDate));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59);
      temp = temp.filter(r => new Date(r.created_at) <= end);
    }
    setFilteredResults(temp);
  }, [searchTerm, startDate, endDate, results]);

  const calculateAverages = () => {
    if (filteredResults.length === 0) return [];
    return keys.map(item => {
      const avg = filteredResults.reduce((acc, curr) => acc + (curr[item.key] || 0), 0) / filteredResults.length;
      return { name: item.label, value: Number(avg.toFixed(1)) };
    });
  };

  const pieData = calculateAverages();

  // פונקציה לרינדור כיתובים מחוץ לעוגה כדי למנוע בלאגן ויזואלי
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 30;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#1e3a8a" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="800">
        {name} ({value})
      </text>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-[#f8fafc] text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-10 text-center">דשבורד מודל הבאלנס</h1>
        
        {isLoading ? (
          <div className="flex justify-center mt-20 italic text-blue-900 animate-pulse">טוען נתונים...</div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            
            {/* סיכום כמותי */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-900 text-center min-w-[250px]">
                <p className="text-gray-400 font-bold">סה"כ משיבים</p>
                <p className="text-5xl font-black text-blue-900">{filteredResults.length}</p>
              </div>
            </div>

            {/* גרף עוגה משודרג */}
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-8 text-blue-900 text-center text-pretty">התפלגות חוזקות צוותית (ממוצע)</h2>
              <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={80}
                      outerRadius={140}
                      paddingAngle={8}
                      dataKey="value"
                      label={renderCustomLabel}
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '40px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* טבלה עם מסננים מובנים */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-950 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <h2 className="text-xl font-black text-white">פירוט תשובות גולמיות</h2>
                  
                  {/* שורת המסננים בתוך הכותרת */}
                  <div className="flex flex-wrap gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-md">
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/50" />
                      <input 
                        type="text" placeholder="חיפוש לפי שם..." 
                        className="bg-white/10 border border-white/20 text-white text-sm rounded-xl py-2 pr-9 pl-4 outline-none focus:bg-white/20 w-44 placeholder:text-white/40"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 py-1">
                      <Calendar className="w-4 h-4 text-white/50" />
                      <input 
                        type="date" className="bg-transparent text-white text-xs outline-none invert"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      />
                      <span className="text-white/30 text-xs">עד</span>
                      <input 
                        type="date" className="bg-transparent text-white text-xs outline-none invert"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <button onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); }} className="p-2 hover:bg-white/10 rounded-xl text-white/70 transition">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="bg-gray-50 text-blue-900 border-b">
                      <th className="p-4 text-sm font-bold">תאריך</th>
                      <th className="p-4 text-sm font-bold">שם העובד/ת</th>
                      {keys.map(k => <th key={k.key} className="p-4 text-[10px] font-bold text-center bg-blue-50/30 leading-tight w-20">{k.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length > 0 ? filteredResults.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-xs text-gray-400">{new Date(row.created_at).toLocaleDateString('he-IL')}</td>
                        <td className="p-4 font-bold text-blue-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                            <User className="w-4 h-4" />
                          </div>
                          {row.full_name}
                        </td>
                        <td className="p-4 text-center font-black text-gray-700">{row.cat1_leadership}</td>
                        <td className="p-4 text-center font-black text-gray-700">{row.cat2_soul_player}</td>
                        <td className="p-4 text-center font-black text-gray-700">{row.cat3_mutual_guarantee}</td>
                        <td className="p-4 text-center font-black text-gray-700">{row.cat4_professionalism}</td>
                        <td className="p-5 text-center font-black text-gray-700">{row.cat5_business_connection}</td>
                        <td className="p-4 text-center font-black text-gray-700">{row.cat6_curiosity}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8} className="p-20 text-center text-gray-400 font-bold">לא נמצאו תוצאות לסינון הנבחר</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
