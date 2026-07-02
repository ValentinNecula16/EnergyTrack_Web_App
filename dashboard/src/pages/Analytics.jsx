import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../components";
import { useStateContext } from "../contexts/ContextProvider";
import PageWrapper from "../components/PageWrapper";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  BsDownload,
  BsLightningChargeFill,
  BsGraphUpArrow,
  BsGraphDownArrow,
  BsActivity,
  BsClock,
  BsBarChart,
  BsPieChart,
} from "react-icons/bs";

const Analytics = () => {
  const { currentColor, userData, appSettings } = useStateContext();
  const { t } = useTranslation();

  const [dashboardData, setDashboardData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [lastMonthData, setLastMonthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const monthlyTarget = appSettings?.monthlyTarget || 300;
  const pricePerKwh = appSettings?.pricePerKwh || 1.3;
  const currency = appSettings?.currency || "RON";

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) return;
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      try {
        const [dashRes, histRes, lastRes] = await Promise.all([
          fetch(`http://localhost:8080/api/devices/dashboard/${userData.id}`),
          fetch(`http://localhost:8080/api/history/${userData.id}?year=${year}&month=${month}`),
          fetch(`http://localhost:8080/api/history/${userData.id}?year=${prev.getFullYear()}&month=${prev.getMonth() + 1}`),
        ]);
        if (dashRes.ok) setDashboardData(await dashRes.json());
        if (histRes.ok) setHistoryData(await histRes.json());
        if (lastRes.ok) setLastMonthData(await lastRes.json());
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData]);

  const trendData = (historyData?.dailyData || []).map((d) => ({
    day: d.day,
    consumption: parseFloat(d.kwh.toFixed(2)),
    target: parseFloat((monthlyTarget / 30).toFixed(2)),
    cost: parseFloat((d.kwh * pricePerKwh).toFixed(2)),
  }));

  const weeklyData = [1, 2, 3, 4].map((week) => {
    const start = (week - 1) * 7 + 1;
    const end = week * 7;
    const days = (historyData?.dailyData || []).filter(
      (d) => d.day >= start && d.day <= end,
    );
    const consumption = days.reduce((sum, d) => sum + d.kwh, 0);
    return {
      week: `Week ${week}`,
      consumption: parseFloat(consumption.toFixed(2)),
      cost: parseFloat((consumption * pricePerKwh).toFixed(2)),
    };
  });

  const pieData =
    dashboardData?.deviceBreakdown?.slice(0, 7).map((device) => ({
      name:
        device.name.length > 20
          ? device.name.substring(0, 20) + "..."
          : device.name,
      value: parseFloat(device.kwh.toFixed(2)),
      percentage: device.percentage,
    })) || [];

  const dailyAvgKwh = historyData?.dailyAverage ?? (dashboardData?.totalKwh ?? 0) / 30;
  const peakHoursData = Array.from({ length: 24 }, (_, i) => {
    let factor = 0.4;
    let intensity = "Low";
    if (i >= 6 && i <= 9)  { factor = 1.6; intensity = "Medium"; }
    if (i >= 10 && i <= 17) { factor = 1.2; intensity = "Medium"; }
    if (i >= 18 && i <= 22) { factor = 2.0; intensity = "High"; }
    return {
      hour: `${String(i).padStart(2, "0")}:00`,
      consumption: parseFloat(((dailyAvgKwh / 24) * factor).toFixed(3)),
      intensity,
    };
  });

  const targetPercentage = (
    ((dashboardData?.totalKwh || 84) / monthlyTarget) *
    100
  ).toFixed(1);

  const gaugeData = [
    {
      name: "Progress",
      value: parseFloat(targetPercentage),
      fill:
        parseFloat(targetPercentage) > 100
          ? "#ff4444"
          : parseFloat(targetPercentage) > 80
            ? "#ffa726"
            : "#00FF87",
    },
  ];

  const PIE_COLORS = [
    "#7FFF7F",
    "#00FF87",
    "#00E676",
    "#00D97E",
    "#00CED1",
    "#20B2AA",
    "#009153",
    "#707070",
  ];

  // ─── TREND vs LAST MONTH ─────────────────────────────────────────
  const calcTrend = (current, previous) =>
    previous && previous > 0 ? ((current - previous) / previous) * 100 : null;

  const trendKwh = calcTrend(dashboardData?.totalKwh, lastMonthData?.totalKwh);
  const trendCost = calcTrend(
    dashboardData?.totalCost,
    lastMonthData ? lastMonthData.totalKwh * pricePerKwh : null,
  );
  const trendDevices = calcTrend(historyData?.totalDevices, lastMonthData?.totalDevices);

  const TrendBadge = ({ value }) => {
    if (value === null || value === undefined) return null;
    const abs = Math.abs(value);
    if (abs < 0.5) return <span className="text-xs text-[#707070]">→ stable vs last month</span>;
    const isUp = value > 0;
    const color = isUp ? "#FF4444" : "#00FF87";
    return (
      <span className="text-xs font-semibold" style={{ color }}>
        {isUp ? "↑" : "↓"} {abs.toFixed(1)}% vs last month
      </span>
    );
  };

  // ─── PREDICTION END-OF-MONTH ──────────────────────────────────────
  const nowA = new Date();
  const daysInMonthA = new Date(nowA.getFullYear(), nowA.getMonth() + 1, 0).getDate();
  const daysElapsedA = nowA.getDate();
  const daysRemainingA = daysInMonthA - daysElapsedA;
  const dailyRateA = daysElapsedA > 0 ? (dashboardData?.totalKwh || 0) / daysElapsedA : 0;
  const predictedKwhA = parseFloat((dailyRateA * daysInMonthA).toFixed(2));
  const predictedCostA = parseFloat((predictedKwhA * pricePerKwh).toFixed(2));
  const predictedOverTargetA = predictedKwhA > monthlyTarget;
  // ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0F0F0F]">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-[#1A1A1A]"></div>
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-[#00FF87] absolute top-0 animate-pulse"></div>
        </div>
        <p className="mt-6 text-[#A0A0A0] font-semibold ml-4">
          {t("analytics.loading")}
        </p>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#0F0F0F]">
        <div className="m-2 md:m-10 mt-24 p-8 bg-[#1A1A1A] backdrop-blur-xl rounded-3xl shadow-2xl border border-[#2A2A2A]">
          <Header
            category={t("analytics.category")}
            title={t("analytics.title")}
          />

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-gradient-to-br from-[#00FF87] to-[#00D97E] rounded-2xl p-6 text-black shadow-2xl hover:shadow-[0_0_40px_rgba(0,255,135,0.6)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BsLightningChargeFill className="text-4xl opacity-80" />
                  <BsGraphUpArrow className="text-2xl opacity-60" />
                </div>
                <p className="text-sm font-semibold opacity-80 mb-2">
                  {t("analytics.totalConsumption")}
                </p>
                <h3 className="text-4xl font-bold mb-1">
                  {dashboardData?.totalKwh?.toFixed(2) || 0}
                </h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs opacity-70">{t("analytics.kwhMonth")}</p>
                  {trendKwh !== null && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.25)", color: trendKwh > 0 ? "#FF7070" : "#7FFF7F" }}>
                      {trendKwh > 0 ? "↑" : "↓"} {Math.abs(trendKwh).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-[#20B2AA] to-[#00CED1] rounded-2xl p-6 text-white shadow-2xl hover:shadow-[0_0_40px_rgba(0,206,209,0.6)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl">💰</span>
                  <BsActivity className="text-2xl opacity-60" />
                </div>
                <p className="text-sm font-semibold opacity-90 mb-2">
                  {t("analytics.totalCost")}
                </p>
                <h3 className="text-4xl font-bold mb-1">
                  {dashboardData?.totalCost?.toFixed(2) || 0}
                </h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs opacity-80">{currency} ({pricePerKwh}/kWh)</p>
                  {trendCost !== null && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.25)", color: trendCost > 0 ? "#FF7070" : "#7FFF7F" }}>
                      {trendCost > 0 ? "↑" : "↓"} {Math.abs(trendCost).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-[#9D4EDD] to-[#7B2CBF] rounded-2xl p-6 text-white shadow-2xl hover:shadow-[0_0_40px_rgba(157,78,221,0.6)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BsBarChart className="text-4xl" />
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-sm font-semibold opacity-90 mb-2">
                  {t("analytics.activeDevices")}
                </p>
                <h3 className="text-4xl font-bold mb-1">
                  {dashboardData?.activeDevices || 0}
                  <span className="text-xl opacity-60">
                    /{dashboardData?.totalDevices || 0}
                  </span>
                </h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs opacity-80">{t("analytics.currentlyRunning")}</p>
                  {trendDevices !== null && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.25)", color: trendDevices > 0 ? "#B08EFF" : "#B08EFF" }}>
                      {trendDevices > 0 ? "↑" : "↓"} {Math.abs(trendDevices).toFixed(0)} vs last month
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-[#1A1A1A] to-[#1E1E1E] rounded-2xl p-6 text-white shadow-2xl border-2 border-[#00FF87] hover:shadow-[0_0_40px_rgba(0,255,135,0.4)] transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#00FF87] opacity-5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <BsPieChart className="text-4xl text-[#00FF87]" />
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-sm font-semibold text-[#A0A0A0] mb-2">
                  {t("analytics.targetProgress")}
                </p>
                <h3 className="text-4xl font-bold mb-1 text-[#00FF87]">
                  {targetPercentage}%
                </h3>
                <p className="text-xs text-[#707070]">
                  of {monthlyTarget} kWh target
                </p>
              </div>
            </div>
          </div>

          {/* 30-Day Trend + Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2 bg-[#1A1A1A] backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#2A2A2A] hover:border-[#00FF87] hover:shadow-[0_0_30px_rgba(0,255,135,0.2)] transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BsClock className="text-[#00FF87]" />{" "}
                  {t("analytics.trend30")}
                </h3>
                <p className="text-sm text-[#A0A0A0]">
                  {t("analytics.dailyPattern")}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient
                      id="colorConsumption"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#7FFF7F" stopOpacity={0.8} />
                      <stop
                        offset="50%"
                        stopColor="#00FF87"
                        stopOpacity={0.5}
                      />
                      <stop
                        offset="95%"
                        stopColor="#00D97E"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2A2A2A"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="day"
                    stroke="#707070"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke="#707070" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                    labelStyle={{ color: "#A0A0A0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="#00FF87"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorConsumption)"
                    name="Consumption (kWh)"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#FFD700"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#1A1A1A] backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#2A2A2A] hover:border-[#00FF87] hover:shadow-[0_0_30px_rgba(0,255,135,0.2)] transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white">
                  {t("analytics.monthlyTarget")}
                </h3>
                <p className="text-sm text-[#A0A0A0]">
                  {t("analytics.progressOverview")}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="90%"
                  barSize={20}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                    fill={gaugeData[0].fill}
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-4xl font-bold"
                    fill="#00FF87"
                  >
                    {targetPercentage}%
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <p className="text-[#A0A0A0] text-sm">
                  {dashboardData?.totalKwh?.toFixed(2) || 0} / {monthlyTarget}{" "}
                  kWh
                </p>
                <div
                  className="mt-4 px-4 py-2 rounded-full text-xs font-semibold inline-block"
                  style={{
                    backgroundColor: `${gaugeData[0].fill}20`,
                    color: gaugeData[0].fill,
                  }}
                >
                  {parseFloat(targetPercentage) > 100
                    ? t("analytics.overTarget")
                    : parseFloat(targetPercentage) > 80
                      ? t("analytics.almostThere")
                      : t("analytics.onTrack")}
                </div>
              </div>
            </div>
          </div>

          {/* Weekly + Device Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-[#1A1A1A] backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#2A2A2A] hover:border-[#20B2AA] hover:shadow-[0_0_30px_rgba(32,178,170,0.2)] transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BsBarChart className="text-[#20B2AA]" />{" "}
                  {t("analytics.weeklyPerformance")}
                </h3>
                <p className="text-sm text-[#A0A0A0]">
                  {t("analytics.last4weeks")}
                </p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <defs>
                    <linearGradient
                      id="barGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#20B2AA" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#00CED1"
                        stopOpacity={0.8}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2A2A2A"
                    opacity={0.3}
                  />
                  <XAxis dataKey="week" stroke="#707070" />
                  <YAxis stroke="#707070" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="consumption"
                    fill="url(#barGradient)"
                    radius={[10, 10, 0, 0]}
                    name="Consumption (kWh)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#1A1A1A] backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#2A2A2A] hover:border-[#9D4EDD] hover:shadow-[0_0_30px_rgba(157,78,221,0.2)] transition-all">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BsPieChart className="text-[#9D4EDD]" />{" "}
                  {t("analytics.deviceDistribution")}
                </h3>
                <p className="text-sm text-[#A0A0A0]">{t("analytics.top7")}</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percentage }) => `${percentage.toFixed(1)}%`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2A2A2A",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: "12px", color: "#A0A0A0" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Peak Hours */}
          <div className="bg-[#1A1A1A] backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-[#2A2A2A] hover:shadow-[0_0_30px_rgba(0,255,135,0.2)] transition-all mb-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <BsActivity className="text-[#00FF87]" />{" "}
                  {t("analytics.peakHours")}
                </h3>
                <p className="text-sm text-[#A0A0A0]">
                  {t("analytics.hourlyPattern")}
                </p>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-medium flex-shrink-0"
                style={{
                  backgroundColor: "rgba(255,215,0,0.15)",
                  color: "#FFD700",
                  border: "1px solid rgba(255,215,0,0.3)",
                }}
              >
                ⚠ Estimated pattern
              </span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={peakHoursData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#2A2A2A"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="hour"
                  stroke="#707070"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#707070" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2A2A2A",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                  }}
                />
                <Bar
                  dataKey="consumption"
                  fill="#8884d8"
                  radius={[6, 6, 0, 0]}
                  name="Avg Consumption (kWh)"
                >
                  {peakHoursData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.intensity === "High"
                          ? "#FF4444"
                          : entry.intensity === "Medium"
                            ? "#FFD700"
                            : "#00FF87"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#00FF8720] to-[#00D97E20] backdrop-blur-lg rounded-2xl p-6 border-l-4 border-[#00FF87] shadow-2xl hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00FF87] opacity-10 rounded-full -mr-12 -mt-12"></div>
              <h4 className="font-bold text-[#00FF87] mb-3 flex items-center gap-2 text-lg">
                💡 {t("analytics.smartInsight")}
              </h4>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                {t("analytics.smartInsightDesc")}{" "}
                <span className="font-bold text-[#00FF87]">
                  {t("analytics.smartInsightSave")}
                </span>
                .
              </p>
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-[#20B2AA20] to-[#00CED120] backdrop-blur-lg rounded-2xl p-6 border-l-4 border-[#20B2AA] shadow-2xl hover:shadow-[0_0_30px_rgba(32,178,170,0.3)] transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#20B2AA] opacity-10 rounded-full -mr-12 -mt-12"></div>
              <h4 className="font-bold text-[#20B2AA] mb-3 flex items-center gap-2 text-lg">
                📈 End-of-month forecast
              </h4>
              <p className="text-sm text-[#A0A0A0] leading-relaxed mb-3">
                At current daily rate of{" "}
                <span className="font-bold text-white">{dailyRateA.toFixed(2)} kWh/day</span>,
                you will reach approximately{" "}
                <span className="font-bold text-[#20B2AA]">{predictedKwhA} kWh</span>{" "}
                by end of month — costing{" "}
                <span className="font-bold text-white">{predictedCostA} {currency}</span>.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#707070]">{daysRemainingA} days remaining</span>
                <span
                  className="text-xs font-bold px-2 py-1 rounded-full"
                  style={
                    predictedOverTargetA
                      ? { backgroundColor: "rgba(239,68,68,0.15)", color: "#FF4444", border: "1px solid rgba(239,68,68,0.3)" }
                      : { backgroundColor: "rgba(0,255,135,0.12)", color: "#00FF87", border: "1px solid rgba(0,255,135,0.3)" }
                  }
                >
                  {predictedOverTargetA
                    ? `⚠ ${(predictedKwhA - monthlyTarget).toFixed(1)} kWh over target`
                    : `✓ ${(monthlyTarget - predictedKwhA).toFixed(1)} kWh under target`}
                </span>
              </div>
              {lastMonthData && (
                <p className="text-xs text-[#707070] mt-2">
                  Last month actual: <span className="text-white font-semibold">{lastMonthData.totalKwh} kWh</span>
                  {trendKwh !== null && (
                    <span style={{ color: trendKwh > 0 ? "#FF7070" : "#00FF87" }} className="ml-1 font-semibold">
                      ({trendKwh > 0 ? "↑" : "↓"} {Math.abs(trendKwh).toFixed(1)}%)
                    </span>
                  )}
                </p>
              )}
            </div>

            <div className="relative overflow-hidden bg-gradient-to-br from-[#9D4EDD20] to-[#7B2CBF20] backdrop-blur-lg rounded-2xl p-6 border-l-4 border-[#9D4EDD] shadow-2xl hover:shadow-[0_0_30px_rgba(157,78,221,0.3)] transition-all hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#9D4EDD] opacity-10 rounded-full -mr-12 -mt-12"></div>
              <h4 className="font-bold text-[#9D4EDD] mb-3 flex items-center gap-2 text-lg">
                🎯 {t("analytics.aiRecommendation")}
              </h4>
              <p className="text-sm text-[#A0A0A0] leading-relaxed">
                <span className="font-bold text-white">
                  {dashboardData?.topConsumer?.name}
                </span>{" "}
                {t("analytics.aiConsumes")}{" "}
                <span className="font-bold text-[#9D4EDD]">
                  {(
                    (dashboardData?.topConsumer?.kwh /
                      dashboardData?.totalKwh) *
                    100
                  ).toFixed(1)}
                  %
                </span>{" "}
                {t("analytics.aiOptimize")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Analytics;
