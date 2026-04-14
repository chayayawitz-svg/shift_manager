"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Search, Calendar, RotateCcw, User, ClipboardList } from "lucide-react";

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

  // מצבי מסננים
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

  // לוגיקת סינון
  useEffect(() => {
    let temp = [...results];
    if (searchTerm) {
      temp = temp.filter(r => r.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (startDate) {
      temp = temp.filter(r => new Date(r.created_at) >= new Date(startDate));
    }
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

  // פונקציית כיתובים מרוחקים מהעוגה למניעת בלאגן
  const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 60; // מרחק גדול בחוץ
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#1e3a8a" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central" 
        fontSize="13" 
        fontWeight="800"
      >
        {name} ({value})
      </text>
    );
  };

  return (
    <div className="min-h-screen p-6 bg-[#f8fafc] text-right font-sans" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-blue-900 mb-10 text-center">דשבורד מודל הבאלנס</h1>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center mt-20 gap-4">
             <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
             <p className="font-bold text-blue-900">טוען נתונים מהמערכת...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            
            {/* כרטיס סה"כ משיבים ממורכז */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-blue-900 text-center min-w-[280px]">
                <p className="text-gray-400 font-bold text-sm uppercase tracking-wider">סה"כ משיבים</p>
                <p className="text-6xl font-black text-blue-900">{filteredResults.length}</p>
              </div>
            </div>

            {/* גרף עוגה משודרג */}
            <div className="bg-white p-8 lg:p-12 rounded-[40px] shadow-sm border border-gray-100">
              <h2 className="text-2xl font-black mb-10 text-blue-900 text-center">התפלגות חוזקות צוותית (ממוצע)</h2>
              <div className="h-[600px] w-full">
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
                      labelLine={{ stroke: '#cbd5e1', strokeWidth: 1.5 }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '80px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* טבלה עם מסננים משולבים בכותרת */}
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-blue-950 p-6 lg:px-10">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                    <ClipboardList className="text-[#FF3366] w-8 h-8" />
                    <h2 className="text-xl font-black text-white">פירוט תשובות גולמיות</h2>
                  </div>
                  
                  {/* אזור המסננים */}
                  <div className="flex flex-wrap gap-3 bg-white/5 p-2 rounded-2xl backdrop-blur-sm border border-white/10">
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 w-4 h-4 text-white/40" />
                      <input 
                        type="text" placeholder="חיפוש לפי שם..." 
                        className="bg-white/10 border border-white/10 text-white text-sm rounded-xl py-2 pr-9 pl-4 outline-none focus:bg-white/20 w-44 placeholder:text-white/30 transition-all"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-3 py-1">
                      <Calendar className="w-4 h-4 text-white/40" />
                      <input 
                        type="date" className="bg-transparent text-white text-xs outline-none invert brightness-200"
                        value={startDate} onChange={(e) => setStartDate(e.target.value)}
                      />
                      <span className="text-white/20 text-xs px-1">עד</span>
                      <input 
                        type="date" className="bg-transparent text-white text-xs outline-none invert brightness-200"
                        value={endDate} onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={() => { setSearchTerm(""); setStartDate(""); setEndDate(""); }} 
                      className="p-2 bg-white/10 hover:bg-[#FF3366] rounded-xl text-white transition-colors"
                      title="איפוס מסננים"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-blue-900 border-b">
                      <th className="p-5 text-sm font-bold">תאריך</th>
                      <th className="p-5 text-sm font-bold">שם העובד/ת</th>
                      {keys.map(k => (
                        <th key={k.key} className="p-5 text-[10px] font-bold text-center bg-blue-50/30 leading-tight w-20">
                          {k.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.length > 0 ? filteredResults.map((row) => {
                      // חישוב מספר הגשה למי שמילא פעמיים
                      const allUserSubmissions = results
                        .filter(r => r.full_name === row.full_name)
                        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                      
                      const submissionIndex = allUserSubmissions.findIndex(r => r.id === row.id) + 1;
                      const isMultiple = allUserSubmissions.length > 1;

                      return (
                        <tr key={row.id} className="border-b hover:bg-blue-50/30 transition-colors group">
                          <td className="p-5 text-xs text-gray-400 font-medium">
                            {new Date(row.created_at).toLocaleDateString('he-IL')}
                          </td>
                          <td className="p-5 font-bold text-blue-900">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-[#FF3366] group-hover:text-white transition-colors">
                                <User className="w-5 h-5" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-base">{row.full_name}</span>
                                {isMultiple && (
                                  <span className="text-[10px] text-[#FF3366] font-black uppercase tracking-tighter">
                                    הגשה מספר {submissionIndex}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-center font-black text-gray-700">{row.cat1_leadership}</td>
                          <td className="p-5 text-center font-black text-gray-700">{row.cat2_soul_player}</td>
                          <td className="p-5 text-center font-black text-gray-700">{row.cat3_mutual_guarantee}</td>
                          <td className="p-5 text-center font-black text-gray-700">{row.cat4_professionalism}</td>
                          <td className="p-5 text-center font-black text-gray-700">{row.cat5_business_connection}</td>
                          <td className="p-5 text-center font-black text-gray-700">{row.cat6_curiosity}</td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={8} className="p-24 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <Search className="w-12 h-12" />
                            <p className="text-xl font-bold">לא נמצאו תוצאות העונות לסינון</p>
                          </div>
                        </td>
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
