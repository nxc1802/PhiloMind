import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect already authenticated admin users
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          navigate('/');
        }
      } catch (_) {}
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Vui lòng nhập đầy đủ email và mật khẩu', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.user.role !== 'admin') {
        showToast('Truy cập bị từ chối: Tài khoản không có quyền Admin', 'error');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      showToast('Đăng nhập thành công! Chào mừng tới PhiloMind Admin', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center relative overflow-hidden px-4">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Container */}
      <div className="w-full max-w-md z-10">
        {/* Brand / Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 shadow-lg shadow-indigo-500/30 mb-4 ring-1 ring-white/20">
            <span className="text-white text-3xl font-extrabold tracking-wider">P</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            PhiloMind Admin
          </h1>
          <p className="text-slate-400 text-sm mt-2 font-light">
            Bảng điều khiển quản trị triết học học đường
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="email">
                Email quản trị
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@philomind.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2" htmlFor="password">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none transition-all duration-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative group overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang xác thực...
                </span>
              ) : (
                'Đăng Nhập'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-slate-600 text-xs text-center mt-6">
          © 2026 PhiloMind Philosophy Sanctuary. Bản quyền được bảo lưu.
        </p>
      </div>
    </div>
  );
}
