import React, { useState, useMemo } from "react";
import { useToast } from "../../../../components/Toast";
import { PieceReward } from "./AdventureCommon";

export default function ChainGame({ chain, onSuccess }) {
  const { showToast } = useToast();
  
  const shuffled = useMemo(() => {
    if (!chain?.items) return [];
    const arr = [...chain.items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [chain?.items]);

  const [placed, setPlaced] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const done = placed.length === (chain?.items?.length || 0);

  const handlePick = (item) => {
    if (done || placed.includes(item.id)) return;
    if (item.order === placed.length) {
      const next = [...placed, item.id];
      setPlaced(next);
      setWrongId(null);
      if (next.length === chain.items.length) {
        showToast(chain.successFeedback || "Ghép nối chính xác!", "success");
      }
    } else {
      setWrongId(item.id);
      showToast("Chưa đúng thứ tự — hãy bắt đầu từ nguyên nhân gốc rễ.", "warning");
      setTimeout(() => setWrongId(null), 500);
    }
  };

  const itemById = (id) => chain?.items?.find((it) => it.id === id);

  return (
    <div className="bg-white dark:bg-[#002b37] rounded-3xl shadow-md border border-gray-200 p-6 text-left animate-fadeIn">
      <h3 className="text-xl font-bold text-primary-850 dark:text-primary-100 mb-1 flex items-center gap-2">
        <span className="material-symbols-outlined">link</span>
        {chain?.title || "Lắp ráp chuỗi nhân quả"}
      </h3>
      <p className="text-sm text-gray-500 mb-4">{chain?.instruction}</p>

      <div className="space-y-2 mb-5">
        {placed.map((id, index) => {
          const item = itemById(id);
          return (
            <div key={id}>
              <div className="flex items-center gap-3 bg-green-50 border-2 border-green-400 rounded-3xl px-4 py-3 j-unlock">
                <span className="h-7 w-7 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {index + 1}
                </span>
                <span className="material-symbols-outlined text-green-700">{item?.icon || "link"}</span>
                <span className="text-sm text-green-900 font-medium">{item?.text}</span>
              </div>
              {index < (chain?.items?.length || 0) - 1 && (
                <div className="flex justify-center text-gray-300">
                  <span className="material-symbols-outlined">arrow_downward</span>
                </div>
              )}
            </div>
          );
        })}
        {done && (
          <p className="text-center text-green-700 font-semibold text-sm mt-2 j-bubble-in">
            {chain?.successFeedback}
          </p>
        )}
      </div>

      {!done && (
        <div className="grid sm:grid-cols-2 gap-3">
          {shuffled
            .filter((it) => !placed.includes(it.id))
            .map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className={`flex items-center gap-3 text-left rounded-3xl border-2 px-4 py-3 transition-all ${
                  wrongId === item.id
                    ? "border-red-500 bg-primary-50 dark:bg-primary-900/35 j-shake"
                    : "border-gray-200 bg-white dark:bg-[#002b37] hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
                }`}
              >
                <span className="material-symbols-outlined text-primary-650 dark:text-primary-300 shrink-0">{item.icon || "radio_button_unchecked"}</span>
                <span className="text-sm text-gray-800">{item.text}</span>
              </button>
            ))}
        </div>
      )}

      {done && (
        <div className="mt-5">
          <PieceReward label={chain?.reward || "MẢNH GHÉP MỚI"} onNext={onSuccess} />
        </div>
      )}
    </div>
  );
}
