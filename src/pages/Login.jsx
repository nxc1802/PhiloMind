import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email.trim() || !form.password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }
    const result = login(form);
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
        <AuthField
          label="Mật khẩu"
          icon="lock"
          type="password"
          value={form.password}
          onChange={updateField("password")}
          placeholder="••••••••"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-800 text-white font-bold py-3 rounded-lg hover:bg-red-900 transition-colors"
        >
          Đăng nhập
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
