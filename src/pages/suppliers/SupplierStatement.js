import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFunctions, httpsCallable } from "firebase/functions";

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

const SupplierStatement = ({supplierID}) => {
  console.log('statement', supplierID)

  const [pdfSrc, setPdfSrc] = useState("");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const functions = getFunctions();

  useEffect(() => {
      const getSupplierStatement = async () => {
      try {
          const getData = httpsCallable(functions, "supplierFinancialStatements");
          getData({ id: supplierID })
          .then((result) => {
              const data = result.data;
              const dashoardAnalysis = data?.data;

              console.log(dashoardAnalysis);
          })
          .catch((error) => {
              console.log(error);
          });
      } catch (error) {
          console.log(error);
      }
      };

      getSupplierStatement();
  }, [dispatch]);

  const onChange = (value) => {
    console.log(`selected ${value}`);
    setFilterType(value);
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
      orientation: "landscape", // A4 size in inches
    });
    const rowCount = 7;
    const startX = 10;
    const startY = 20;
    const regularRowHeight = 7;
    const firstRowHeight = 9; // Adjust the height of the first row
    const lineHeight = 5;
    const columnWidth = 39.6;

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
      "ATN PETROLEUM LTD",
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
      doc.text(columnTwoData[i - 2], 285, y + regularRowHeight / 4, {
        align: "right",
        baseline: "middle",
      });

      y += regularRowHeight;
    }

    // Row 6
    doc.setDrawColor(0); // Set draw color to black
    doc.rect(startX, y - lineHeight / 2, columnWidth * 7, regularRowHeight); // Draw border for the rectangle
    y += regularRowHeight;

    // Row 7: Data Headers and Data Rows
    const row7Headers = [
      "DATE",
      "DETAILS",
      "STATION",
      "LITRES",
      "PRICE",
      "AMOUNT",
      "PAYMENT",
      "BALANCE",
    ];
    y += regularRowHeight; // Move to Row 7
    doc.setFillColor(83, 126, 201);
    doc.rect(
      startX,
      y - lineHeight / 2,
      columnWidth * 7,
      regularRowHeight,
      "F"
    );
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Draw Data Rows
    const rowData = [
      [
        "2024-03-13",
        "T 888 FFF / T 444 FFF",
        "Handeni Petrol Station",
        "1000",
        "3200",
        "3200000",
        "",
        "3200000",
      ],
      [
        "2024-03-14",
        "Payment by bank",
        "Handeni Petrol Station",
        "",
        "",
        "",
        "2000000",
        "1200000",
      ],
      // Add more data rows as needed
    ];

    const availableWidth = columnWidth * 7; // Total available width for the row
    const columnW = availableWidth / row7Headers.length; // Calculate width for each column

    // Draw Column Headers
    const reducedColumnWidth = columnWidth / 2;
    const headerWidths = []; // Array to store calculated widths of each header
    let xPosition = startX; // Initial x position for drawing column headers
    const sY = 20 + rowCount * regularRowHeight; // Adjust startY to place headers on the eighth row

    for (let i = 0; i < row7Headers.length; i++) {
      let calculatedWidth = columnWidth; // Default width

      // Adjust width for DATE, PRICE, LITRES columns
      if (
        row7Headers[i] === "PRICE" ||
        row7Headers[i] === "LITRES" ||
        row7Headers[i] === "DATE"
      ) {
        calculatedWidth = reducedColumnWidth + reducedColumnWidth / 3;
      } else if (row7Headers[i] === "DETAILS" || row7Headers[i] === "STATION") {
        calculatedWidth = columnWidth + reducedColumnWidth * 0.3;
      } else if (row7Headers[i] === "AMOUNT") {
        calculatedWidth = reducedColumnWidth + reducedColumnWidth * 0.4;
      }

      headerWidths.push(calculatedWidth); // Store calculated width

      // Draw header
      doc.rect(
        xPosition,
        sY - lineHeight / 7,
        calculatedWidth,
        regularRowHeight
      );
      doc.text(
        row7Headers[i],
        xPosition + calculatedWidth / 2,
        sY + regularRowHeight / 2,
        {
          align: "center",
          baseline: "middle",
        }
      );

      xPosition += calculatedWidth;
    }

    const columnWidths = row7Headers.map((header, index) => {
      let calculatedWidth = columnWidth; // Default width

      // Adjust width for specific columns
      if (header === "DATE" || header === "PRICE" || header === "LITRES") {
        calculatedWidth = reducedColumnWidth + reducedColumnWidth / 3;
      } else if (header === "DETAILS" || header === "STATION") {
        calculatedWidth = columnWidth + reducedColumnWidth * 0.3;
      } else if (header === "AMOUNT") {
        calculatedWidth = reducedColumnWidth + reducedColumnWidth * 0.4;
      }

      return calculatedWidth;
    });

    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    // Draw Data Rows

    for (let i = 0; i < rowData.length; i++) {
      y += regularRowHeight;
      const data = rowData[i];
      let xPosition = startX;
      for (let j = 0; j < data.length; j++) {
        let calculatedWidth = columnWidth; // Default width

        // Adjust width for specific columns
        if (j == 0 || j == 3 || j == 4) {
          calculatedWidth = reducedColumnWidth + reducedColumnWidth / 3;
        } else if (j == 1 || j == 2) {
          calculatedWidth = columnWidth + reducedColumnWidth * 0.3;
        } else if (j == 5) {
          calculatedWidth = reducedColumnWidth + reducedColumnWidth * 0.4;
        }

        doc.rect(
          xPosition,
          y - lineHeight / 2,
          calculatedWidth,
          regularRowHeight
        );
        if (j > 2) {
          doc.text(
            data[j],
            xPosition + calculatedWidth - 2,
            y + lineHeight / 4,
            {
              align: "right",
              baseline: "middle",
            }
          );
        } else {
          doc.text(data[j], xPosition + 2, y + lineHeight / 4, {
            align: "left",
            baseline: "middle",
          });
        }
        xPosition += calculatedWidth;
      }
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

export default SupplierStatement;
