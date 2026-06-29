import React, { useState } from "react";
import PageShell, { PageHero } from "../components/PageShell";

import { STORAGE_KEY, DEFAULT_SETTINGS, loadSettings } from "../utils/settings";

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [savedAt, setSavedAt] = useState(null);

  const updateField = (field, value) =>
    setSettings((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSavedAt(new Date().toLocaleTimeString("vi-VN"));
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    setSavedAt(null);
  };

  return (
    <PageShell activeKey="">
      <PageHero
        eyebrow="Tài khoản"
        icon="settings"
        title="Cài đặt"
        subtitle="Tuỳ chỉnh trải nghiệm học tập của bạn. Cài đặt được lưu cục bộ trên trình duyệt."
      />

      <div className="px-6 md:px-12 py-10 max-w-3xl mx-auto space-y-6">
        {/* Account */}
        <section className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-md border border-blue-100 dark:border-slate-700/70 p-6">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">
              person
            </span>
            Hồ sơ
          </h2>
          <label className="block">
            <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 mb-1 block">
              Tên hiển thị
            </span>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => updateField("displayName", e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-blue-100 dark:border-slate-600 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-white rounded-3xl focus:border-primary-600 dark:focus:border-primary-300 outline-none"
            />
          </label>
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-md border border-blue-100 dark:border-slate-700/70 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">
              notifications
            </span>
            Thông báo
          </h2>

          <ToggleRow
            label="Nhận email nhắc nhở"
            description="Email thông báo bài học mới và lịch ôn tập"
            checked={settings.emailNotification}
            onChange={(v) => updateField("emailNotification", v)}
          />

          <label className="flex items-center justify-between gap-4 py-2">
            <div>
              <div className="font-semibold text-gray-800 dark:text-slate-100">
                Giờ nhắc học hàng ngày
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Hệ thống sẽ ping nhắc bạn vào giờ này
              </div>
            </div>
            <input
              type="time"
              value={settings.studyReminderTime}
              onChange={(e) => updateField("studyReminderTime", e.target.value)}
              className="px-3 py-2 border-2 border-blue-100 dark:border-slate-600 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-white rounded-3xl focus:border-primary-600 dark:focus:border-primary-300 outline-none"
            />
          </label>
        </section>

        {/* Playback */}
        <section className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-md border border-blue-100 dark:border-slate-700/70 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">
              play_circle
            </span>
            Phát nội dung
          </h2>

          <ToggleRow
            label="Tự động phát video"
            description="Khởi động ngay video bài học khi mở trang"
            checked={settings.autoplayVideo}
            onChange={(v) => updateField("autoplayVideo", v)}
          />

          <ToggleRow
            label="Hiện transcript podcast mặc định"
            description="Lời thoại của podcast sẽ luôn hiển thị khi mở"
            checked={settings.showTranscriptByDefault}
            onChange={(v) => updateField("showTranscriptByDefault", v)}
          />
        </section>

        {/* Study */}
        <section className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-md border border-blue-100 dark:border-slate-700/70 p-6 space-y-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-650 dark:text-primary-300">
              school
            </span>
            Tiến trình học tập
          </h2>

          <ToggleRow
            label="Mở khóa toàn bộ bài học"
            description="Mở khóa tất cả các bài học trong sơ đồ học tập theo mặc định"
            checked={settings.unlockAllLessons}
            onChange={(v) => updateField("unlockAllLessons", v)}
          />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-gray-500 dark:text-slate-400 underline hover:text-primary-650 dark:hover:text-primary-300"
          >
            Khôi phục mặc định
          </button>
          <div className="flex items-center gap-3">
            {savedAt && (
              <span className="text-sm text-green-700 flex items-center gap-1">
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
                Đã lưu lúc {savedAt}
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-3xl font-bold hover:bg-primary-700 transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// Helper row co toggle switch
function ToggleRow({ label, description, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
      <div>
        <div className="font-semibold text-gray-800 dark:text-slate-100">{label}</div>
        <div className="text-sm text-gray-500 dark:text-slate-400">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 rounded-full transition-colors ${
          checked ? "bg-primary-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white dark:bg-slate-100 shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
