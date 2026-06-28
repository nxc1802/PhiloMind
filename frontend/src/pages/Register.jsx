import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authReady, isAuthenticated, register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const redirectTo = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  useEffect(() => {
    if (authReady && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [authReady, isAuthenticated, navigate, redirectTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }
    if (!form.password.trim()) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận chưa khớp.");
      return;
    }
    setLoading(true);
    const result = await register({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Đăng ký thành công! Chào mừng bạn.", "success");
    navigate(redirectTo, { replace: true });
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await loginWithGoogle();
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon="person_add"
      title="Đăng ký"
      subtitle="Tạo tài khoản để bắt đầu hành trình học tập"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField
          label="Họ và tên"
          icon="badge"
          type="text"
          value={form.name}
          onChange={updateField("name")}
          placeholder="Nguyễn Văn A"
        />
        <AuthField
          label="Email"
          icon="mail"
          type="email"
          value={form.email}
          onChange={updateField("email")}
          placeholder="ban@example.com"
        />
        <AuthField
          label="Mật khẩu"
          icon="lock"
          type="password"
          value={form.password}
          onChange={updateField("password")}
          placeholder="Tạo mật khẩu"
        />
        <AuthField
          label="Xác nhận mật khẩu"
          icon="lock_reset"
          type="password"
          value={form.confirm}
          onChange={updateField("confirm")}
          placeholder="Nhập lại mật khẩu"
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-300 text-sm rounded-2xl px-3 py-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white font-bold py-3 rounded-2xl hover:bg-primary-750 transition-colors disabled:opacity-50 shadow-md animate-hover"
        >
          {loading ? "Đang xử lý..." : "Tạo tài khoản"}
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-205 dark:border-primary-850"></div>
          <span className="flex-shrink mx-4 text-gray-400 dark:text-primary-400 text-xs font-semibold uppercase">Hoặc</span>
          <div className="flex-grow border-t border-gray-205 dark:border-primary-850"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-gray-300 dark:border-primary-800 text-gray-700 dark:text-primary-100 hover:bg-gray-50 dark:hover:bg-primary-900/20 font-semibold py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.38c0,-0.37 -0.03,-0.72 -0.1,-1.02Z" fill="#4285F4" />
              <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.58c-0.92,0.62 -2.1,0.98 -3.3,0.98c-2.34,0 -4.33,-1.58 -5.04,-3.7H3v2.6C4.48,18.62 8.01,20.6 12,20.6Z" fill="#34A853" />
              <path d="M6.96,13.1c-0.18,-0.54 -0.28,-1.12 -0.28,-1.7c0,-0.58 0.1,-1.16 0.28,-1.7V7.1H3c-0.62,1.24 -0.98,2.64 -0.98,4.1s0.36,2.86 0.98,4.1l3.96,-3.2Z" fill="#FBBC05" />
              <path d="M12,6.4c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.64 14.43,3 12,3c-3.99,0 -7.52,1.98 -9,5.1l3.96,3.2C7.67,7.98 9.66,6.4 12,6.4Z" fill="#EA4335" />
            </g>
          </svg>
          Đăng ký bằng Google
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
