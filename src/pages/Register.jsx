import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout, { AuthField } from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError("Vui lòng điền đầy đủ các trường.");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    const result = register({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast("Đăng ký thành công! Chào mừng bạn.", "success");
    navigate("/home");
  };

  return (
    <AuthLayout
      icon="person_add"
      title="Đăng ký"
      subtitle="Tạo tài khoản để bắt đầu hành trình học tập"
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-red-800 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
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
          placeholder="Tối thiểu 6 ký tự"
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
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-800 text-white font-bold py-3 rounded-lg hover:bg-red-900 transition-colors"
        >
          Tạo tài khoản
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
