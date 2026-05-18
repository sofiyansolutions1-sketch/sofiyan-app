import React, { useState, useEffect } from 'react';
import { X, Download, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { rateCardDatabase } from '../services/rateCardData';

export const RateCardModal: React.FC<{ isOpen: boolean; onClose: () => void; category: string | null }> = ({ isOpen, onClose, category }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen && category && rateCardDatabase[category]) {
      document.body.style.overflow = 'hidden';
      // Open the first section by default
      const firstSection = Object.keys(rateCardDatabase[category])[0];
      if (firstSection) {
        setOpenSections({ [firstSection]: true });
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, category]);

  if (!isOpen || !category || !rateCardDatabase[category]) return null;

  const currentRateCardData = rateCardDatabase[category];

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    
    const originalSections = { ...openSections };
    
    const allExpanded: Record<string, boolean> = {};
    if (category && rateCardDatabase[category]) {
      Object.keys(rateCardDatabase[category]).forEach(key => {
        allExpanded[key] = true;
      });
    }
    setOpenSections(allExpanded);
    
    // Wait for DOM to update animations
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const content = document.getElementById('rate-card-content');
    if (content) {
      // Temporarily hide the close and download buttons for the PDF
      const headerBtns = document.querySelectorAll('.pdf-exclude');
      headerBtns.forEach(btn => (btn as HTMLElement).style.display = 'none');
      
      try {
        const canvas = await html2canvas(content, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        let position = 0;
        let heightLeft = pdfHeight;
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
        
        while (heightLeft >= 0) {
          position -= pageHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
        
        pdf.save(`${category}-Rate-Card.pdf`);
      } catch (error) {
        console.error("PDF Generation failed", error);
      } finally {
        // Restore buttons
        headerBtns.forEach(btn => (btn as HTMLElement).style.display = '');
      }
    }
    
    setOpenSections(originalSections);
    setIsDownloading(false);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #rate-card-content, #rate-card-content * {
              visibility: visible;
            }
            #rate-card-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              max-height: none !important;
              overflow: visible !important;
              padding: 0 !important;
              box-shadow: none !important;
            }
            .no-print {
              display: none !important;
            }
            /* Expand all sections for print */
            .print-expand {
              display: block !important;
            }
            .print-hide-chevron {
              display: none !important;
            }
          }
        `}
      </style>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn no-print">
        <div 
          id="rate-card-content"
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col transform transition-all animate-scaleIn print:rounded-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white rounded-t-2xl sticky top-0 z-10 w-full no-print">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sofiyan Home Service - {category} Rate Card</h2>
            </div>
            <button 
              onClick={onClose}
              className="pdf-exclude p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>

          <div className="hidden print:block mb-6 pb-4 border-b border-gray-300">
             <h2 className="text-2xl font-bold text-gray-900">Sofiyan Home Service - {category} Rate Card</h2>
             <p className="text-gray-500">Official Rate List</p>
          </div>

          {/* Sub-header / Action */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center no-print w-full">
            <p className="text-sm text-gray-600 font-medium">Clear pricing for all {category} services</p>
            <button 
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="pdf-exclude flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isDownloading ? "Generating PDF..." : "Download as PDF"}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto w-full print:overflow-visible print:max-h-none">
            <div className="p-6 space-y-4 print:p-0">
              {Object.entries(currentRateCardData).map(([sectionTitle, items]) => (
                <div key={sectionTitle} className="border border-gray-200 rounded-xl overflow-hidden bg-white print:border-none print:mb-6">
                  <button
                    onClick={() => toggleSection(sectionTitle)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors focus:outline-none no-print"
                  >
                    <span className="font-bold text-gray-800 text-left">{sectionTitle}</span>
                    <span className="text-gray-500 print-hide-chevron">
                      {openSections[sectionTitle] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>

                  <h3 className="hidden print:block text-lg font-bold text-gray-900 mb-2 py-2 border-b border-gray-800">
                    {sectionTitle}
                  </h3>

                  <div className={`${openSections[sectionTitle] ? 'block' : 'hidden'} print-expand`}>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white text-gray-500 border-t print:border-none border-gray-200 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3 font-semibold w-2/3">Item Description</th>
                          <th className="px-5 py-3 font-semibold text-right">Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors print:break-inside-avoid">
                            <td className="px-5 py-3.5 text-gray-800 font-medium">{item.name}</td>
                            <td className="px-5 py-3.5 text-right text-gray-700 font-semibold">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              <div className="pt-6 pb-2 text-center text-xs text-gray-400 font-medium hidden print:block">
                Prices may vary slightly based on actual inspection. Taxes as applicable.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
