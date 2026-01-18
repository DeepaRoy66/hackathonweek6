"use client";
import { useState, useEffect } from "react";
import QuestionCard from "../components/QuestionCard";

export default function Homepage() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numToGen, setNumToGen] = useState(5);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) setHistory(await res.json());
    } catch (err) { console.error("History fetch failed"); }
  };

  useEffect(() => { loadHistory(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || questions.length >= 50) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch(`/api/generate?count=${numToGen}`, { 
        method: "POST", 
        body: fd 
      });
      const result = await res.json();

      if (result && result.questions) {
        setQuestions(prev => [...result.questions, ...prev].slice(0, 50));
      } else {
        alert("Extraction failed. Try a clearer PDF.");
      }
      setLoading(false);
      loadHistory();
    } catch (error) {
      alert("Network error. Check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">M</span>
          </div>
          <span className="font-black text-lg italic tracking-tighter">Quiz Generator</span>
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>

      {/* Sidebar - Responsive */}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-100 p-8 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none`}>
        <div className="hidden lg:flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center">
             <span className="text-white font-black text-lg">M</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic">Question Generator</h2>
        </div>
        
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent History</h3>
        <div className="space-y-3 overflow-y-auto flex-1 pr-2 custom-scrollbar">
          {history.length > 0 ? history.map(h => (
            <div key={h._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-default">
              <p className="text-xs font-bold text-slate-700 truncate">{h.filename}</p>
              <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase tracking-tighter">{h.content.length} Questions</p>
            </div>
          )) : <p className="text-xs text-slate-400 italic">No history yet</p>}
        </div>
      </aside>

      {/* Main Studio Area */}
      <main className="flex-1 overflow-y-auto px-4 md:px-10 py-10 lg:py-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 lg:mb-14 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight text-slate-900 leading-tight">
              AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Quiz Studio</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-xl mx-auto lg:mx-0">
              Transform your documents into interactive study guides using advanced Question Generator.
            </p>
          </header>

         
          <section className="bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl shadow-indigo-100/40 border border-white mb-10 md:mb-16">
            <div className="flex flex-col md:flex-row items-stretch md:items-end gap-6 md:gap-8">
              <div className="flex-1 md:max-w-[160px]">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Questions Count</label>
                <input 
                  type="number" min="1" max="15" 
                  value={numToGen}
                  onChange={(e) => setNumToGen(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 font-bold text-xl transition-all shadow-inner"
                />
              </div>
              <div className="flex-[2] relative">
                <input type="file" id="pdf" className="hidden" onChange={handleUpload} accept=".pdf" />
                <label htmlFor="pdf" className={`flex items-center justify-center gap-4 w-full h-[64px] md:h-[72px] rounded-2xl font-black text-base md:text-lg transition-all cursor-pointer shadow-lg active:scale-[0.97] ${loading ? 'bg-indigo-50 text-indigo-300 border-2 border-indigo-100' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300'}`}>
                   {loading ? (
                     <span className="flex items-center gap-3">
                       <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>
                       AI ENGINE PROCESSING...
                     </span>
                   ) : "UPLOAD PDF & GENERATE"}
                </label>
              </div>
            </div>
          </section>

          <div className="grid gap-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Study Deck ({questions.length}/50)</h3>
              {questions.length > 0 && (
                <button onClick={() => setQuestions([])} className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  Reset
                </button>
              )}
            </div>
            
            {questions.length === 0 && !loading && (
              <div className="py-20 text-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                <p className="text-slate-400 font-bold italic">No cards active. Upload a document to begin.</p>
              </div>
            )}

            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
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