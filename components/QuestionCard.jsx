export default function QuestionCard({ q, index }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-4">
      <div className="flex gap-4">
        <span className="bg-indigo-600 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
          {index + 1}
        </span>
        <p className="text-slate-800 font-semibold">{q.q}</p>
      </div>
      <details className="mt-4 group cursor-pointer">
        <summary className="text-sm text-indigo-600 font-bold list-none">View Answer</summary>
        <p className="mt-2 text-slate-600 p-3 bg-slate-50 rounded border-l-2 border-indigo-400">
          {q.a}
        </p>
      </details>
    </div>
  );
}