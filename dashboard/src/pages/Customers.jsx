import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../components";
import { useStateContext } from "../contexts/ContextProvider";

const Customers = () => {
  const { userData, currentColor } = useStateContext();
  const { t } = useTranslation();

  const [devices, setDevices] = useState([]);
  const [simulationData, setSimulationData] = useState({});
  const [dailySimulatedCost, setDailySimulatedCost] = useState(0);
  const [startIndex, setStartIndex] = useState(0);
  const [currentIndex, setCurrentIndex] = useState("");
  const [calculatedConsumption, setCalculatedConsumption] = useState(0);
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [saveStatus, setSaveStatus] = useState(null); // null | "saving" | "success" | "error"

  useEffect(() => {
    if (userData && userData.id) {
      fetch(`http://localhost:8080/api/devices/user/${userData.id}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setDevices(data))
        .catch((err) => console.error(err));
    }
    loadSmartIndexData();
  }, [userData]);

  const loadSmartIndexData = () => {
    const savedStart = localStorage.getItem("meter_startIndex");
    const savedLastMonth = localStorage.getItem("meter_lastMonth");
    const currentMonth = new Date().getMonth();

    if (savedLastMonth && parseInt(savedLastMonth) !== currentMonth) {
      const lastReading = localStorage.getItem("meter_lastReading") || 0;
      setStartIndex(parseFloat(lastReading));
      localStorage.setItem("meter_startIndex", lastReading);
      localStorage.setItem("meter_lastMonth", currentMonth);
      alert(t("manualTracking.newMonthAlert"));
    } else {
      if (savedStart) setStartIndex(parseFloat(savedStart));
      else localStorage.setItem("meter_lastMonth", currentMonth);
    }
  };

  const handleSetStartIndex = () => {
    const val = parseFloat(
      prompt("Set initial Start Index (e.g., from your bill):", "0"),
    );
    if (!isNaN(val)) {
      setStartIndex(val);
      localStorage.setItem("meter_startIndex", val);
      localStorage.setItem("meter_lastMonth", new Date().getMonth());
    }
  };

  const handleCalculateIndex = () => {
    const current = parseFloat(currentIndex);
    if (!isNaN(current) && current >= startIndex) {
      const consumption = current - startIndex;
      setCalculatedConsumption(consumption);
      setCalculatedCost(consumption * 1.3);
      localStorage.setItem("meter_lastReading", current);
    } else {
      alert(t("manualTracking.smallIndexError"));
    }
  };

  const handleHoursChange = (deviceId, hours) => {
    setSimulationData({ ...simulationData, [deviceId]: hours });
  };

  const calculateDailySimulation = () => {
    let total = 0;
    devices.forEach((device) => {
      const hours = parseFloat(simulationData[device.id] || 0);
      if (hours > 0) {
        const cost = ((device.powerConsumption * hours) / 1000) * 1.3;
        total += cost;
      }
    });
    setDailySimulatedCost(total);
  };

  const handleSaveToday = async () => {
    const entries = devices
      .filter(
        (device) =>
          simulationData[device.id] !== undefined &&
          simulationData[device.id] !== "",
      )
      .map((device) => ({
        deviceId: device.id,
        hours: parseFloat(simulationData[device.id] || 0),
      }));

    if (entries.length === 0) {
      alert(t("manualTracking.noHoursError"));
      return;
    }

    setSaveStatus("saving");

    try {
      const response = await fetch(
        "http://localhost:8080/api/devices/manual-log",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entries),
        },
      );

      if (response.ok) {
        setSaveStatus("success");
        setSimulationData({});
        setDailySimulatedCost(0);
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-4 md:p-10 bg-[#0F0F0F] rounded-3xl shadow-2xl min-h-screen">
      <Header
        category={t("manualTracking.category")}
        title={t("manualTracking.title")}
      />

      {/* --- PART 1: SMART METER INDEX --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Start Index Card */}
        <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#1E1E1E] p-8 rounded-2xl border-2 border-[#00CED1] shadow-2xl hover:border-[#00FF87] hover:shadow-[0_0_40px_rgba(0,206,209,0.4)] transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00CED1] opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-[#00CED1] mb-2">
              {t("manualTracking.startIndex")}
            </h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-6xl font-bold text-white">
                {startIndex.toFixed(1)}
              </span>
              <span className="text-2xl text-[#A0A0A0]">kWh</span>
            </div>
            <p className="text-sm text-[#707070] mb-4">
              {t("manualTracking.autoUpdates")}
            </p>
            <button
              onClick={handleSetStartIndex}
              className="text-[#00FF87] hover:text-[#7FFF7F] font-semibold text-sm transition-colors flex items-center gap-2 group/btn"
            >
              <span>{t("manualTracking.editManually")}</span>
              <span className="group-hover/btn:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </div>
        </div>

        {/* Current Reading Card */}
        <div className="relative bg-gradient-to-br from-[#1A1A1A] to-[#1E1E1E] p-8 rounded-2xl border-2 border-[#00FF87] shadow-2xl hover:border-[#7FFF7F] hover:shadow-[0_0_40px_rgba(0,255,135,0.4)] transition-all overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF87] opacity-5 rounded-full -mr-16 -mt-16 group-hover:opacity-10 transition-opacity"></div>
          <div className="relative z-10">
            <h3 className="text-lg font-bold text-[#00FF87] mb-6">
              {t("manualTracking.enterCurrent")}
            </h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="e.g. 7870.5"
                className="flex-1 px-6 py-4 bg-[#0F0F0F] border-2 border-[#2A2A2A] rounded-xl text-white placeholder-[#707070] focus:outline-none focus:border-[#00FF87] focus:shadow-[0_0_20px_rgba(0,255,135,0.2)] transition-all text-lg font-bold"
                value={currentIndex}
                onChange={(e) => setCurrentIndex(e.target.value)}
              />
              <button
                onClick={handleCalculateIndex}
                className="px-8 py-4 bg-gradient-to-r from-[#00FF87] to-[#00D97E] hover:from-[#7FFF7F] hover:to-[#00FF87] text-black font-bold rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] transition-all transform hover:scale-105 active:scale-95"
              >
                {t("manualTracking.calculate")}
              </button>
            </div>

            {calculatedConsumption > 0 && (
              <div className="mt-6 bg-[#00FF8715] rounded-xl border border-[#00FF8730] p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-[#A0A0A0] mb-1">
                      {t("manualTracking.consumption")}
                    </p>
                    <p className="text-3xl font-bold text-[#00FF87]">
                      {calculatedConsumption.toFixed(2)}{" "}
                      <span className="text-lg text-[#7FFF7F]">kWh</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[#A0A0A0] mb-1">
                      {t("manualTracking.costSoFar")}
                    </p>
                    <p className="text-3xl font-bold text-[#00FF87]">
                      {calculatedCost.toFixed(2)}{" "}
                      <span className="text-lg text-[#7FFF7F]">RON</span>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PART 2: DAILY DEVICE PLANNER --- */}
      <div className="bg-[#1A1A1A] rounded-2xl p-8 shadow-2xl border border-[#2A2A2A]">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📊</span>
          <h3 className="text-2xl font-bold text-white">
            {t("manualTracking.plannerTitle")}
          </h3>
        </div>
        <p className="text-[#A0A0A0] mb-2 text-sm">
          {t("manualTracking.plannerSubtitle")}{" "}
          <strong className="text-[#00FF87]">
            {t("manualTracking.saveToday")}
          </strong>{" "}
          {t("manualTracking.savingNote").split("replace")[1] ? "" : ""}
        </p>

        {/* Info banner */}
        <div
          className="mb-6 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            backgroundColor: "rgba(0,255,135,0.07)",
            border: "1px solid rgba(0,255,135,0.2)",
          }}
        >
          <span className="text-lg">💡</span>
          <p className="text-sm text-[#A0A0A0]">
            {t("manualTracking.savingWill")}{" "}
            <span className="text-[#00FF87] font-semibold">
              {t("manualTracking.replace")}
            </span>{" "}
            {t("manualTracking.savingNote")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#2A2A2A]">
                <th className="px-6 py-4 text-left text-sm font-bold text-[#00FF87] uppercase tracking-wider">
                  {t("manualTracking.device")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-[#20B2AA] uppercase tracking-wider">
                  {t("manualTracking.power")}
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-[#7FFF7F] uppercase tracking-wider">
                  {t("manualTracking.hoursActive")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-[#00CED1] uppercase tracking-wider">
                  {t("manualTracking.estConsumption")}
                </th>
                <th className="px-6 py-4 text-right text-sm font-bold text-[#FFD700] uppercase tracking-wider">
                  {t("manualTracking.dailyCost")}
                </th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => {
                const hours = parseFloat(simulationData[device.id] || 0);
                const kwh = (device.powerConsumption * hours) / 1000;
                const cost = kwh * 1.3;
                return (
                  <tr
                    key={device.id}
                    className="border-b border-[#2A2A2A] hover:bg-[#1E1E1E] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00FF87] to-[#00D97E] flex items-center justify-center text-black font-bold group-hover:scale-110 transition-transform">
                          {device.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white text-lg">
                          {device.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#20B2AA] font-semibold text-lg">
                        {device.powerConsumption} W
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        className="w-24 px-4 py-2 bg-[#0F0F0F] border-2 border-[#2A2A2A] rounded-lg text-white text-center focus:outline-none focus:border-[#7FFF7F] focus:shadow-[0_0_15px_rgba(127,255,127,0.3)] transition-all font-semibold"
                        placeholder="0"
                        value={simulationData[device.id] || ""}
                        onChange={(e) =>
                          handleHoursChange(device.id, e.target.value)
                        }
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[#00CED1] font-bold text-lg">
                        {kwh > 0 ? `${kwh.toFixed(2)} kWh` : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[#FFD700] font-bold text-lg">
                        {cost > 0 ? `${cost.toFixed(2)} RON` : "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary + Buttons */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-8 gap-6">
          {/* Total card */}
          <div className="relative bg-gradient-to-br from-[#00FF8720] to-[#00D97E20] rounded-xl p-6 border-2 border-[#00FF87] flex-1 overflow-hidden group hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF87] opacity-10 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
            <div className="relative z-10">
              <p className="text-[#7FFF7F] text-sm font-semibold mb-1">
                {t("manualTracking.estimatedDaily")}
              </p>
              <p className="text-5xl font-bold text-white mb-2">
                {dailySimulatedCost.toFixed(2)}
                <span className="text-2xl text-[#7FFF7F] ml-2">RON</span>
              </p>
              <p className="text-xs text-[#A0A0A0]">
                {t("manualTracking.approx")}{" "}
                <span className="text-[#00FF87] font-semibold">
                  {(dailySimulatedCost * 30).toFixed(2)} RON
                </span>{" "}
                / {t("manualTracking.month")}
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={calculateDailySimulation}
              className="px-8 py-4 bg-[#1A1A1A] border-2 border-[#00FF87] hover:bg-[#00FF8715] text-[#00FF87] font-bold rounded-2xl transition-all transform hover:scale-105 text-lg"
            >
              🧮 {t("manualTracking.calculateBtn")}
            </button>

            <button
              onClick={handleSaveToday}
              disabled={saveStatus === "saving"}
              className="px-8 py-4 font-bold rounded-2xl shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-lg disabled:opacity-50"
              style={{
                background:
                  saveStatus === "success"
                    ? "linear-gradient(135deg, #00b377, #009966)"
                    : saveStatus === "error"
                      ? "linear-gradient(135deg, #FF4444, #CC0000)"
                      : "linear-gradient(135deg, #00FF87, #00D97E)",
                color: "#0d1117",
              }}
            >
              {saveStatus === "saving" && `⏳ ${t("manualTracking.saving")}`}
              {saveStatus === "success" && `✅ ${t("manualTracking.saved")}`}
              {saveStatus === "error" && `❌ ${t("manualTracking.error")}`}
              {!saveStatus && `💾 ${t("manualTracking.saveBtn")}`}
            </button>
          </div>
        </div>

        {/* Success message */}
        {saveStatus === "success" && (
          <div
            className="mt-4 p-4 rounded-xl text-center"
            style={{
              backgroundColor: "rgba(0,255,135,0.1)",
              border: "1px solid rgba(0,255,135,0.3)",
            }}
          >
            <p className="text-[#00FF87] font-semibold">
              ✅ {t("manualTracking.successMsg")}
            </p>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#1E1E1E] to-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span>💡</span>
            {t("manualTracking.tipsTitle")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[#00FF8710] rounded-lg border border-[#00FF8730] hover:border-[#00FF87] transition-colors">
              <p className="text-sm text-[#A0A0A0]">
                <span className="text-[#00FF87] font-semibold">
                  {t("manualTracking.tip1Title")}
                </span>
                {t("manualTracking.tip1Desc")}
              </p>
            </div>
            <div className="p-4 bg-[#20B2AA10] rounded-lg border border-[#20B2AA30] hover:border-[#20B2AA] transition-colors">
              <p className="text-sm text-[#A0A0A0]">
                <span className="text-[#20B2AA] font-semibold">
                  {t("manualTracking.tip2Title")}
                </span>
                {t("manualTracking.tip2Desc")}
              </p>
            </div>
            <div className="p-4 bg-[#9D4EDD10] rounded-lg border border-[#9D4EDD30] hover:border-[#9D4EDD] transition-colors">
              <p className="text-sm text-[#A0A0A0]">
                <span className="text-[#9D4EDD] font-semibold">
                  {t("manualTracking.tip3Title")}
                </span>
                {t("manualTracking.tip3Desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Customers;
