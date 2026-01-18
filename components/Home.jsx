"use client";
import { useState, useEffect } from "react";
import QuestionCard from "../components/QuestionCard";

export default function Homepage() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numToGen, setNumToGen] = useState(5); 

  const loadHistory = async () => {
    const res = await fetch("/api/history");
    if (res.ok) setHistory(await res.json());
  };

  useEffect(() => { loadHistory(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || questions.length >= 50) return;
    setLoading(true);

    const fd = new FormData();
    fd.append("file", file);

    try {
      // Direct fetch to allow the server-side maxDuration to manage the limit
      const res = await fetch(`/api/generate?count=${numToGen}`, { 
        method: "POST", 
        body: fd 
      });

      if (!res.ok) throw new Error("Vercel Timeout");

      const result = await res.json();

      // Ensure result.questions exists before spreading to prevent crashes
      if (result && result.questions && result.questions.length > 0) {
        setQuestions(prev => [...result.questions, ...prev].slice(0, 50));
      } else {
        alert("The AI took too long. Try generating fewer questions.");
      }
      
    } catch (error) {
      alert("Connection Timeout: The free-tier server took too long. Try a simpler PDF.");
    } finally {
      setLoading(false);
      loadHistory();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFDFF] font-sans text-slate-900">
      {/* Sidebar - History */}
      <aside className="w-80 bg-white border-r border-slate-100 p-8 hidden xl:flex flex-col shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center">
             <span className="text-white font-black text-lg">M</span>
          </div>
          <h2 className="text-xl font-black tracking-tighter uppercase italic">Mentora</h2>
        </div>
        
        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-6">Recent History</h3>
        <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
          {history.map(h => (
            <div key={h._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs font-bold text-slate-700 truncate">{h.filename}</p>
              <p className="text-[10px] text-indigo-500 font-black mt-1 uppercase">{h.content.length} Questions</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Studio Area */}
      <main className="flex-1 overflow-y-auto px-10 py-16">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-5xl font-black mb-4 tracking-tight">AI Quiz Studio</h1>
            <p className="text-slate-500 text-lg font-medium">Fast AI generation (Optimized for Vercel Serverless).</p>
          </header>

          <section className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100/50 border border-slate-50 mb-16">
            <div className="flex flex-col md:flex-row items-end gap-8">
              <div className="w-full md:w-40">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quantity</label>
                <input 
                  type="number" min="1" max="10" 
                  value={numToGen}
                  onChange={(e) => setNumToGen(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-indigo-500 font-bold text-xl transition-all"
                />
              </div>
              <div className="flex-1 w-full relative">
                <input type="file" id="pdf" className="hidden" onChange={handleUpload} accept=".pdf" />
                <label htmlFor="pdf" className={`flex items-center justify-center gap-4 w-full h-[68px] rounded-2xl font-black text-lg transition-all cursor-pointer shadow-xl active:scale-95 ${loading ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700'}`}>
                   {loading ? "AI ENGINES PROCESSING..." : "UPLOAD PDF & GENERATE"}
                </label>
              </div>
            </div>
          </section>

          <div className="grid gap-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Quiz ({questions.length}/50)</h3>
              {questions.length > 0 && <button onClick={() => setQuestions([])} className="text-xs font-bold text-rose-500 hover:underline">Reset Board</button>}
            </div>
            {questions.map((q, i) => <QuestionCard key={i} index={i} q={q} />)}
          </div>
        </div>
      </main>
    </div>
  );
}