import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "../components";
import { useStateContext } from "../contexts/ContextProvider";
import {
  BsLightningChargeFill,
  BsX,
  BsPlus,
  BsTrash,
  BsCheckCircle,
  BsXCircle,
  BsClock,
  BsCalendar3,
  BsTextLeft,
} from "react-icons/bs";

const Calendar = () => {
  const { currentColor, userData } = useStateContext();
  const { t, i18n } = useTranslation();

  const [dashboardData, setDashboardData] = useState(null);
  const [dailyData, setDailyData] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState({});
  const [newNote, setNewNote] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Locale helper
  const locale = i18n.language === "ro" ? "ro-RO" : "en-US";

  const getMonthName = (year, month) =>
    new Date(year, month, 1).toLocaleString(locale, { month: "long" });

  const getDayNames = () => {
    if (i18n.language === "ro") {
      return ["Dum", "Lun", "Mar", "Mie", "Joi", "Vin", "Sâm"];
    }
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  };

  // Fetch dashboard data
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
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userData]);

  // Fetch real daily consumption from DB
  useEffect(() => {
    const fetchDailyData = async () => {
      if (!userData?.id) return;
      try {
        const response = await fetch(
          `http://localhost:8080/api/devices/daily-consumption/${userData.id}?month=${month + 1}&year=${year}`,
        );
        if (response.ok) {
          const data = await response.json();
          setDailyData(data);
        }
      } catch (error) {
        console.error("Error fetching daily data:", error);
      }
    };
    fetchDailyData();
  }, [userData, currentMonth]);

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem("energyCalendarNotes");
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  const saveNotes = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem("energyCalendarNotes", JSON.stringify(updatedNotes));
  };

  // ============================================
  // CALENDAR LOGIC
  // ============================================

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } =
    getDaysInMonth(currentMonth);

  const getDayConsumption = (day) => {
    const today = new Date();
    const thisDay = new Date(year, month, day);

    if (thisDay > today) return null;

    const realValue = dailyData[day];
    if (realValue !== undefined) {
      return parseFloat(realValue).toFixed(2);
    }

    return null;
  };

  const getConsumptionColor = (consumption) => {
    if (!consumption) return "bg-[#1E1E1E] border-[#2A2A2A]";
    const value = parseFloat(consumption);
    if (value < 10) return "bg-[#00FF8730] border-[#00FF87]";
    if (value < 20) return "bg-[#FFD70030] border-[#FFD700]";
    return "bg-[#FF444430] border-[#FF4444]";
  };

  const getConsumptionEmoji = (consumption) => {
    if (!consumption) return "⚪";
    const value = parseFloat(consumption);
    if (value < 10) return "🟢";
    if (value < 20) return "🟡";
    return "🔴";
  };

  const getDayDeviceActivity = (day) => {
    if (!dashboardData) return [];

    const dayConsumption = getDayConsumption(day);
    if (!dayConsumption) return [];

    return dashboardData.deviceBreakdown.slice(0, 10).map((device) => {
      const isWeekend =
        new Date(year, month, day).getDay() === 0 ||
        new Date(year, month, day).getDay() === 6;

      const baseHours = Math.random() * 8 + 4;
      const weekendBonus = isWeekend ? 2 : 0;
      const hoursOn = (baseHours + weekendBonus).toFixed(1);

      const startHour = Math.floor(Math.random() * 8 + 6);
      const endHour = Math.min(23, startHour + Math.floor(parseFloat(hoursOn)));

      const dailyConsumption = (device.kwh / 30).toFixed(2);

      return {
        name: device.name,
        hoursOn: hoursOn,
        startTime: `${String(startHour).padStart(2, "0")}:00`,
        endTime: `${String(endHour).padStart(2, "0")}:00`,
        consumption: dailyConsumption,
        status:
          parseFloat(hoursOn) > 8
            ? "high"
            : parseFloat(hoursOn) > 5
              ? "normal"
              : "low",
      };
    });
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day) => {
    const consumption = getDayConsumption(day);
    if (!consumption) return;

    setSelectedDate({
      day,
      month,
      year,
      consumption,
      devices: getDayDeviceActivity(day),
    });
    setShowModal(true);
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedDate) return;

    const dateKey = `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day}`;
    const updatedNotes = {
      ...notes,
      [dateKey]: [
        ...(notes[dateKey] || []),
        {
          id: Date.now(),
          text: newNote,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    saveNotes(updatedNotes);
    setNewNote("");
  };

  const deleteNote = (noteId) => {
    const dateKey = `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day}`;
    const updatedNotes = {
      ...notes,
      [dateKey]: notes[dateKey].filter((note) => note.id !== noteId),
    };
    saveNotes(updatedNotes);
  };

  const getDateNotes = () => {
    if (!selectedDate) return [];
    const dateKey = `${selectedDate.year}-${selectedDate.month + 1}-${selectedDate.day}`;
    return notes[dateKey] || [];
  };

  const dayNames = getDayNames();

  const calendarDays = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const realDays = Object.values(dailyData)
    .map((v) => parseFloat(v))
    .filter((v) => v > 0);
  const highestDay =
    realDays.length > 0 ? Math.max(...realDays).toFixed(1) : "0";
  const lowestDay =
    realDays.length > 0 ? Math.min(...realDays).toFixed(1) : "0";
  const averageDay =
    realDays.length > 0
      ? (realDays.reduce((a, b) => a + b, 0) / realDays.length).toFixed(1)
      : "0";

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-[#0F0F0F] min-h-screen rounded-3xl">
      <Header category={t("calendar.category")} title={t("calendar.title")} />

      {/* Month Navigation */}
      <div className="bg-gradient-to-r from-[#1A1A1A] via-[#1E1E1E] to-[#1A1A1A] rounded-2xl p-6 mb-8 shadow-2xl border border-[#2A2A2A]">
        <div className="flex justify-between items-center">
          <button
            onClick={previousMonth}
            className="px-6 py-3 bg-[#1E1E1E] hover:bg-[#00FF8720] border-2 border-[#2A2A2A] hover:border-[#00FF87] rounded-xl transition-all text-white font-bold hover:shadow-[0_0_20px_rgba(0,255,135,0.3)]"
          >
            {t("calendar.previous")}
          </button>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <BsCalendar3 className="text-[#00FF87]" />
            {getMonthName(year, month)} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="px-6 py-3 bg-[#1E1E1E] hover:bg-[#00FF8720] border-2 border-[#2A2A2A] hover:border-[#00FF87] rounded-xl transition-all text-white font-bold hover:shadow-[0_0_20px_rgba(0,255,135,0.3)]"
          >
            {t("calendar.next")}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-2xl mb-8 border border-[#2A2A2A]">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-bold text-[#00FF87] py-2 text-sm uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const consumption = getDayConsumption(day);
            const emoji = getConsumptionEmoji(consumption);
            const colorClass = getConsumptionColor(consumption);
            const isToday =
              day === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <button
                key={day}
                onClick={() => consumption && handleDayClick(day)}
                disabled={!consumption}
                className={`
                  aspect-square p-3 rounded-xl border-2 transition-all
                  ${colorClass}
                  ${
                    consumption
                      ? "hover:scale-105 hover:shadow-[0_0_20px_rgba(0,255,135,0.4)] cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }
                  ${isToday ? "ring-2 ring-[#00FF87] ring-offset-2 ring-offset-[#0F0F0F]" : ""}
                  group
                `}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span
                    className={`text-lg font-bold ${
                      consumption ? "text-white" : "text-[#707070]"
                    }`}
                  >
                    {day}
                  </span>
                  {consumption && (
                    <span className="text-xs text-[#A0A0A0] mt-1 group-hover:text-white transition-colors">
                      {consumption} kWh
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#00FF8720] to-[#00D97E20] rounded-xl p-6 border-2 border-[#00FF87] shadow-lg hover:shadow-[0_0_30px_rgba(0,255,135,0.3)] transition-all">
          <BsLightningChargeFill className="text-3xl text-[#00FF87] mb-2" />
          <p className="text-sm text-[#A0A0A0]">{t("calendar.highestDay")}</p>
          <h3 className="text-3xl font-bold text-white">{highestDay} kWh</h3>
        </div>

        <div className="bg-gradient-to-br from-[#20B2AA20] to-[#00CED120] rounded-xl p-6 border-2 border-[#20B2AA] shadow-lg hover:shadow-[0_0_30px_rgba(32,178,170,0.3)] transition-all">
          <span className="text-3xl mb-2 block">📉</span>
          <p className="text-sm text-[#A0A0A0]">{t("calendar.lowestDay")}</p>
          <h3 className="text-3xl font-bold text-white">{lowestDay} kWh</h3>
        </div>

        <div className="bg-gradient-to-br from-[#9D4EDD20] to-[#7B2CBF20] rounded-xl p-6 border-2 border-[#9D4EDD] shadow-lg hover:shadow-[0_0_30px_rgba(157,78,221,0.3)] transition-all">
          <BsCheckCircle className="text-3xl text-[#9D4EDD] mb-2" />
          <p className="text-sm text-[#A0A0A0]">{t("calendar.daysWithData")}</p>
          <h3 className="text-3xl font-bold text-white">{realDays.length}</h3>
        </div>

        <div className="bg-gradient-to-br from-[#FFD70020] to-[#FFA50020] rounded-xl p-6 border-2 border-[#FFD700] shadow-lg hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all">
          <BsLightningChargeFill className="text-3xl text-[#FFD700] mb-2" />
          <p className="text-sm text-[#A0A0A0]">{t("calendar.averageDaily")}</p>
          <h3 className="text-3xl font-bold text-white">{averageDay} kWh</h3>
        </div>
      </div>

      {/* Day Detail Modal */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1A1A1A] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-slideUp border-2 border-[#2A2A2A]">
            {/* Modal Header */}
            <div
              className="p-6 text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #00FF87, #20B2AA)",
              }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      {getMonthName(selectedDate.year, selectedDate.month)}{" "}
                      {selectedDate.day}, {selectedDate.year}
                    </h2>
                    <p className="text-black opacity-90">
                      {t("calendar.dailyReport")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <BsX className="text-3xl" />
                  </button>
                </div>

                {/* Day Summary */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
                    <p className="text-sm opacity-90">
                      {t("calendar.totalConsumption")}
                    </p>
                    <h3 className="text-4xl font-bold">
                      {selectedDate.consumption} kWh
                    </h3>
                  </div>
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl p-4 border border-white border-opacity-30">
                    <p className="text-sm opacity-90">
                      {t("calendar.totalCost")}
                    </p>
                    <h3 className="text-4xl font-bold">
                      {(selectedDate.consumption * 1.3).toFixed(2)} RON
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-300px)] bg-[#0F0F0F]">
              {/* Device Activity Timeline */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BsClock className="text-[#00FF87]" />{" "}
                  {t("calendar.deviceActivity")}
                </h3>
                <div className="space-y-3">
                  {selectedDate.devices.map((device, index) => (
                    <div
                      key={index}
                      className="bg-[#1A1A1A] rounded-xl p-4 hover:shadow-[0_0_20px_rgba(0,255,135,0.2)] transition-shadow border-l-4 border-[#2A2A2A] hover:border-[#00FF87]"
                      style={{
                        borderLeftColor:
                          device.status === "high"
                            ? "#FF4444"
                            : device.status === "normal"
                              ? "#FFD700"
                              : "#00FF87",
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-white">
                          {device.name}
                        </span>
                        <span
                          className="text-sm px-3 py-1 rounded-full font-semibold"
                          style={{
                            backgroundColor:
                              device.status === "high"
                                ? "#FF444420"
                                : device.status === "normal"
                                  ? "#FFD70020"
                                  : "#00FF8720",
                            color:
                              device.status === "high"
                                ? "#FF4444"
                                : device.status === "normal"
                                  ? "#FFD700"
                                  : "#00FF87",
                          }}
                        >
                          {device.hoursOn}
                          {t("calendar.hoursActive")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[#A0A0A0]">
                        <span className="flex items-center gap-1">
                          <BsCheckCircle className="text-[#00FF87]" />
                          {t("calendar.on")} {device.startTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <BsXCircle className="text-[#FF4444]" />
                          {t("calendar.off")} {device.endTime}
                        </span>
                        <span className="ml-auto font-semibold text-white">
                          {device.consumption} kWh
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes Section */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <BsTextLeft className="text-[#20B2AA]" />{" "}
                  {t("calendar.notes")}
                </h3>

                <div className="space-y-2 mb-4">
                  {getDateNotes().map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#20B2AA20] rounded-lg p-3 flex justify-between items-start group hover:shadow-[0_0_15px_rgba(32,178,170,0.3)] transition-shadow border border-[#20B2AA30]"
                    >
                      <div className="flex-1">
                        <p className="text-white">{note.text}</p>
                        <p className="text-xs text-[#707070] mt-1">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-[#FF444420] rounded-lg"
                      >
                        <BsTrash className="text-[#FF4444]" />
                      </button>
                    </div>
                  ))}

                  {getDateNotes().length === 0 && (
                    <p className="text-center text-[#707070] py-4">
                      {t("calendar.noNotes")}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addNote()}
                    placeholder={t("calendar.addNote")}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-[#2A2A2A] bg-[#1A1A1A] focus:outline-none focus:border-[#00FF87] text-white placeholder-[#707070]"
                  />
                  <button
                    onClick={addNote}
                    disabled={!newNote.trim()}
                    className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 flex items-center gap-2 bg-gradient-to-r from-[#00FF87] to-[#00D97E] hover:shadow-[0_0_20px_rgba(0,255,135,0.4)] disabled:hover:shadow-none"
                    style={{
                      backgroundColor: !newNote.trim() ? "#2A2A2A" : "",
                    }}
                  >
                    <BsPlus className="text-2xl" />
                    {t("calendar.add")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Calendar;
