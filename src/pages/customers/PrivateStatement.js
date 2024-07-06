import React, { useState } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { FaDownload } from "react-icons/fa6";
import { Box, IconButton, Modal } from "@mui/material";
import moment from "moment";
import { formatter } from "../../helpers/Helpers";
import { DatePicker, Select } from "antd";
import download from "../../assets/images/download_1.png";

const { RangePicker } = DatePicker;

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

const PrivateStatement = () => {
  const [pdfSrc, setPdfSrc] = useState("");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = useState(false);

  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };

  // Filter `option.label` match the user type `input`
  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: "potrait", // A4 size in inches
    });
    const rowCount = 7;
    const startX = 10;
    const startY = 20;
    const regularRowHeight = 7;
    const firstRowHeight = 9; // Adjust the height of the first row
    const lineHeight = 5;
    const columnWidth = 27;

    // Set font size and style for the document
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    doc.setDrawColor(0); // Set draw color to black
    doc.setFillColor(194, 219, 176); // Set fill color
    doc.rect(startX, startY - lineHeight / 2, columnWidth * 7, firstRowHeight); // Draw border for the rectangle
    doc.rect(
      startX,
      startY - lineHeight / 2,
      columnWidth * 7,
      firstRowHeight,
      "F"
    );
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0); // Set text color to black
    doc.text(
      "THOMAS JOHANSEN",
      startX + (columnWidth * 7) / 2,
      startY + firstRowHeight / 2,
      { align: "center" }
    );

    let y = startY + firstRowHeight;
    const columnOneTitles = [
      "BALANCE BD",
      "FUEL TAKEN",
      "PAYMENT",
      "BALANCE CD",
    ];
    const columnTwoData = [
      "TZS 132,000,000",
      "TZS 40,000,000",
      "TZS 87,000,000",
      "TZS 85,000,000",
    ];
    for (let i = 2; i <= 5; i++) {
      doc.setFillColor(255); // Set fill color to white
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.rect(
        startX,
        y - lineHeight / 2,
        columnWidth * 7,
        regularRowHeight,
        "F"
      ); // Draw filled rectangle

      doc.rect(startX, y - lineHeight / 2, columnWidth * 7, regularRowHeight); // Draw border for the rectangle
      doc.rect(
        startX + columnWidth * 2,
        y - lineHeight / 2,
        columnWidth * 5,
        regularRowHeight
      );
      // Draw border for the row
      doc.rect(startX, y - lineHeight / 2, columnWidth * 7, regularRowHeight);

      // Column 1 title
      doc.text(columnOneTitles[i - 2], startX + 2, y + regularRowHeight / 4, {
        align: "left",
        baseline: "middle",
      });

      // Column 2 data
      doc.text(columnTwoData[i - 2], 197, y + regularRowHeight / 4, {
        align: "right",
        baseline: "middle",
      });

      y += regularRowHeight;
    }

    // Row 6
    doc.setDrawColor(0); // Set draw color to black
    doc.rect(startX, y - lineHeight / 2, columnWidth * 7, regularRowHeight); // Draw border for the rectangle
    y += regularRowHeight;

    // Row 7
    doc.setFillColor(83, 126, 201); // Set fill color
    doc.rect(
      startX,
      y - lineHeight / 2,
      columnWidth * 7,
      regularRowHeight,
      "F"
    ); // Draw filled rectangle
    doc.setTextColor(255); // Set text color to white
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const row7Headers = [
      "DATE",
      "DETAILS",
      "LITRES",
      "PRICE",
      "AMOUNT",
      "PAYMENT",
      "BALANCE",
    ];
    let row7X = startX;

    // Draw borders and titles for each column
    for (let i = 0; i < row7Headers.length; i++) {
      // Draw border for the cell
      doc.rect(row7X, y - lineHeight / 2, columnWidth, regularRowHeight);

      // Draw title in the center of the cell
      const titleWidth =
        (doc.getStringUnitWidth(row7Headers[i]) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const titleCenterX = row7X + columnWidth / 2;
      const titleCenterY = y + lineHeight + regularRowHeight / 2;
      const titleY = titleCenterY - doc.internal.getLineHeight() / 1.5;
      doc.text(row7Headers[i], titleCenterX - titleWidth / 2, titleY, {
        align: "left",
        baseline: "middle",
      });

      // Move to the next column
      row7X += columnWidth;
    }

    // Draw border for the row
    doc.rect(startX, y - lineHeight / 2, columnWidth * 7, regularRowHeight);

    // Data rows
    const rowData = [
      [
        "2024-03-13",
        "Fuel purchase",
        "1000",
        "3300",
        "3300000",
        "Cash",
        "50000000",
      ],
      // Add more data rows as needed
    ];
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0); // Set text color to black
    // Draw data rows
    for (let i = 0; i < rowData.length; i++) {
      let rowX = startX;
      const data = rowData[i];
      for (let j = 0; j < data.length; j++) {
        // Calculate title width
        const titleWidth =
          (doc.getStringUnitWidth(row7Headers[j]) *
            doc.internal.getFontSize()) /
          doc.internal.scaleFactor;

        // Adjust column width based on title width
        const columnWidthAdjusted = Math.max(columnWidth, titleWidth + 4); // Add some padding

        const dataWidth =
          (doc.getStringUnitWidth(data[j]) * doc.internal.getFontSize()) /
          doc.internal.scaleFactor;
        const adjustedWidth = Math.max(columnWidthAdjusted, dataWidth + 4);
        doc.rect(
          rowX,
          y + regularRowHeight * (i + 1) - lineHeight / 2,
          adjustedWidth,
          regularRowHeight
        );
        doc.text(
          data[j],
          rowX + adjustedWidth / 2,
          y + regularRowHeight * (i + 1) + lineHeight / 4,
          { align: "center", baseline: "middle" }
        );
        rowX += adjustedWidth;
      }
      doc.rect(
        startX,
        y + regularRowHeight * (i + 1) - lineHeight / 2,
        rowX - startX,
        regularRowHeight
      );
    }

    doc.save("rows.pdf");
  };

  return (
    <div>
      <div className="flex flex-row gap-4 justify-end">
        <div>
          <h4 className="font-semibold py-2">Filtres:</h4>
        </div>
        <div>
          <Select
            showSearch
            placeholder="Select filter type"
            optionFilterProp="children"
            onChange={onChange}
            onSearch={onSearch}
            filterOption={filterOption}
            className="w-[200px]"
            options={[
              {
                value: "all",
                label: "All",
              },
              {
                value: "days",
                label: "Days",
              },
              {
                value: "months",
                label: "Months",
              },
              {
                value: "years",
                label: "Years",
              },
            ]}
          />
        </div>
        <div>
          {filterType === "months" ? (
            <RangePicker picker="month" />
          ) : (
            <>
              {filterType === "years" ? (
                <RangePicker
                  picker="year"
                  id={{
                    start: "startInput",
                    end: "endInput",
                  }}
                  onFocus={(_, info) => {
                    console.log("Focus:", info.range);
                  }}
                  onBlur={(_, info) => {
                    console.log("Blur:", info.range);
                  }}
                />
              ) : (
                <>{filterType === "days" ? <RangePicker /> : null}</>
              )}
            </>
          )}
        </div>
      </div>

      <div>
      <div className="h-full flex flex-row justify-center">
          <img
            src={`${download}`}
            alt={"download report"}
            className="h-[180px] pt-8 cursor-pointer hover:animate-shake hover:animate-twice"
            loading="lazy"
            onClick={generatePDF}
          />
        </div>
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
    </div>
  );
};

export default PrivateStatement;
