import { createFileRoute } from "@tanstack/react-router";
import { useDashboardState, type LibraryDocument } from "@/context/DashboardStateContext";
import { EXPERTS } from "@/data/think10";
import { useState } from "react";
import {
  FileText,
  Upload,
  Trash2,
  Share2,
  CheckCircle,
  X,
  Info,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/documents")({ component: Page });

function Page() {
  const { documents, uploadDocument, deleteDocument, toggleDocumentShare } = useDashboardState();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [docCategory, setDocCategory] = useState<LibraryDocument["type"]>("Finance");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Sharing controls dropdown target
  const [activeShareDoc, setActiveShareDoc] = useState<LibraryDocument | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim() || !selectedFile) return;

    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/api/upload-file", {
        method: "POST",
        body: formData,
      });
      setUploadProgress(60);
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadProgress(100);
      
      setTimeout(() => {
        uploadDocument(
          docName.endsWith(".pdf") || docName.endsWith(".xlsx") || docName.includes(".") ? docName : `${docName}.pdf`,
          `${Math.round(data.size / 1024)} KB`,
          docCategory,
          data.url
        );
        setIsUploading(false);
        setUploadProgress(0);
        setDocName("");
        setSelectedFile(null);
        setShowUploadModal(false);
      }, 300);
    } catch (err) {
      console.error(err);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-sm space-y-6 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[color:var(--t10-navy)]">Document Library</h2>
          <p className="mt-1 text-sm text-[color:var(--t10-grey)]">
            Upload financial models and brand guidelines. Permit specific experts to view files.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-[color:var(--t10-navy)] px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors shadow-sm"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {/* Warning banner */}
      <div className="flex gap-2 rounded-lg bg-[color:var(--t10-mint)] border border-[color:var(--t10-border)] p-3.5 text-xs text-[color:var(--t10-navy)]">
        <Info className="h-4 w-4 shrink-0 text-[color:var(--t10-emerald)]" />
        <span>
          <strong>Confidentiality Notice</strong>: Documents are fully encrypted at rest. Experts
          cannot access any file unless you explicitly check the <strong>Share</strong> permissions below.
        </span>
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 text-[color:var(--t10-grey)] font-semibold">
              <th className="py-2.5">File Name</th>
              <th className="py-2.5">Category</th>
              <th className="py-2.5">Size</th>
              <th className="py-2.5">Uploaded</th>
              <th className="py-2.5">Advisor Permissions</th>
              <th className="py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 text-[color:var(--t10-navy)]">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-neutral-50/50">
                <td className="py-3 flex items-center gap-2 font-medium">
                  <FileText className="h-4.5 w-4.5 text-[color:var(--t10-emerald)]" />
                  {doc.url ? (
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline text-[color:var(--t10-navy)]">
                      {doc.name}
                    </a>
                  ) : (
                    <span>{doc.name}</span>
                  )}
                </td>
                <td className="py-3 font-semibold text-neutral-600">{doc.type}</td>
                <td className="py-3 text-neutral-500">{doc.size}</td>
                <td className="py-3 text-neutral-500">{doc.uploadedAt}</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {doc.sharedWith.length === 0 ? (
                      <span className="text-[10px] text-neutral-400 italic">Private (No access)</span>
                    ) : (
                      doc.sharedWith.map((slug) => {
                        const exp = EXPERTS.find((e) => e.slug === slug);
                        return exp ? (
                          <span
                            key={slug}
                            className="rounded bg-blue-50 border border-blue-200 text-blue-700 px-1.5 py-0.5 text-[9px] font-bold"
                          >
                            {exp.name}
                          </span>
                        ) : null;
                      })
                    )}
                    <button
                      onClick={() => setActiveShareDoc(doc)}
                      className="p-1 hover:bg-neutral-100 rounded text-[color:var(--t10-grey)]"
                      title="Manage sharing permissions"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-1 hover:text-red-500 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {documents.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center italic text-neutral-400">
                  No documents found. Upload Q3 P&L to give Zyne context.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Dialog */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <h3 className="text-sm font-bold text-[color:var(--t10-navy)]">Upload Context Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="rounded-full p-1 hover:bg-neutral-100"
                disabled={isUploading}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <label className="block">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Select File</span>
                <input
                  type="file"
                  required
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      if (!docName) setDocName(file.name);
                    }
                  }}
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Document Name</span>
                <input
                  type="text"
                  required
                  disabled={isUploading}
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Q3 cost spreadsheet.xlsx"
                  className="w-full rounded-md border border-[color:var(--t10-border)] px-3 py-2"
                />
              </label>

              <label className="block">
                <span className="mb-1 block font-semibold text-[color:var(--t10-navy)]">Category</span>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  disabled={isUploading}
                  className="w-full rounded-md border border-[color:var(--t10-border)] bg-white px-3 py-2"
                >
                  <option value="Finance">Finance</option>
                  <option value="Brand">Brand</option>
                  <option value="Marketplaces">Marketplaces</option>
                  <option value="Legal">Legal</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General Context</option>
                </select>
              </label>

              {isUploading && (
                <div className="space-y-1">
                  <div className="flex justify-between font-semibold text-[color:var(--t10-grey)]">
                    <span>Encrypting file...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div
                      className="h-full bg-[color:var(--t10-emerald)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isUploading || !docName.trim() || !selectedFile}
                className="w-full rounded-lg bg-[color:var(--t10-emerald)] py-2 text-center text-xs font-bold text-white hover:bg-[color:var(--t10-green)] disabled:opacity-50 transition-all shadow"
              >
                {isUploading ? "Uploading..." : "Encrypt & Upload Document"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Permissions Dialog */}
      {activeShareDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl border border-[color:var(--t10-border)] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--t10-border)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[color:var(--t10-grey)] uppercase">
                  Advisor Access Permissions
                </span>
                <h3 className="text-sm font-bold text-[color:var(--t10-navy)]">
                  Share: {activeShareDoc.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveShareDoc(null)}
                className="rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[11px] text-[color:var(--t10-grey)] leading-normal">
                Check advisors to grant read-only view access. Revoke access instantly by unchecking.
              </p>

              <div className="divide-y divide-[color:var(--t10-border)]">
                {EXPERTS.map((exp) => {
                  const isShared = activeShareDoc.sharedWith.includes(exp.slug);
                  return (
                    <label key={exp.slug} className="flex items-center justify-between py-2.5 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[color:var(--t10-navy)]">{exp.name}</span>
                        <span className="block text-[10px] text-neutral-400">{exp.role}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isShared}
                        onChange={() => toggleDocumentShare(activeShareDoc.id, exp.slug)}
                        className="h-4.5 w-4.5 accent-[color:var(--t10-emerald)]"
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
