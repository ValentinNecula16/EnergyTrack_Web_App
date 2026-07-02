import React, { useState, useEffect } from "react";
import {
  MdClose,
  MdNotifications,
  MdCheck,
  MdDelete,
  MdSettings,
} from "react-icons/md";
import {
  BsLightningChargeFill,
  BsExclamationTriangle,
  BsInfoCircle,
  BsTrophy,
  BsGear,
  BsTrash,
  BsEye,
} from "react-icons/bs";
import { useStateContext } from "../contexts/ContextProvider";

const NotificationCenter = ({ onClose }) => {
  const { userData, appSettings } = useStateContext();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    alerts: true,
    tips: true,
    achievements: true,
    system: true,
    devices: true,
  });

  useEffect(() => {
    const savedNotifications = localStorage.getItem("energyNotifications");
    const savedSettings = localStorage.getItem("notificationSettings");

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      generateInitialNotifications();
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const saveNotifications = (updatedNotifications) => {
    setNotifications(updatedNotifications);
    localStorage.setItem(
      "energyNotifications",
      JSON.stringify(updatedNotifications),
    );
  };

  const saveSettings = (updatedSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem(
      "notificationSettings",
      JSON.stringify(updatedSettings),
    );
  };

  const generateInitialNotifications = () => {
    const initial = [
      {
        id: Date.now() + 4,
        type: "achievement",
        priority: "low",
        title: "🏆 Welcome!",
        message:
          "Notification system is now active. You'll receive real-time alerts.",
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
      },
    ];
    saveNotifications(initial);
  };

  useEffect(() => {
    const fetchDataAndGenerateNotifications = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/devices/dashboard/${userData.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          generateRealNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDataAndGenerateNotifications();
    const interval = setInterval(
      fetchDataAndGenerateNotifications,
      5 * 60 * 1000,
    );
    return () => clearInterval(interval);
  }, [userData, appSettings]);

  const generateRealNotifications = (dashboardData) => {
    const newNotifications = [];
    const now = Date.now();
    const monthlyTarget = appSettings?.monthlyTarget || 300;
    const price = appSettings?.pricePerKwh || 1.3;
    const currency = appSettings?.currency || "RON";
    const {
      totalKwh,
      totalCost,
      deviceBreakdown,
      activeDevices,
      totalDevices,
    } = dashboardData;
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0,
    ).getDate();
    const dailyAvg = currentDay > 0 ? totalKwh / currentDay : 0;
    const projected = dailyAvg * daysInMonth;

    // 1. Target Exceeded
    if (totalKwh > monthlyTarget) {
      const excess = (totalKwh - monthlyTarget).toFixed(2);
      const excessPercent = ((totalKwh / monthlyTarget - 1) * 100).toFixed(1);
      newNotifications.push({
        id: now + 1,
        type: "alert",
        priority: "critical",
        title: "🚨 Target Exceeded!",
        message: `You've exceeded your ${monthlyTarget} kWh target by ${excess} kWh (+${excessPercent}%). Current: ${totalKwh.toFixed(2)} kWh.`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        action: "View Analytics",
      });
    }

    // 2. Approaching Target (80-100%)
    if (totalKwh >= monthlyTarget * 0.8 && totalKwh < monthlyTarget) {
      const remaining = (monthlyTarget - totalKwh).toFixed(2);
      const percentage = ((totalKwh / monthlyTarget) * 100).toFixed(1);
      newNotifications.push({
        id: now + 2,
        type: "alert",
        priority: "high",
        title: "⚠️ Approaching Target",
        message: `You're at ${percentage}% of your ${monthlyTarget} kWh target. Only ${remaining} kWh remaining with ${daysInMonth - currentDay} days left.`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        action: "View Progress",
      });
    }

    // 3. Projected Overshoot
    if (projected > monthlyTarget && totalKwh <= monthlyTarget) {
      newNotifications.push({
        id: now + 3,
        type: "alert",
        priority: "high",
        title: "📈 Projected Overshoot",
        message: `At your current rate (~${dailyAvg.toFixed(1)} kWh/day), you'll reach ${projected.toFixed(0)} kWh by month end — ${(projected - monthlyTarget).toFixed(0)} kWh over target.`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        action: "View Analytics",
      });
    }

    // 4. High Consumption Device (top > 30%)
    if (deviceBreakdown && deviceBreakdown.length > 0) {
      const topDevice = deviceBreakdown[0];
      if (topDevice.percentage > 30) {
        newNotifications.push({
          id: now + 4,
          type: "alert",
          priority: "high",
          title: `🔥 ${topDevice.name} — High Usage`,
          message: `Consuming ${topDevice.percentage.toFixed(1)}% of total energy (${topDevice.kwh.toFixed(2)} kWh). Consider reducing usage.`,
          timestamp: new Date().toISOString(),
          read: false,
          actionable: true,
          action: "View Device",
        });
      }

      // 5. Many high-power devices
      const highPower = deviceBreakdown.filter((d) => d.kwh > 5);
      if (highPower.length >= 3) {
        newNotifications.push({
          id: now + 5,
          type: "tip",
          priority: "medium",
          title: "💡 Energy Saving Tip",
          message: `${highPower.length} high-power devices are active. Consider turning off: ${highPower
            .slice(0, 3)
            .map((d) => d.name)
            .join(", ")}.`,
          timestamp: new Date().toISOString(),
          read: false,
          actionable: false,
        });
      }
    }

    // 6. Cost Alert
    const estimatedMonthCost = projected * price;
    if (estimatedMonthCost > monthlyTarget * price * 1.1) {
      newNotifications.push({
        id: now + 6,
        type: "alert",
        priority: "medium",
        title: `💰 Cost Estimate: ${estimatedMonthCost.toFixed(0)} ${currency}`,
        message: `Projected monthly bill is ${estimatedMonthCost.toFixed(2)} ${currency} based on current usage of ~${dailyAvg.toFixed(1)} kWh/day.`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: true,
        action: "View Analytics",
      });
    }

    // 7. Many active devices
    if (activeDevices > totalDevices * 0.6 && totalDevices > 5) {
      newNotifications.push({
        id: now + 7,
        type: "tip",
        priority: "medium",
        title: "🔌 Many Devices Active",
        message: `${activeDevices} out of ${totalDevices} devices are currently running. Turn off unused ones to save energy.`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
      });
    }

    // 8. Good progress
    if (currentDay > daysInMonth / 2 && totalKwh < monthlyTarget * 0.5) {
      const percentage = ((totalKwh / monthlyTarget) * 100).toFixed(1);
      newNotifications.push({
        id: now + 8,
        type: "achievement",
        priority: "low",
        title: "🏆 Great Progress!",
        message: `You're only at ${percentage}% of your target halfway through the month. Excellent efficiency!`,
        timestamp: new Date().toISOString(),
        read: false,
        actionable: false,
      });
    }

    // 9. Daily average info
    newNotifications.push({
      id: now + 9,
      type: "system",
      priority: "low",
      title: "📊 Daily Summary",
      message: `Average: ${dailyAvg.toFixed(1)} kWh/day | Total: ${totalKwh.toFixed(1)} kWh | Devices: ${activeDevices}/${totalDevices} active`,
      timestamp: new Date().toISOString(),
      read: false,
      actionable: false,
    });

    // Merge with existing (avoid duplicates)
    const existing = JSON.parse(
      localStorage.getItem("energyNotifications") || "[]",
    );
    const filteredExisting = existing.filter((e) => {
      if (e.read) return true;
      return !newNotifications.some((n) => n.title === e.title);
    });

    const combined = [...newNotifications, ...filteredExisting]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 50);

    saveNotifications(combined);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "alert":
        return <BsExclamationTriangle className="text-xl" />;
      case "tip":
        return <BsLightningChargeFill className="text-xl" />;
      case "achievement":
        return <BsTrophy className="text-xl" />;
      case "system":
        return <BsGear className="text-xl" />;
      default:
        return <MdNotifications className="text-xl" />;
    }
  };

  const getPriorityIconBg = (priority) => {
    switch (priority) {
      case "critical":
        return { background: "linear-gradient(135deg, #ef4444, #b91c1c)" };
      case "high":
        return { background: "linear-gradient(135deg, #f97316, #c2410c)" };
      case "medium":
        return { background: "linear-gradient(135deg, #fbbf24, #d97706)" };
      case "low":
        return { background: "linear-gradient(135deg, #00E396, #00b377)" };
      default:
        return { background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" };
    }
  };

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case "critical":
        return "#ef4444";
      case "high":
        return "#f97316";
      case "medium":
        return "#fbbf24";
      case "low":
        return "#00E396";
      default:
        return "#3b82f6";
    }
  };

  const markAsRead = (id) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    saveNotifications(updated);
  };

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    saveNotifications(updated);
  };

  const deleteNotification = (id) => {
    const updated = notifications.filter((n) => n.id !== id);
    saveNotifications(updated);
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to delete all notifications?")) {
      saveNotifications([]);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;
  const typeCounts = {
    alert: notifications.filter((n) => n.type === "alert").length,
    tip: notifications.filter((n) => n.type === "tip").length,
    achievement: notifications.filter((n) => n.type === "achievement").length,
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return time.toLocaleDateString();
  };

  const handleAction = (notification) => {
    if (notification.action === "View Analytics")
      window.location.href = "/analytics";
    else if (notification.action === "View Progress")
      window.location.href = "/dashboard";
    else if (notification.action === "View Device")
      window.location.href = "/devices";
    markAsRead(notification.id);
    onClose();
  };

  const filterBtnStyle = (active, color) => ({
    backgroundColor: active ? color : "#21262d",
    color: active ? "#0d1117" : "#8b949e",
    border: active ? "none" : "1px solid rgba(255,255,255,0.06)",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        className="rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: "#1a1e24",
          border: "1px solid rgba(0, 227, 150, 0.15)",
        }}
      >
        {/* Header */}
        <div
          className="p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(0, 227, 150, 0.15), rgba(0, 179, 119, 0.1))",
          }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32"
            style={{ backgroundColor: "rgba(0, 227, 150, 0.05)" }}
          />
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-3">
                  <MdNotifications
                    className="text-3xl"
                    style={{ color: "#00E396" }}
                  />
                  Notifications
                  {unreadCount > 0 && (
                    <span
                      className="text-xs px-3 py-1 rounded-full animate-pulse font-bold"
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      {unreadCount} New
                    </span>
                  )}
                </h2>
                <p className="text-sm" style={{ color: "#8b949e" }}>
                  Real-time alerts based on your energy data
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: "#8b949e" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 227, 150, 0.1)";
                    e.currentTarget.style.color = "#00E396";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#8b949e";
                  }}
                >
                  <MdSettings className="text-xl" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all"
                  style={{ color: "#8b949e" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 227, 150, 0.1)";
                    e.currentTarget.style.color = "#00E396";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#8b949e";
                  }}
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(0, 227, 150, 0.15)",
                  color: "#00E396",
                  border: "1px solid rgba(0, 227, 150, 0.2)",
                }}
              >
                <MdCheck /> Mark All Read
              </button>
              <button
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 flex items-center gap-2"
                style={{
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  color: "#f87171",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                <MdDelete /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div
          className="p-4"
          style={{
            borderBottom: "1px solid rgba(0, 227, 150, 0.1)",
            backgroundColor: "#161b22",
          }}
        >
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter("all")}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
              style={filterBtnStyle(filter === "all", "#00E396")}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter("unread")}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
              style={filterBtnStyle(filter === "unread", "#00E396")}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter("alert")}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
              style={filterBtnStyle(filter === "alert", "#ef4444")}
            >
              🚨 Alerts ({typeCounts.alert})
            </button>
            <button
              onClick={() => setFilter("tip")}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
              style={filterBtnStyle(filter === "tip", "#fbbf24")}
            >
              💡 Tips ({typeCounts.tip})
            </button>
            <button
              onClick={() => setFilter("achievement")}
              className="px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all"
              style={filterBtnStyle(filter === "achievement", "#00E396")}
            >
              🏆 Achievements ({typeCounts.achievement})
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div
            className="p-6"
            style={{
              borderBottom: "1px solid rgba(0, 227, 150, 0.1)",
              backgroundColor: "rgba(0, 227, 150, 0.03)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4">
              Notification Settings
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(settings).map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    backgroundColor: "#21262d",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="text-sm text-white capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <button
                    onClick={() =>
                      saveSettings({ ...settings, [key]: !settings[key] })
                    }
                    className="relative w-10 h-5 rounded-full transition-all"
                    style={{
                      backgroundColor: settings[key] ? "#00E396" : "#333",
                    }}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                      style={{
                        backgroundColor: settings[key] ? "#0d1117" : "#666",
                        left: settings[key] ? "22px" : "2px",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <MdNotifications
                className="text-5xl mb-4"
                style={{ color: "#333" }}
              />
              <p className="text-lg font-semibold text-white">
                No notifications
              </p>
              <p className="text-sm" style={{ color: "#8b949e" }}>
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="group relative rounded-xl p-4 transition-all hover:scale-[1.01]"
                  style={{
                    backgroundColor: notification.read
                      ? "rgba(33, 38, 45, 0.5)"
                      : "#21262d",
                    borderLeft: `4px solid ${getPriorityBorder(notification.priority)}`,
                    opacity: notification.read ? 0.6 : 1,
                  }}
                >
                  <div className="flex gap-4">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={getPriorityIconBg(notification.priority)}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          {notification.title}
                          {!notification.read && (
                            <span
                              className="w-2 h-2 rounded-full animate-pulse"
                              style={{ backgroundColor: "#00E396" }}
                            />
                          )}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 rounded-lg transition-all"
                              style={{ color: "#8b949e" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "rgba(0, 227, 150, 0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "transparent";
                              }}
                            >
                              <BsEye />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1.5 rounded-lg transition-all"
                            style={{ color: "#8b949e" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "rgba(239, 68, 68, 0.1)";
                              e.currentTarget.style.color = "#f87171";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.color = "#8b949e";
                            }}
                          >
                            <BsTrash />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs mb-2" style={{ color: "#8b949e" }}>
                        {notification.message}
                      </p>

                      <div className="flex justify-between items-center">
                        <span
                          className="text-xs flex items-center gap-1"
                          style={{ color: "#555" }}
                        >
                          ⏱ {getRelativeTime(notification.timestamp)}
                        </span>
                        {notification.actionable && (
                          <button
                            onClick={() => handleAction(notification)}
                            className="px-3 py-1 rounded-lg text-xs font-bold transition-all hover:scale-105"
                            style={{
                              background:
                                "linear-gradient(135deg, #00E396, #00b377)",
                              color: "#0d1117",
                            }}
                          >
                            {notification.action}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
