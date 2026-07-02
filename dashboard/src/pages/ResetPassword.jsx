import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);

    try {
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        setTimeout(() => navigate("/login"), 2000);
      }, 1500);
    } catch (err) {
      setError("Failed to reset password.");
      setLoading(false);
    }
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = "#00E396";
    e.target.style.boxShadow = "0 0 0 2px rgba(0, 227, 150, 0.15)";
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
    e.target.style.boxShadow = "none";
  };

  const inputStyle = {
    backgroundColor: "rgba(13, 17, 23, 0.7)",
    border: "1px solid rgba(0, 227, 150, 0.2)",
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans"
      style={{
        background: "linear-gradient(135deg, #0a0f0d, #0d1117, #0a1210)",
      }}
    >
      <div
        className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"
        style={{ backgroundColor: "#00E396" }}
      />
      <div
        className="absolute top-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-2000"
        style={{ backgroundColor: "#00b377" }}
      />
      <div
        className="absolute -bottom-32 left-20 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"
        style={{ backgroundColor: "#00E396" }}
      />

      <div
        className="relative p-10 rounded-3xl shadow-2xl w-full max-w-md mx-4 transform transition-all hover:scale-[1.01]"
        style={{
          backgroundColor: "rgba(22, 27, 34, 0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(0, 227, 150, 0.15)",
          boxShadow: "0 0 60px rgba(0, 227, 150, 0.08)",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 shadow-lg"
            style={{
              background: "rgba(0, 227, 150, 0.15)",
              border: "2px solid rgba(0, 227, 150, 0.4)",
              boxShadow: "0 0 20px rgba(0, 227, 150, 0.2)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8"
              style={{ color: "#00E396" }}
            >
              <path
                fillRule="evenodd"
                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {t("auth.resetPassword")}
          </h2>
          <p
            className="mt-2 text-sm tracking-wide"
            style={{ color: "#8b949e" }}
          >
            {t("auth.resetDesc")}
          </p>
        </div>

        {success && (
          <div
            className="px-4 py-3 rounded-xl mb-6 text-sm text-center"
            style={{
              backgroundColor: "rgba(0, 227, 150, 0.15)",
              border: "1px solid rgba(0, 227, 150, 0.3)",
              color: "#00E396",
            }}
          >
            {t("auth.resetSuccess")}
          </div>
        )}

        {error && (
          <div
            className="px-4 py-3 rounded-xl mb-6 text-sm text-center"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        {!success && (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="peer w-full px-5 py-4 rounded-xl text-white placeholder-transparent focus:outline-none transition-all"
                style={inputStyle}
                placeholder="New Password"
                id="new-password"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <label
                htmlFor="new-password"
                className="absolute left-5 -top-2.5 px-1 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs rounded"
                style={{ backgroundColor: "#0d1117", color: "#8b949e" }}
              >
                {t("auth.newPassword")}
              </label>
            </div>

            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="peer w-full px-5 py-4 rounded-xl text-white placeholder-transparent focus:outline-none transition-all"
                style={inputStyle}
                placeholder="Confirm Password"
                id="confirm-password"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <label
                htmlFor="confirm-password"
                className="absolute left-5 -top-2.5 px-1 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs rounded"
                style={{ backgroundColor: "#0d1117", color: "#8b949e" }}
              >
                {t("auth.confirmPassword")}
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-black font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 ${
                loading ? "opacity-70 cursor-wait" : ""
              }`}
              style={{
                background: "linear-gradient(135deg, #00E396, #00b377)",
                boxShadow: "0 4px 20px rgba(0, 227, 150, 0.3)",
              }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                t("auth.resetPassword")
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center text-sm" style={{ color: "#8b949e" }}>
          {t("auth.nevermind")}{" "}
          <Link
            to="/login"
            className="font-bold text-white hover:underline transition-colors"
            onMouseEnter={(e) => (e.target.style.color = "#00E396")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            {t("auth.goBack")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
