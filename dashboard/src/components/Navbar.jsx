import React, { useEffect, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { BsChatDots } from "react-icons/bs";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useTranslation } from "react-i18next";

import { Notification, UserProfile } from ".";
import ChatBot from "./ChatBotAi";
import NotificationCenter from "./NotificationCenter";
import { useStateContext } from "../contexts/ContextProvider";

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      onClick={() => customFunc()}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      <span
        style={{ background: dotColor }}
        className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2"
      />
      {icon}
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  const {
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setScreenSize,
    screenSize,
    userAvatar,
    setIsClicked,
  } = useStateContext();

  const { i18n } = useTranslation();
  const [showChatBot, setShowChatBot] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (screenSize <= 900) {
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  }, [screenSize]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const openNotificationCenter = () => {
    setIsClicked({ ...isClicked, notification: false });
    setShowNotificationCenter(true);
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ro" : "en";
    i18n.changeLanguage(newLang);
    localStorage.setItem("language", newLang);
  };

  return (
    <div className="flex justify-between p-2 md:ml-6 md:mr-6 relative">
      <NavButton
        title="Menu"
        customFunc={handleActiveMenu}
        color={currentColor}
        icon={<AiOutlineMenu />}
      />
      <div className="flex items-center">
        {/* ── BUTON LIMBĂ ── */}
        <button
          onClick={toggleLanguage}
          style={{ borderColor: currentColor, color: currentColor }}
          className="flex items-center gap-1 px-3 py-1 mr-2 rounded-full border text-sm font-bold hover:opacity-80 transition-all duration-200"
        >
          {i18n.language === "en" ? "🇷🇴 RO" : "🇬🇧 EN"}
        </button>

        <NavButton
          title="AI Assistant"
          customFunc={() => setShowChatBot(true)}
          color={currentColor}
          icon={<BsChatDots />}
        />
        <NavButton
          title="Notifications"
          dotColor="rgb(254, 201, 15)"
          customFunc={() => handleClick("notification")}
          color={currentColor}
          icon={<RiNotification3Line />}
        />
        <TooltipComponent content="Profile" position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer p-1 hover:bg-light-gray rounded-lg"
            onClick={() => handleClick("userProfile")}
          >
            <img
              className="rounded-full w-8 h-8 object-cover"
              src={userAvatar}
              alt="user-profile"
            />
            <p>
              <span className="text-gray-400 text-14">Hi,</span>{" "}
              <span className="text-gray-400 font-bold ml-1 text-14">
                Necula
              </span>
            </p>
            <MdKeyboardArrowDown className="text-gray-400 text-14" />
          </div>
        </TooltipComponent>

        {isClicked.notification && (
          <Notification openFullCenter={openNotificationCenter} />
        )}
        {isClicked.userProfile && <UserProfile />}

        {showChatBot && <ChatBot onClose={() => setShowChatBot(false)} />}

        {showNotificationCenter && (
          <NotificationCenter
            onClose={() => setShowNotificationCenter(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
