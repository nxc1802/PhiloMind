import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  Dumbbell,
  MessagesSquare,
  Play,
  FileText,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react";
import { SIDEBAR_NAV_ITEMS } from "../constants";
import { useAuth } from "../context/AuthContext";

// Lấy chữ cái đầu của tên để hiển thị trong avatar
const getInitials = (name) =>
  name
    ? name
        .trim()
        .split(/\s+/)
        .slice(-2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()
    : "?";

// Navbar top — gom tat ca dieu huong chinh
// Tren desktop: hien thi 6 NavLink + icon o phia phai
// Tren mobile: nut hamburger mo drawer chua cac muc sidebar
const TOP_NAV_ITEMS = [
  { to: "/",  label: "Home",   Icon: Home },
  { to: "/lessons",    label: "Lesson",      Icon: BookOpen },
  { to: "/practice",   label: "Practice",    Icon: Dumbbell },
  { to: "/debate",     label: "Debate",      Icon: MessagesSquare },
  { to: "/philosofun", label: "Philosofun",  Icon: Play },
  { to: "/docs",       label: "PDF docs",    Icon: FileText },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <header className="flex justify-between items-center w-full px-4 md:px-12 h-16 sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Hamburger — chi hien tren mobile */}
          <button
            type="button"
            aria-label="Mở menu điều hướng"
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            <Menu size={24} />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <img
              alt="Dialectic Academy Logo"
              className="h-9 w-9 md:h-10 md:w-10 object-contain rounded-md"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuDAAAQAElEQVR4AezdB5wURbrH8X/vLkkUFMVA2F1QVMw5Y845ZwkmzNkznTKLit4ZzywGVERMGF/PnDFnPXNCxKwYkbz9Vs2uCpI2THdXVf/6M83sznRXPc+3ZoepZ3p6ysSCAAIIIIAAAggggAACCCCAAAKhC4gCQPBDTIIIIIAAAggggAACCCCAAAIIiAIADwIEEEAAAQQQQAABBBBAAAEEghcwCXIEgEHgggACCCCAAAIIIIAAAggggEDIAjY3CgBWgRUBBBBAAAEEEEAAAQQQQACBcAWKmVEAKDLwDwIIIIAAAggggAACCCCAAAKiAMCbIIAAAggggAACCCCAAAIIIBAqAYvAJhzBIBBAAAEEEEAAAQQQQACBcAVsLoLeFHvNI5IARBAAAEEAAQQQQACB/gZYdSELhM0Y/kUAAQQQQAABBBBAAAEEEEAARIBBAAAHxgBrD2q3fTJf+wQkCCCAQEgCxiAmGJpRl1r9fmELZvmkm6muXcVyV1C3BvJL2PGu9DAJMZ9Ri0KvPEEJCCGAAAIIIIAAAggggEAcBMaY4l5wgzEj91xjBVgE6RN3YoGMAQQQQACBfBEpJt0Rvx1j6T3nTSmhPKAzxKRQ6Kgnneg8k6hG2LKvyAQfLFnrm5VgUO5k0t4YFc/LVVKTsSzEHEPdJI1gvR8fWGxoKZVPiYYLgBhBQQHEEAAAQQQQAABBBBAICQCv/2A55R7ZmwNXzqcZPMcC4nVq8f8lqmQPW2+z8l1VdwvMLyUvgvBaT1VOMcCnRvkbPc2XdRbVZFXAhVJKZJCwT1IpvvLyqHF8gXsOXtYvO+jLxNLWdDH8T0hm4XY0DZGE9iZKkqQf+pHJTfZMkbZxN/yiKyqJJtx0ORLXgtOPmZngRZvGPa1SHp8Zj5WYYZY1fq0x6VDvFacFLgJLxBVp20sWiVN6Z3BNFf4/fKZkMTYvBMEpJhVfcLJU6hvHqkH/2sZON7Q+u/VNWGpbYhjPT+3kcwMnJJx2uMUMvGYF8nzGrR5sXlLYJu0K8EQHXtKm6TYN+0rFrQrz7VCk/pVvxm/v9dLc3qU4WqEDPyp5h4u3l+s3jMPPZvkLxZqPD6vwkKZbdGsQ1gF5Wdz9Q5nRkx+/8CILPo7Bd1Sw2CYlQ55MjBjBstfOhS3HfGYqfqNrgFWWiOw="
            />
            <h1
              className="hidden sm:block text-xl md:text-[28px] text-[#570013] font-bold"
              style={{ fontFamily: '"Libre Caslon Text", serif' }}
            >
              Dialectic Academy
            </h1>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 lg:gap-14">
          {TOP_NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group relative transition-all duration-200 ${
                  isActive ? "text-red-800" : "text-gray-600 hover:text-red-800"
                }`
              }
            >
              <Icon size={26} strokeWidth={2.2} />
              <span className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                {label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/settings"
            aria-label="Cài đặt"
            title="Cài đặt"
            className="p-2 hover:bg-blue-100 rounded-full transition-all text-gray-600"
          >
            <SettingsIcon size={20} />
          </Link>

          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                aria-label="Tài khoản"
                className="h-9 w-9 bg-red-800 rounded-full flex items-center justify-center text-white font-bold text-sm hover:bg-red-900 transition-colors"
              >
                {getInitials(user.name)}
              </button>

              {isUserMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-50 w-60 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <span className="material-symbols-outlined text-base">
                        settings
                      </span>
                      Cài đặt
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-800 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-red-800 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-900 transition-colors whitespace-nowrap"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </header>

      {/* Mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 md:hidden"
          onClick={closeMobileMenu}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
              <h2 className="font-bold text-lg text-red-800">Menu</h2>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={closeMobileMenu}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {SIDEBAR_NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg ${
                      isActive
                        ? "bg-red-50 text-red-800 font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}

              <a
                href="https://forms.gle/9AXVDRqzcAnTbdU39"
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                <span className="material-symbols-outlined">rate_review</span>
                Thực hiện khảo sát
              </a>

              <NavLink
                to="/settings"
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg ${
                    isActive
                      ? "bg-red-50 text-red-800 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="material-symbols-outlined">settings</span>
                Cài đặt
              </NavLink>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
