import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import Profile from "./pages/Profile";

import { Navbar, Footer, ThemeSettings } from "./components";
import Sidebar from "./components/Sidebar";

// --- IMPORTĂM PAGINILE DE AUTH ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword"; // <--- NOU
import ResetPassword from "./pages/ResetPassword"; // <--- NOU

// --- IMPORTĂM PAGINILE PENTRU DISPOZITIVE ---
import Devices from "./pages/Devices";
import AddDevice from "./pages/AddDevice";

import History from "./pages/History";
import {
  Ecommerce,
  Orders,
  Calendar,
  // Employees,
  Stacked,
  Pyramid,
  Customers,
  Kanban,
  Line,
  Area,
  Bar,
  Pie,
  Financial,
  ColorPicker,
  ColorMapping,
  Editor,
} from "./pages";
import "./App.css";

// Importam contextul
import { useStateContext } from "./contexts/ContextProvider.js";

const App = () => {
  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    isLoggedIn,
  } = useStateContext();

  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    const currentThemeMode = localStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <BrowserRouter>
        <Routes>
          {/* --- RUTE PUBLICE (Accesibile fără login) --- */}
          <Route
            path="/login"
            element={!isLoggedIn ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!isLoggedIn ? <Register /> : <Navigate to="/" />}
          />

          {/* Rutele noi pentru Parolă Uitată - Trebuie să fie publice */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* --- RUTE PROTEJATE (Aplicația Principală / Dashboard) --- */}
          {/* Această rută "*" prinde orice alt URL. 
              Dacă e logat -> Arată Dashboard-ul.
              Dacă NU e logat -> Trimite la Login.
          */}
          <Route
            path="*"
            element={
              isLoggedIn ? (
                <div className="flex relative dark:bg-main-dark-bg">
                  {activeMenu ? (
                    <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
                      <Sidebar />
                    </div>
                  ) : (
                    <div className="w-0 dark:bg-secondary-dark-bg">
                      <Sidebar />
                    </div>
                  )}
                  <div
                    className={
                      activeMenu
                        ? "dark:bg-main-dark-bg bg-main-bg min-h-screen md:ml-72 w-full "
                        : "bg-main-bg dark:bg-main-dark-bg w-full min-h-screen flex-2 "
                    }
                  >
                    <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
                      <Navbar />
                    </div>
                    <div>
                      {themeSettings && <ThemeSettings />}
                      <Routes>
                        {/* dashboard  */}
                        <Route path="/" element={<Ecommerce />} />
                        <Route path="/dashboard" element={<Ecommerce />} />

                        {/* pages  */}
                        <Route path="/analytics" element={<Orders />} />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/add-device" element={<AddDevice />} />
                        <Route
                          path="/manual-tracking"
                          element={<Customers />}
                        />
                        <Route path="/history" element={<History />} />
                        <Route path="/user-profile" element={<Profile />} />

                        {/* apps  */}
                        <Route path="/kanban" element={<Kanban />} />

                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/settings" element={<Editor />} />

                        {/* charts  */}
                        <Route path="/line" element={<Line />} />

                        <Route path="/pie" element={<Pie />} />

                        <Route path="/pyramid" element={<Pyramid />} />
                        <Route path="/stacked" element={<Stacked />} />
                      </Routes>
                    </div>
                    <Footer />
                  </div>
                </div>
              ) : (
                // Daca nu e logat si incearca sa intre pe dashboard, redirect la Login
                <Navigate to="/login" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
