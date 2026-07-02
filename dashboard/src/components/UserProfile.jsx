import React from "react";
import { useNavigate } from "react-router-dom";
import { useStateContext } from "../contexts/ContextProvider";

const UserProfile = () => {
  const { userAvatar, handleClose, userData, logout } = useStateContext();
  const navigate = useNavigate();

  const handleEditProfileClick = () => {
    handleClose();
    navigate("/user-profile");
  };

  const performLogout = () => {
    logout();
    handleClose();
    navigate("/login");
  };

  return (
    <div
      className="nav-item absolute right-1 top-16 p-8 rounded-2xl w-96 shadow-2xl z-50"
      style={{
        backgroundColor: "#1a1e24",
        border: "1px solid rgba(0, 227, 150, 0.2)",
        boxShadow:
          "0 8px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 227, 150, 0.08)",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <p className="font-semibold text-lg text-white">User Profile</p>
        <button
          type="button"
          onClick={handleClose}
          className="p-2 rounded-lg transition-all"
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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Avatar Info */}
      <div
        className="flex gap-5 items-center pb-6 mb-6"
        style={{ borderBottom: "1px solid rgba(0, 227, 150, 0.15)" }}
      >
        <img
          className="rounded-full h-24 w-24 object-cover"
          style={{ border: "3px solid rgba(0, 227, 150, 0.4)" }}
          src={userAvatar}
          alt="user-profile"
        />
        <div className="flex flex-col gap-1 overflow-hidden">
          <p className="font-semibold text-xl text-white truncate">
            {userData.fullName}
          </p>
          <p className="text-sm" style={{ color: "#8b949e" }}>
            {userData.role}
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: "#00E396" }}
          >
            {userData.email}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button
          onClick={handleEditProfileClick}
          className="w-full py-3 font-medium rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-sm flex justify-center items-center gap-2"
          style={{
            background: "linear-gradient(135deg, #00E396, #00b377)",
            color: "#0d1117",
            boxShadow: "0 4px 15px rgba(0, 227, 150, 0.25)",
          }}
        >
          Edit Profile
        </button>

        <button
          onClick={performLogout}
          className="w-full py-2 font-medium rounded-xl transition-all"
          style={{
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#f87171",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            e.currentTarget.style.borderColor = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.4)";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UserProfile;
