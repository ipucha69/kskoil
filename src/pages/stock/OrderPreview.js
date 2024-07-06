import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaDownload } from "react-icons/fa6";
import { Box, IconButton, Modal } from "@mui/material";
import moment from "moment";
import { formatter } from "../../helpers/Helpers";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 800,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

const OrderPreview = ({ order }) => {
  const [pdfSrc, setPdfSrc] = useState("");
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const generate = () => {
    setOpen(true);
    const doc = new jsPDF();

    const filename = "Order book.pdf";

    // Set draw color and line width for borders
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);

    // Define table dimensions
    const tableX = 10;
    const tableY = 20;
    const tableWidth = 190;
    const rowHeight1 = 20; // Increase height for header
    const rowHeight2 = 160;
    const numRows = 16;
    const rowSpacing = rowHeight2 / numRows;

    // Define column widths
    const column1Width = 85;
    const column2Width = tableWidth - column1Width;

    // Draw background color for the header
    doc.setFillColor(229, 228, 226);
    doc.rect(tableX, tableY, tableWidth, rowHeight1, "F"); // Fill rectangle with the specified color

    // Draw gray background color for column one
    doc.setFillColor(235, 235, 235);
    doc.rect(tableX, tableY + rowHeight1, column1Width, rowHeight2, "F");

    // Draw background color for the second column of row 16
    doc.setFillColor(235, 235, 235); // Set gray background color
    doc.rect(
      tableX + column1Width,
      tableY + rowHeight1 + 15 * rowSpacing,
      column2Width,
      rowSpacing,
      "F"
    );

    // Add header text
    doc.setTextColor(0); // Reset text color to black
    doc.setFont("times", "bold");
    doc.setFontSize(32);
    doc.text("ORDER BOOK", tableX + tableWidth / 2, tableY + 14, {
      align: "center",
    }); // Header text centered

    // Draw borders for the table
    doc.rect(tableX, tableY, tableWidth, rowHeight1); // First row
    doc.rect(tableX, tableY + rowHeight1, column1Width, rowHeight2); // Second row, first column
    doc.rect(
      tableX + column1Width,
      tableY + rowHeight1,
      column2Width,
      rowHeight2
    ); // Second row, second column

    // Add data for second row, column one (rows 1-10)
    const dataColumn1 = [
      "DATE",
      "LOCATION",
      "STATION NAME/RECEIPT NAME",
      "REGION",
      "EWURA",
      "TIN NUMBER",
      "DRIVER NAME",
      "TRUCK NUMBER",
      "LICENCE NUMBER",
      "PHONE NUMBER",
      "CAPACITY",
      "LITRES",
      "PRICE",
      "AMOUNT",
      "TOTAL AMOUNT",
      "LOADING",
    ];

    // doc.setFont("poppins");
    doc.setFontSize(13); // Set font size for data
    for (let i = 0; i < dataColumn1.length; i++) {
      doc.text(
        dataColumn1[i],
        tableX + 5,
        tableY + rowHeight1 + i * rowSpacing + 7
      ); // Add text for each data item
    }

    // Add data for second row, column two (rows 1-10)
    const dataColumn2 = [
      `${moment
        .unix(order?.date?.seconds || order?.date?._seconds)
        .format("DD/MM/YYYY")}`,
      `${order?.stationLocation?.toUpperCase()}`,
      `${order?.stationName?.toUpperCase()}`,
      `${order?.stationRegion?.toUpperCase()}`,
      `${order?.stationEwura?.toUpperCase()}`,
      `${order?.stationTin}`,
      `${order?.driverName?.toUpperCase()}`,
      `${order?.truck?.toUpperCase()}`,
      `${order?.driverLicence}`,
      `${order?.driverPhone}`,
      { value1: "PMS", value2: "AGO" },
      {
        value1: `${formatter.format(order?.pmsLitres)}`,
        value2: `${formatter.format(order?.agoLitres)}`,
      },
      {
        value1: `TZS ${formatter.format(order?.pmsPrice)}`,
        value2: ` TZS ${formatter.format(order?.agoPrice)}`,
      },
      {
        value1: `TZS ${formatter.format(order?.pmsTotalPrice)}`,
        value2: `TZS ${formatter.format(order?.agoTotalPrice)}`,
      },
      `TZS ${formatter.format(order?.totalPrice)}`,
      `${order?.supplierName?.toUpperCase()}`,
    ];

    for (let i = 0; i < dataColumn2.length; i++) {
      const xPos = tableX + column1Width + 5; // Align data to the left, add padding of 5 units
      const yPos = tableY + rowHeight1 + i * rowSpacing + 7; // Add a padding of 5 units from the top

      if (i >= 10 && i <= 13) {
        const rowData = dataColumn2[i];
        doc.text(rowData.value1, xPos, yPos);
        doc.text(rowData.value2, xPos + column2Width / 2, yPos);
      } else {
        // For other rows, add data normally
        doc.text(dataColumn2[i], xPos, yPos);
      }
    }

    // Draw rows in both columns of the table
    for (let i = 0; i < numRows; i++) {
      if (i >= 10 && i <= 13) {
        // For rows 11, 12, 13, and 14, split column two into two equal parts
        const column2WidthHalf = column2Width / 2;
        doc.rect(
          tableX + column1Width,
          tableY + rowHeight1 + i * rowSpacing,
          column2WidthHalf,
          rowSpacing
        );
        doc.rect(
          tableX + column1Width + column2WidthHalf,
          tableY + rowHeight1 + i * rowSpacing,
          column2WidthHalf,
          rowSpacing
        );
      } else {
        // For other rows,
        doc.rect(
          tableX,
          tableY + rowHeight1 + i * rowSpacing,
          column1Width,
          rowSpacing
        );
        doc.rect(
          tableX + column1Width,
          tableY + rowHeight1 + i * rowSpacing,
          column2Width,
          rowSpacing
        );
      }
    }

    // Draw rows in the second column of the table
    // Draw rows in both columns of the table
    for (let i = 0; i < numRows; i++) {
      doc.rect(
        tableX,
        tableY + rowHeight1 + i * rowSpacing,
        column1Width,
        rowSpacing
      );
      doc.rect(
        tableX + column1Width,
        tableY + rowHeight1 + i * rowSpacing,
        column2Width,
        rowSpacing
      );
    }

    // Get the data URL representing the PDF
    const pdfDataUri = doc.output("datauristring");

    setPdfSrc(pdfDataUri);
    // doc.save(filename);
  };

  return (
    <div>
      <IconButton onClick={generate} className="flex justify-center text-xl">
        <FaDownload className="text-primaryColor cursor-pointer" />
      </IconButton>
      {pdfSrc && (
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style} className="rounded-md">
            <iframe
              title="ORDER BOOK PREVIEW"
              src={pdfSrc}
              style={{
                width: "100%",
                height: "500px",
                border: "1px solid black",
              }}
            />
          </Box>
        </Modal>
      )}
    </div>
  );
};

export default OrderPreview;
