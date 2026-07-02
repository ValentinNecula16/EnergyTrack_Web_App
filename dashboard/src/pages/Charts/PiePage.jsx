import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useStateContext } from "../../contexts/ContextProvider";

const COLORS = [
  "#00E396",
  "#00b377",
  "#008f5d",
  "#00d68f",
  "#33ffc1",
  "#66ffda",
  "#99ffe8",
  "#b3fff0",
];

const PiePage = () => {
  const { userData } = useStateContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalKwh, setTotalKwh] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/devices/dashboard/${userData.id}`,
        );
        if (response.ok) {
          const dashData = await response.json();
          const breakdown = dashData.deviceBreakdown || [];
          setTotalKwh(dashData.totalKwh || 0);

          const sorted = [...breakdown].sort((a, b) => b.kwh - a.kwh);
          const top7 = sorted.slice(0, 7);
          const othersKwh = sorted.slice(7).reduce((sum, d) => sum + d.kwh, 0);

          const chartData = top7.map((d) => ({
            name: d.name,
            value: Math.round(d.kwh * 100) / 100,
            percentage: d.percentage,
          }));

          if (othersKwh > 0) {
            chartData.push({
              name: "Others",
              value: Math.round(othersKwh * 100) / 100,
              percentage:
                Math.round((othersKwh / dashData.totalKwh) * 100 * 10) / 10,
            });
          }

          setData(chartData);
        }
      } catch (error) {
        console.error("Error fetching pie data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData]);

  const renderCustomLabel = ({ name, percentage, x, y }) => (
    <text x={x} y={y} fill="#e6edf3" textAnchor="middle" fontSize={11}>
      {`${name} (${percentage?.toFixed(1) || 0}%)`}
    </text>
  );

  return (
    <div
      className="m-4 md:m-10 mt-24 p-8 rounded-3xl"
      style={{
        backgroundColor: "#1a1e24",
        border: "1px solid rgba(0, 227, 150, 0.15)",
      }}
    >
      <div className="mb-8">
        <p className="text-sm" style={{ color: "#00E396" }}>
          Chart
        </p>
        <p className="text-2xl font-bold text-white">
          Device Energy Distribution
        </p>
        <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
          Total: {totalKwh.toFixed(2)} kWh this month
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-80">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: "#00E396", borderTopColor: "transparent" }}
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={160}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={renderCustomLabel}
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#1a1e24"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#21262d",
                border: "1px solid rgba(0, 227, 150, 0.2)",
                borderRadius: "12px",
                color: "#e6edf3",
              }}
              formatter={(value) => [`${value} kWh`, "Consumption"]}
            />
            <Legend
              wrapperStyle={{ color: "#8b949e" }}
              formatter={(value) => (
                <span style={{ color: "#e6edf3" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default PiePage;
