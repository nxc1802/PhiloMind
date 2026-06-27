import React from 'react';

export default function NodeDocumentTab({
  nodeDocuments,
  handleDocumentDelete,
  handlePdfUploadSubmit,
  pdfFile,
  setPdfFile,
  uploadingPdf,
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-base font-semibold text-blue-500 flex items-center gap-2">
        <span className="material-symbols-outlined">picture_as_pdf</span> Tài liệu PDF học bổ trợ
      </h4>

      <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
        {nodeDocuments.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">Chưa có tài liệu PDF nào cho khóa học này.</p>
        ) : (
          nodeDocuments.map(doc => (
            <div key={doc.id} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-850 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 text-sm">picture_as_pdf</span>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold max-w-[200px] truncate">{doc.fileName}</a>
              </div>
              <button onClick={() => handleDocumentDelete(doc.id)} className="text-red-500 hover:text-red-400 p-1">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handlePdfUploadSubmit} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 text-left">
        <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">cloud_upload</span> Upload tài liệu PDF bổ trợ
        </h5>
        <input
          type="file"
          accept=".pdf"
          required
          onChange={(e) => setPdfFile(e.target.files[0])}
          className="text-xs text-slate-400 file:bg-slate-955 file:border-slate-800 file:text-slate-350 file:rounded-lg file:px-3 file:py-1 file:mr-3 hover:file:bg-slate-900 focus:outline-none"
        />
        <button
          type="submit"
          disabled={uploadingPdf || !pdfFile}
          className="w-full bg-blue-750 hover:bg-blue-800 disabled:opacity-50 text-white font-bold py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
        >
          {uploadingPdf ? "Đang tải lên..." : "Tải lên tài liệu PDF"}
        </button>
      </form>
    </div>
  );
}
