// import React from 'react';
// import { jsPDF } from 'jspdf';
// import Button from './Button';
// import { Printer } from 'lucide-react';

// interface Client {
//   name: string;
//   email: string;
//   phone: string;
//   nationality: string;
//   category: string;
//   status: string;
//   postalCode: string,
// }

// interface PrintAddressButtonProps {
//   client: Client;
// }

// const PrintAddressButton: React.FC<PrintAddressButtonProps> = ({ client }) => {
//   const downloadAsPdf = () => {
//     const doc = new jsPDF();

//     doc.text(`Name: ${client.name}`, 10, 10);
//     doc.text(`Category: ${client.category}`, 10, 50);
//     doc.text(`Status: ${client.status}`, 10, 60);
//     doc.text(`Email: ${client.email}`, 10, 20);
//     doc.text(`Phone: ${client.phone}`, 10, 30);
//     doc.text(`Nationality: ${client.nationality}`, 10, 40);
//     doc.text(`PostalCode: ${client.postalCode}`, 10, 30);

//     doc.save(`${client.name}_details.pdf`);
//   };

//   return (
//     // <button onClick={downloadAsPdf} className="btn btn-primary">
//     //   Print Address (PDF)
//     // </button>

// <Button onClick={downloadAsPdf}
// variant="outline"
// size="sm"
// title="Print Address"
// >
// <Printer className="h-4 w-4" />
// </Button>
//   );
// };

// export default PrintAddressButton;






import React from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; 
import Button from './Button';
import { Printer } from 'lucide-react';

interface Client {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  category: string;
  status: string;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building: string;
  modeOfContact: string[];
  socialMedia: object;
  timeline: any[];
  dateJoined: Date;
  profilePhoto: string;
}

interface PrintAddressButtonProps {
  client: Client;
}

const PrintAddressButton: React.FC<PrintAddressButtonProps> = ({ client }) => {
  const downloadAsPdf = () => {
    const doc = new jsPDF();

    let yPosition = 10; 

    // Add profilePhoto at the top center (calculate the x position for centering)
    if (client.profilePhoto) {
      try {
        const imageSize = 50; // Image diameter
        const xPosition = (doc.internal.pageSize.width - imageSize) / 2; // Center the image horizontally

        // Create a circular clip path before adding the image
        doc.setDrawColor(0); // Set border color (optional)
        doc.setFillColor(255, 255, 255); // Set fill color (white)
        doc.ellipse(xPosition + imageSize / 2, yPosition + imageSize / 2, imageSize / 2, imageSize / 2, 'FD'); // Circle for clipping

        // Add the image inside the circular clip
        doc.addImage(client.profilePhoto, 'JPEG', xPosition, yPosition, imageSize, imageSize);
        
        yPosition += imageSize + 10; // Add a margin after the image
      } catch (error) {
        console.error("Error adding image:", error);
      }
    }

    // Add client details in table format
    const tableData = [
      ['Name', client.name],
      ['Category', client.category],
      ['Status', client.status],
      ['Email', client.email],
      ['Phone', client.phone],
      ['Nationality', client.nationality],
      ['Postal Code', client.postalCode],
      ['Prefecture', client.prefecture],
      ['City', client.city],
      ['Street', client.street],
      ['Building', client.building],
      ['Mode of Contact', client.modeOfContact.join(', ')],
    ];

    // Set up table formatting
    const colWidths = [40, 120]; // Adjust column widths if necessary
    const startX = 10;
    const startY = yPosition;

    doc.autoTable({
      startY,
      head: [['Field', 'Details']], // Table header
      body: tableData,
      columnStyles: {
        0: { cellWidth: colWidths[0], halign: 'left' },
        1: { cellWidth: colWidths[1], halign: 'left' },
      },
      theme: 'striped', // Optional: striped rows for better readability
      headStyles: {
        fillColor: '#fedc00', // Table header color
      },
    });

    // Add footer
    const footerText = 'Zoom Creatives';
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 20; // Position the footer 20 units from the bottom

    // Set footer text to bold
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10); // Set footer font size

    // Center the footer text
    const textWidth = doc.getTextWidth(footerText); // Get the width of the text
    const xPosition = (pageWidth - textWidth) / 2; // Calculate xPosition to center the text

    doc.text(footerText, xPosition, footerY); // Add footer text

    // Optional: Add logo centered with circular background
    const logoSize = 30; // Size of the logo
    const logoX = (pageWidth - logoSize) / 2; // Center the logo horizontally
    const logoY = footerY - logoSize - 10; // Position the logo above the footer

    // Draw circular background for the logo
    doc.setFillColor(0, 0, 0); // Set background color (black)
    doc.ellipse(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, logoSize / 2, 'F'); // Circular background

    // Add logo (ensure the correct image path)
    const imgURL = '/public/zoom_logo.jpg'; // Adjust the path to your logo
    doc.addImage(imgURL, 'JPEG', logoX, logoY, logoSize, logoSize); // Position and size of the logo

    // Save the generated PDF
    doc.save(`${client.name}_details.pdf`);
  };

  return (
    <Button onClick={downloadAsPdf} variant="outline" size="sm" title="Print Address">
      <Printer className="h-4 w-4" />
    </Button>
  );
};

export default PrintAddressButton;
