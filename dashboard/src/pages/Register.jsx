import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [housingType, setHousingType] = useState("Apartment");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          phoneNumber,
          email,
          housingType,
          password,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      setError("Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(13, 17, 23, 0.7)",
    border: "1px solid rgba(0, 227, 150, 0.2)",
  };
  const handleFocus = (e) => {
    e.target.style.borderColor = "#00E396";
    e.target.style.boxShadow = "0 0 0 2px rgba(0, 227, 150, 0.15)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
    e.target.style.boxShadow = "none";
  };
  const inputClass =
    "peer w-full px-5 py-4 rounded-xl text-white placeholder-transparent focus:outline-none transition-all";
  const labelStyle = { backgroundColor: "#0d1117", color: "#8b949e" };
  const labelClass =
    "absolute left-5 -top-2.5 px-1 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:-top-2.5 peer-focus:text-xs rounded pointer-events-none";

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans py-10"
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
        className="relative p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl mx-4"
        style={{
          backgroundColor: "rgba(22, 27, 34, 0.8)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(0, 227, 150, 0.15)",
        }}
      >
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3 shadow-lg"
            style={{
              background: "rgba(0, 227, 150, 0.15)",
              border: "2px solid rgba(0, 227, 150, 0.4)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7"
              style={{ color: "#00E396" }}
            >
              <path
                fillRule="evenodd"
                d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            EnergyTrack
          </h2>
          <p
            className="mt-1 text-sm tracking-wide"
            style={{ color: "#8b949e" }}
          >
            {t("auth.createAccount")}
          </p>
        </div>

        {error && (
          <div
            className="px-4 py-3 rounded-xl mb-6 text-sm text-center animate-pulse"
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
          >
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative w-full">
              <input
                type="text"
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="John Doe"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <label
                htmlFor="fullname"
                className={labelClass}
                style={labelStyle}
              >
                {t("auth.fullName")}
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*$/.test(val) && val.length <= 10)
                    setPhoneNumber(val);
                }}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="07xxxxxxxx"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <label htmlFor="phone" className={labelClass} style={labelStyle}>
                {t("auth.phone")}
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative w-full">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                style={inputStyle}
                placeholder="name@email.com"
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <label htmlFor="email" className={labelClass} style={labelStyle}>
                {t("auth.email")}
              </label>
            </div>
            <div className="relative w-full">
              <select
                id="housing"
                value={housingType}
                onChange={(e) => setHousingType(e.target.value)}
                className={`${inputClass} cursor-pointer appearance-none`}
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option
                  value="Apartment"
                  style={{ backgroundColor: "#0d1117" }}
                >
                  {t("auth.apartment")}
                </option>
                <option value="House" style={{ backgroundColor: "#0d1117" }}>
                  {t("auth.house")}
                </option>
                <option value="Studio" style={{ backgroundColor: "#0d1117" }}>
                  {t("auth.studio")}
                </option>
                <option value="Condo" style={{ backgroundColor: "#0d1117" }}>
                  {t("auth.condo")}
                </option>
              </select>
              <label
                htmlFor="housing"
                className="absolute left-5 -top-2.5 px-1 text-xs rounded"
                style={{ backgroundColor: "#0d1117", color: "#00E396" }}
              >
                {t("auth.housingType")}
              </label>
            </div>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
              placeholder="Password"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <label htmlFor="password" className={labelClass} style={labelStyle}>
              {t("auth.password")}
            </label>
          </div>

          <div className="relative w-full">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
              placeholder="Confirm Password"
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <label
              htmlFor="confirmPassword"
              className={labelClass}
              style={labelStyle}
            >
              {t("auth.confirmPassword")}
            </label>
          </div>

          <div
            className="flex items-center text-sm mt-2"
            style={{ color: "#8b949e" }}
          >
            <label className="flex items-center cursor-pointer hover:text-white transition-colors">
              <input
                type="checkbox"
                required
                className="mr-2 rounded border-gray-600 focus:ring-0 cursor-pointer w-4 h-4"
                style={{ accentColor: "#00E396" }}
              />
              {t("auth.termsAgree")}
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-black font-bold py-4 px-6 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-95 flex justify-center items-center gap-2 mt-4 ${loading ? "opacity-70 cursor-wait" : ""}`}
            style={{
              background: "linear-gradient(135deg, #00E396, #00b377)",
              boxShadow: "0 4px 20px rgba(0, 227, 150, 0.3)",
            }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              t("auth.registerNow")
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm" style={{ color: "#8b949e" }}>
          {t("auth.hasAccount")}{" "}
          <Link
            to="/login"
            className="font-bold text-white hover:underline transition-colors"
            onMouseEnter={(e) => (e.target.style.color = "#00E396")}
            onMouseLeave={(e) => (e.target.style.color = "white")}
          >
            {t("auth.loginHere")}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
