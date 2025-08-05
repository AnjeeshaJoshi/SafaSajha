// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { FiStar, FiUser } from 'react-icons/fi';

// const AdminFeedback = () => {
//   const { token } = useAuth();
//   const [feedbackList, setFeedbackList] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     const fetchFeedback = async () => {
//       try {
//         const { data } = await axios.get('/api/admin/feedback', {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setFeedbackList(data.feedback);
//       } catch (error) {
//         toast.error('Failed to load feedback');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeedback();
//   }, [token]);

//   const filteredFeedback = feedbackList.filter(feedback => {
//     const search = searchTerm.toLowerCase();
//     return (
//       feedback.user?.name.toLowerCase().includes(search) ||
//       feedback.user?.email.toLowerCase().includes(search) ||
//       feedback.report.type.toLowerCase().includes(search) ||
//       feedback.report.location.address.toLowerCase().includes(search) ||
//       feedback.comment?.toLowerCase().includes(search)
//     );
//   });

//   if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

//   return (
//     <div className="p-6 max-w-6xl mx-auto">
//       <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
//         <h1 className="text-2xl font-bold">Customer Feedback</h1>
//         <div className="mt-4 md:mt-0">
//           <input
//             type="text"
//             placeholder="Search feedback..."
//             className="w-full md:w-64 p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//         </div>
//       </div>
      
//       {filteredFeedback.length === 0 ? (
//         <div className="bg-white p-6 rounded-lg shadow text-center">
//           <p className="text-gray-600">
//             {searchTerm ? 'No matching feedback found' : 'No feedback received yet'}
//           </p>
//         </div>
//       ) : (
//         <div className="space-y-6">
//           {filteredFeedback.map(feedback => (
//             <div key={feedback._id} className="bg-white p-6 rounded-lg shadow">
//               <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
//                 <div className="flex items-center mb-3 md:mb-0">
//                   {feedback.user ? (
//                     <div className="flex items-center">
//                       <div className="bg-gray-100 p-2 rounded-full mr-3">
//                         <FiUser className="text-gray-600" />
//                       </div>
//                       <div>
//                         <h2 className="font-semibold">{feedback.user.name}</h2>
//                         <p className="text-sm text-gray-500">{feedback.user.email}</p>
//                       </div>
//                     </div>
//                   ) : (
//                     <span className="text-gray-500">User not available</span>
//                   )}
//                 </div>
//                 <div className="flex items-center">
//                   <div className="flex mr-4">
//                     {[...Array(5)].map((_, i) => (
//                       <FiStar
//                         key={i}
//                         className={`w-5 h-5 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-sm text-gray-500">
//                     {new Date(feedback.submittedAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>
              
//               <div className="mb-4">
//                 <h3 className="font-medium text-gray-900 mb-1">
//                   {feedback.report.type} Waste Report
//                 </h3>
//                 <p className="text-sm text-gray-600 mb-1">
//                   Location: {feedback.report.location.address}
//                 </p>
//                 <p className="text-sm text-gray-600">
//                   Completed on: {new Date(feedback.report.completedAt).toLocaleDateString()}
//                 </p>
//               </div>
              
//               {feedback.comment && (
//                 <div className="mt-4 p-4 bg-gray-50 rounded-md">
//                   <p className="text-gray-700 whitespace-pre-wrap">{feedback.comment}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AdminFeedback;