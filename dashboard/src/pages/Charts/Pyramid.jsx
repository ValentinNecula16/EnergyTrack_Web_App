import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";

const Pyramid = () => {
  const { userData } = useStateContext();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxKwh, setMaxKwh] = useState(0);

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
          const sorted = [...breakdown].sort((a, b) => a.kwh - b.kwh).slice(-8);
          setMaxKwh(sorted[sorted.length - 1]?.kwh || 1);
          setData(sorted);
        }
      } catch (error) {
        console.error("Error fetching pyramid data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userData]);

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
          Energy Consumption Pyramid
        </p>
        <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
          Top 8 devices ranked by usage
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
        <div className="flex flex-col items-center gap-2 py-8">
          {[...data].reverse().map((device, index) => {
            const widthPercent = 30 + (device.kwh / maxKwh) * 65;
            const opacity = 1 - index * 0.08;
            const cost = (device.kwh * 1.3).toFixed(2);

            return (
              <div
                key={index}
                className="relative group transition-all duration-300 hover:scale-[1.02]"
                style={{ width: `${widthPercent}%` }}
              >
                <div
                  className="relative py-3 px-4 rounded-xl flex items-center justify-between"
                  style={{
                    background: `linear-gradient(135deg, rgba(0, 227, 150, ${opacity * 0.25}), rgba(0, 179, 119, ${opacity * 0.15}))`,
                    border: `1px solid rgba(0, 227, 150, ${opacity * 0.3})`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-lg"
                      style={{
                        backgroundColor: "rgba(0, 227, 150, 0.2)",
                        color: "#00E396",
                      }}
                    >
                      #{data.length - index}
                    </span>
                    <span className="font-medium text-white text-sm">
                      {device.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className="font-bold text-sm"
                      style={{ color: "#00E396" }}
                    >
                      {device.kwh.toFixed(2)} kWh
                    </span>
                    <span className="text-xs" style={{ color: "#8b949e" }}>
                      {cost} RON
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(0, 227, 150, 0.15)",
                        color: "#00E396",
                      }}
                    >
                      {device.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="mt-6 flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "#00E396" }}
            />
            <span className="text-xs" style={{ color: "#8b949e" }}>
              Wider bars = higher consumption
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pyramid;
