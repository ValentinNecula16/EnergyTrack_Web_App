import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStateContext } from "../contexts/ContextProvider";

const Profile = () => {
  const { userAvatar, setUserAvatar, userData, setUserData } =
    useStateContext();
  const { t } = useTranslation();
  const [formData, setFormData] = useState(userData);
  const [previewImage, setPreviewImage] = useState(userAvatar);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFormData(userData);
    setPreviewImage(userAvatar);
  }, [userData, userAvatar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setPreviewImage(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, avatarUrl: previewImage }),
        },
      );
      if (response.ok) {
        setUserData(formData);
        setUserAvatar(previewImage);
        setMessage(t("profile.successMsg"));
      } else {
        setUserData(formData);
        setUserAvatar(previewImage);
        setMessage(t("profile.savedLocally"));
      }
    } catch (error) {
      setUserData(formData);
      setUserAvatar(previewImage);
      setMessage(t("profile.savedNetwork"));
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "p-3 rounded-xl bg-gray-50 dark:bg-main-dark-bg dark:text-white outline-none transition-all";
  const inputStyle = { border: "1px solid rgba(0, 227, 150, 0.2)" };
  const handleFocus = (e) => {
    e.target.style.borderColor = "#00E396";
    e.target.style.boxShadow = "0 0 0 3px rgba(0, 227, 150, 0.15)";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(0, 227, 150, 0.2)";
    e.target.style.boxShadow = "none";
  };

  return (
    <div className="mt-20 md:mt-10 p-4 md:p-10 bg-main-bg dark:bg-main-dark-bg min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div
          className="relative bg-white dark:bg-secondary-dark-bg p-8 rounded-3xl shadow-xl overflow-hidden"
          style={{ border: "1px solid rgba(0, 227, 150, 0.1)" }}
        >
          <div
            className="absolute top-0 left-0 w-full h-32 opacity-80"
            style={{ background: "linear-gradient(135deg, #00E396, #00b377)" }}
          />
          <div className="relative mt-16 flex flex-col items-center">
            <div className="relative group">
              <div
                className="w-32 h-32 rounded-full overflow-hidden shadow-lg bg-gray-200"
                style={{ border: "4px solid #00E396" }}
              >
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label
                htmlFor="avatar-upload-page"
                className="absolute bottom-0 right-0 text-white p-2 rounded-full cursor-pointer shadow-md transition-all"
                style={{ backgroundColor: "#00E396", color: "#0d1117" }}
                title={t("profile.changePhoto")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                  />
                </svg>
                <input
                  type="file"
                  id="avatar-upload-page"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            <h1 className="mt-4 text-3xl font-bold dark:text-white text-gray-800">
              {formData.fullName}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">{formData.role}</p>
            {message && (
              <div
                className="mt-4 p-3 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: "rgba(0, 227, 150, 0.15)",
                  color: "#00E396",
                  border: "1px solid rgba(0, 227, 150, 0.3)",
                }}
              >
                {message}
              </div>
            )}
            <form
              onSubmit={handleSave}
              className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-12 w-full"
            >
              {[
                {
                  label: t("profile.fullName"),
                  name: "fullName",
                  type: "text",
                },
                { label: t("profile.email"), name: "email", type: "email" },
                { label: t("profile.phone"), name: "phone", type: "text" },
                {
                  label: t("profile.location"),
                  name: "location",
                  type: "text",
                },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-2">
                  <label className="text-gray-500 dark:text-gray-400 font-medium">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    className={inputClass}
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-gray-500 dark:text-gray-400 font-medium">
                  {t("profile.bio")}
                </label>
                <textarea
                  name="bio"
                  value={formData.bio || ""}
                  onChange={handleChange}
                  rows="3"
                  className={`${inputClass} resize-none`}
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 text-black font-bold rounded-xl shadow-lg hover:opacity-90 transition-transform active:scale-95 flex items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #00E396, #00b377)",
                    boxShadow: "0 4px 15px rgba(0, 227, 150, 0.3)",
                  }}
                >
                  {loading ? t("profile.saving") : t("profile.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
