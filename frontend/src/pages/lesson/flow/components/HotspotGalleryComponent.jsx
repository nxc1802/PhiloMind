import React, { useState } from "react";
import { ComponentFrame } from "./ComponentFrame";
import { ComponentImage, firstImageAsset } from "./ComponentImage";
import { ContinueButton } from "./ContinueButton";

export function HotspotGalleryComponent({ component, onComplete }) {
  const { items = [], summary, instruction } = component.config || {};
  const [visited, setVisited] = useState([]);
  const [activeId, setActiveId] = useState(items[0]?.id || null);
  const active = items.find((item) => item.id === activeId) || items[0];
  const complete = items.length > 0 && visited.length === items.length;

  const openItem = (id) => {
    setActiveId(id);
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <ComponentFrame component={component}>
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex min-h-0 flex-col">
          <p className="mb-3 shrink-0 text-sm font-semibold leading-6 text-slate-700 dark:text-primary-150">
            {instruction || "Chọn từng nhân vật/vật thể để mở nội dung."}
          </p>
          <div className="grid min-h-0 flex-1 auto-rows-fr grid-cols-2 gap-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const isActive = item.id === active?.id;
              const isVisited = visited.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openItem(item.id)}
                  className={`overflow-hidden rounded-3xl border text-left transition-all ${
                    isActive
                      ? "border-primary-400 bg-primary-50 shadow-sm dark:bg-primary-900/35"
                      : isVisited
                        ? "border-green-200 bg-green-50 dark:border-green-800/40 dark:bg-green-950/20"
                        : "border-slate-200 bg-white hover:border-primary-300 dark:border-primary-850 dark:bg-[#102733]"
                  }`}
                >
                  <div className="aspect-[4/3] bg-slate-100 dark:bg-primary-950/30">
                    {firstImageAsset(
                      [item.image, item.imageUrl, item.media],
                      item.title || item.label,
                    ) ? (
                      <ComponentImage
                        image={firstImageAsset(
                          [item.image, item.imageUrl, item.media],
                          item.title || item.label,
                        )}
                        alt={item.title || item.label}
                        caption={false}
                        className="h-full rounded-none border-0"
                        imageClassName="h-full w-full"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-primary-500">
                          {item.icon || "person_search"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-extrabold leading-tight text-primary-900 dark:text-primary-100">
                      {item.title || item.label}
                    </p>
                    {item.subtitle && (
                      <p className="mt-1 text-[11px] font-semibold text-slate-500 dark:text-primary-350">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-primary-850/50 dark:bg-[#102733]">
          {active ? (
            <>
              <p className="text-xl font-extrabold text-primary-900 dark:text-primary-100">
                {active.title || active.label}
              </p>
              {active.subtitle && (
                <p className="mt-1 text-sm font-bold text-primary-650 dark:text-primary-300">
                  {active.subtitle}
                </p>
              )}
              <ComponentImage
                image={firstImageAsset(
                  [active.image, active.imageUrl, active.media],
                  active.title || active.label,
                )}
                alt={active.title || active.label}
                fit="contain"
                className="mt-4 max-h-72"
                imageClassName="max-h-72"
              />
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700 dark:bg-primary-950/25 dark:text-primary-150">
                {active.detail || active.summary || "Chưa có nội dung chi tiết."}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500 dark:text-primary-300">
              Chưa có mục tương tác.
            </p>
          )}

          {complete && (
            <div className="mt-4 rounded-3xl border border-green-200 bg-green-50 p-4 text-green-950 dark:border-green-800 dark:bg-green-950/35 dark:text-green-100">
              <p className="flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined">task_alt</span>
                Đã khám phá đủ các điểm.
              </p>
              {summary && <p className="mt-1 text-sm leading-6">{summary}</p>}
              <ContinueButton
                onComplete={() =>
                  onComplete({
                    score: 100,
                    answer: visited,
                    status: "completed",
                  })
                }
                label="Tiếp tục"
              />
            </div>
          )}
        </div>
      </div>
    </ComponentFrame>
  );
}
