import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (dashboardData, userData) => {
  // Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Colors
  const primaryColor = [0, 136, 254]; // Blue
  const darkGray = [50, 50, 50];
  const lightGray = [150, 150, 150];

  // ============================================
  // HEADER SECTION
  // ============================================

  // Company Name with Lightning Icon
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text("⚡ ENERGYTRACK", 20, 25);

  // Invoice Label
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkGray);
  doc.text("ENERGY INVOICE", pageWidth - 60, 20);

  // Invoice Number and Date
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  const invoiceNumber = `#${new Date().getFullYear()}-${String(
    new Date().getMonth() + 1
  ).padStart(2, "0")}`;
  const invoiceDate = new Date().toLocaleDateString("en-GB");
  doc.text(`Invoice: ${invoiceNumber}`, pageWidth - 60, 28);
  doc.text(`Date: ${invoiceDate}`, pageWidth - 60, 35);

  // Line separator
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 40, pageWidth - 20, 40);

  // ============================================
  // BILL TO SECTION
  // ============================================

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkGray);
  doc.text("BILL TO:", 20, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(userData?.fullName || "User", 20, 60);
  doc.setTextColor(...lightGray);
  doc.text(userData?.email || "user@example.com", 20, 67);
  doc.text("Brașov, România", 20, 74);

  // ============================================
  // BILLING PERIOD
  // ============================================

  const currentDate = new Date();
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );

  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.text("Billing Period:", pageWidth - 100, 52);
  doc.setTextColor(...lightGray);
  doc.text(
    `${firstDay.toLocaleDateString("en-GB")} - ${lastDay.toLocaleDateString(
      "en-GB"
    )}`,
    pageWidth - 100,
    59
  );

  // ============================================
  // CONSUMPTION SUMMARY BOX
  // ============================================

  doc.setFillColor(245, 247, 250);
  doc.rect(20, 85, pageWidth - 40, 25, "F");

  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "bold");

  // Summary stats
  doc.text("Active Devices:", 25, 93);
  doc.text("Total Consumption:", 25, 100);
  doc.text("Estimated Cost:", 25, 107);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...primaryColor);
  doc.text(`${dashboardData?.activeDevices || 0}`, 70, 93);
  doc.text(`${dashboardData?.totalKwh?.toFixed(2) || "0.00"} kWh`, 70, 100);
  doc.text(`${dashboardData?.totalCost?.toFixed(2) || "0.00"} RON`, 70, 107);

  // ============================================
  // DEVICES TABLE
  // ============================================

  // Prepare table data
  const tableData =
    dashboardData?.deviceBreakdown?.map((device) => [
      device.name,
      device.kwh.toFixed(2),
      device.percentage.toFixed(1) + "%",
      (device.kwh * 1.3).toFixed(2),
    ]) || [];

  autoTable(doc, {
    startY: 120,
    head: [["Device", "Consumption (kWh)", "Share (%)", "Cost (RON)"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkGray,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: "right", cellWidth: 40 },
      2: { halign: "center", cellWidth: 30 },
      3: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 20, right: 20 },
  });

  // ============================================
  // TOTALS SECTION
  // ============================================

  const finalY = doc.lastAutoTable.finalY + 10;

  // Draw box for totals
  doc.setFillColor(245, 247, 250);
  doc.rect(pageWidth - 100, finalY, 80, 35, "F");

  doc.setFontSize(10);
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal:", pageWidth - 95, finalY + 8);
  doc.text("Rate:", pageWidth - 95, finalY + 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("TOTAL:", pageWidth - 95, finalY + 25);

  // Values
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...lightGray);
  doc.text(
    `${dashboardData?.totalKwh?.toFixed(2) || "0.00"} kWh`,
    pageWidth - 30,
    finalY + 8,
    { align: "right" }
  );
  doc.text("1.3 RON/kWh", pageWidth - 30, finalY + 15, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(
    `${dashboardData?.totalCost?.toFixed(2) || "0.00"} RON`,
    pageWidth - 30,
    finalY + 25,
    { align: "right" }
  );

  // ============================================
  // FOOTER SECTION
  // ============================================

  const footerY = pageHeight - 40;

  // Payment due
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkGray);
  doc.text("Payment Due:", 20, footerY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightGray);
  const dueDate = new Date();
  dueDate.setDate(25);
  doc.text(dueDate.toLocaleDateString("en-GB"), 55, footerY);

  // Thank you message
  doc.setFontSize(9);
  doc.setTextColor(...lightGray);
  doc.text("Thank you for using EnergyTrack!", 20, footerY + 10);
  doc.text("For support: support@energytrack.com", 20, footerY + 17);

  // Generated by
  doc.setFontSize(8);
  doc.setTextColor(...lightGray);
  doc.text("Generated by EnergyTrack System", pageWidth - 70, footerY + 17);

  // Line separator at bottom
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);

  // Page number
  doc.setFontSize(8);
  doc.text(`Page 1 of 1`, pageWidth / 2, pageHeight - 10, { align: "center" });

  // ============================================
  // SAVE PDF
  // ============================================

  const fileName = `EnergyTrack_Invoice_${invoiceNumber}_${invoiceDate.replace(
    /\//g,
    "-"
  )}.pdf`;
  doc.save(fileName);
};
