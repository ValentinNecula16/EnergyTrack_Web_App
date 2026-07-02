import React from "react";
import {
  AiOutlineCalendar,
  AiOutlineShoppingCart,
  AiOutlineAreaChart,
  AiOutlineBarChart,
  AiOutlineStock,
} from "react-icons/ai";
import {
  FiShoppingBag,
  FiEdit,
  FiPieChart,
  FiBarChart,
  FiCreditCard,
  FiStar,
  FiShoppingCart,
  FiSettings,
} from "react-icons/fi";
import { FiClock } from "react-icons/fi";
import {
  BsKanban,
  BsBarChart,
  BsBoxSeam,
  BsCurrencyDollar,
  BsShield,
  BsChatLeft,
} from "react-icons/bs";
import { BiColorFill } from "react-icons/bi";
import { IoMdContacts } from "react-icons/io";
import { RiContactsLine, RiStockLine } from "react-icons/ri";
// Importuri corectate pentru iconite noi
import {
  MdOutlineSupervisorAccount,
  MdOutlineBolt,
  MdOutlineDevices,
} from "react-icons/md";
import { HiOutlineRefresh } from "react-icons/hi";
import { TiTick } from "react-icons/ti";
import { GiLouvrePyramid } from "react-icons/gi";
import { GrLocation } from "react-icons/gr";
import avatar from "./avatar.jpg";
import avatar2 from "./avatar2.jpg";
import avatar3 from "./avatar3.png";
import avatar4 from "./avatar4.jpg";
import product1 from "./product1.jpg";
import product2 from "./product2.jpg";
import product3 from "./product3.jpg";
import product4 from "./product4.jpg";
import product5 from "./product5.jpg";
import product6 from "./product6.jpg";
import product7 from "./product7.jpg";
import product8 from "./product8.jpg";

// --- GRID TEMPLATES ---

export const gridOrderImage = (props) => (
  <div>
    <img
      className="rounded-xl h-20 md:ml-3"
      src={props.ProductImage}
      alt="order-item"
    />
  </div>
);

export const gridOrderStatus = (props) => (
  <button
    type="button"
    style={{ background: props.StatusBg }}
    className="text-white py-1 px-2 capitalize rounded-2xl text-md"
  >
    {props.Status}
  </button>
);

export const gridEmployeeProfile = (props) => (
  <div className="flex items-center gap-2">
    <img
      className="rounded-full w-10 h-10"
      src={props.EmployeeImage}
      alt="employee"
    />
    <p>{props.Name}</p>
  </div>
);

export const gridEmployeeCountry = (props) => (
  <div className="flex items-center justify-center gap-2">
    <GrLocation />
    <span>{props.Country}</span>
  </div>
);

// --- DATE PENTRU DASHBOARD (ECOMMERCE) ---

// Datele pentru cele 3 carduri de sus (Consum, Aparate, Cost)
export const earningData = [
  {
    icon: <MdOutlineBolt />,
    amount: "245 kWh",
    percentage: "-4%",
    title: "Energy Usage",
    iconColor: "#03C9D7",
    iconBg: "#E5FAFB",
    pcColor: "red-600",
  },
  {
    icon: <MdOutlineDevices />,
    amount: "12",
    percentage: "+2 New",
    title: "Connected Devices",
    iconColor: "rgb(255, 244, 229)",
    iconBg: "rgb(254, 201, 15)",
    pcColor: "green-600",
  },
  {
    icon: <BsCurrencyDollar />,
    amount: "196 RON",
    percentage: "+15%",
    title: "Estimated Cost",
    iconColor: "rgb(228, 106, 118)",
    iconBg: "rgb(255, 244, 229)",
    pcColor: "green-600",
  },
];

// Date pentru tranzactii recente (Istoric Citiri)
export const recentTransactions = [
  {
    icon: <MdOutlineBolt />,
    amount: "14500 kWh",
    title: "Citire Index",
    desc: "01 Noiembrie 2025",
    iconColor: "#03C9D7",
    iconBg: "#E5FAFB",
    pcColor: "green-600",
  },
  {
    icon: <MdOutlineBolt />,
    amount: "14250 kWh",
    desc: "01 Octombrie 2025",
    title: "Citire Index",
    iconColor: "rgb(0, 194, 146)",
    iconBg: "rgb(235, 250, 242)",
    pcColor: "green-600",
  },
  {
    icon: <BsCurrencyDollar />,
    amount: "-210 RON",
    title: "Plată Factură",
    desc: "Septembrie 2025",
    iconColor: "rgb(255, 244, 229)",
    iconBg: "rgb(254, 201, 15)",
    pcColor: "red-600",
  },
];

export const weeklyStats = [
  {
    icon: <FiShoppingCart />,
    amount: "-$560",
    title: "Top Sales",
    desc: "Johnathan Doe",
    iconBg: "#FB9678",
    pcColor: "red-600",
  },
  {
    icon: <FiStar />,
    amount: "-$560",
    title: "Best Seller",
    desc: "MaterialPro Admin",
    iconBg: "rgb(254, 201, 15)",
    pcColor: "red-600",
  },
  {
    icon: <BsChatLeft />,
    amount: "+$560",
    title: "Most Commented",
    desc: "Ample Admin",
    iconBg: "#00C292",
    pcColor: "green-600",
  },
];

export const medicalproBranding = {
  data: [
    {
      title: "Due Date",
      desc: "Oct 23, 2021",
    },
    {
      title: "Budget",
      desc: "$98,500",
    },
    {
      title: "Expense",
      desc: "$63,000",
    },
  ],
  teams: [
    {
      name: "Bootstrap",
      color: "orange",
    },
    {
      name: "Angular",
      color: "#FB9678",
    },
  ],
  leaders: [
    {
      image: avatar2,
    },
    {
      image: avatar3,
    },
    {
      image: avatar2,
    },
    {
      image: avatar4,
    },
    {
      image: avatar,
    },
  ],
};

// --- MENIUL LATERAL (SIDEBAR) ---
// Aici am schimbat 'employees' in 'devices'
export const links = [
  {
    title: "Dashboard",
    links: [
      {
        name: "dashboard",
        icon: <FiShoppingBag />,
      },
    ],
  },
  {
    title: "Pages",
    links: [
      {
        name: "analytics",
        icon: <AiOutlineAreaChart />,
      },
      {
        name: "devices",
        icon: <MdOutlineDevices />,
      },
      {
        name: "manual-tracking",
        icon: <RiContactsLine />,
      },
      {
        name: "history",
        icon: <FiClock />,
      },
    ],
  },
  {
    title: "Apps",
    links: [
      {
        name: "calendar",
        icon: <AiOutlineCalendar />,
      },
      {
        name: "kanban",
        displayName: "Saving Goals",
        icon: <BsKanban />,
      },
      {
        name: "settings",
        icon: <FiSettings />,
      },
    ],
  },
  {
    title: "Charts",
    links: [
      {
        name: "line",
        icon: <AiOutlineStock />,
      },
      {
        name: "pie",
        icon: <FiPieChart />,
      },
      {
        name: "pyramid",
        icon: <GiLouvrePyramid />,
      },
      {
        name: "stacked",
        icon: <AiOutlineBarChart />,
      },
    ],
  },
];

// --- DATE PENTRU GRAFICE ---

// Datele pentru graficul mic albastru (Boiler)
export const SparklineAreaData = [
  { x: "15.07", yval: 8.5 },
  { x: "16.07", yval: 10.2 },
  { x: "17.07", yval: 12.8 },
  { x: "18.07", yval: 9.4 },
  { x: "19.07", yval: 11.0 },
];

// Alias pentru compatibilitate (ca sa nu dea eroare daca ai folosit boilerConsumptionData)
export const boilerConsumptionData = SparklineAreaData;

// --- DATE PENTRU GRAFICUL MARE (STACKED - Consum vs Target) ---
export const stackedChartData = [
  [
    { x: "Jan", y: 300 },
    { x: "Feb", y: 280 },
    { x: "Mar", y: 250 },
    { x: "Apr", y: 200 },
    { x: "May", y: 180 },
    { x: "Jun", y: 180 },
    { x: "Jul", y: 200 },
  ],
  [
    { x: "Jan", y: 290 },
    { x: "Feb", y: 275 },
    { x: "Mar", y: 260 },
    { x: "Apr", y: 190 },
    { x: "May", y: 170 },
    { x: "Jun", y: 185 },
    { x: "Jul", y: 210 },
  ],
];

export const stackedCustomSeries = [
  {
    dataSource: stackedChartData[0],
    xName: "x",
    yName: "y",
    name: "Target (kWh)",
    type: "StackingColumn",
    background: "#4ade80",
  },
  {
    dataSource: stackedChartData[1],
    xName: "x",
    yName: "y",
    name: "Actual (kWh)",
    type: "StackingColumn",
    background: "#33373E",
  },
];

export const stackedPrimaryXAxis = {
  majorGridLines: { width: 0 },
  minorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  labelIntersectAction: "Rotate45",
  valueType: "Category",
};

export const stackedPrimaryYAxis = {
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 400,
  interval: 100,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  minorTickLines: { width: 0 },
  labelFormat: "{value} kWh",
};

// --- DATE PENTRU PIE CHART (Repartizare Consum) ---
export const ecomPieChartData = [
  { x: "Boiler", y: 35, text: "35%" },
  { x: "Iluminat", y: 15, text: "15%" },
  { x: "Electrocasnice", y: 25, text: "25%" },
  { x: "Incalzire", y: 25, text: "25%" },
];

// --- ALTE DATE (Template-uri vechi, le pastram ca sa nu dea eroare paginile nefolosite) ---

export const themeColors = [
  {
    name: "blue-theme",
    color: "#1A97F5",
  },
  {
    name: "green-theme",
    color: "#03C9D7",
  },
  {
    name: "purple-theme",
    color: "#7352FF",
  },
  {
    name: "red-theme",
    color: "#FF5C8E",
  },
  {
    name: "indigo-theme",
    color: "#1E4DB7",
  },
  {
    color: "#FB9678",
    name: "orange-theme",
  },
];

export const userProfileData = [
  {
    icon: <BsCurrencyDollar />,
    title: "My Profile",
    desc: "Account Settings",
    iconColor: "#03C9D7",
    iconBg: "#E5FAFB",
  },
  {
    icon: <BsShield />,
    title: "My Inbox",
    desc: "Messages & Emails",
    iconColor: "rgb(0, 194, 146)",
    iconBg: "rgb(235, 250, 242)",
  },
  {
    icon: <FiCreditCard />,
    title: "My Tasks",
    desc: "To-do and Daily Tasks",
    iconColor: "rgb(255, 244, 229)",
    iconBg: "rgb(254, 201, 15)",
  },
];

export const ordersGrid = [
  {
    headerText: "Image",
    template: gridOrderImage,
    textAlign: "Center",
    width: "120",
  },
  {
    field: "OrderItems",
    headerText: "Item",
    width: "150",
    editType: "dropdownedit",
    textAlign: "Center",
  },
  {
    field: "CustomerName",
    headerText: "Customer Name",
    width: "150",
    textAlign: "Center",
  },
  {
    field: "TotalAmount",
    headerText: "Total Amount",
    format: "C2",
    textAlign: "Center",
    editType: "numericedit",
    width: "150",
  },
  {
    headerText: "Status",
    template: gridOrderStatus,
    field: "OrderItems",
    textAlign: "Center",
    width: "120",
  },
  {
    field: "OrderID",
    headerText: "Order ID",
    width: "120",
    textAlign: "Center",
  },

  {
    field: "Location",
    headerText: "Location",
    width: "150",
    textAlign: "Center",
  },
];

export const customersData = [
  {
    CustomerID: 1001,
    CustomerName: "Nirav Joshi",
    CustomerEmail: "nirav@gmail.com",
    CustomerImage: avatar2,
    ProjectName: "Hosting Press HTML",
    Status: "Active",
    StatusBg: "#8BE78B",
    Weeks: "40",
    Budget: "$2.4k",
    Location: "India",
  },
];

export const employeesData = [
  {
    EmployeeID: 1,
    Name: "Nancy Davolio",
    Title: "Sales Representative",
    HireDate: "01/02/2021",
    Country: "USA",
    ReportsTo: "Carson",
    EmployeeImage: avatar3,
  },
];

export const ordersData = [
  {
    OrderID: 10248,
    CustomerName: "Vinet",
    TotalAmount: 32.38,
    OrderItems: "Fresh Tomato",
    Location: "USA",
    Status: "pending",
    StatusBg: "#FB9678",
    ProductImage: product6,
  },
];

export const contextMenuItems = [
  "AutoFit",
  "AutoFitAll",
  "SortAscending",
  "SortDescending",
  "Copy",
  "Edit",
  "Delete",
  "Save",
  "Cancel",
  "PdfExport",
  "ExcelExport",
  "CsvExport",
  "FirstPage",
  "PrevPage",
  "LastPage",
  "NextPage",
];

export const lineChartData = [
  [
    { x: new Date(2005, 0, 1), y: 21 },
    { x: new Date(2006, 0, 1), y: 24 },
    { x: new Date(2007, 0, 1), y: 36 },
  ],
];

export const lineCustomSeries = [
  {
    dataSource: lineChartData[0],
    xName: "x",
    yName: "y",
    name: "Germany",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
];

export const pieChartData = [
  { x: "Labour", y: 18, text: "18%" },
  { x: "Legal", y: 8, text: "8%" },
  { x: "Production", y: 15, text: "15%" },
];

export const PyramidData = [
  { x: "Sweet Treats", y: 120, text: "120 cal" },
  { x: "Milk, Youghnut, Cheese", y: 435, text: "435 cal" },
];

export const EditorData = () => (
  <div>
    <h3>Try React</h3>
  </div>
);

export const kanbanGrid = [
  { headerText: "To Do", keyField: "Open", allowToggle: true },
];

export const dropdownData = [
  {
    Id: "1",
    Time: "March 2021",
  },
];

// AICI AM ADAUGAT DEFINITIILE GOALE CA SA SCAPI DE ERORI
export const cartData = []; // <--- Aceasta lipsea si cauza eroare in Cart.jsx
export const chatData = []; // <--- Aceasta lipsea si cauza eroare in Notifications/ChartsHeader
export const kanbanData = []; // <--- Aceasta lipsea si cauza eroare in Kanban.jsx

// Definiții goale pentru restul graficelor
export const areaCustomSeries = [];
export const areaPrimaryXAxis = {};
export const areaPrimaryYAxis = {};
export const barCustomSeries = [];
export const barPrimaryXAxis = {};
export const barPrimaryYAxis = {};
export const ColorMappingPrimaryXAxis = {};
export const ColorMappingPrimaryYAxis = {};
export const colorMappingData = [];
export const rangeColorMapping = [];
export const FinancialPrimaryXAxis = {};
export const FinancialPrimaryYAxis = {};
export const financialChartData = [];
export const LinePrimaryXAxis = {};
export const LinePrimaryYAxis = {};
export const customersGrid = [];
export const employeesGrid = [];
export const scheduleData = [];
