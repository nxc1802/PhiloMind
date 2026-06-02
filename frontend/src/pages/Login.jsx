import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Google Callback handler
  const handleGoogleCallback = useCallback(async (response) => {
    setError("");
    setLoading(true);
    const result = await loginWithGoogle(response.credential);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Đăng nhập bằng Google thành công!", "success");
    navigate("/home");
  }, [loginWithGoogle, showToast, navigate]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          // Client ID mẫu, học viên có thể cấu hình CLIENT_ID thực tế tại đây
          client_id: "1090494488344-piqwpmvfwrmvjxwcfeny.apps.googleusercontent.com",
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "outline", size: "large", width: "350" }
        );
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleGoogleCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }
    setLoading(true);
    const result = await login(form);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Đăng nhập thành công!", "success");
    navigate("/home");
  };

  return (
    <AuthLayout
      icon="login"
      title="Đăng nhập"
      subtitle="Chào mừng trở lại với Dialectic Academy"
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-red-800 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          icon="mail"
          type="email"
          value={form.email}
          onChange={updateField("email")}
          placeholder="ban@example.com"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-800 text-white font-bold py-3 rounded-lg hover:bg-red-900 transition-colors mb-4 disabled:opacity-50"
        >
          {loading ? "Đang xử lý..." : "Đăng nhập bằng Email"}
        </button>

        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase">Hoặc</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="flex justify-center mt-2">
          <div id="google-signin-btn"></div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;
