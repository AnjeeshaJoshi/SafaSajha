// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { FiStar, FiCheckCircle } from 'react-icons/fi';

// const UserFeedback = () => {
//   const { user, token } = useAuth();
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [feedback, setFeedback] = useState({
//     rating: 5,
//     comment: ''
//   });

//   useEffect(() => {
//     const fetchCompletedReports = async () => {
//       try {
//         const { data } = await axios.get('/api/waste/reports/completed', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setReports(data.reports);
//       } catch (error) {
//         toast.error('Failed to load completed reports');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCompletedReports();
//   }, [token]);

//   const handleSubmitFeedback = async (reportId) => {
//     try {
//       await axios.post(`/api/waste/reports/${reportId}/feedback`, feedback, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       toast.success('Feedback submitted successfully');
//       setReports(reports.filter(r => r._id !== reportId));
//       setFeedback({ rating: 5, comment: '' }); // Reset form
//     } catch (error) {
//       toast.error(error.response?.data?.msg || 'Failed to submit feedback');
//     }
//   };

//   if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Give Feedback</h1>
      
//       {reports.length === 0 ? (
//         <div className="bg-white p-6 rounded-lg shadow text-center">
//           <FiCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
//           <p className="text-gray-600">No completed reports available for feedback</p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {reports.map(report => (
//             <div key={report._id} className="bg-white p-6 rounded-lg shadow">
//               <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
//                 <h2 className="font-semibold text-lg mb-2 md:mb-0">
//                   {report.type} Waste - {report.location?.address || 'Unknown location'}
//                 </h2>
//                 <span className="text-sm text-gray-500">
//                   Completed on {new Date(report.completedAt || report.updatedAt).toLocaleDateString()}
//                 </span>
//               </div>
              
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
//                 <div className="flex space-x-1">
//                   {[1, 2, 3, 4, 5].map(star => (
//                     <button
//                       key={star}
//                       type="button"
//                       onClick={() => setFeedback({...feedback, rating: star})}
//                       className={`text-2xl focus:outline-none ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
//                     >
//                       <FiStar className="inline" />
//                     </button>
//                   ))}
//                 </div>
//               </div>
              
//               <div className="mb-4">
//                 <label htmlFor={`comment-${report._id}`} className="block text-sm font-medium text-gray-700 mb-2">
//                   Comments
//                 </label>
//                 <textarea
//                   id={`comment-${report._id}`}
//                   className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
//                   rows="3"
//                   value={feedback.comment}
//                   onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
//                   placeholder="Share your experience..."
//                 />
//               </div>
              
//               <button
//                 onClick={() => handleSubmitFeedback(report._id)}
//                 className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
//               >
//                 Submit Feedback
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserFeedback;