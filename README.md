## 📖 About

EnergyTrack is my Bachelor's Degree project developed at **Transilvania University of Brașov**.

The application helps residential users understand their electricity consumption by providing a **virtual smart energy meter** that estimates power usage without requiring expensive IoT devices.

Unlike traditional energy provider applications, EnergyTrack provides:

- ⚡ Real-time consumption simulation
- 📈 Interactive analytics
- 📅 Daily & monthly history
- 🤖 Pattern Learning algorithm
- 🔄 Automatic consumption simulation
- 📄 PDF invoice generation
- 🔔 Smart notification system
- 🌍 Multi-language support

---

# 🚀 Features

### 👤 Authentication

- Register
- Login
- Secure password hashing (BCrypt)

---

### ⚡ Device Management

- Add devices
- Edit devices
- Delete devices
- Turn devices ON/OFF
- Device categories
- Energy class support

---

### 📊 Dashboard

- Monthly consumption
- Estimated monthly cost
- Active devices
- Live statistics
- Consumption charts

---

### 📅 Calendar

- Daily energy heatmap
- Daily consumption reports
- Timeline visualization

---

### 📈 Analytics

- 30-day trends
- Weekly performance
- Peak hours heatmap
- Consumption distribution

---

### 🧠 Pattern Learning

EnergyTrack learns user behaviour.

The user manually enters daily usage for several days.

The application computes:

- Mean (μ)
- Standard Deviation (σ)

Then generates realistic daily usage using Gaussian sampling.

```
hours = μ + random.nextGaussian() × σ
```

---

### 🔄 Consumption Simulation Engine

The application includes three custom algorithms:

### Periodic Scheduler

Runs every 30 minutes.

Calculates:

```
Consumption = Power(kW) × 0.5h
```

---

### Catch-up Algorithm

One of the most important features.

If the server was offline:

- 2 hours
- 2 days
- even several weeks

EnergyTrack reconstructs missing consumption records automatically.

No gaps remain inside the database.

---

### Monthly Reset

Automatically resets monthly totals on the first day of every month.

---

### 🔔 Notifications

- Saving recommendations
- High consumption alerts
- Monthly target alerts
- Notification Center

---

### 📄 PDF Reports

Generate monthly electricity reports in PDF format.

---

### 🌍 Internationalization

- Romanian 🇷🇴
- English 🇬🇧

---

# 🏗 Architecture

```
React.js
      │
 REST API
      │
Spring Boot
      │
Hibernate / JPA
      │
PostgreSQL
```

---

# 🛠 Tech Stack

### Frontend

- React
- TailwindCSS
- Recharts
- React Context API
- React Router
- jsPDF
- react-i18next

### Backend

- Java 17
- Spring Boot
- Spring Data JPA
- Hibernate
- REST API
- BCrypt

### Database

- PostgreSQL

---

# 📂 Database

Main entities:

- Users
- Devices
- Consumption Logs
- Device Patterns
- Push Subscriptions

---

# 📸 Screenshots

> Add screenshots here

- Dashboard
- Analytics
- Calendar
- History
- Manual Tracking
- Devices
- ChatBot

---

# 💡 Future Improvements

- IoT Smart Plug Integration
- Mobile App (React Native)
- LSTM Consumption Prediction
- Anomaly Detection
- Cloud Deployment

---

# 🎓 Academic Project

Bachelor's Degree Project

Faculty of Electrical Engineering and Computer Science

Transilvania University of Brașov

2026

---

# 👨‍💻 Author

**Necula Valentin Mirel**
