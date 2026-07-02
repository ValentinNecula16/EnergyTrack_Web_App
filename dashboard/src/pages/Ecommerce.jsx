import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  BsLightningChargeFill,
  BsCurrencyDollar,
  BsDeviceSsd,
  BsCheckCircleFill,
  BsDownload,
} from "react-icons/bs";
import DashboardSkeleton from "../components/DashboardSkeleton";
import useCountUp from "../hooks/useCountUp";
import PageWrapper from "../components/PageWrapper";
import { FaFire, FaLeaf } from "react-icons/fa";
import { generateInvoicePDF } from "../services/pdfService";
import { MdTrendingUp } from "react-icons/md";
import {
  registerServiceWorker,
  notifyOverTarget,
  notifyApproachingTarget,
  notifyPredictionOver,
} from "../services/notificationService";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useStateContext } from "../contexts/ContextProvider";
import { Header } from "../components";

const Ecommerce = () => {
  const { currentColor, currentMode, userData, appSettings } =
    useStateContext();
  const { t } = useTranslation();

  const [dashboardData, setDashboardData] = useState(null);
  const [lastMonthData, setLastMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const notifiedRef = useRef({ overTarget: false, approaching: false, prediction: false });

  const today = new Date().getDate();
  const isBillingPeriod = today >= 20 && today <= 25;

  const fetchDashboardData = async () => {
    if (!userData?.id) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/devices/dashboard/${userData.id}?t=${new Date().getTime()}`,
      );
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setLastUpdate(new Date());
        checkAndNotify(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndNotify = (data) => {
    const settings = JSON.parse(localStorage.getItem("energytrack_settings") || "{}");
    if (!settings.notificationsEnabled || Notification.permission !== "granted") return;

    const target = settings.monthlyTarget || appSettings.monthlyTarget;
    const price = settings.pricePerKwh || appSettings.pricePerKwh;
    const currency = settings.currency || appSettings.currency;
    const kwh = data?.totalKwh || 0;
    const cost = data?.totalCost || 0;
    const percent = (kwh / target) * 100;

    if (settings.notifyOverTarget && percent >= 100 && !notifiedRef.current.overTarget) {
      notifiedRef.current.overTarget = true;
      notifyOverTarget(kwh, target, currency, cost.toFixed(2));
    }
    if (settings.notifyHighConsumption && percent >= 80 && percent < 100 && !notifiedRef.current.approaching) {
      notifiedRef.current.approaching = true;
      notifyApproachingTarget(kwh, target, percent);
    }

    // Prediction check
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysElapsed = now.getDate();
    if (daysElapsed > 0) {
      const predicted = (kwh / daysElapsed) * daysInMonth;
      if (settings.notifyOverTarget && predicted > target && !notifiedRef.current.prediction) {
        notifiedRef.current.prediction = true;
        notifyPredictionOver(predicted, target, currency, (predicted * price).toFixed(2));
      }
    }
  };

  useEffect(() => {
    if (Notification.permission === "granted") registerServiceWorker();
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [userData]);

  useEffect(() => {
    const fetchLastMonth = async () => {
      if (!userData?.id) return;
      const now = new Date();
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      try {
        const res = await fetch(
          `http://localhost:8080/api/history/${userData.id}?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}`,
        );
        if (res.ok) setLastMonthData(await res.json());
      } catch (e) {
        console.error("Error fetching last month data:", e);
      }
    };
    fetchLastMonth();
  }, [userData]);

  const handleDownloadPDF = () => {
    if (!dashboardData) {
      alert(t("dashboard.loadingWait"));
      return;
    }
    try {
      generateInvoicePDF(dashboardData, userData);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(t("dashboard.errorGenerating"));
    }
  };

  const preparePieChartData = () => {
    if (
      !dashboardData?.deviceBreakdown ||
      dashboardData.deviceBreakdown.length === 0
    )
      return [];
    const allDevices = dashboardData.deviceBreakdown;
    const TOP_COUNT = 7;
    const sortedDevices = [...allDevices].sort((a, b) => b.kwh - a.kwh);
    const topDevices = sortedDevices.slice(0, TOP_COUNT);
    const otherDevices = sortedDevices.slice(TOP_COUNT);
    const othersTotal = otherDevices.reduce(
      (sum, device) => sum + device.kwh,
      0,
    );
    const othersPercentage = otherDevices.reduce(
      (sum, device) => sum + device.percentage,
      0,
    );
    const chartData = topDevices.map((device) => ({
      name: device.name,
      value: device.kwh,
      percentage: device.percentage,
    }));
    if (otherDevices.length > 0) {
      chartData.push({
        name: `Others (${otherDevices.length} devices)`,
        value: othersTotal,
        percentage: othersPercentage,
      });
    }
    return chartData;
  };

  const pieChartData = preparePieChartData();
  const COLORS = [
    "#7FFF7F",
    "#00FF87",
    "#00E676",
    "#00D97E",
    "#00C774",
    "#00B569",
    "#009153",
    "#707070",
  ];

  const monthlyTarget = appSettings.monthlyTarget;
  const currentKwh = dashboardData?.totalKwh || 0;
  const progressPercent = Math.min((currentKwh / monthlyTarget) * 100, 100);
  const isOverBudget = currentKwh > monthlyTarget;

  // ─── COUNT-UP HOOKS ──────────────────────────────────────────────
  const animatedKwh = useCountUp(dashboardData?.totalKwh ?? null, 1200, 2);
  const animatedCost = useCountUp(dashboardData?.totalCost ?? null, 1200, 2);
  const animatedDevices = useCountUp(
    dashboardData?.activeDevices ?? null,
    800,
    0,
  );
  const animatedProgress = useCountUp(progressPercent, 1000, 1);
  const animatedTopKwh = useCountUp(
    dashboardData?.topConsumer?.kwh ?? null,
    1200,
    2,
  );
  // ────────────────────────────────────────────────────────────────

  // ─── TREND vs LAST MONTH ────────────────────────────────────────
  const calcTrend = (current, previous) =>
    previous && previous > 0 ? ((current - previous) / previous) * 100 : null;

  const trendKwh = calcTrend(dashboardData?.totalKwh, lastMonthData?.totalKwh);
  const trendCost = calcTrend(
    dashboardData?.totalCost,
    lastMonthData ? lastMonthData.totalKwh * appSettings.pricePerKwh : null,
  );

  const TrendBadge = ({ value, label = "vs last month" }) => {
    if (value === null || value === undefined) return null;
    const abs = Math.abs(value);
    if (abs < 0.5)
      return <span className="text-xs text-[#707070]">→ stable {label}</span>;
    const isUp = value > 0;
    const color = isUp ? "#FF4444" : "#00FF87";
    return (
      <span className="text-xs font-semibold" style={{ color }}>
        {isUp ? "↑" : "↓"} {abs.toFixed(1)}% {label}
      </span>
    );
  };

  // ─── PREDICTION END-OF-MONTH ─────────────────────────────────────
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed;
  const dailyRate = daysElapsed > 0 ? (dashboardData?.totalKwh || 0) / daysElapsed : 0;
  const predictedKwh = parseFloat((dailyRate * daysInMonth).toFixed(2));
  const predictedCost = parseFloat((predictedKwh * appSettings.pricePerKwh).toFixed(2));
  const predictedOverTarget = predictedKwh > appSettings.monthlyTarget;
  const predictedDiff = (predictedKwh - appSettings.monthlyTarget).toFixed(1);
  // ────────────────────────────────────────────────────────────────

  if (loading) return <DashboardSkeleton />;

  return (
    <PageWrapper>
      <div className="mt-24 px-2 md:px-6 bg-[#0F0F0F] min-h-screen">
        {/* HEADER */}
        <div className="mb-8 bg-gradient-to-r from-[#1A1A1A] via-[#1E1E1E] to-[#1A1A1A] rounded-2xl p-8 text-white shadow-2xl border border-[#2A2A2A]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BsLightningChargeFill className="text-3xl text-[#00FF87]" />
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {t("dashboard.title")}
                </h1>
              </div>
              <p className="text-lg text-[#A0A0A0]">
                {t("dashboard.welcome")},{" "}
                <span className="font-semibold text-white">
                  {userData?.fullName || "User"}
                </span>
                !
              </p>
              <p className="text-sm text-[#707070] mt-1">
                {t("dashboard.lastUpdated")}: {lastUpdate.toLocaleTimeString()}{" "}
                • {lastUpdate.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#1E1E1E] backdrop-blur-sm rounded-xl px-6 py-3 border border-[#2A2A2A]">
                <p className="text-sm text-[#A0A0A0]">
                  {t("dashboard.currentMonth")}
                </p>
                <p className="text-2xl font-bold text-white">
                  {new Date().toLocaleString("default", { month: "long" })}
                </p>
              </div>
              {isBillingPeriod && (
                <div className="bg-[#00FF87] px-4 py-2 rounded-lg font-semibold text-sm text-black animate-pulse">
                  📄 {t("dashboard.invoiceReady")}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Energy Consumption */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-all hover:-translate-y-1 border border-[#2A2A2A]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#A0A0A0] text-sm font-semibold mb-2">
                  {t("dashboard.totalConsumption")}
                </p>
                <h3 className="text-3xl font-bold text-[#00FF87]">
                  {animatedKwh}
                  <span className="text-lg ml-1">kWh</span>
                </h3>
                <div className="flex items-center mt-2 gap-1">
                  {trendKwh !== null ? (
                    <TrendBadge value={trendKwh} />
                  ) : (
                    <>
                      <MdTrendingUp className="text-[#00FF87] mr-1" />
                      <span className="text-xs text-[#00FF87]">
                        {t("dashboard.thisMonth")}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="bg-[#00FF8720] p-3 rounded-full">
                <BsLightningChargeFill className="text-2xl text-[#00FF87]" />
              </div>
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-all hover:-translate-y-1 border border-[#2A2A2A]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#A0A0A0] text-sm font-semibold mb-2">
                  {t("dashboard.estimatedCost")}
                </p>
                <h3 className="text-3xl font-bold text-[#00FF87]">
                  {animatedCost}
                  <span className="text-lg ml-1">{appSettings.currency}</span>
                </h3>
                <div className="flex items-center mt-2 gap-1">
                  {trendCost !== null ? (
                    <TrendBadge value={trendCost} />
                  ) : (
                    <span className="text-xs text-[#707070]">
                      {appSettings.pricePerKwh} {appSettings.currency}/kWh
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-[#00FF8720] p-3 rounded-full">
                <BsCurrencyDollar className="text-2xl text-[#00FF87]" />
              </div>
            </div>
          </div>

          {/* Active Devices */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-all hover:-translate-y-1 border border-[#2A2A2A]">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[#A0A0A0] text-sm font-semibold mb-2">
                  {t("dashboard.activeDevices")}
                </p>
                <h3 className="text-3xl font-bold text-[#00FF87]">
                  {animatedDevices}
                  <span className="text-lg ml-1 text-[#707070]">
                    / {dashboardData?.totalDevices || 0}
                  </span>
                </h3>
                <div className="flex items-center mt-2">
                  <span className="text-xs text-[#707070]">
                    {t("dashboard.currentlyRunning")}
                  </span>
                </div>
              </div>
              <div className="bg-[#00FF8720] p-3 rounded-full">
                <BsDeviceSsd className="text-2xl text-[#00FF87]" />
              </div>
            </div>
          </div>

          {/* Download Invoice */}
          <div
            className="bg-gradient-to-br from-[#00FF87] to-[#00D97E] rounded-2xl p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,135,0.5)] transition-all hover:-translate-y-1 cursor-pointer group"
            onClick={handleDownloadPDF}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-black text-sm font-semibold mb-2">
                  {t("dashboard.monthlyInvoice")}
                </p>
                <h3 className="text-2xl font-bold text-black mb-2">
                  {t("dashboard.downloadPdf")}
                </h3>
                <div className="flex items-center">
                  <span className="text-xs text-black opacity-80">
                    {t("dashboard.clickToGenerate")}
                  </span>
                </div>
              </div>
              <div className="bg-black bg-opacity-20 p-3 rounded-full group-hover:scale-110 transition-transform">
                <BsDownload className="text-2xl text-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Target Progress */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl mb-8 border border-[#2A2A2A]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">
                {t("dashboard.monthlyTarget")}
              </h3>
              <p className="text-sm text-[#A0A0A0] mt-1">
                {t("dashboard.target")}: {monthlyTarget} kWh |{" "}
                {t("dashboard.current")}: {currentKwh.toFixed(2)} kWh
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#00FF87]">
                {animatedProgress}%
              </p>
              <p
                className={`text-sm font-semibold ${isOverBudget ? "text-red-500" : "text-[#00FF87]"}`}
              >
                {isOverBudget
                  ? `+${(currentKwh - monthlyTarget).toFixed(1)} kWh ${t("dashboard.over")}`
                  : `${(monthlyTarget - currentKwh).toFixed(1)} kWh ${t("dashboard.remaining")}`}
              </p>
            </div>
          </div>
          <div className="relative w-full h-6 bg-[#1E1E1E] rounded-full overflow-hidden border border-[#2A2A2A]">
            <div
              className="absolute top-0 left-0 h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(progressPercent, 100)}%`,
                background: isOverBudget
                  ? "linear-gradient(90deg, #FCA5A5 0%, #EF4444 50%, #B91C1C 100%)"
                  : progressPercent > 80
                    ? "linear-gradient(90deg, #FDE047 0%, #FB923C 50%, #EA580C 100%)"
                    : "linear-gradient(90deg, #CCFFCC 0%, #7FFF7F 20%, #00FF87 50%, #00D97E 70%, #007F48 100%)",
              }}
            >
              <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentKwh.toFixed(1)} / {monthlyTarget} kWh
              </span>
            </div>
          </div>

          {/* Prediction row */}
          {daysElapsed > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-4 border-t border-[#2A2A2A]">
              <div className="flex items-center gap-2">
                <span className="text-lg">📈</span>
                <div>
                  <p className="text-xs text-[#707070]">
                    {t("dashboard.predictionLabel") || "End-of-month prediction"} · {daysRemaining} {t("dashboard.daysLeft") || "days remaining"}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    ~{predictedKwh} kWh &nbsp;·&nbsp; ~{predictedCost} {appSettings.currency}
                  </p>
                </div>
              </div>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full"
                style={
                  predictedOverTarget
                    ? { backgroundColor: "rgba(239,68,68,0.15)", color: "#FF4444", border: "1px solid rgba(239,68,68,0.3)" }
                    : { backgroundColor: "rgba(0,255,135,0.12)", color: "#00FF87", border: "1px solid rgba(0,255,135,0.3)" }
                }
              >
                {predictedOverTarget
                  ? `⚠ +${predictedDiff} kWh over target`
                  : `✓ ${Math.abs(Number(predictedDiff))} kWh under target`}
              </span>
            </div>
          )}
        </div>

        {/* Second Row: Top Consumer + Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Consumer */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {t("dashboard.topConsumer")}
              </h3>
              <FaFire className="text-3xl text-orange-500" />
            </div>
            {dashboardData?.topConsumer ? (
              <div className="text-center py-8">
                <div className="bg-gradient-to-br from-[#00FF8730] to-[#00D97E30] rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4 border-2 border-[#00FF87]">
                  <BsLightningChargeFill className="text-4xl text-[#00FF87]" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">
                  {dashboardData.topConsumer.name}
                </h4>
                <p className="text-4xl font-bold mb-2 text-[#00FF87]">
                  {animatedTopKwh}
                  <span className="text-lg ml-1">kWh</span>
                </p>
                <p className="text-sm text-[#A0A0A0]">
                  {(
                    (dashboardData.topConsumer.kwh / dashboardData.totalKwh) *
                    100
                  ).toFixed(1)}
                  % {t("dashboard.ofTotal")}
                </p>
                <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                  <p className="text-xs text-[#707070]">{t("dashboard.tip")}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-[#707070]">
                <p>{t("dashboard.noConsumption")}</p>
              </div>
            )}
          </div>

          {/* Consumption Distribution Pie Chart */}
          <div className="lg:col-span-2 bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {t("dashboard.consumptionDistribution")}
                </h3>
                <p className="text-xs text-[#A0A0A0] mt-1">
                  {t("dashboard.top7devices")}
                </p>
              </div>
              <FaLeaf className="text-3xl text-[#00FF87]" />
            </div>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [
                      `${value.toFixed(2)} kWh (${props.payload.percentage.toFixed(1)}%)`,
                      props.payload.name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
                      padding: "12px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={60}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px", color: "#FFFFFF" }}
                    formatter={(value, entry) => {
                      const shortName =
                        value.length > 20
                          ? value.substring(0, 17) + "..."
                          : value;
                      return (
                        <span style={{ color: "#A0A0A0" }}>
                          {shortName}: {entry.payload.percentage.toFixed(1)}%
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-[#707070]">
                <p>No device data to display</p>
              </div>
            )}
          </div>
        </div>

        {/* Device Status List */}
        <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl border border-[#2A2A2A]">
          <h3 className="text-xl font-bold text-white mb-6">
            {t("dashboard.deviceStatus")}
          </h3>
          {dashboardData?.deviceBreakdown &&
          dashboardData.deviceBreakdown.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.deviceBreakdown
                .slice(0, 6)
                .map((device, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-[#1E1E1E] rounded-xl hover:shadow-[0_0_20px_rgba(0,255,135,0.2)] transition-shadow border border-[#2A2A2A]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <div>
                        <p className="font-semibold text-white">
                          {device.name}
                        </p>
                        <p className="text-xs text-[#A0A0A0]">
                          {device.kwh.toFixed(2)} kWh
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#00FF87]">
                        {device.percentage.toFixed(1)}%
                      </p>
                      <BsCheckCircleFill className="text-[#00FF87] ml-auto mt-1" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#707070]">
              <BsDeviceSsd className="text-5xl mx-auto mb-4 opacity-50" />
              <p>{t("dashboard.noDevices")}</p>
              <p className="text-sm mt-2">{t("dashboard.addDevices")}</p>
            </div>
          )}
          {dashboardData?.deviceBreakdown &&
            dashboardData.deviceBreakdown.length > 6 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => (window.location.href = "/devices")}
                  className="text-sm font-semibold hover:underline text-[#00FF87]"
                >
                  {t("dashboard.viewAll")} {dashboardData.totalDevices}{" "}
                  {t("dashboard.devices")} →
                </button>
              </div>
            )}
        </div>

        {/* Tips & Insights */}
        <div className="mt-8 bg-gradient-to-r from-[#1A1A1A] to-[#1E1E1E] rounded-2xl p-6 text-white shadow-2xl border border-[#2A2A2A]">
          <h3 className="text-xl font-bold mb-4">
            💡 {t("dashboard.energySavingTips")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#00FF87] transition-colors">
              <p className="font-semibold mb-2 text-[#00FF87]">
                🌙 {t("dashboard.nightMode")}
              </p>
              <p className="text-sm text-[#A0A0A0]">
                {t("dashboard.nightModeDesc")}
              </p>
            </div>
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#00FF87] transition-colors">
              <p className="font-semibold mb-2 text-[#00FF87]">
                ⚡ {t("dashboard.smartUsage")}
              </p>
              <p className="text-sm text-[#A0A0A0]">
                {t("dashboard.topConsumerUsage")}{" "}
                {(
                  ((dashboardData?.topConsumer?.kwh || 0) /
                    (dashboardData?.totalKwh || 1)) *
                  100
                ).toFixed(0)}
                {t("dashboard.percentTotal")}
              </p>
            </div>
            <div className="bg-[#1E1E1E] rounded-lg p-4 border border-[#2A2A2A] hover:border-[#00FF87] transition-colors">
              <p className="font-semibold mb-2 text-[#00FF87]">
                📊 {t("dashboard.thisMonthLabel")}
              </p>
              <p className="text-sm text-[#A0A0A0]">
                {isOverBudget
                  ? `${(currentKwh - monthlyTarget).toFixed(1)} kWh ${t("dashboard.overBudget")}`
                  : `${(monthlyTarget - currentKwh).toFixed(1)} kWh ${t("dashboard.underBudget")}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Ecommerce;
