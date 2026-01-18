"use client";
import { useState, useEffect } from "react";
import QuestionCard from "../components/QuestionCard";

export default function Homepage() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numToGen, setNumToGen] = useState(3);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) setHistory(await res.json());
    } catch (err) { console.error("History fetch failed"); }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/api/generate?count=${numToGen}`, { method: "POST", body: fd });
      const result = await res.json();
      if (result.questions) setQuestions(prev => [...result.questions, ...prev]);
      loadHistory();
    } catch (err) { alert("Server error. Try a smaller PDF."); }
    setLoading(false);
  };

  const deleteSession = async (id) => {
    if (!confirm("Delete this session?")) return;
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) loadHistory();
    } catch (err) { alert("Delete failed"); }
  };

  return (
    // The "dark:" prefix handles everything automatically based on browser settings
    <div className="flex min-h-screen bg-[#FDFDFF] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500">
      
      {/* Sidebar with Glassmorphism in Dark Mode */}
      <aside className="w-80 bg-white dark:bg-[#1E293B]/50 dark:backdrop-blur-xl border-r border-slate-100 dark:border-slate-800 p-8 hidden xl:flex flex-col shadow-sm transition-all">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center">
             <span className="text-white font-black text-lg italic">Q</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic dark:text-white">Generator</h2>
        </div>
        
        <h3 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6">Recent Sessions</h3>
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {history.map(h => (
            <div key={h._id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-800 transition-all duration-200">
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{h.filename}</p>
                <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-tighter">{h.content?.length || 0} Qs</p>
              </div>
              <button 
                onClick={() => deleteSession(h._id)} 
                className="opacity-0 group-hover:opacity-100 ml-2 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Studio Area */}
      <main className="flex-1 overflow-y-auto px-6 py-12 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12 text-center lg:text-left">
            <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white leading-tight">
              AI <span className="text-indigo-600">Question</span> Studio
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium italic">Assignment: Service Operations</p>
          </header>

          {/* Interactive Upload Card */}
          <section className="bg-white dark:bg-[#1E293B] rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-50 dark:border-slate-800 mb-16 relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-500/10 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-8 relative z-10">
              <div className="w-full md:w-40">
                <label className="block text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 ml-1">Quantity</label>
                <input 
                  type="number" min="1" max="10" 
                  value={numToGen}
                  onChange={(e) => setNumToGen(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-50 dark:border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 font-bold text-xl dark:text-white transition-all shadow-inner"
                />
              </div>
              
              <div className="flex-1 w-full relative">
                <input type="file" id="pdf" className="hidden" onChange={handleUpload} accept=".pdf" />
                <label 
                  htmlFor="pdf" 
                  className={`flex items-center justify-center gap-4 w-full h-[72px] rounded-2xl font-black text-lg transition-all cursor-pointer shadow-xl active:scale-[0.98] ${
                    loading ? 'bg-indigo-100 text-indigo-400 cursor-wait animate-pulse' : 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none hover:bg-indigo-700'
                  }`}
                >
                   {loading ? "GENERATING..." : "UPLOAD PDF (2 PAGES)"}
                </label>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-6 text-center font-bold tracking-tight uppercase">
               Only the first 2 pages are processed for maximum performance.
            </p>
          </section>

          {/* Results Display */}
          <div className="grid gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Quiz ({questions.length}/50)</h3>
              {questions.length > 0 && (
                <button 
                  onClick={() => setQuestions([])} 
                  className="text-xs font-bold text-rose-500 hover:underline transition-all"
                >
                  Clear Results
                </button>
              )}
            </div>
            
            <div className="space-y-6">
              {questions.length === 0 && !loading && (
                <div className="py-24 text-center bg-slate-50/50 dark:bg-slate-900/20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                  <p className="text-slate-300 dark:text-slate-600 font-bold italic">No document active. Upload a PDF to begin.</p>
                </div>
              )}
              {questions.map((q, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <QuestionCard index={i} q={q} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}