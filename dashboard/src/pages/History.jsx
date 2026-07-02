import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStateContext } from "../contexts/ContextProvider";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  BsLightningChargeFill,
  BsCalendar3,
  BsGraphUp,
  BsGraphDown,
  BsChevronLeft,
  BsChevronRight,
} from "react-icons/bs";
import {
  FaMoneyBillWave,
  FaChartPie,
  FaBolt,
  FaCalendarDay,
} from "react-icons/fa";
import { MdOutlineDevices, MdBarChart } from "react-icons/md";

const History = () => {
  const { userData, appSettings } = useStateContext();
  const { t, i18n } = useTranslation();

  const [availableMonths, setAvailableMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [showAllDevices, setShowAllDevices] = useState(false);

  const price = appSettings?.pricePerKwh || 1.3;
  const currency = appSettings?.currency || "RON";
  const target = appSettings?.monthlyTarget || 300;

  const locale = i18n.language === "ro" ? "ro-RO" : "en-US";

  const getMonthName = (year, month) =>
    new Date(year, month - 1, 1).toLocaleString(locale, { month: "long" });

  const PIE_COLORS = [
    "#00E396",
    "#00b377",
    "#00d4aa",
    "#20B2AA",
    "#00CED1",
    "#7FFF7F",
    "#48D1CC",
    "#66CDAA",
  ];

  // Fetch available months
  useEffect(() => {
    const fetchMonths = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/history/available-months/${userData.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setAvailableMonths(data);
          if (data.length > 0) {
            setSelectedMonth(data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching months:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMonths();
  }, [userData]);

  // Fetch history for selected month
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userData?.id || !selectedMonth) return;
      setDataLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8080/api/history/${userData.id}?year=${selectedMonth.year}&month=${selectedMonth.month}`,
        );
        if (response.ok) {
          const data = await response.json();
          setHistoryData(data);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setDataLoading(false);
      }
    };
    fetchHistory();
  }, [userData, selectedMonth]);

  const navigateMonth = (direction) => {
    const currentIndex = availableMonths.findIndex(
      (m) => m.year === selectedMonth.year && m.month === selectedMonth.month,
    );
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < availableMonths.length) {
      setSelectedMonth(availableMonths[newIndex]);
    }
  };

  const currentIndex = availableMonths.findIndex(
    (m) => m?.year === selectedMonth?.year && m?.month === selectedMonth?.month,
  );

  const isCurrentMonth =
    selectedMonth &&
    selectedMonth.year === new Date().getFullYear() &&
    selectedMonth.month === new Date().getMonth() + 1;

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ backgroundColor: "#0d1117" }}
      >
        <div className="text-center">
          <div className="relative inline-block">
            <div
              className="w-16 h-16 border-4 rounded-full animate-spin"
              style={{ borderColor: "#21262d", borderTopColor: "#00E396" }}
            />
          </div>
          <p className="mt-4 text-sm" style={{ color: "#8b949e" }}>
            {t("history.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (availableMonths.length === 0) {
    return (
      <div
        className="m-2 md:m-10 mt-24 p-8 rounded-3xl"
        style={{
          backgroundColor: "#1a1e24",
          border: "1px solid rgba(0, 227, 150, 0.1)",
        }}
      >
        <div className="text-center py-20">
          <BsCalendar3
            className="text-6xl mx-auto mb-4"
            style={{ color: "#333" }}
          />
          <h2 className="text-2xl font-bold text-white mb-2">
            {t("history.noData")}
          </h2>
          <p style={{ color: "#8b949e" }}>{t("history.noDataDesc")}</p>
        </div>
      </div>
    );
  }

  const progressPercent = historyData
    ? ((historyData.totalKwh / target) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0d1117" }}>
      <div
        className="m-2 md:m-10 mt-24 p-6 md:p-8 rounded-3xl"
        style={{
          backgroundColor: "#1a1e24",
          border: "1px solid rgba(0, 227, 150, 0.1)",
        }}
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <p
              className="text-sm font-medium mb-1"
              style={{ color: "#00E396" }}
            >
              ⚡ {t("history.title")}
            </p>
            <h1 className="text-3xl font-bold text-white">
              {t("history.title")}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
              {t("history.subtitle")}
            </p>
          </div>

          {/* Month Navigator */}
          <div
            className="flex items-center gap-3 p-2 rounded-2xl"
            style={{
              backgroundColor: "#21262d",
              border: "1px solid rgba(0, 227, 150, 0.15)",
            }}
          >
            <button
              onClick={() => navigateMonth(1)}
              disabled={currentIndex >= availableMonths.length - 1}
              className="p-2.5 rounded-xl transition-all disabled:opacity-20"
              style={{ color: "#00E396" }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled)
                  e.currentTarget.style.backgroundColor =
                    "rgba(0, 227, 150, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <BsChevronLeft className="text-lg" />
            </button>

            <select
              value={
                selectedMonth
                  ? `${selectedMonth.year}-${selectedMonth.month}`
                  : ""
              }
              onChange={(e) => {
                const [y, m] = e.target.value.split("-");
                const found = availableMonths.find(
                  (am) => am.year === parseInt(y) && am.month === parseInt(m),
                );
                if (found) setSelectedMonth(found);
              }}
              className="px-4 py-2.5 rounded-xl text-white font-bold text-center appearance-none cursor-pointer min-w-[200px]"
              style={{
                backgroundColor: "#161b22",
                border: "1px solid rgba(0, 227, 150, 0.2)",
                outline: "none",
              }}
            >
              {availableMonths.map((m) => (
                <option
                  key={`${m.year}-${m.month}`}
                  value={`${m.year}-${m.month}`}
                  style={{ backgroundColor: "#161b22" }}
                >
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => navigateMonth(-1)}
              disabled={currentIndex <= 0}
              className="p-2.5 rounded-xl transition-all disabled:opacity-20"
              style={{ color: "#00E396" }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled)
                  e.currentTarget.style.backgroundColor =
                    "rgba(0, 227, 150, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <BsChevronRight className="text-lg" />
            </button>
          </div>
        </div>

        {/* Current Month Badge */}
        {isCurrentMonth && (
          <div
            className="mb-6 px-4 py-2 rounded-xl inline-flex items-center gap-2"
            style={{
              backgroundColor: "rgba(0, 227, 150, 0.1)",
              border: "1px solid rgba(0, 227, 150, 0.2)",
            }}
          >
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: "#00E396" }}
            />
            <span className="text-sm font-medium" style={{ color: "#00E396" }}>
              {t("history.collecting")}
            </span>
          </div>
        )}

        {dataLoading ? (
          <div className="flex justify-center py-20">
            <div
              className="w-10 h-10 border-3 rounded-full animate-spin"
              style={{ borderColor: "#21262d", borderTopColor: "#00E396" }}
            />
          </div>
        ) : historyData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div
                className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <BsLightningChargeFill
                    className="text-xl"
                    style={{ color: "#00E396" }}
                  />
                  <span
                    className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{
                      backgroundColor:
                        parseFloat(progressPercent) > 100
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(0, 227, 150, 0.15)",
                      color:
                        parseFloat(progressPercent) > 100
                          ? "#f87171"
                          : "#00E396",
                    }}
                  >
                    {progressPercent}% {t("history.ofTarget")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {historyData.totalKwh} kWh
                </p>
                <p className="text-xs mt-1" style={{ color: "#8b949e" }}>
                  {t("history.totalConsumption")}
                </p>
              </div>

              <div
                className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <FaMoneyBillWave
                    className="text-xl"
                    style={{ color: "#fbbf24" }}
                  />
                  <span
                    className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(251, 191, 36, 0.15)",
                      color: "#fbbf24",
                    }}
                  >
                    {price} {currency}/kWh
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {(historyData.totalKwh * price).toFixed(2)} {currency}
                </p>
                <p className="text-xs mt-1" style={{ color: "#8b949e" }}>
                  {t("history.estimatedCost")}
                </p>
              </div>

              <div
                className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <FaCalendarDay
                    className="text-xl"
                    style={{ color: "#20B2AA" }}
                  />
                  <span
                    className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(32, 178, 170, 0.15)",
                      color: "#20B2AA",
                    }}
                  >
                    {historyData.daysWithData} {t("history.days")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {historyData.dailyAverage} kWh
                </p>
                <p className="text-xs mt-1" style={{ color: "#8b949e" }}>
                  {t("history.dailyAverage")}
                </p>
              </div>

              <div
                className="p-5 rounded-2xl transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <MdOutlineDevices
                    className="text-xl"
                    style={{ color: "#9D4EDD" }}
                  />
                  <span
                    className="text-xs px-2 py-1 rounded-lg font-medium"
                    style={{
                      backgroundColor: "rgba(157, 78, 221, 0.15)",
                      color: "#9D4EDD",
                    }}
                  >
                    {t("history.tracked")}
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {historyData.totalDevices}
                </p>
                <p className="text-xs mt-1" style={{ color: "#8b949e" }}>
                  {t("history.activeDevices")}
                </p>
              </div>
            </div>

            {/* Peak / Lowest Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                className="flex items-center gap-4 p-5 rounded-2xl"
                style={{
                  backgroundColor: "#21262d",
                  borderLeft: "4px solid #f97316",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.05))",
                  }}
                >
                  <BsGraphUp className="text-xl" style={{ color: "#f97316" }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#8b949e" }}>
                    {t("history.peakDay")}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {historyData.peakKwh} kWh
                    <span
                      className="text-sm font-normal ml-2"
                      style={{ color: "#8b949e" }}
                    >
                      on {historyData.peakDay}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className="flex items-center gap-4 p-5 rounded-2xl"
                style={{
                  backgroundColor: "#21262d",
                  borderLeft: "4px solid #00E396",
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(0, 227, 150, 0.2), rgba(0, 227, 150, 0.05))",
                  }}
                >
                  <BsGraphDown
                    className="text-xl"
                    style={{ color: "#00E396" }}
                  />
                </div>
                <div>
                  <p className="text-sm" style={{ color: "#8b949e" }}>
                    {t("history.lowestDay")}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {historyData.lowestKwh} kWh
                    <span
                      className="text-sm font-normal ml-2"
                      style={{ color: "#8b949e" }}
                    >
                      on {historyData.lowestDay}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Daily Consumption Chart */}
              <div
                className="lg:col-span-2 p-6 rounded-2xl"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MdBarChart style={{ color: "#00E396" }} />
                    {t("history.dailyConsumption")}
                  </h3>
                  <p className="text-xs" style={{ color: "#8b949e" }}>
                    {getMonthName(selectedMonth?.year, selectedMonth?.month)}{" "}
                    {selectedMonth?.year}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={historyData.dailyData}>
                    <defs>
                      <linearGradient
                        id="historyGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#00E396"
                          stopOpacity={0.6}
                        />
                        <stop
                          offset="50%"
                          stopColor="#00E396"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#00E396"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d333b"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="day"
                      stroke="#8b949e"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#161b22",
                        border: "1px solid rgba(0, 227, 150, 0.2)",
                        borderRadius: "12px",
                        color: "#e6edf3",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [`${value} kWh`, "Consumption"]}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="kwh"
                      stroke="#00E396"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#historyGradient)"
                      name="Consumption"
                      dot={{ r: 3, fill: "#00E396", strokeWidth: 0 }}
                      activeDot={{
                        r: 6,
                        fill: "#00E396",
                        stroke: "#0d1117",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Device Pie Chart */}
              <div
                className="p-6 rounded-2xl"
                style={{
                  backgroundColor: "#21262d",
                  border: "1px solid rgba(0, 227, 150, 0.1)",
                }}
              >
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaChartPie style={{ color: "#00E396" }} />
                    {t("history.deviceBreakdown")}
                  </h3>
                  <p className="text-xs" style={{ color: "#8b949e" }}>
                    {t("history.topConsumers")}
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={historyData.deviceBreakdown?.slice(0, 7) || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="kwh"
                      nameKey="name"
                      label={({ percentage }) => `${percentage}%`}
                    >
                      {(historyData.deviceBreakdown || [])
                        .slice(0, 7)
                        .map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#161b22",
                        border: "1px solid rgba(0, 227, 150, 0.2)",
                        borderRadius: "12px",
                        color: "#e6edf3",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [`${value} kWh`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Device Breakdown Table */}
            <div
              className="p-6 rounded-2xl"
              style={{
                backgroundColor: "#21262d",
                border: "1px solid rgba(0, 227, 150, 0.1)",
              }}
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaBolt style={{ color: "#00E396" }} />
                  {t("history.deviceDetails")}
                </h3>
                <p className="text-xs" style={{ color: "#8b949e" }}>
                  {t("history.completeBreakdown")}{" "}
                  {getMonthName(selectedMonth?.year, selectedMonth?.month)}{" "}
                  {selectedMonth?.year}
                </p>
              </div>

              {/* Table Header */}
              <div
                className="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl mb-2"
                style={{ backgroundColor: "#161b22" }}
              >
                <div
                  className="col-span-1 text-xs font-bold"
                  style={{ color: "#8b949e" }}
                >
                  #
                </div>
                <div
                  className="col-span-4 text-xs font-bold"
                  style={{ color: "#8b949e" }}
                >
                  Device
                </div>
                <div
                  className="col-span-2 text-xs font-bold text-right"
                  style={{ color: "#8b949e" }}
                >
                  kWh
                </div>
                <div
                  className="col-span-2 text-xs font-bold text-right"
                  style={{ color: "#8b949e" }}
                >
                  Cost
                </div>
                <div
                  className="col-span-3 text-xs font-bold"
                  style={{ color: "#8b949e" }}
                >
                  Share
                </div>
              </div>

              {/* Table Rows */}
              <div className="space-y-1">
                {(historyData.deviceBreakdown || [])
                  .slice(0, showAllDevices ? undefined : 7)
                  .map((device, index) => (
                    <div
                      key={device.deviceId}
                      className="grid grid-cols-12 gap-4 px-4 py-3 rounded-xl transition-all hover:scale-[1.01]"
                      style={{
                        backgroundColor:
                          index % 2 === 0
                            ? "rgba(22, 27, 34, 0.5)"
                            : "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "rgba(0, 227, 150, 0.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          index % 2 === 0
                            ? "rgba(22, 27, 34, 0.5)"
                            : "transparent";
                      }}
                    >
                      <div className="col-span-1 flex items-center">
                        <span
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
                          style={{
                            backgroundColor:
                              index < 3
                                ? "rgba(0, 227, 150, 0.15)"
                                : "rgba(139, 148, 158, 0.1)",
                            color: index < 3 ? "#00E396" : "#8b949e",
                          }}
                        >
                          {index + 1}
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center">
                        <div
                          className="w-2 h-2 rounded-full mr-3"
                          style={{
                            backgroundColor:
                              PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <span className="text-sm text-white font-medium truncate">
                          {device.name}
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span className="text-sm font-bold text-white">
                          {device.kwh}
                        </span>
                        <span
                          className="text-xs ml-1"
                          style={{ color: "#8b949e" }}
                        >
                          kWh
                        </span>
                      </div>
                      <div className="col-span-2 text-right">
                        <span
                          className="text-sm font-medium"
                          style={{ color: "#fbbf24" }}
                        >
                          {(device.kwh * price).toFixed(2)}
                        </span>
                        <span
                          className="text-xs ml-1"
                          style={{ color: "#8b949e" }}
                        >
                          {currency}
                        </span>
                      </div>
                      <div className="col-span-3 flex items-center gap-2">
                        <div
                          className="flex-1 h-2 rounded-full overflow-hidden"
                          style={{ backgroundColor: "#161b22" }}
                        >
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.min(device.percentage, 100)}%`,
                              background: `linear-gradient(90deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[index % PIE_COLORS.length]}88)`,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium min-w-[40px] text-right"
                          style={{ color: "#8b949e" }}
                        >
                          {device.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Show More / Less Button */}
              {(historyData.deviceBreakdown || []).length > 7 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAllDevices(!showAllDevices)}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: "rgba(0, 227, 150, 0.1)",
                      color: "#00E396",
                      border: "1px solid rgba(0, 227, 150, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(0, 227, 150, 0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(0, 227, 150, 0.1)";
                    }}
                  >
                    {showAllDevices
                      ? `${t("history.showLess")} ▲`
                      : `${t("history.showAll")} ${historyData.deviceBreakdown.length} Devices ▼`}
                  </button>
                </div>
              )}

              {/* Total Row */}
              <div
                className="grid grid-cols-12 gap-4 px-4 py-4 mt-3 rounded-xl"
                style={{
                  backgroundColor: "rgba(0, 227, 150, 0.05)",
                  borderTop: "1px solid rgba(0, 227, 150, 0.15)",
                }}
              >
                <div className="col-span-1"></div>
                <div className="col-span-4">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#00E396" }}
                  >
                    {t("history.total")}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#00E396" }}
                  >
                    {historyData.totalKwh}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "#8b949e" }}>
                    kWh
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#fbbf24" }}
                  >
                    {(historyData.totalKwh * price).toFixed(2)}
                  </span>
                  <span className="text-xs ml-1" style={{ color: "#8b949e" }}>
                    {currency}
                  </span>
                </div>
                <div className="col-span-3 flex items-center gap-2">
                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "#161b22" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: "100%",
                        background: "linear-gradient(90deg, #00E396, #00b377)",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-bold min-w-[40px] text-right"
                    style={{ color: "#00E396" }}
                  >
                    100%
                  </span>
                </div>
              </div>
            </div>

            {/* Month Comparison Footer */}
            {availableMonths.length > 1 &&
              currentIndex < availableMonths.length - 1 && (
                <div
                  className="mt-6 p-4 rounded-2xl text-center"
                  style={{
                    backgroundColor: "rgba(0, 227, 150, 0.05)",
                    border: "1px solid rgba(0, 227, 150, 0.1)",
                  }}
                >
                  <p className="text-sm" style={{ color: "#8b949e" }}>
                    💡 {t("history.compareHint")}{" "}
                    <span className="font-bold" style={{ color: "#00E396" }}>
                      {availableMonths.length} {t("history.months")}
                    </span>{" "}
                    {t("history.ofHistoricalData")}
                  </p>
                </div>
              )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default History;
