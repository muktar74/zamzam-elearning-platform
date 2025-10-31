
import React, { useState, useRef, useEffect } from 'react';
import { CertificateData, Review, Toast } from '../types';
import { ChevronLeftIcon, StarIcon, BookOpenIcon as DownloadIcon } from './icons';

// Declare global variables for libraries loaded via script tags
declare const html2canvas: any;
declare const jspdf: any;


interface CertificateViewProps {
  data: CertificateData;
  onBackToDashboard: () => void;
  onRateCourse: (courseId: string, rating: number, comment: string) => void;
  addToast: (message: string, type: Toast['type']) => void;
  userRating?: number;
  userReview?: Review;
}

const CertificateView: React.FC<CertificateViewProps> = ({ data, onBackToDashboard, onRateCourse, addToast, userRating, userReview }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');

  const [isDownloading, setIsDownloading] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadRef.current && !downloadRef.current.contains(event.target as Node)) {
        setShowDownloadOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = async (format: 'pdf' | 'jpg' | 'png') => {
      setIsDownloading(true);
      setShowDownloadOptions(false);
      
      const certificateElement = document.getElementById('certificate-to-print');
      if (!certificateElement) {
        addToast('Could not find certificate element.', 'error');
        setIsDownloading(false);
        return;
      }
    
      try {
        const canvas = await html2canvas(certificateElement, { 
            scale: 2, // Higher scale for better quality
            useCORS: true,
            logging: false, 
        });
        
        const dataUrl = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 1.0);
    
        if (format === 'pdf') {
          const { jsPDF } = jspdf;
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });
          pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`Certificate-${data.courseName.replace(/\s/g, '_')}.pdf`);
        } else {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `Certificate-${data.courseName.replace(/\s/g, '_')}.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        addToast('Certificate downloaded successfully!', 'success');
      } catch (error) {
        console.error('Error downloading certificate:', error);
        addToast('Failed to download certificate.', 'error');
      } finally {
        setIsDownloading(false);
      }
  };

  const handleRateAndComment = () => {
      if (selectedRating > 0 && comment.trim() !== '') {
          onRateCourse(data.courseId, selectedRating, comment);
      } else {
          addToast('Please select a rating and write a comment.', 'error');
      }
  };

  const RateCourse: React.FC = () => {
    if(userRating) {
      return (
        <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Thank you for your feedback!</h3>
            <p className="text-slate-600">You rated this course:</p>
            <div className="flex justify-center items-center mt-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} className={`w-7 h-7 ${i < userRating ? 'text-amber-400' : 'text-slate-300'}`} />
              ))}
            </div>
             {userReview?.comment && (
                <blockquote className="mt-4 p-4 bg-slate-50 border-l-4 border-slate-300 max-w-lg mx-auto">
                    <p className="text-slate-700 italic">"{userReview.comment}"</p>
                </blockquote>
            )}
        </div>
      );
    }

    return (
      <div className="text-center">
          <h3 className="text-lg font-semibold text-slate-700 mb-3">Rate and Review this course</h3>
          <div className="flex justify-center items-center" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
              const ratingValue = i + 1;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedRating(ratingValue)}
                  onMouseEnter={() => setHoverRating(ratingValue)}
                  className="focus:outline-none"
                  aria-label={`Rate ${ratingValue} out of 5 stars`}
                >
                  <StarIcon 
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      ratingValue <= (hoverRating || selectedRating) ? 'text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              );
            })}
          </div>
           <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full max-w-lg mx-auto mt-4 px-3 py-2 bg-slate-100 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zamzam-teal-500"
            placeholder="Share your thoughts on the course..."
           />
           <button
             onClick={handleRateAndComment}
             disabled={!selectedRating || !comment.trim()}
             className="mt-4 bg-zamzam-teal-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-zamzam-teal-700 transition disabled:bg-slate-300"
           >
             Submit Review
           </button>
      </div>
    );
  }


  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBackToDashboard} className="flex items-center text-sm font-medium text-zamzam-teal-600 hover:text-zamzam-teal-800 transition">
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="relative" ref={downloadRef}>
            <button 
                onClick={() => setShowDownloadOptions(prev => !prev)}
                disabled={isDownloading}
                className="flex items-center bg-zamzam-teal-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-zamzam-teal-700 transition disabled:bg-slate-400"
            >
                <DownloadIcon className="h-5 w-5 mr-2" />
                {isDownloading ? 'Generating...' : 'Download Certificate'}
            </button>
            {showDownloadOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-slate-200 z-10">
                    <button onClick={() => handleDownload('pdf')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Download as PDF</button>
                    <button onClick={() => handleDownload('png')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Download as PNG</button>
                    <button onClick={() => handleDownload('jpg')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Download as JPG</button>
                </div>
            )}
        </div>
      </div>

      <div id="certificate-to-print" className="bg-white p-8 rounded-xl shadow-lg border-8 border-zamzam-teal-600">
        <div className="border-4 border-zamzam-teal-200 p-8 text-center">
            <h1 className="text-4xl font-bold text-zamzam-teal-800">Certificate of Completion</h1>
            <p className="text-lg text-slate-600 mt-6">This certificate is proudly presented to</p>
            <p className="text-5xl font-extrabold text-zamzam-teal-700 my-8 tracking-wider">{data.employeeName}</p>
            <p className="text-lg text-slate-600">for successfully completing the course</p>
            <h2 className="text-3xl font-semibold text-slate-800 my-4">"{data.courseName}"</h2>
            <p className="text-md text-slate-500 mt-8">Issued on: {data.completionDate}</p>
            <div className="mt-16 flex justify-between items-end">
                <div className="text-center">
                    <p className="font-['Caveat'] text-3xl text-slate-600">A. Ibrahim</p>
                    <p className="font-semibold text-slate-700 border-t-2 border-slate-400 pt-2 mt-2 text-sm">HR Director</p>
                    <p className="text-xs text-slate-500">Human Resource Directorate</p>
                </div>
                 <div className="text-2xl font-bold text-zamzam-teal-700">
                    Zamzam Bank
                </div>
                 <div className="text-center">
                    <p className="font-['Caveat'] text-3xl text-slate-600">M. Yusuf</p>
                    <p className="font-semibold text-slate-700 border-t-2 border-slate-400 pt-2 mt-2 text-sm">Department Head</p>
                    <p className="text-xs text-slate-500">Training & Development</p>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
          <RateCourse />
      </div>
    </div>
  );
};

export default CertificateView;