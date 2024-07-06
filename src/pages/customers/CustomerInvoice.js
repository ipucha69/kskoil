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

const CustomerInvoice = ({ customerID }) => {
  console.log('invoice', customerID)
  const [pdfSrc, setPdfSrc] = useState("");
  const [filterType, setFilterType] = useState("");
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const functions = getFunctions();

  useEffect(() => {
      const getCustomerInvoice = async () => {
      try {
          const getData = httpsCallable(functions, "customerInvoice");
          getData({ id: customerID })
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

      getCustomerInvoice();
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
    const doc = new jsPDF();

    // Add Invoice title
    doc.setFontSize(24);
    doc.text("CUSTOMER INVOICE", 105, 20, null, null, "center");

    // Add Billed To section
    doc.setFontSize(12);
    doc.text("BILLED TO:", 20, 30);
    doc.text("MSA Transport Ltd", 20, 35);
    doc.text("0702303030", 20, 40);
    doc.text("Dar Es Salaam", 20, 45);

    // Add Invoice Details
    doc.text("Invoice No. 12345", 150, 30);
    doc.text("16 June 2025", 150, 35);

    // Add Table
    doc.autoTable({
      startY: 60,
      head: [
        ["Item", "Station", "Date", "Litres", "Unit Price", "Total Amount"],
      ],
      body: [
        [
          "AGO",
          "Handeni fuel station",
          "12-12-2024",
          "1000",
          "TZS 2000",
          "TZS 2000000",
        ],
        [
          "PMS",
          "Chalinze fuel station",
          "06-12-2024",
          "200",
          "TZS 2100",
          "TZS 420000",
        ],
        [
          "AGO",
          "Mkata fuel station",
          "18-11-2024",
          "150",
          "TZS 2000",
          "TZS 300000",
        ],
      ],
    });

    // Add Total section
    const finalY = doc.autoTable.previous.finalY;
    doc.setFontSize(14);
    doc.text("Total: TZS 2500000", 150, finalY + 35);

    // Add Payment Information
    doc.setFontSize(12);
    doc.text("Thank you!", 20, finalY + 40);
    doc.text("PAYMENT INFORMATION", 20, finalY + 50);
    doc.text("Briard Bank", 20, finalY + 55);
    doc.text("Account Name: KSK OIL", 20, finalY + 60);
    doc.text("Account No.: 123-456-7890", 20, finalY + 65);
    doc.text("Pay by: 5 July 2025", 20, finalY + 70);
    doc.text("123 Anywhere St., Any City, ST 12345", 20, finalY + 75);

    // Save the PDF
    doc.save("invoice.pdf");
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

export default CustomerInvoice;