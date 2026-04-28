// import React, { useRef, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useReactToPrint } from "react-to-print";
// import html2pdf from "html2pdf.js";
// import { useTheme } from "../../context/ThemeContext";
// import "./InvoicePage.css";

// const InvoicePage = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { theme } = useTheme();
//   const isDark = theme === "dark";

//   const {
//     invoiceNumber,
//     items,
//     total,
//     paymentMode,
//     date,
//     buyerName = "—",
//     buyerPhone = "",
//     buyerAddress = "—",
//     buyerCity = "",
//     buyerState = "",
//     courierCharge = 80,
//     discount = 0,
//     salesperson = "",
//     referenceNo = "",
//   } = location.state || {};

//   const componentRef = useRef();
//   const [saveMessage, setSaveMessage] = useState("");

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleSavePDF = () => {
//     const element = componentRef.current;
//     const options = {
//       margin: 10,
//       filename: `Invoice-${invoiceNumber}.pdf`,
//       image: { type: "jpeg", quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true },
//       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//     };
//     html2pdf().set(options).from(element).save();
//     setSaveMessage("✓ PDF saved");
//     setTimeout(() => setSaveMessage(""), 2000);
//   };

//   if (!invoiceNumber) {
//     return <div>No invoice data</div>;
//   }

//   const discountedSubtotal = total - discount;
//   const grandTotal = discountedSubtotal + courierCharge;
//   const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
//   const buyerLine1 = buyerName + (buyerPhone ? ` - ${buyerPhone}` : "");
//   const buyerLine2 = buyerAddress || "";
//   const buyerLine3 = [buyerCity, buyerState].filter(Boolean).join(" - ");

//   const amountInWords = (num) => {
//     const ones = [
//       "",
//       "One",
//       "Two",
//       "Three",
//       "Four",
//       "Five",
//       "Six",
//       "Seven",
//       "Eight",
//       "Nine",
//       "Ten",
//       "Eleven",
//       "Twelve",
//       "Thirteen",
//       "Fourteen",
//       "Fifteen",
//       "Sixteen",
//       "Seventeen",
//       "Eighteen",
//       "Nineteen",
//     ];
//     const tens = [
//       "",
//       "",
//       "Twenty",
//       "Thirty",
//       "Forty",
//       "Fifty",
//       "Sixty",
//       "Seventy",
//       "Eighty",
//       "Ninety",
//     ];
//     if (num === 0) return "Zero";
//     if (num < 20) return ones[num];
//     if (num < 100)
//       return (
//         tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
//       );
//     if (num < 1000)
//       return (
//         ones[Math.floor(num / 100)] +
//         " Hundred" +
//         (num % 100 ? " " + amountInWords(num % 100) : "")
//       );
//     if (num < 100000)
//       return (
//         amountInWords(Math.floor(num / 1000)) +
//         " Thousand" +
//         (num % 1000 ? " " + amountInWords(num % 1000) : "")
//       );
//     return (
//       amountInWords(Math.floor(num / 100000)) +
//       " Lakh" +
//       (num % 100000 ? " " + amountInWords(num % 100000) : "")
//     );
//   };
//   const grandTotalWords = `INR ${amountInWords(grandTotal)} Only`;

//   const formatReferenceNo = () => {
//     if (!referenceNo) return "";
//     const formattedDate = new Date(date).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//     return `${referenceNo} dt. ${formattedDate}`;
//   };

//   return (
//     <div className={`invoice-page ${isDark ? "dark" : ""}`}>
//       <div className="invoice-actions">
//         <button onClick={() => navigate(-1)} className="back-btn">
//           ← Back
//         </button>
//         <div className="action-btn-group">
//           <button onClick={handlePrint} className="print-btn">
//             🖨️ Print
//           </button>
//           <button onClick={handleSavePDF} className="save-btn">
//             📄 Save PDF
//           </button>
//         </div>
//       </div>
//       {saveMessage && <div className="save-message">{saveMessage}</div>}

//       <div ref={componentRef} className="invoice-container">
//         <div className="invoice-outer">
//           <div className="invoice-header">
//             <h2>RADNUS COMMUNICATION</h2>
//             <p>No.242/44, MG Road, Sinnaya Plaza, Near Fish Market</p>
//             <p>Puducherry - 605001</p>
//             <p>State Name: Puducherry, Code: 34</p>
//             <p>E-Mail: sundar12134@gmail.com</p>
//             <p>
//               <strong>GST: 34AAHFR8679B</strong>
//             </p>
//           </div>

//           <div className="invoice-title">INVOICE</div>

//           <div className="two-columns">
//             <div className="col-left">
//               <div className="section-title">Consignee (Ship to)</div>
//               <p>{buyerLine1}</p>
//               {buyerLine2 && <p>{buyerLine2}</p>}
//               {buyerLine3 && <p>{buyerLine3}</p>}
//               <div className="section-title" style={{ marginTop: 10 }}>
//                 Buyer (Bill to)
//               </div>
//               <p>{buyerLine1}</p>
//               {buyerLine2 && <p>{buyerLine2}</p>}
//               {buyerLine3 && <p>{buyerLine3}</p>}
//             </div>
//             <div className="col-right">
//               <table className="meta-table">
//                 <tbody>
//                   <tr>
//                     <td>
//                       <strong>Invoice No.</strong>
//                     </td>
//                     <td>{invoiceNumber}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Dated</strong>
//                     </td>
//                     <td>{new Date(date).toDateString()}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Delivery Note</strong>
//                     </td>
//                     <td></td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Mode/Terms of Payment</strong>
//                     </td>
//                     <td>{paymentMode?.toUpperCase()}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Salesperson</strong>
//                     </td>
//                     <td>{salesperson}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Reference No. &amp; Date</strong>
//                     </td>
//                     <td>{formatReferenceNo()}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Buyer's Order No.</strong>
//                     </td>
//                     <td></td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Dispatched through</strong>
//                     </td>
//                     <td></td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Destination</strong>
//                     </td>
//                     <td>{buyerLine3}</td>
//                   </tr>
//                   <tr>
//                     <td>
//                       <strong>Terms of Delivery</strong>
//                     </td>
//                     <td></td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           <table className="items-table">
//             <thead>
//               <tr>
//                 <th>Sl No.</th>
//                 <th>Description</th>
//                 <th>HSN</th>
//                 <th>Qty</th>
//                 <th>Rate</th>
//                 <th>Per</th>
//                 <th>Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               {items.map((item, idx) => (
//                 <tr key={idx}>
//                   <td>{idx + 1}</td>
//                   <td>{item.name}</td>
//                   <td>-</td>
//                   <td>{item.qty} NOS</td>
//                   <td>₹{item.price}</td>
//                   <td>NOS</td>
//                   <td>₹{item.qty * item.price}.00</td>
//                 </tr>
//               ))}
//               {discount > 0 && (
//                 <tr>
//                   <td></td>
//                   <td>DISCOUNT</td>
//                   <td></td>
//                   <td></td>
//                   <td></td>
//                   <td></td>
//                   <td>-₹{discount}.00</td>
//                 </tr>
//               )}
//               <tr>
//                 <td></td>
//                 <td>COURIER CHARGE</td>
//                 <td></td>
//                 <td></td>
//                 <td></td>
//                 <td></td>
//                 <td>₹{courierCharge}.00</td>
//               </tr>
//               <tr>
//                 <td></td>
//                 <td>
//                   <strong>Total</strong>
//                 </td>
//                 <td></td>
//                 <td>
//                   <strong>{totalQty} NOS</strong>
//                 </td>
//                 <td></td>
//                 <td></td>
//                 <td>
//                   <strong>₹{grandTotal}.00</strong>
//                 </td>
//               </tr>
//             </tbody>
//           </table>

//           <div className="amount-words">
//             <strong>Amount Chargeable (in words)</strong>
//             <br />
//             {grandTotalWords}
//           </div>

//           <div className="declaration">
//             <strong>Declaration</strong>
//             <br />
//             We declare that this invoice shows the actual price of the goods
//             described and that all particulars are true and correct.
//           </div>

//           <div className="signature">
//             <div className="sig-left">E. &amp; O.E</div>
//             <div className="sig-right">
//               <strong>for RADNUS COMMUNICATION</strong>
//               <div className="sig-line"></div>
//               Authorised Signatory
//             </div>
//           </div>

//           <div className="footer">This is a Computer Generated Invoice</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InvoicePage;

import React, { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import { useTheme } from "../../context/ThemeContext";
import { Printer, FileText } from "lucide-react";
import "./InvoicePage.css";

const InvoicePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const {
    invoiceNumber,
    items,
    total,
    paymentMode,
    date,
    buyerName = "—",
    buyerPhone = "",
    buyerAddress = "—",
    buyerCity = "",
    buyerState = "",
    courierCharge = 80,
    discount = 0,
    salesperson = "",
    referenceNo = "",
  } = location.state || {};

  const componentRef = useRef();
  const [saveMessage, setSaveMessage] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const handleSavePDF = () => {
    const element = componentRef.current;
    const options = {
      margin: 10,
      filename: `Invoice-${invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(options).from(element).save();
    setSaveMessage("✓ PDF saved");
    setTimeout(() => setSaveMessage(""), 2000);
  };

  if (!invoiceNumber) {
    return <div>No invoice data</div>;
  }

  const discountedSubtotal = total - discount;
  const grandTotal = discountedSubtotal + courierCharge;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const buyerLine1 = buyerName + (buyerPhone ? ` - ${buyerPhone}` : "");
  const buyerLine2 = buyerAddress || "";
  const buyerLine3 = [buyerCity, buyerState].filter(Boolean).join(" - ");

  const amountInWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    if (num === 0) return "Zero";
    if (num < 20) return ones[num];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + amountInWords(num % 100) : "")
      );
    if (num < 100000)
      return (
        amountInWords(Math.floor(num / 1000)) +
        " Thousand" +
        (num % 1000 ? " " + amountInWords(num % 1000) : "")
      );
    return (
      amountInWords(Math.floor(num / 100000)) +
      " Lakh" +
      (num % 100000 ? " " + amountInWords(num % 100000) : "")
    );
  };
  const grandTotalWords = `INR ${amountInWords(grandTotal)} Only`;

  const formatReferenceNo = () => {
    if (!referenceNo) return "";
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    return `${referenceNo} dt. ${formattedDate}`;
  };

  return (
    <div className={`invoice-page ${isDark ? "dark" : ""}`}>
      <div className="invoice-actions">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <div className="action-btn-group">
          <button onClick={handlePrint} className="print-btn">
            <Printer size={16} /> Print
          </button>
          <button onClick={handleSavePDF} className="save-btn">
            <FileText size={16} /> Save PDF
          </button>
        </div>
      </div>
      {saveMessage && <div className="save-message">{saveMessage}</div>}

      <div ref={componentRef} className="invoice-container">
        <div className="invoice-outer">
          <div className="invoice-header">
            <h2>RADNUS COMMUNICATION</h2>
            <p>No.242/44, MG Road, Sinnaya Plaza, Near Fish Market</p>
            <p>Puducherry - 605001</p>
            <p>State Name: Puducherry, Code: 34</p>
            <p>E-Mail: sundar12134@gmail.com</p>
            <p>
              <strong>GST: 34AAHFR8679B</strong>
            </p>
          </div>

          <div className="invoice-title">INVOICE</div>

          <div className="two-columns">
            <div className="col-left">
              <div className="section-title">Consignee (Ship to)</div>
              <p>{buyerLine1}</p>
              {buyerLine2 && <p>{buyerLine2}</p>}
              {buyerLine3 && <p>{buyerLine3}</p>}
              <div className="section-title" style={{ marginTop: 10 }}>
                Buyer (Bill to)
              </div>
              <p>{buyerLine1}</p>
              {buyerLine2 && <p>{buyerLine2}</p>}
              {buyerLine3 && <p>{buyerLine3}</p>}
            </div>
            <div className="col-right">
              <table className="meta-table">
                <tbody>
                  <tr>
                    <td>
                      <strong>Invoice No.</strong>
                    </td>
                    <td>{invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Dated</strong>
                    </td>
                    <td>{new Date(date).toDateString()}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Delivery Note</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Mode/Terms of Payment</strong>
                    </td>
                    <td>{paymentMode?.toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Salesperson</strong>
                    </td>
                    <td>{salesperson}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Reference No. &amp; Date</strong>
                    </td>
                    <td>{formatReferenceNo()}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Buyer's Order No.</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Dispatched through</strong>
                    </td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Destination</strong>
                    </td>
                    <td>{buyerLine3}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Terms of Delivery</strong>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <table className="items-table">
            <thead>
              <tr>
                <th>Sl No.</th>
                <th>Description</th>
                <th>HSN</th>
                <th>Qty</th>
                <th>Rate</th>
                <th>Per</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{item.name}</td>
                  <td>-</td>
                  <td>{item.qty} NOS</td>
                  <td>₹{item.price}</td>
                  <td>NOS</td>
                  <td>₹{item.qty * item.price}.00</td>
                </tr>
              ))}
              {discount > 0 && (
                <tr>
                  <td></td>
                  <td>DISCOUNT</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>-₹{discount}.00</td>
                </tr>
              )}
              <tr>
                <td></td>
                <td>COURIER CHARGE</td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>₹{courierCharge}.00</td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <strong>Total</strong>
                </td>
                <td></td>
                <td>
                  <strong>{totalQty} NOS</strong>
                </td>
                <td></td>
                <td></td>
                <td>
                  <strong>₹{grandTotal}.00</strong>
                </td>
              </tr>
            </tbody>
          </table>

          <div className="amount-words">
            <strong>Amount Chargeable (in words)</strong>
            <br />
            {grandTotalWords}
          </div>

          <div className="declaration">
            <strong>Declaration</strong>
            <br />
            We declare that this invoice shows the actual price of the goods
            described and that all particulars are true and correct.
          </div>

          <div className="signature">
            <div className="sig-left">E. &amp; O.E</div>
            <div className="sig-right">
              <strong>for RADNUS COMMUNICATION</strong>
              <div className="sig-line"></div>
              Authorised Signatory
            </div>
          </div>

          <div className="footer">This is a Computer Generated Invoice</div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;