import React, { createContext, useContext, useState, useEffect } from "react";

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

const defaultSettings = {
  monthlyTarget: 300,
  pricePerKwh: 1.3,
  currency: "RON",
  invoiceDay: 25,
  notificationsEnabled: true,
  notifyOverTarget: true,
  notifyHighConsumption: true,
  notifyDeviceIdle: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);

  // --- SETTINGS GLOBAL ---
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem("energytrack_settings");
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const updateSettings = (newSettings) => {
    setAppSettings(newSettings);
    localStorage.setItem("energytrack_settings", JSON.stringify(newSettings));
  };

  // --- STAREA DE LOGIN ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("user") ? true : false;
  });

  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser
      ? JSON.parse(savedUser)
      : {
          id: null,
          fullName: "Guest User",
          email: "",
          role: "Guest",
          phone: "",
          location: "",
          bio: "",
        };
  });

  const [userAvatar, setUserAvatar] = useState(
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
  );

  useEffect(() => {
    const currentThemeColor = localStorage.getItem("colorMode");
    const currentThemeMode = localStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    localStorage.setItem("themeMode", e.target.value);
  };

  const setColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem("colorMode", color);
  };

  const handleClick = (clicked) => {
    setIsClicked({ ...initialState, [clicked]: true });
  };

  const handleClose = () => {
    setIsClicked(initialState);
  };

  const login = (data) => {
    setIsLoggedIn(true);

    if (data.token) {
      localStorage.setItem("token", data.token);
    }

    if (data.id || data.email) {
      const userObj = {
        id: data.id,
        fullName:
          data.firstName && data.lastName
            ? `${data.firstName} ${data.lastName}`
            : data.firstName || data.name || "User",
        email: data.email,
        role: data.role || "User",
        phone: data.phoneNumber || "",
        location: data.housingType || "",
        bio: "EnergyTrack User",
      };

      setUserData(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserData({ id: null, fullName: "Guest" });

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsClicked(initialState);
  };

  return (
    <StateContext.Provider
      value={{
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick,
        handleClose,
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
        setCurrentColor,
        setCurrentMode,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        isLoggedIn,
        login,
        logout,
        userAvatar,
        setUserAvatar,
        userData,
        setUserData,
        appSettings,
        updateSettings,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
