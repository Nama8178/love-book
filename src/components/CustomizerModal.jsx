import React, { useState } from 'react';
import { X, Save, RotateCcw, Upload, Heart, Sparkles, Image, Check } from 'lucide-react';
import { soundEngine } from '../utils/audio';

export default function CustomizerModal({ isOpen, onClose, storyData, onSave, onReset }) {
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(storyData)));
  const [activeTab, setActiveTab] = useState('couple');
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleCoupleChange = (field, val) => {
    setFormData((prev) => ({
      ...prev,
      couple: {
        ...prev.couple,
        [field]: val,
      },
    }));
  };

  const handleFileUpload = (chapterIdx, photoKey, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Url = uploadEvent.target.result;
      setFormData((prev) => {
        const updatedPages = [...prev.pages];
        if (updatedPages[chapterIdx] && updatedPages[chapterIdx][photoKey]) {
          updatedPages[chapterIdx][photoKey] = {
            ...updatedPages[chapterIdx][photoKey],
            url: base64Url,
          };
        }
        return { ...prev, pages: updatedPages };
      });
      soundEngine.playSparkle();
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUrlChange = (chapterIdx, photoKey, url) => {
    setFormData((prev) => {
      const updatedPages = [...prev.pages];
      if (updatedPages[chapterIdx] && updatedPages[chapterIdx][photoKey]) {
        updatedPages[chapterIdx][photoKey] = {
          ...updatedPages[chapterIdx][photoKey],
          url,
        };
      }
      return { ...prev, pages: updatedPages };
    });
  };

  const handleCaptionChange = (chapterIdx, photoKey, caption) => {
    setFormData((prev) => {
      const updatedPages = [...prev.pages];
      if (updatedPages[chapterIdx] && updatedPages[chapterIdx][photoKey]) {
        updatedPages[chapterIdx][photoKey] = {
          ...updatedPages[chapterIdx][photoKey],
          caption,
        };
      }
      return { ...prev, pages: updatedPages };
    });
  };

  const handleStoryChange = (chapterIdx, field, val) => {
    setFormData((prev) => {
      const updatedPages = [...prev.pages];
      if (updatedPages[chapterIdx]) {
        updatedPages[chapterIdx][field] = val;
      }
      return { ...prev, pages: updatedPages };
    });
  };

  const handleLetterChange = (field, val) => {
    setFormData((prev) => {
      const updatedPages = [...prev.pages];
      // Letter is in chapter index 4 (Chapter 05)
      if (updatedPages[4] && updatedPages[4].letter) {
        updatedPages[4].letter[field] = val;
      }
      return { ...prev, pages: updatedPages };
    });
  };

  const handleSave = () => {
    onSave(formData);
    soundEngine.playSparkle();
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    if (window.confirm("Reset all memories and photos to default?")) {
      onReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#16101c] border border-amber-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-rose-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-rose-950/60 bg-gradient-to-r from-rose-950/40 to-amber-950/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="text-rose-500 fill-rose-500/40" size={22} />
            <h2 className="font-serif text-2xl text-amber-200">Personalize Your Love Book</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-rose-300 hover:text-white rounded-lg hover:bg-rose-900/40 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-rose-900/40 bg-[#120c18] px-6 text-sm overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('couple')}
            className={`py-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'couple'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-rose-300/70 hover:text-rose-200'
            }`}
          >
            💑 Names & Anniversary
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'photos'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-rose-300/70 hover:text-rose-200'
            }`}
          >
            📸 Your Photos
          </button>
          <button
            onClick={() => setActiveTab('letter')}
            className={`py-3 px-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'letter'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-rose-300/70 hover:text-rose-200'
            }`}
          >
            💌 Secret Love Letter
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'couple' && (
            <div className="space-y-4">
              <p className="text-xs text-rose-300/70">
                Customize your names, anniversary date, and dedication text that appears on the front cover and dedication page.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                    His Name
                  </label>
                  <input
                    type="text"
                    value={formData.couple.hisName}
                    onChange={(e) => handleCoupleChange('hisName', e.target.value)}
                    className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                    Her Name
                  </label>
                  <input
                    type="text"
                    value={formData.couple.herName}
                    onChange={(e) => handleCoupleChange('herName', e.target.value)}
                    placeholder="e.g. My Princess"
                    className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={formData.couple.bookTitle}
                    onChange={(e) => handleCoupleChange('bookTitle', e.target.value)}
                    className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                    Anniversary / First Met Date
                  </label>
                  <input
                    type="date"
                    value={formData.couple.anniversaryDate}
                    onChange={(e) => handleCoupleChange('anniversaryDate', e.target.value)}
                    className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                  Book Subtitle
                </label>
                <input
                  type="text"
                  value={formData.couple.subtitle}
                  onChange={(e) => handleCoupleChange('subtitle', e.target.value)}
                  className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                  Dedication Message
                </label>
                <textarea
                  rows={3}
                  value={formData.couple.dedication}
                  onChange={(e) => handleCoupleChange('dedication', e.target.value)}
                  className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-6">
              <p className="text-xs text-rose-300/70">
                You can upload your own photos directly from your device, or paste image URLs!
              </p>

              {/* Photo 1: Chapter 1 */}
              <div className="p-4 bg-[#1b1424] rounded-xl border border-rose-900/40 space-y-3">
                <h3 className="font-semibold text-amber-300">Chapter 1 — The Day We Met (Photo 1)</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <img
                    src={formData.pages[0]?.photo1?.url}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-amber-500/30"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={formData.pages[0]?.photo1?.url}
                        onChange={(e) => handlePhotoUrlChange(0, 'photo1', e.target.value)}
                        className="flex-1 bg-[#150f1d] border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-rose-100"
                      />
                      <label className="cursor-pointer bg-rose-900/50 hover:bg-rose-800/60 border border-rose-700/50 text-rose-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap">
                        <Upload size={14} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(0, 'photo1', e)}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Photo caption"
                      value={formData.pages[0]?.photo1?.caption}
                      onChange={(e) => handleCaptionChange(0, 'photo1', e.target.value)}
                      className="w-full bg-[#150f1d] border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-rose-100"
                    />
                  </div>
                </div>
              </div>

              {/* Photo 2: Chapter 2 */}
              <div className="p-4 bg-[#1b1424] rounded-xl border border-rose-900/40 space-y-3">
                <h3 className="font-semibold text-amber-300">Chapter 2 — First Trips & Dates (Photo)</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <img
                    src={formData.pages[1]?.photo1?.url}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-amber-500/30"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={formData.pages[1]?.photo1?.url}
                        onChange={(e) => handlePhotoUrlChange(1, 'photo1', e.target.value)}
                        className="flex-1 bg-[#150f1d] border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-rose-100"
                      />
                      <label className="cursor-pointer bg-rose-900/50 hover:bg-rose-800/60 border border-rose-700/50 text-rose-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap">
                        <Upload size={14} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(1, 'photo1', e)}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Photo caption"
                      value={formData.pages[1]?.photo1?.caption}
                      onChange={(e) => handleCaptionChange(1, 'photo1', e.target.value)}
                      className="w-full bg-[#150f1d] border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-rose-100"
                    />
                  </div>
                </div>
              </div>

              {/* Photo 3: Chapter 3 Portrait */}
              <div className="p-4 bg-[#1b1424] rounded-xl border border-rose-900/40 space-y-3">
                <h3 className="font-semibold text-amber-300">Chapter 3 — Her Beautiful Portrait</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <img
                    src={formData.pages[2]?.photo1?.url}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-amber-500/30"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Image URL..."
                        value={formData.pages[2]?.photo1?.url}
                        onChange={(e) => handlePhotoUrlChange(2, 'photo1', e.target.value)}
                        className="flex-1 bg-[#150f1d] border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-rose-100"
                      />
                      <label className="cursor-pointer bg-rose-900/50 hover:bg-rose-800/60 border border-rose-700/50 text-rose-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 whitespace-nowrap">
                        <Upload size={14} /> Upload
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(2, 'photo1', e)}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      placeholder="Photo caption"
                      value={formData.pages[2]?.photo1?.caption}
                      onChange={(e) => handleCaptionChange(2, 'photo1', e.target.value)}
                      className="w-full bg-[#150f1d] border border-rose-900/60 rounded-lg px-3 py-1.5 text-xs text-rose-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'letter' && (
            <div className="space-y-4">
              <p className="text-xs text-rose-300/70">
                This letter will be placed inside the interactive envelope on Chapter 5!
              </p>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                  Salutation
                </label>
                <input
                  type="text"
                  value={formData.pages[4]?.letter?.salutation || ''}
                  onChange={(e) => handleLetterChange('salutation', e.target.value)}
                  className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                  Letter Body (Your Words to Her)
                </label>
                <textarea
                  rows={6}
                  value={formData.pages[4]?.letter?.body || ''}
                  onChange={(e) => handleLetterChange('body', e.target.value)}
                  className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                    Closing
                  </label>
                  <input
                    type="text"
                    value={formData.pages[4]?.letter?.closing || ''}
                    onChange={(e) => handleLetterChange('closing', e.target.value)}
                    className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-amber-400/90 font-semibold mb-1">
                    Signature
                  </label>
                  <input
                    type="text"
                    value={formData.pages[4]?.letter?.signature || ''}
                    onChange={(e) => handleLetterChange('signature', e.target.value)}
                    className="w-full bg-[#1e1526] border border-rose-900/60 rounded-lg px-3 py-2 text-rose-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#100a16] border-t border-rose-900/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-rose-400/80 hover:text-rose-300 transition-colors"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs rounded-lg border border-rose-900/50 hover:bg-rose-900/30 text-rose-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white shadow-glow-gold transition-all"
            >
              {saveToast ? (
                <>
                  <Check size={16} /> Saved!
                </>
              ) : (
                <>
                  <Save size={16} /> Save Memories
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
