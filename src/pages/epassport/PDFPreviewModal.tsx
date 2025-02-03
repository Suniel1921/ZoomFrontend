// import { useState } from 'react';
// import { X, Download } from 'lucide-react';
// import Button from '../../components/Button';

// interface PDFPreviewModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   fileUrls: string[];
//   fileName: string;
// }

// export default function PDFPreviewModal({
//   isOpen,
//   onClose,
//   fileUrls,
//   fileName,
// }: PDFPreviewModalProps) {
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//  console.log('file data came from prop is', fileUrls)


//   const handleDownload = () => {
//     fileUrls.forEach((dataUrls) => {
//       const link = document.createElement('a');
//       link.href = dataUrls;
//       link.download = fileName || 'document.pdf';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//     });
//   };


//   const handleIframeLoad = () => {
//     setIsLoading(false);
//   };

//   const handleIframeError = () => {
//     setError('Failed to load PDF. Please try downloading instead.');
//     setIsLoading(false);
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b">
//           <div className="flex items-center gap-4">
//             <h2 className="text-lg font-semibold">{fileName}</h2>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleDownload}
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Download All
//             </Button>
//           </div>
//           <Button variant="outline" size="sm" onClick={onClose}>
//             <X className="h-4 w-4" />
//           </Button>
//         </div>
        
//         {/* PDF Viewer */}
//         <div className="flex-1 p-4 bg-gray-50">
//           {isLoading && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
//               <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-yellow border-t-transparent"></div>
//             </div>
//           )}

//           {error ? (
//             <div className="h-full flex items-center justify-center">
//               <div className="text-center">
//                 <p className="text-red-600 mb-4">{error}</p>
//                 <Button onClick={handleDownload}>
//                   <Download className="h-4 w-4 mr-2" />
//                   Download PDF
//                 </Button>
//               </div>
//             </div>
//           ) : (
//             <iframe
//               src={`${fileUrls[0]}#toolbar=0`} //show all preview of the image and file data
//               className="w-full h-full rounded-lg border border-gray-200"
//               title="PDF Preview"
//               onLoad={handleIframeLoad}
//               onError={handleIframeError}
//             />
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }








import { useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../components/Button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrls: string[];
  fileName: string;
}

export default function PDFPreviewModal({
  isOpen,
  onClose,
  fileUrls,
  fileName,
}: PDFPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // const handleDownload = () => {
  //   fileUrls.forEach((fileUrl) => {
  //     const link = document.createElement('a');
  //     link.href = fileUrl;
  //     link.download = fileUrl.split('/').pop() || 'document.pdf';
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   });
  // };


  const handleDownload = async () => {
    const zip = new JSZip();
  
    // Fetch all files and add them to the ZIP
    const fetchPromises = fileUrls.map(async (fileUrl, index) => {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const fileName = fileUrl.split('/').pop() || `file_${index + 1}.pdf`;
      zip.file(fileName, blob);
    });
  
    // Wait for all files to be added to the ZIP
    await Promise.all(fetchPromises);
  
    // Generate the ZIP file and trigger download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'files.zip');
  };




  
  const handleNextFile = () => {
    setCurrentFileIndex((prevIndex) => (prevIndex + 1) % fileUrls.length);
  };

  const handlePreviousFile = () => {
    setCurrentFileIndex((prevIndex) => (prevIndex - 1 + fileUrls.length) % fileUrls.length);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load PDF. Please try downloading instead.');
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">{fileName}</h2>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 p-4 bg-gray-50 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-yellow border-t-transparent"></div>
            </div>
          )}

          {error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <iframe
                src={`${fileUrls[currentFileIndex]}#toolbar=0`}
                className="w-full h-full rounded-lg border border-gray-200"
                title="PDF Preview"
                onLoad={handleIframeLoad}
                onError={handleIframeError}
              />
              {fileUrls.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousFile}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextFile}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}