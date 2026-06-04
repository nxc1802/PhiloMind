import React from "react";

// ============================================================================
// HINH ANH HOAT HOA cho bai hoc "Hanh trinh Khai Sang"
// Tat ca deu la SVG noi tuyen + animation bang CSS (class j-*) dinh nghia trong index.css.
// Ly do dung SVG thay vi anh/GIF ngoai mang:
//   - Khong phu thuoc mang -> chay muot khi trinh dien, khong loi 404.
//   - Nhe, sac net o moi do phan giai, animation chay bang transform (GPU) -> hieu nang cao.
//   - Ton trong prefers-reduced-motion (xem index.css) cho nguoi nhay cam voi chuyen dong.
// ============================================================================

// --- Avatar nhan vat (he thong dong vai) ---
// Moi nhan vat 1 chan dung hinh hoc co mau rieng -> nguoi hoc de phan biet ai dang noi.
export function Avatar({ id, size = 44, className = "" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    className,
    role: "img",
    "aria-hidden": true,
  };

  switch (id) {
    case "guide": // Sophia — Nguoi Khai Sang: ngon duoc tri tue
      return (
        <svg {...common}>
          <defs>
            <radialGradient id="gd-guide" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#6d28d9" />
            </radialGradient>
          </defs>
          <circle cx="32" cy="32" r="30" fill="url(#gd-guide)" />
          <g className="j-flicker" style={{ transformOrigin: "32px 30px" }}>
            <path d="M32 14c5 6 8 10 8 16a8 8 0 11-16 0c0-6 3-10 8-16z" fill="#fde68a" />
            <path d="M32 22c2.5 3 4 5.5 4 8.5a4 4 0 11-8 0c0-3 1.5-5.5 4-8.5z" fill="#fb923c" />
          </g>
          <circle cx="32" cy="48" r="6" fill="#ede9fe" />
        </svg>
      );
    case "elder": // Gia lang — rau dai
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#d97706" />
          <circle cx="32" cy="26" r="11" fill="#fde2bf" />
          <path d="M22 30c0 12 4 22 10 22s10-10 10-22c-3 4-6 5-10 5s-7-1-10-5z" fill="#f5f5f4" />
          <rect x="24" y="14" width="16" height="6" rx="3" fill="#92400e" />
          <circle cx="28" cy="26" r="1.6" fill="#1f2937" />
          <circle cx="36" cy="26" r="1.6" fill="#1f2937" />
        </svg>
      );
    case "skeptic": // Nguoi hoai nghi — dau cham hoi
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#0891b2" />
          <circle cx="32" cy="30" r="12" fill="#cffafe" />
          <circle cx="27" cy="29" r="1.8" fill="#0e7490" />
          <circle cx="37" cy="29" r="1.8" fill="#0e7490" />
          <path d="M28 35c2 1.5 6 1.5 8 0" stroke="#0e7490" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <text x="44" y="20" fontSize="18" fontWeight="700" fill="#fde047" className="j-bob">?</text>
        </svg>
      );
    case "slave": // Lao dong chan tay — mang tren vai
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#57534e" />
          <circle cx="32" cy="27" r="10" fill="#e7d3bf" />
          <path d="M16 44c4-6 10-9 16-9s12 3 16 9z" fill="#78716c" />
          <rect x="14" y="20" width="36" height="3.4" rx="1.7" fill="#451a03" transform="rotate(-12 32 22)" />
          <circle cx="29" cy="26" r="1.5" fill="#1f2937" />
          <circle cx="35" cy="26" r="1.5" fill="#1f2937" />
        </svg>
      );
    case "noble": // Quy toc / tri thuc — cuon sach + vuong mien
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#9333ea" />
          <circle cx="32" cy="28" r="11" fill="#f3e8ff" />
          <path d="M22 18l4 5 6-6 6 6 4-5v6H22z" fill="#facc15" />
          <circle cx="28" cy="28" r="1.6" fill="#4c1d95" />
          <circle cx="36" cy="28" r="1.6" fill="#4c1d95" />
          <path d="M28 33c2 1.2 6 1.2 8 0" stroke="#7e22ce" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="30" fill="#9ca3af" />
        </svg>
      );
  }
}

// --- Canh nen hoat hoa theo tung vong ---
export function SceneArt({ scene, className = "" }) {
  const wrap = `w-full h-full ${className}`;

  if (scene === "timeMachine") {
    return (
      <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Cỗ máy thời gian và bản đồ văn minh cổ đại">
        <defs>
          <radialGradient id="sky" cx="50%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#0f0a2e" />
          </radialGradient>
          <radialGradient id="portal" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="60%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="240" fill="url(#sky)" />
        {/* Sao lap lanh */}
        {[[40, 40], [90, 70], [150, 30], [330, 50], [280, 90], [360, 120], [60, 140], [200, 25]].map(
          ([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" className="j-twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          )
        )}
        {/* Cong xoay thoi gian */}
        <g style={{ transformOrigin: "200px 130px" }} className="j-spin-slow">
          <circle cx="200" cy="130" r="70" fill="url(#portal)" />
          <circle cx="200" cy="130" r="70" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="6 10" />
          <circle cx="200" cy="130" r="52" fill="none" stroke="#ddd6fe" strokeWidth="1.5" strokeDasharray="3 14" />
        </g>
        {/* Ban do van minh — 3 diem sang */}
        {[
          { x: 140, y: 130, label: "Hy Lạp" },
          { x: 200, y: 150, label: "Ấn Độ" },
          { x: 255, y: 120, label: "Trung Hoa" },
        ].map((m, i) => (
          <g key={i} className="j-pulse-soft" style={{ animationDelay: `${i * 0.6}s`, transformOrigin: `${m.x}px ${m.y}px` }}>
            <circle cx={m.x} cy={m.y} r="6" fill="#fbbf24" />
            <circle cx={m.x} cy={m.y} r="11" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
          </g>
        ))}
      </svg>
    );
  }

  if (scene === "earthquake") {
    return (
      <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Trận động đất phá hủy ngôi đền và mùa màng">
        <defs>
          <linearGradient id="eq-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#eq-sky)" />
        {/* Tia set */}
        <path className="j-flash" d="M250 10l-18 70h22l-16 80 60-100h-26l20-50z" fill="#fde047" />
        {/* Den co dai rung lac */}
        <g className="j-shake" style={{ transformOrigin: "200px 200px" }}>
          <rect x="120" y="80" width="160" height="14" fill="#e7e5e4" />
          <path d="M120 80l80 -26 80 26z" fill="#f5f5f4" />
          {[132, 168, 204, 240].map((x) => (
            <rect key={x} x={x} y="94" width="14" height="86" fill="#d6d3d1" />
          ))}
          <rect x="120" y="180" width="160" height="12" fill="#a8a29e" />
        </g>
        {/* Khe nut mat dat */}
        <rect x="0" y="200" width="400" height="40" fill="#451a03" />
        <path className="j-crack-grow" d="M150 200l16 40M250 200l-14 40M200 200l4 40" stroke="#1c1917" strokeWidth="3" fill="none" />
      </svg>
    );
  }

  if (scene === "society") {
    return (
      <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Xã hội phân chia giai cấp: lao động chân tay và tầng lớp trí thức">
        <defs>
          <linearGradient id="soc-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>
        </defs>
        <rect width="400" height="240" fill="url(#soc-sky)" />
        <circle cx="330" cy="50" r="26" fill="#fbbf24" className="j-pulse-soft" style={{ transformOrigin: "330px 50px" }} />
        <rect x="0" y="190" width="400" height="50" fill="#a16207" />
        {/* Lao dong chan tay — cuoc xuong dong */}
        <g style={{ transformOrigin: "110px 150px" }}>
          <circle cx="110" cy="120" r="14" fill="#e7d3bf" />
          <rect x="100" y="134" width="20" height="40" rx="6" fill="#78716c" />
          <g className="j-dig" style={{ transformOrigin: "120px 150px" }}>
            <rect x="118" y="120" width="5" height="50" rx="2" fill="#451a03" transform="rotate(35 120 150)" />
          </g>
        </g>
        {/* Quy toc / tri thuc — ngam sao, cuon sach */}
        <g>
          <circle cx="290" cy="118" r="14" fill="#f3e8ff" />
          <path d="M276 130h28l-4 46h-20z" fill="#9333ea" />
          <rect x="296" y="140" width="22" height="16" rx="2" fill="#facc15" className="j-bob" style={{ transformOrigin: "307px 148px" }} />
        </g>
        {/* Duong phan chia giai cap */}
        <line x1="200" y1="90" x2="200" y2="200" stroke="#92400e" strokeWidth="2" strokeDasharray="5 6" />
      </svg>
    );
  }

  // synthesis — hai nhanh hoi tu ve tam
  return (
    <svg viewBox="0 0 400 240" className={wrap} role="img" aria-label="Hai nguồn gốc hợp nhất tạo nên triết học">
      <rect width="400" height="240" fill="#1e1b4b" />
      <circle cx="200" cy="120" r="40" fill="#7c3aed" className="j-glow" style={{ transformOrigin: "200px 120px" }} />
      <line x1="80" y1="60" x2="200" y2="120" stroke="#22d3ee" strokeWidth="3" className="j-draw" />
      <line x1="320" y1="60" x2="200" y2="120" stroke="#e879f9" strokeWidth="3" className="j-draw" style={{ animationDelay: "0.4s" }} />
      <circle cx="80" cy="60" r="18" fill="#0891b2" />
      <circle cx="320" cy="60" r="18" fill="#a21caf" />
    </svg>
  );
}
