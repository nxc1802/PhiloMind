import React from 'react';

export default function NodeFlashcardTab({
  flashcards,
  openCreateFc,
  openEditFc,
  handleFcDelete,
  parseFlashcardQuestion,
  handleJsonUpload,
  jsonText,
  setJsonText,
  handleBulkImport,
  importingFlashcards,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-semibold text-red-500 flex items-center gap-2">
          <span className="material-symbols-outlined">layers</span> Danh sách Thẻ nhớ ({flashcards.length})
        </h4>
        <button
          type="button"
          onClick={openCreateFc}
          className="bg-red-800 hover:bg-red-950 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">add</span> Thêm thẻ
        </button>
      </div>

      {/* Flashcards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[35vh] overflow-y-auto pr-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        {flashcards.length === 0 ? (
          <p className="col-span-2 text-xs text-slate-500 italic text-center py-4">Chưa có thẻ nhớ nào cho bài này.</p>
        ) : (
          flashcards.map(fc => {
            const parsed = parseFlashcardQuestion(fc.question);
            return (
              <div key={fc.id} className="bg-slate-950 border border-slate-850 p-3 rounded-xl flex flex-col justify-between text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[10px] text-slate-400 font-bold uppercase">
                    {fc.tag}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditFc(fc)} className="p-1 hover:bg-slate-800 text-blue-405 rounded" title="Sửa">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button onClick={() => handleFcDelete(fc.id)} className="p-1 hover:bg-slate-800 text-red-405 rounded" title="Xóa">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Mặt trước (Q):</p>
                  <p className="font-semibold text-slate-200 leading-snug">{parsed.question}</p>
                  {parsed.isMcq && (
                    <div className="pl-2 border-l border-slate-800 text-slate-400 space-y-0.5 mt-1">
                      {parsed.options.map((o, idx) => (
                        <p key={idx}>{o}</p>
                      ))}
                    </div>
                  )}
                  <div className="h-px bg-slate-800/60 my-1" />
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Mặt sau (A):</p>
                  <p className="text-slate-350 italic leading-snug">{fc.answer}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bulk Import Section */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 text-left">
        <h5 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">upload_file</span> Nhập hàng loạt Flashcards (JSON)
        </h5>
        <input
          type="file"
          accept=".json"
          onChange={handleJsonUpload}
          className="text-xs text-slate-400 file:bg-slate-955 file:border-slate-800 file:text-slate-300 file:rounded-lg file:px-3 file:py-1 file:mr-3 hover:file:bg-slate-900 focus:outline-none"
        />
        <textarea
          rows="3"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder='Ví dụ: &#10;[&#10;  { "question": "Vật chất là gì?", "answer": "Là phạm trù..." }&#10;]'
          className="w-full bg-slate-955 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-700 font-mono resize-none focus:outline-none"
        />
        <button
          type="button"
          onClick={handleBulkImport}
          disabled={importingFlashcards || !jsonText.trim()}
          className="w-full bg-red-800 hover:bg-red-950 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {importingFlashcards ? "Đang nhập..." : "Nhập hàng loạt thẻ nhớ"}
        </button>
      </div>
    </div>
  );
}
