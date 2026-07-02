import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStateContext } from "../contexts/ContextProvider";
import {
  isSupported,
  getPermission,
  requestPermission,
  registerServiceWorker,
} from "../services/notificationService";

const Settings = () => {
  const { userData, appSettings, updateSettings } = useStateContext();
  const { t } = useTranslation();
  const [settings, setSettings] = useState(appSettings);
  const [saved, setSaved] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(
    isSupported() ? getPermission() : "unsupported"
  );

  useEffect(() => {
    const savedSettings = localStorage.getItem("energytrack_settings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  const handleSave = () => {
    updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = async (key, value) => {
    if (key === "notificationsEnabled" && value === true) {
      if (browserPermission !== "granted") {
        const granted = await requestPermission();
        if (granted) {
          await registerServiceWorker();
          setBrowserPermission("granted");
        } else {
          setBrowserPermission("denied");
          return;
        }
      } else {
        await registerServiceWorker();
      }
    }
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const inputStyle = {
    backgroundColor: "#0d1117",
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

  const notificationItems = [
    {
      key: "notificationsEnabled",
      label: t("settings.enableNotifications"),
      desc: t("settings.enableNotificationsDesc"),
    },
    {
      key: "notifyOverTarget",
      label: t("settings.overTarget"),
      desc: t("settings.overTargetDesc"),
    },
    {
      key: "notifyHighConsumption",
      label: t("settings.highConsumption"),
      desc: t("settings.highConsumptionDesc"),
    },
    {
      key: "notifyDeviceIdle",
      label: t("settings.deviceIdle"),
      desc: t("settings.deviceIdleDesc"),
    },
  ];

  const accountItems = [
    { label: t("settings.name"), value: userData?.fullName || "—" },
    { label: t("settings.email"), value: userData?.email || "—" },
    {
      label: t("settings.housingType"),
      value: userData?.housingType || "Apartment",
    },
    { label: t("settings.memberSince"), value: "2025" },
  ];

  const appInfoItems = [
    { label: t("settings.version"), value: "1.0.0" },
    { label: t("settings.frontend"), value: "React + Tailwind CSS" },
    { label: t("settings.backend"), value: "Spring Boot + PostgreSQL" },
    {
      label: t("settings.aiFeatures"),
      value: "Pattern Learning, Smart Backfill",
    },
    { label: t("settings.developer"), value: "Valentin Necula", isGreen: true },
    { label: t("settings.projectType"), value: "Bachelor's Thesis" },
  ];

  return (
    <div
      className="m-4 md:m-10 mt-24 p-6 md:p-8 rounded-3xl"
      style={{
        backgroundColor: "#1a1e24",
        border: "1px solid rgba(0, 227, 150, 0.15)",
      }}
    >
      <div className="mb-8">
        <p className="text-sm" style={{ color: "#00E396" }}>
          {t("settings.category")}
        </p>
        <p className="text-2xl font-bold text-white">{t("settings.title")}</p>
        <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
          {t("settings.subtitle")}
        </p>
      </div>

      {saved && (
        <div
          className="mb-6 px-4 py-3 rounded-xl text-sm"
          style={{
            backgroundColor: "rgba(0, 227, 150, 0.15)",
            border: "1px solid rgba(0, 227, 150, 0.3)",
            color: "#00E396",
          }}
        >
          {t("settings.saved")}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Energy Settings */}
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "#21262d",
            border: "1px solid rgba(0, 227, 150, 0.1)",
          }}
        >
          <h3 className="font-bold text-white text-lg mb-1">
            {t("settings.energyConfig")}
          </h3>
          <p className="text-xs mb-6" style={{ color: "#8b949e" }}>
            {t("settings.energyConfigDesc")}
          </p>
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: "#8b949e" }}
              >
                {t("settings.monthlyTarget")}
              </label>
              <input
                type="number"
                value={settings.monthlyTarget}
                onChange={(e) =>
                  handleChange("monthlyTarget", parseFloat(e.target.value) || 0)
                }
                className="px-4 py-3 rounded-xl text-white focus:outline-none"
                style={inputStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <p className="text-xs" style={{ color: "#8b949e" }}>
                {t("settings.monthlyTargetHint")}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: "#8b949e" }}
              >
                {t("settings.pricePerKwh")}
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  step="0.01"
                  value={settings.pricePerKwh}
                  onChange={(e) =>
                    handleChange("pricePerKwh", parseFloat(e.target.value) || 0)
                  }
                  className="flex-1 px-4 py-3 rounded-xl text-white focus:outline-none"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange("currency", e.target.value)}
                  className="px-4 py-3 rounded-xl text-white focus:outline-none cursor-pointer appearance-none"
                  style={inputStyle}
                >
                  <option value="RON" style={{ backgroundColor: "#0d1117" }}>
                    RON
                  </option>
                  <option value="EUR" style={{ backgroundColor: "#0d1117" }}>
                    EUR
                  </option>
                  <option value="USD" style={{ backgroundColor: "#0d1117" }}>
                    USD
                  </option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-medium"
                style={{ color: "#8b949e" }}
              >
                {t("settings.invoiceDay")}
              </label>
              <select
                value={settings.invoiceDay}
                onChange={(e) =>
                  handleChange("invoiceDay", parseInt(e.target.value))
                }
                className="px-4 py-3 rounded-xl text-white focus:outline-none cursor-pointer appearance-none"
                style={inputStyle}
              >
                {[1, 5, 10, 15, 20, 25, 28].map((day) => (
                  <option
                    key={day}
                    value={day}
                    style={{ backgroundColor: "#0d1117" }}
                  >
                    {t("settings.invoiceDayOf")} {day}{" "}
                    {t("settings.invoiceDayOf2")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "#21262d",
            border: "1px solid rgba(0, 227, 150, 0.1)",
          }}
        >
          <h3 className="font-bold text-white text-lg mb-1">
            {t("settings.notifications")}
          </h3>
          <p className="text-xs mb-4" style={{ color: "#8b949e" }}>
            {t("settings.notificationsDesc")}
          </p>

          {/* Browser permission status banner */}
          {isSupported() && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg mb-4 text-xs font-medium"
              style={
                browserPermission === "granted"
                  ? { backgroundColor: "rgba(0,227,150,0.1)", color: "#00E396", border: "1px solid rgba(0,227,150,0.25)" }
                  : browserPermission === "denied"
                  ? { backgroundColor: "rgba(239,68,68,0.1)", color: "#FF4444", border: "1px solid rgba(239,68,68,0.25)" }
                  : { backgroundColor: "rgba(255,215,0,0.1)", color: "#FFD700", border: "1px solid rgba(255,215,0,0.25)" }
              }
            >
              <span>
                {browserPermission === "granted" && "✓ Browser notifications are enabled"}
                {browserPermission === "denied" && "✗ Browser notifications are blocked — allow them in browser settings"}
                {browserPermission === "default" && "⚠ Enable the toggle below to request notification permission"}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {notificationItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  backgroundColor: "#1a1e24",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs" style={{ color: "#8b949e" }}>
                    {item.desc}
                  </p>
                </div>
                <button
                  onClick={() => handleChange(item.key, !settings[item.key])}
                  className="relative w-12 h-6 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: settings[item.key] ? "#00E396" : "#333",
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: settings[item.key] ? "#0d1117" : "#666",
                      left: settings[item.key] ? "26px" : "2px",
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "#21262d",
            border: "1px solid rgba(0, 227, 150, 0.1)",
          }}
        >
          <h3 className="font-bold text-white text-lg mb-1">
            {t("settings.accountInfo")}
          </h3>
          <p className="text-xs mb-6" style={{ color: "#8b949e" }}>
            {t("settings.accountInfoDesc")}
          </p>
          <div className="flex flex-col gap-4">
            {accountItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-xl"
                style={{
                  backgroundColor: "#1a1e24",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="text-sm" style={{ color: "#8b949e" }}>
                  {item.label}
                </span>
                <span className="text-sm font-medium text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: "#21262d",
            border: "1px solid rgba(0, 227, 150, 0.1)",
          }}
        >
          <h3 className="font-bold text-white text-lg mb-1">
            {t("settings.aboutApp")}
          </h3>
          <p className="text-xs mb-6" style={{ color: "#8b949e" }}>
            {t("settings.aboutAppDesc")}
          </p>
          <div className="flex flex-col gap-4">
            {appInfoItems.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-xl"
                style={{
                  backgroundColor: "#1a1e24",
                  border: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span className="text-sm" style={{ color: "#8b949e" }}>
                  {item.label}
                </span>
                <span
                  className="text-sm font-medium"
                  style={{ color: item.isGreen ? "#00E396" : "white" }}
                >
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          className="px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: "linear-gradient(135deg, #00E396, #00b377)",
            color: "#0d1117",
            boxShadow: "0 4px 15px rgba(0, 227, 150, 0.3)",
          }}
        >
          {t("settings.save")}
        </button>
      </div>
    </div>
  );
};

export default Settings;
