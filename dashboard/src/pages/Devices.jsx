import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Header } from "../components";
import PageWrapper from "../components/PageWrapper";
import {
  BsLightningChargeFill,
  BsSearch,
  BsPlus,
  BsTrash,
} from "react-icons/bs";
import { useStateContext } from "../contexts/ContextProvider";

const Devices = () => {
  const { currentColor, userData } = useStateContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    if (!userData?.id) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/devices/user/${userData.id}`,
      );
      if (response.ok) {
        const data = await response.json();
        setDevices(data);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [userData]);

  const handleToggleDevice = async (deviceId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/devices/${deviceId}/toggle`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (response.ok) {
        await fetchDevices();
      } else {
        alert(t("devices.toggleError"));
      }
    } catch (error) {
      alert(t("devices.networkError"));
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm(t("devices.deleteConfirm"))) return;
    try {
      const response = await fetch(
        `http://localhost:8080/api/devices/${deviceId}`,
        { method: "DELETE" },
      );
      if (response.ok) {
        setDevices((prev) => prev.filter((d) => d.id !== deviceId));
        alert(t("devices.deleteSuccess"));
      }
    } catch (error) {
      alert(t("devices.deleteError"));
    }
  };

  const filteredDevices = devices.filter(
    (device) =>
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <Header category="Page" title={t("devices.title")} />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
        <div className="flex justify-between items-center mb-8">
          <Header category="Page" title={t("devices.title")} />
          <button
            onClick={() => navigate("/add-device")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:opacity-90 transition-all"
            style={{ backgroundColor: currentColor }}
          >
            <BsPlus className="text-2xl" />
            {t("devices.addDevice")}
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <BsSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t("devices.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 focus:outline-none focus:border-blue-500 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.icon")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.name")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.location")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.power")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.class")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.status")}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold dark:text-gray-200">
                  {t("devices.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr
                  key={device.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                      <BsLightningChargeFill className="text-white text-xl" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold dark:text-gray-200">
                      {device.name}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      {device.location}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold dark:text-gray-200">
                      {device.powerConsumption}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {device.energyClass || "B"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleToggleDevice(device.id, device.active)
                      }
                      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 ${device.active ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-gray-300 dark:bg-gray-600"} hover:scale-110 active:scale-95`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${device.active ? "translate-x-9" : "translate-x-1"}`}
                      />
                    </button>
                    <span
                      className={`text-sm font-bold ml-2 ${device.active ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
                    >
                      {device.active
                        ? `✅ ${t("devices.on")}`
                        : `⏸️ ${t("devices.off")}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 transition-colors"
                    >
                      <BsTrash className="text-red-600 dark:text-red-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDevices.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <BsLightningChargeFill className="text-6xl mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">{t("devices.noDevices")}</p>
              <p className="text-sm">{t("devices.noDevicesHint")}</p>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default Devices;
