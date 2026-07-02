import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStateContext } from "../contexts/ContextProvider";

// Folosim chei de traducere (titleKey/descKey) în loc de text hardcodat
const initialGoals = {
  todo: [
    {
      id: "g1",
      titleKey: "kanban.goal1Title",
      descKey: "kanban.goal1Desc",
      impact: "~5% savings",
      priority: "medium",
    },
    {
      id: "g2",
      titleKey: "kanban.goal2Title",
      descKey: "kanban.goal2Desc",
      impact: "~15% on lighting",
      priority: "high",
    },
    {
      id: "g3",
      titleKey: "kanban.goal3Title",
      descKey: "kanban.goal3Desc",
      impact: "~10% on cooling",
      priority: "medium",
    },
    {
      id: "g4",
      titleKey: "kanban.goal4Title",
      descKey: "kanban.goal4Desc",
      impact: "~3% savings",
      priority: "low",
    },
  ],
  inProgress: [
    {
      id: "g5",
      titleKey: "kanban.goal5Title",
      descKey: "kanban.goal5Desc",
      impact: "Awareness",
      priority: "high",
    },
    {
      id: "g6",
      titleKey: "kanban.goal6Title",
      descKey: "kanban.goal6Desc",
      impact: "~5% on fridge",
      priority: "medium",
    },
  ],
  done: [
    {
      id: "g7",
      titleKey: "kanban.goal7Title",
      descKey: "kanban.goal7Desc",
      impact: "Full visibility",
      priority: "high",
    },
  ],
};

const Kanban = () => {
  const { userData } = useStateContext();
  const { t } = useTranslation();

  const [goals, setGoals] = useState(initialGoals);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addColumn, setAddColumn] = useState("todo");
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    impact: "",
    priority: "medium",
  });
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/devices/dashboard/${userData.id}`,
        );
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchData();
  }, [userData]);

  const handleDragStart = (item, source) => {
    setDraggedItem(item);
    setDragSource(source);
  };

  const handleDrop = (target) => {
    if (!draggedItem || dragSource === target) return;
    setGoals((prev) => ({
      ...prev,
      [dragSource]: prev[dragSource].filter((g) => g.id !== draggedItem.id),
      [target]: [...prev[target], draggedItem],
    }));
    setDraggedItem(null);
    setDragSource(null);
  };

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;
    // Goal-urile adăugate de user folosesc `title`/`description` (text direct)
    const goal = { ...newGoal, id: `g${Date.now()}` };
    setGoals((prev) => ({ ...prev, [addColumn]: [...prev[addColumn], goal] }));
    setNewGoal({ title: "", description: "", impact: "", priority: "medium" });
    setShowAddModal(false);
  };

  const handleDeleteGoal = (column, goalId) => {
    setGoals((prev) => ({
      ...prev,
      [column]: prev[column].filter((g) => g.id !== goalId),
    }));
  };

  // Returnează titlul tradus: dacă are titleKey → t(titleKey), altfel title direct
  const getTitle = (goal) =>
    goal.titleKey ? t(goal.titleKey) : goal.title || "";

  // Returnează descrierea tradusă
  const getDesc = (goal) =>
    goal.descKey ? t(goal.descKey) : goal.description || "";

  const priorityColors = {
    high: {
      bg: "rgba(239, 68, 68, 0.15)",
      border: "rgba(239, 68, 68, 0.3)",
      text: "#f87171",
    },
    medium: {
      bg: "rgba(251, 191, 36, 0.15)",
      border: "rgba(251, 191, 36, 0.3)",
      text: "#fbbf24",
    },
    low: {
      bg: "rgba(0, 227, 150, 0.15)",
      border: "rgba(0, 227, 150, 0.3)",
      text: "#00E396",
    },
  };

  const priorityLabel = (priority) => {
    if (priority === "high") return t("kanban.highPriority");
    if (priority === "medium") return t("kanban.mediumPriority");
    return t("kanban.lowPriority");
  };

  const columns = [
    { key: "todo", title: t("kanban.todo"), emoji: "📋", color: "#f87171" },
    {
      key: "inProgress",
      title: t("kanban.inProgress"),
      emoji: "🔄",
      color: "#fbbf24",
    },
    { key: "done", title: t("kanban.done"), emoji: "✅", color: "#00E396" },
  ];

  const totalGoals =
    goals.todo.length + goals.inProgress.length + goals.done.length;
  const completionRate =
    totalGoals > 0 ? Math.round((goals.done.length / totalGoals) * 100) : 0;

  return (
    <div
      className="m-4 md:m-10 mt-24 p-6 md:p-8 rounded-3xl"
      style={{
        backgroundColor: "#1a1e24",
        border: "1px solid rgba(0, 227, 150, 0.15)",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <p className="text-sm" style={{ color: "#00E396" }}>
            {t("kanban.category")}
          </p>
          <p className="text-2xl font-bold text-white">{t("kanban.title")}</p>
          <p className="text-sm mt-1" style={{ color: "#8b949e" }}>
            {t("kanban.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="px-4 py-2 rounded-xl"
            style={{
              backgroundColor: "#21262d",
              border: "1px solid rgba(0, 227, 150, 0.2)",
            }}
          >
            <span className="text-sm" style={{ color: "#8b949e" }}>
              {t("kanban.completion")}{" "}
            </span>
            <span className="font-bold" style={{ color: "#00E396" }}>
              {completionRate}%
            </span>
          </div>
          {dashboardData && (
            <div
              className="px-4 py-2 rounded-xl"
              style={{
                backgroundColor: "#21262d",
                border: "1px solid rgba(0, 227, 150, 0.2)",
              }}
            >
              <span className="text-sm" style={{ color: "#8b949e" }}>
                {t("kanban.current")}{" "}
              </span>
              <span className="font-bold" style={{ color: "#00E396" }}>
                {dashboardData.totalKwh?.toFixed(1)} kWh
              </span>
            </div>
          )}
          <button
            onClick={() => {
              setAddColumn("todo");
              setShowAddModal(true);
            }}
            className="px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #00E396, #00b377)",
              color: "#0d1117",
            }}
          >
            {t("kanban.addGoal")}
          </button>
        </div>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map((col) => (
          <div
            key={col.key}
            className="rounded-2xl p-4 min-h-[400px] transition-all"
            style={{
              backgroundColor: "#21262d",
              border: "1px solid rgba(0, 227, 150, 0.1)",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(col.key)}
          >
            {/* Column Header */}
            <div
              className="flex items-center justify-between mb-4 pb-3"
              style={{ borderBottom: `2px solid ${col.color}` }}
            >
              <div className="flex items-center gap-2">
                <span>{col.emoji}</span>
                <span className="font-bold text-white">{col.title}</span>
              </div>
              <span
                className="text-xs px-2 py-1 rounded-full font-bold"
                style={{ backgroundColor: `${col.color}20`, color: col.color }}
              >
                {goals[col.key].length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-3">
              {goals[col.key].map((goal) => {
                const pColor =
                  priorityColors[goal.priority] || priorityColors.medium;
                return (
                  <div
                    key={goal.id}
                    draggable
                    onDragStart={() => handleDragStart(goal, col.key)}
                    className="p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] group"
                    style={{
                      backgroundColor: "#1a1e24",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-white text-sm flex-1">
                        {getTitle(goal)}
                      </h4>
                      <button
                        onClick={() => handleDeleteGoal(col.key, goal.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all ml-2 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    {(goal.descKey || goal.description) && (
                      <p className="text-xs mb-3" style={{ color: "#8b949e" }}>
                        {getDesc(goal)}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {goal.impact && (
                        <span
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{
                            backgroundColor: "rgba(0, 227, 150, 0.1)",
                            color: "#00E396",
                          }}
                        >
                          {goal.impact}
                        </span>
                      )}
                      <span
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                          backgroundColor: pColor.bg,
                          border: `1px solid ${pColor.border}`,
                          color: pColor.text,
                        }}
                      >
                        {priorityLabel(goal.priority)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowAddModal(false)}
          />
          <div
            className="relative p-6 rounded-2xl w-full max-w-md"
            style={{
              backgroundColor: "#1a1e24",
              border: "1px solid rgba(0, 227, 150, 0.2)",
            }}
          >
            <h3 className="text-lg font-bold text-white mb-4">
              {t("kanban.addNewGoal")}
            </h3>

            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder={t("kanban.goalTitle")}
                value={newGoal.title}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, title: e.target.value })
                }
                className="px-4 py-3 rounded-xl text-white focus:outline-none"
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid rgba(0, 227, 150, 0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#00E396";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
                }}
              />
              <textarea
                placeholder={t("kanban.description")}
                rows={3}
                value={newGoal.description}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, description: e.target.value })
                }
                className="px-4 py-3 rounded-xl text-white focus:outline-none resize-none"
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid rgba(0, 227, 150, 0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#00E396";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
                }}
              />
              <input
                type="text"
                placeholder={t("kanban.impact")}
                value={newGoal.impact}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, impact: e.target.value })
                }
                className="px-4 py-3 rounded-xl text-white focus:outline-none"
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid rgba(0, 227, 150, 0.2)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#00E396";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
                }}
              />
              <select
                value={newGoal.priority}
                onChange={(e) =>
                  setNewGoal({ ...newGoal, priority: e.target.value })
                }
                className="px-4 py-3 rounded-xl text-white focus:outline-none cursor-pointer appearance-none"
                style={{
                  backgroundColor: "#0d1117",
                  border: "1px solid rgba(0, 227, 150, 0.2)",
                }}
              >
                <option value="low" style={{ backgroundColor: "#0d1117" }}>
                  {t("kanban.lowPriority")}
                </option>
                <option value="medium" style={{ backgroundColor: "#0d1117" }}>
                  {t("kanban.mediumPriority")}
                </option>
                <option value="high" style={{ backgroundColor: "#0d1117" }}>
                  {t("kanban.highPriority")}
                </option>
              </select>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl font-medium transition-all"
                  style={{
                    backgroundColor: "#21262d",
                    color: "#8b949e",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {t("kanban.cancel")}
                </button>
                <button
                  onClick={handleAddGoal}
                  className="flex-1 py-3 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  style={{
                    background: "linear-gradient(135deg, #00E396, #00b377)",
                    color: "#0d1117",
                  }}
                >
                  {t("kanban.add")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kanban;
