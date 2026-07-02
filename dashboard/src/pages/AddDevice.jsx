import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStateContext } from "../contexts/ContextProvider.js";

const AddDevice = () => {
  const { currentColor, userData } = useStateContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [power, setPower] = useState("");
  const [energyClass, setEnergyClass] = useState("A");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const deviceData = {
      name: name,
      location: location,
      powerConsumption: parseFloat(power),
      energyClass: energyClass,
      userId: userData ? userData.id : 1,
    };

    try {
      const response = await fetch("http://localhost:8080/api/devices/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deviceData),
      });

      if (response.ok) {
        alert(t("addDevice.successMessage"));
        navigate("/devices");
      } else {
        alert(t("addDevice.errorMessage"));
      }
    } catch (error) {
      console.error("Eroare:", error);
      alert(t("addDevice.connectionError"));
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
      <div className="mb-10">
        <p className="text-3xl font-extrabold tracking-tight text-slate-900">
          {t("addDevice.title")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-lg">
        {/* Nume Dispozitiv */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            {t("addDevice.deviceName")}
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder={t("addDevice.namePlaceholder")}
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Locatie */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-gray-900">
            {t("addDevice.location")}
          </label>
          <select
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Kitchen">{t("addDevice.locations.kitchen")}</option>
            <option value="Living">{t("addDevice.locations.living")}</option>
            <option value="Bedroom">{t("addDevice.locations.bedroom")}</option>
            <option value="Bathroom">
              {t("addDevice.locations.bathroom")}
            </option>
            <option value="Office">{t("addDevice.locations.office")}</option>
            <option value="Hall">{t("addDevice.locations.hall")}</option>
          </select>
        </div>

        {/* Putere si Clasa */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              {t("addDevice.power")}
            </label>
            <input
              type="number"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder={t("addDevice.powerPlaceholder")}
              required
              value={power}
              onChange={(e) => setPower(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900">
              {t("addDevice.energyClass")}
            </label>
            <select
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={energyClass}
              onChange={(e) => setEnergyClass(e.target.value)}
            >
              <option value="A+++">A+++</option>
              <option value="A++">A++</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
              <option value="F">F</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          style={{ backgroundColor: currentColor }}
          className="text-white font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center hover:opacity-90"
        >
          {t("addDevice.submit")}
        </button>

        <button
          type="button"
          onClick={() => navigate("/devices")}
          className="ml-4 text-gray-500 hover:text-gray-900 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          {t("common.cancel")}
        </button>
      </form>
    </div>
  );
};

export default AddDevice;
