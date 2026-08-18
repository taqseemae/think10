import { createFileRoute } from "@tanstack/react-router";
import { ColorSchemePicker } from "@/components/ui/ColorSchemePicker";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { AvatarCropperModal } from "@/components/AvatarCropperModal";
import { useState, useEffect } from "react";
import {
  Camera,
  Upload,
  User,
  Image,
  CheckCircle2,
  Lock,
  AlertCircle,
  FileText,
  Loader2,
  Sparkles,
  Award,
  DollarSign,
  MapPin,
  Languages,
  Clock,
  Eye,
  Check,
  Briefcase,
  ShieldCheck,
  FileType,
  FileUp,
} from "lucide-react";

export const Route = createFileRoute("/consultant/profile")({
  component: ConsultantProfile,
});

export function ConsultantProfile() {
  const { currentUser, userDoc, refreshUserDoc } = useAuth();
  const { colorScheme } = useTheme();

  const [displayNameState, setDisplayNameState] = useState(userDoc?.displayName || currentUser?.displayName || "");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [experienceYears, setExperienceYears] = useState<number>(10);
  const [pricePlaceholder, setPricePlaceholder] = useState("AED 450");
  const [location, setLocation] = useState("Dubai, UAE");
  const [languages, setLanguages] = useState("English, Arabic");
  const [primaryArea, setPrimaryArea] = useState("Supply Chain & Logistics");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(userDoc?.photoURL || currentUser?.photoURL || null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  
  // Asset & Document Upload States
  const [cvFileName, setCvFileName] = useState<string | null>(null);
  const [cvUrl, setCvUrl] = useState<string | null>(null);
  const [certFileName, setCertFileName] = useState<string | null>(null);
  const [certUrl, setCertUrl] = useState<string | null>(null);
  const [emiratesIdFileName, setEmiratesIdFileName] = useState<string | null>(null);
  const [emiratesIdUrl, setEmiratesIdUrl] = useState<string | null>(null);
  const [expLetterFileName, setExpLetterFileName] = useState<string | null>(null);
  const [expLetterUrl, setExpLetterUrl] = useState<string | null>(null);

  const [uploadingState, setUploadingState] = useState<{ [key: string]: boolean }>({
    cv: false,
    cert: false,
    emiratesId: false,
    expLetter: false,
  });

  const [saving, setSaving] = useState(false);
  const [aiCompiling, setAiCompiling] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageSrc(reader.result as string);
        setCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
    // reset input so the same file can be selected again
    e.target.value = '';
  };

  const uploadFileToBackend = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/upload-file`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      return data.url;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleCvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingState(prev => ({ ...prev, cv: true }));
      const url = await uploadFileToBackend(file);
      if (url) {
        setCvFileName(file.name);
        setCvUrl(url);
      }
      setUploadingState(prev => ({ ...prev, cv: false }));
    }
  };

  const handleCertFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingState(prev => ({ ...prev, cert: true }));
      const url = await uploadFileToBackend(file);
      if (url) {
        setCertFileName(file.name);
        setCertUrl(url);
      }
      setUploadingState(prev => ({ ...prev, cert: false }));
    }
  };

  const handleEmiratesIdFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingState(prev => ({ ...prev, emiratesId: true }));
      const url = await uploadFileToBackend(file);
      if (url) {
        setEmiratesIdFileName(file.name);
        setEmiratesIdUrl(url);
      }
      setUploadingState(prev => ({ ...prev, emiratesId: false }));
    }
  };

  const handleExpLetterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingState(prev => ({ ...prev, expLetter: true }));
      const url = await uploadFileToBackend(file);
      if (url) {
        setExpLetterFileName(file.name);
        setExpLetterUrl(url);
      }
      setUploadingState(prev => ({ ...prev, expLetter: false }));
    }
  };

  // Sync profile data from userDoc
  useEffect(() => {
    if (userDoc?.consultantProfile) {
      setTitle(userDoc.consultantProfile.title || "");
      setBio(userDoc.consultantProfile.bio || "");
      setExperienceYears(userDoc.consultantProfile.experienceYears || 10);
      setPricePlaceholder(userDoc.consultantProfile.pricePlaceholder || "AED 450");
      setLocation(userDoc.consultantProfile.location || "Dubai, UAE");
      setLanguages(userDoc.consultantProfile.languages ? userDoc.consultantProfile.languages.join(", ") : "English, Arabic");
      setPrimaryArea(userDoc.consultantProfile.primaryArea || "Supply Chain & Logistics");
      setTags(userDoc.consultantProfile.topics || []);
      if (userDoc.consultantProfile.cvFileName) setCvFileName(userDoc.consultantProfile.cvFileName);
      if (userDoc.consultantProfile.cvUrl) setCvUrl(userDoc.consultantProfile.cvUrl);
      if (userDoc.consultantProfile.certFileName) setCertFileName(userDoc.consultantProfile.certFileName);
      if (userDoc.consultantProfile.certUrl) setCertUrl(userDoc.consultantProfile.certUrl);
      if (userDoc.consultantProfile.emiratesIdFileName) setEmiratesIdFileName(userDoc.consultantProfile.emiratesIdFileName);
      if (userDoc.consultantProfile.emiratesIdUrl) setEmiratesIdUrl(userDoc.consultantProfile.emiratesIdUrl);
      if (userDoc.consultantProfile.expLetterFileName) setExpLetterFileName(userDoc.consultantProfile.expLetterFileName);
      if (userDoc.consultantProfile.expLetterUrl) setExpLetterUrl(userDoc.consultantProfile.expLetterUrl);
    }
    if (userDoc?.photoURL && !avatarUrl) {
      setAvatarUrl(userDoc.photoURL);
    }
    if (userDoc?.displayName && !displayNameState) {
      setDisplayNameState(userDoc.displayName);
    }
  }, [userDoc]);

  // AI Profile Compiler
  const handleAiCompileProfile = async () => {
    if (!cvUrl) {
      setErrorMsg("Please upload your CV first to use the AI Auto-Compiler.");
      return;
    }
    setAiCompiling(true);
    setErrorMsg("");
    try {
      const { parseCvWithGeminiFn } = await import("@/lib/server-actions");
      const parsedData = await parseCvWithGeminiFn({ data: { fileUrl: cvUrl } });
      
      if (parsedData.title) setTitle(parsedData.title);
      if (parsedData.bio) setBio(parsedData.bio);
      if (parsedData.experienceYears) setExperienceYears(parsedData.experienceYears);
      if (parsedData.primaryArea) setPrimaryArea(parsedData.primaryArea);
      if (parsedData.languages && parsedData.languages.length > 0) {
        setLanguages(parsedData.languages.join(", "));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to auto-compile profile with AI.");
    } finally {
      setAiCompiling(false);
    }
  };

  const handleSave = async () => {
    const uid = currentUser?.uid || userDoc?.uid;
    if (!uid) return;
    setSaving(true);
    setSuccess(false);
    setErrorMsg("");
    try {
      const { updateConsultantProfileFn } = await import("@/lib/server-actions");
      const langArray = languages.split(",").map((l) => l.trim()).filter(Boolean);

      await updateConsultantProfileFn({
        data: {
          uid: currentUser.uid,
          displayName: displayNameState,
          photoURL: avatarUrl,
          profile: {
            title,
            bio,
            experienceYears,
            pricePlaceholder,
            location,
            languages: langArray,
            primaryArea,
            topics: tags,
            cvFileName,
            cvUrl,
            certFileName,
            certUrl,
            emiratesIdFileName,
            emiratesIdUrl,
            expLetterFileName,
            expLetterUrl,
            avatarUrl,
          },
        },
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
  const approvalStatus = userDoc?.approvalStatus || "PENDING";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Main Save Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Public Profile & Assets</h2>
          </div>
          <p className="text-neutral-500 text-xs mt-1">
            Customize your public presentation, upload CV & assets, and pick your workspace theme.
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto items-center">
          {errorMsg && <span className="text-xs text-red-600 font-semibold">{errorMsg}</span>}
          {success && (
            <span className="text-xs text-[color:var(--t10-emerald)] font-semibold">
              Saved successfully!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-5 py-2.5 bg-[color:var(--t10-emerald)] text-white rounded-xl text-xs font-bold hover:bg-[color:var(--t10-green)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Profile
          </button>
        </div>
      </div>

      {/* Approval Status Banner */}
      <div
        className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${
          approvalStatus === "APPROVED"
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : approvalStatus === "REJECTED"
            ? "bg-red-50 border-red-200 text-red-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider">
              Verification Status: {approvalStatus === "APPROVED" ? "Verified & Published" : approvalStatus === "REJECTED" ? "Needs Revision" : "Pending Manual Admin Approval"}
            </p>
            <p className="text-xs mt-0.5">
              {approvalStatus === "APPROVED"
                ? "Your profile is active on the Think10 marketplace for clients to book strategy sessions."
                : "Our admin team will review your uploaded CV, Emirates ID, and compiled profile before publishing."}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-white/80 px-3 py-1 rounded-full border border-black/10 shrink-0">
          Fee: AED 0
        </span>
      </div>

      {/* AI Profile Auto-Compiler Assistant Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
              AI Profile Auto-Compiler Assistant
            </h3>
            <p className="text-xs text-indigo-700 mt-0.5">
              Let Zyne AI format your raw CV and bio into a high-converting executive advisory profile.
            </p>
          </div>
        </div>

        <button
          onClick={handleAiCompileProfile}
          disabled={aiCompiling}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-indigo-700 transition-all cursor-pointer shadow-sm disabled:opacity-50"
        >
          {aiCompiling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Compiling...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> AI Auto-Compile Profile
            </>
          )}
        </button>
      </div>

      {/* 2-Column Layout: Profile Form & Live Public Card Preview */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Form & Asset Uploads */}
        <div className="space-y-6">
          {/* 1. Basic Info & Avatar */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-100 pb-3">
              <User className="w-4 h-4 text-[color:var(--t10-emerald)]" /> Consultant Details & Avatar
            </h3>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-2">
                <label className="h-24 w-24 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 overflow-hidden relative group cursor-pointer hover:border-[color:var(--t10-emerald)] transition-colors">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Consultant avatar" className="h-full w-full object-cover" />
                  ) : (
                    <Image className="w-8 h-8 opacity-50 group-hover:opacity-100" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                    <Camera className="w-5 h-5" />
                    <span className="text-[10px] font-bold mt-0.5">Upload</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
                <label className="text-[11px] text-[color:var(--t10-emerald)] font-bold cursor-pointer hover:underline mt-1">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
                </label>
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayNameState}
                      onChange={(e) => setDisplayNameState(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-[color:var(--t10-emerald)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Retail Supply Chain Strategist"
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-[color:var(--t10-emerald)] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Experience (Years)
                    </label>
                    <input
                      type="number"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(Number(e.target.value))}
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-[color:var(--t10-emerald)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Rate / Session
                    </label>
                    <input
                      type="text"
                      value={pricePlaceholder}
                      onChange={(e) => setPricePlaceholder(e.target.value)}
                      placeholder="AED 450"
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-[color:var(--t10-emerald)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Dubai, UAE"
                      className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-xs focus:border-[color:var(--t10-emerald)] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-600 uppercase mb-1">
                Executive Biography
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write your executive bio or paste your CV text for AI auto-formatting..."
                className="w-full rounded-xl border border-neutral-200 px-3.5 py-2.5 text-xs focus:border-[color:var(--t10-emerald)] outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* 2. Asset Uploads (Resume, CV & Certifications) */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2 border-b border-neutral-100 pb-3">
              <FileUp className="w-4 h-4 text-[color:var(--t10-emerald)]" /> Asset Uploads (Resume, CV & Verification Docs)
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Resume / CV Upload Box */}
              <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center space-y-2">
                <FileText className="h-7 w-7 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">Resume / CV Document</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">PDF or Word (.pdf, .docx)</p>
                </div>

                {cvFileName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <Check className="h-3 w-3" /> {cvFileName}
                  </span>
                ) : uploadingState.cv ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-600 text-xs font-bold cursor-wait">
                    Uploading...
                  </span>
                ) : (
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--t10-navy)] text-white text-xs font-bold cursor-pointer hover:bg-neutral-800 transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload CV
                    <input type="file" accept=".pdf,.docx" onChange={handleCvFile} className="hidden" />
                  </label>
                )}
              </div>

              {/* Trade License / Certification Box */}
              <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center space-y-2">
                <Award className="h-7 w-7 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">Trade License / Certificate</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">PDF or Image (.pdf, .jpg, .png)</p>
                </div>

                {certFileName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <Check className="h-3 w-3" /> {certFileName}
                  </span>
                ) : uploadingState.cert ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-600 text-xs font-bold cursor-wait">
                    Uploading...
                  </span>
                ) : (
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--t10-emerald)] text-white text-xs font-bold cursor-pointer hover:bg-[color:var(--t10-green)] transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload Certificate
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleCertFile} className="hidden" />
                  </label>
                )}
              </div>
              
              {/* Emirates ID Box */}
              <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center space-y-2">
                <Award className="h-7 w-7 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">Emirates ID (Required)</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">PDF or Image (.pdf, .jpg, .png)</p>
                </div>

                {emiratesIdFileName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <Check className="h-3 w-3" /> {emiratesIdFileName}
                  </span>
                ) : uploadingState.emiratesId ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-600 text-xs font-bold cursor-wait">
                    Uploading...
                  </span>
                ) : (
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-bold cursor-pointer hover:bg-orange-700 transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload ID
                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleEmiratesIdFile} className="hidden" />
                  </label>
                )}
              </div>

              {/* Experience Letter Box */}
              <div className="rounded-xl border border-dashed border-neutral-300 p-4 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-all flex flex-col items-center justify-center space-y-2">
                <FileText className="h-7 w-7 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-neutral-900">Experience Letter (Optional)</p>
                  <p className="text-[10px] text-neutral-500 mt-0.5">PDF or Word (.pdf, .docx)</p>
                </div>

                {expLetterFileName ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <Check className="h-3 w-3" /> {expLetterFileName}
                  </span>
                ) : uploadingState.expLetter ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-200 text-neutral-600 text-xs font-bold cursor-wait">
                    Uploading...
                  </span>
                ) : (
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[color:var(--t10-navy)] text-white text-xs font-bold cursor-pointer hover:bg-neutral-800 transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Upload Letter
                    <input type="file" accept=".pdf,.docx" onChange={handleExpLetterFile} className="hidden" />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* 3. WordPress-Style Color Scheme Picker */}
          <ColorSchemePicker
            title="Consultant Presentation & Workspace Theme"
            subtitle="Select your preferred color scheme for how your profile and consultant panel look."
          />
        </div>

        {/* Right Column: Live Public Profile Card Preview */}
        <div className="space-y-4">
          <div className="sticky top-20 bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[color:var(--t10-navy)] flex items-center gap-1.5">
                <Eye className="h-4 w-4 text-[color:var(--t10-emerald)]" /> Live Client View Preview
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Marketplace View
              </span>
            </div>

            {/* Public Advisor Card Component Mock */}
            <div className="rounded-2xl border border-[color:var(--t10-border)] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[color:var(--t10-navy)] text-sm font-bold text-white uppercase overflow-hidden border border-neutral-200 shadow-xs">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      displayName.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[color:var(--t10-navy)]">{displayName}</h4>
                    <p className="text-[11px] text-[color:var(--t10-grey)]">{title || "Business Advisor"}</p>
                  </div>
                </div>

                <span className="rounded-full bg-[color:var(--t10-mint)] px-2.5 py-1 text-[10px] font-bold text-[color:var(--t10-navy)]">
                  {pricePlaceholder}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-[color:var(--t10-grey)] line-clamp-3">
                {bio || "Your professional bio will appear here to clients looking for expert business advice."}
              </p>

              <div className="flex flex-wrap gap-1">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[color:var(--t10-mint)] px-2 py-0.5 text-[9px] font-semibold text-[color:var(--t10-navy)]"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="border-t border-[color:var(--t10-border)] pt-3 flex items-center justify-between text-[11px] text-[color:var(--t10-grey)]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--t10-emerald)]" /> Verified Advisor
                </span>
                <span>{experienceYears} Yrs Exp</span>
              </div>

              <button className="w-full rounded-xl bg-[color:var(--t10-navy)] py-2.5 text-center text-xs font-bold text-white hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer">
                Schedule Session (1 Credit)
              </button>
            </div>

            <p className="text-[10px] text-neutral-400 text-center">
              Changes updated live as you edit your details and select themes.
            </p>
          </div>
        </div>
      </div>
      <AvatarCropperModal 
        isOpen={cropperOpen}
        onClose={() => setCropperOpen(false)}
        imageSrc={tempImageSrc}
        onCropComplete={(croppedBase64) => setAvatarUrl(croppedBase64)}
      />
    </div>
  );
}
