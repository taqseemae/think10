import { createFileRoute } from "@tanstack/react-router";
import { User, Image, FileText, CheckCircle2, AlertCircle, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/consultant/profile")({
  component: ConsultantProfile,
});

function ConsultantProfile() {
  const { currentUser, userDoc, refreshUserDoc } = useAuth();
  
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [primaryArea, setPrimaryArea] = useState("Supply Chain & Logistics");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Sync profile data from userDoc
  useEffect(() => {
    if (userDoc?.consultantProfile) {
      setTitle(userDoc.consultantProfile.title || "");
      setBio(userDoc.consultantProfile.bio || "");
      setPrimaryArea(userDoc.consultantProfile.primaryArea || "Supply Chain & Logistics");
      setTags(userDoc.consultantProfile.topics || []);
    }
  }, [userDoc]);

  const handleSave = async () => {
    if (!currentUser?.uid) return;
    setSaving(true);
    setSuccess(false);
    setErrorMsg("");
    try {
      const { updateConsultantProfileFn } = await import("@/lib/server-actions");
      await updateConsultantProfileFn({
        uid: currentUser.uid,
        profile: {
          title,
          bio,
          primaryArea,
          topics: tags
        }
      });
      await refreshUserDoc();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const displayName = userDoc?.displayName || currentUser?.displayName || "Consultant";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 font-display">Public Profile & Credentials</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage how clients see you on the Think10 marketplace.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {errorMsg && (
            <span className="text-xs text-red-600 self-center font-semibold mr-2">{errorMsg}</span>
          )}
          {success && (
            <span className="text-xs text-[color:var(--t10-emerald)] self-center font-semibold mr-2">Changes saved successfully!</span>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-[color:var(--t10-emerald)] text-white rounded-lg text-sm font-bold hover:bg-[color:var(--t10-emerald)]/90 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Completeness Meter */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full border-4 border-neutral-100 flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="20" cy="20" r="18" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="113" strokeDashoffset="0" className="text-[color:var(--t10-emerald)]" />
          </svg>
          <span className="text-xs font-bold text-neutral-900">100%</span>
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 text-sm">Profile Complete</h3>
          <p className="text-xs text-neutral-500">Your profile is fully optimized and visible to clients.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        
        {/* Photo & Basic Info */}
        <div className="p-6 border-b border-neutral-100">
          <h3 className="font-bold text-neutral-900 mb-4 flex items-center gap-2"><User className="w-4 h-4 text-[color:var(--t10-emerald)]"/> Personal Details</h3>
          
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            <div className="flex flex-col items-center gap-3">
              <div className="h-24 w-24 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 overflow-hidden relative group cursor-pointer hover:border-[color:var(--t10-emerald)] transition-colors">
                <Image className="w-8 h-8 opacity-50 group-hover:opacity-100" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white font-medium">Upload</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={displayName} 
                    disabled
                    className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500 cursor-not-allowed focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">Professional Title</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Supply Chain Strategist"
                    className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-neutral-600 uppercase mb-1">Biography</label>
            <textarea 
              rows={4} 
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a brief professional bio..."
              className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none resize-none" 
            />
            <p className="text-[10px] text-neutral-400 mt-1 text-right">{bio.length} characters</p>
          </div>
        </div>

        {/* Expertise & Topics */}
        <div className="p-6 border-b border-neutral-100">
          <h3 className="font-bold text-neutral-900 mb-4">Expertise & Topics</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Primary Advisory Area</label>
              <select 
                value={primaryArea}
                onChange={(e) => setPrimaryArea(e.target.value)}
                className="w-full sm:w-1/2 rounded-md border border-neutral-200 px-3 py-2 text-sm focus:border-[color:var(--t10-emerald)] focus:outline-none bg-white"
              >
                <option value="Supply Chain & Logistics">Supply Chain & Logistics</option>
                <option value="E-commerce Strategy">E-commerce Strategy</option>
                <option value="Financial Planning">Financial Planning</option>
                <option value="Marketing & Growth">Marketing & Growth</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-neutral-600 uppercase mb-2">Consultation Topics (Tags)</label>
              <div className="flex flex-wrap gap-2 mb-2 p-2.5 rounded-lg border border-neutral-100 bg-neutral-50/50">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                    {tag} 
                    <button 
                      type="button"
                      onClick={() => setTags(tags.filter(t => t !== tag))}
                      className="hover:text-red-500 ml-1 font-bold"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <span className="text-xs text-neutral-400">No tags added yet.</span>
                )}
              </div>
              <div className="flex gap-2 max-w-sm mt-2">
                <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add topic..." 
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs outline-none focus:border-[color:var(--t10-emerald)]" 
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                        setTagInput("");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                      setTags([...tags, tagInput.trim()]);
                      setTagInput("");
                    }
                  }}
                  className="rounded-lg bg-[color:var(--t10-navy)] px-3 text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Verified Credentials */}
        <div className="p-6 bg-neutral-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-neutral-900 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[color:var(--t10-emerald)]"/> Verified Credentials</h3>
            <span className="text-xs text-neutral-500"><Lock className="w-3 h-3 inline mr-1"/> Private data</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded-lg border border-neutral-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Emirates ID</p>
                  <p className="text-xs text-neutral-500">Verified by Think10</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[color:var(--t10-emerald)]">Valid</span>
            </div>
            
            <div className="bg-white p-3 rounded-lg border border-red-200 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-neutral-400" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Trade License</p>
                  <p className="text-xs text-red-500 font-medium">Expiring in 5 days</p>
                </div>
              </div>
              <button className="text-xs font-bold text-neutral-600 hover:text-neutral-900 underline">Update</button>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 flex gap-3 text-sm text-amber-800">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Any changes to restricted claims or credentials require verification by the Think10 quality team before appearing on your public profile.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
