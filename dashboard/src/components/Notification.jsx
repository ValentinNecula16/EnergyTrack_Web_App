import React, { useState, useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import {
  BsLightningChargeFill,
  BsExclamationTriangle,
  BsGraphUp,
  BsDeviceSsd,
} from "react-icons/bs";
import { FaLeaf, FaFire } from "react-icons/fa";
import { useStateContext } from "../contexts/ContextProvider";

const Notification = ({ openFullCenter }) => {
  const { currentColor, userData, appSettings } = useStateContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateRealNotifications = async () => {
      if (!userData?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8080/api/devices/dashboard/${userData.id}`,
        );
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();
        const alerts = [];
        const now = new Date();
        const target = appSettings?.monthlyTarget || 300;
        const price = appSettings?.pricePerKwh || 1.3;
        const totalKwh = data.totalKwh || 0;
        const totalDevices = data.totalDevices || 0;
        const activeDevices = data.activeDevices || 0;
        const currentDay = now.getDate();
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
        ).getDate();
        const dailyAvg = currentDay > 0 ? totalKwh / currentDay : 0;
        const projected = dailyAvg * daysInMonth;
        const progressPercent = (totalKwh / target) * 100;

        // 1. Target exceeded
        if (totalKwh > target) {
          alerts.push({
            id: "target_exceeded",
            type: "alert",
            priority: "critical",
            icon: <BsExclamationTriangle className="text-red-500 text-lg" />,
            title: "Monthly Target Exceeded!",
            message: `You've used ${totalKwh.toFixed(1)} kWh — that's ${(totalKwh - target).toFixed(1)} kWh over your ${target} kWh target.`,
            time: "Now",
          });
        }

        // 2. Approaching target (>80%)
        if (progressPercent >= 80 && progressPercent < 100) {
          alerts.push({
            id: "approaching_target",
            type: "alert",
            priority: "high",
            icon: <BsExclamationTriangle className="text-orange-500 text-lg" />,
            title: "Approaching Target!",
            message: `You've used ${progressPercent.toFixed(0)}% of your monthly target with ${daysInMonth - currentDay} days remaining.`,
            time: "Now",
          });
        }

        // 3. Projected overshoot
        if (projected > target && totalKwh <= target) {
          alerts.push({
            id: "projected_over",
            type: "alert",
            priority: "high",
            icon: <BsGraphUp className="text-orange-400 text-lg" />,
            title: "Projected Overshoot",
            message: `At current rate, you'll reach ${projected.toFixed(0)} kWh (${(projected - target).toFixed(0)} kWh over target) by end of month.`,
            time: "Today",
          });
        }

        // 4. Top consumer warning
        if (data.topConsumer) {
          const topPercent = ((data.topConsumer.kwh / totalKwh) * 100).toFixed(
            0,
          );
          if (topPercent > 20) {
            alerts.push({
              id: "top_consumer",
              type: "tip",
              priority: "medium",
              icon: <FaFire className="text-orange-500 text-lg" />,
              title: `${data.topConsumer.name} — Top Consumer`,
              message: `Using ${data.topConsumer.kwh.toFixed(2)} kWh (${topPercent}% of total). Consider reducing usage.`,
              time: "Today",
            });
          }
        }

        // 5. Many devices active
        if (activeDevices > totalDevices * 0.6 && totalDevices > 5) {
          alerts.push({
            id: "many_active",
            type: "tip",
            priority: "medium",
            icon: <BsDeviceSsd className="text-yellow-500 text-lg" />,
            title: "Many Devices Active",
            message: `${activeDevices} out of ${totalDevices} devices are running. Turn off unused ones to save energy.`,
            time: "Now",
          });
        }

        // 6. Good progress (under 50% with half month passed)
        if (currentDay > daysInMonth / 2 && progressPercent < 50) {
          alerts.push({
            id: "good_progress",
            type: "achievement",
            priority: "low",
            icon: <FaLeaf className="text-green-500 text-lg" />,
            title: "Great Progress! 🎉",
            message: `You're only at ${progressPercent.toFixed(0)}% of your target halfway through the month. Keep it up!`,
            time: "Today",
          });
        }

        // 7. Cost estimate
        const estimatedCost = projected * price;
        alerts.push({
          id: "cost_estimate",
          type: "system",
          priority: "low",
          icon: <BsLightningChargeFill className="text-green-400 text-lg" />,
          title: "Monthly Cost Estimate",
          message: `Estimated bill: ${estimatedCost.toFixed(2)} ${appSettings?.currency || "RON"} (${projected.toFixed(0)} kWh × ${price} ${appSettings?.currency || "RON"}/kWh).`,
          time: "Updated now",
        });

        // 8. Daily average info
        alerts.push({
          id: "daily_avg",
          type: "system",
          priority: "low",
          icon: <BsGraphUp className="text-blue-400 text-lg" />,
          title: "Daily Average",
          message: `You're consuming ~${dailyAvg.toFixed(1)} kWh per day across ${totalDevices} devices.`,
          time: "Today",
        });

        setNotifications(alerts);
      } catch (error) {
        console.error("Error generating notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    generateRealNotifications();
  }, [userData, appSettings]);

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "critical":
        return {
          borderLeft: "4px solid #ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.08)",
        };
      case "high":
        return {
          borderLeft: "4px solid #f97316",
          backgroundColor: "rgba(249, 115, 22, 0.08)",
        };
      case "medium":
        return {
          borderLeft: "4px solid #fbbf24",
          backgroundColor: "rgba(251, 191, 36, 0.08)",
        };
      default:
        return {
          borderLeft: "4px solid #00E396",
          backgroundColor: "rgba(0, 227, 150, 0.08)",
        };
    }
  };

  const unreadCount = notifications.filter(
    (n) => n.priority === "critical" || n.priority === "high",
  ).length;

  return (
    <div
      className="nav-item absolute right-5 md:right-40 top-16 p-6 rounded-2xl w-96 shadow-2xl z-50"
      style={{
        backgroundColor: "#1a1e24",
        border: "1px solid rgba(0, 227, 150, 0.2)",
        boxShadow:
          "0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 227, 150, 0.08)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-3 items-center">
          <p className="font-semibold text-lg text-white">Notifications</p>
          {unreadCount > 0 && (
            <span
              className="text-xs rounded-full px-3 py-1 font-bold animate-pulse"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                color: "#f87171",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              {unreadCount} Alert{unreadCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            const event = new Event("closeNotification");
            window.dispatchEvent(event);
          }}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: "#8b949e" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(0, 227, 150, 0.1)";
            e.currentTarget.style.color = "#00E396";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#8b949e";
          }}
        >
          <MdOutlineCancel className="text-xl" />
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-8">
            <div
              className="w-6 h-6 border-2 rounded-full animate-spin"
              style={{
                borderColor: "#00E396",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🔔</p>
            <p className="text-sm" style={{ color: "#8b949e" }}>
              No new notifications
            </p>
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer hover:scale-[1.01]"
              style={getPriorityStyle(item.priority)}
              onClick={openFullCenter}
            >
              <div className="flex-shrink-0 mt-0.5">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm truncate">
                  {item.title}
                </p>
                <p
                  className="text-xs mt-0.5 line-clamp-2"
                  style={{ color: "#8b949e" }}
                >
                  {item.message}
                </p>
                <p className="text-xs mt-1" style={{ color: "#555" }}>
                  {item.time}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div
          className="mt-4 pt-4"
          style={{ borderTop: "1px solid rgba(0, 227, 150, 0.15)" }}
        >
          <button
            onClick={openFullCenter}
            className="w-full py-2.5 rounded-xl font-medium text-sm transition-all hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #00E396, #00b377)",
              color: "#0d1117",
            }}
          >
            See all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;
