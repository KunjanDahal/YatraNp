import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import useFetch from "../hooks/useFetch";
import { Link, useLocation } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import axios from "axios";
import { FaReply, FaTrash, FaCheckCircle, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const Tourlist = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];
  const { data } = useFetch(`/api/${path}`);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customRequests, setCustomRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Fetch custom tour requests when modal opens
  useEffect(() => {
    if (showCustomModal) {
      fetchCustomRequests();
    }
  }, [showCustomModal]);

  const fetchCustomRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await axios.get("/api/tours/customform/all");
      setCustomRequests(response.data);
      setLoadingRequests(false);
    } catch (error) {
      console.error("Error fetching custom tour requests:", error);
      setLoadingRequests(false);
    }
  };

  // Handle responding to a request
  const handleRespondRequest = async (id, userEmail) => {
    const { value: response } = await Swal.fire({
      title: "Respond to Request",
      inputLabel: `Respond to ${userEmail}`,
      input: "textarea",
      inputPlaceholder: "Enter your response here...",
      showCancelButton: true,
      confirmButtonText: "Send Response",
      showLoaderOnConfirm: true,
      preConfirm: (response) => {
        if (!response || response.trim() === "") {
          Swal.showValidationMessage("Please enter a response");
          return false;
        }
        return response;
      },
    });

    if (response) {
      try {
        setLoadingRequests(true);
        const res = await axios.post(`/api/tours/customform/respond/${id}`, {
          response,
        });
        
        if (res.data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Response Sent!",
            text: "The user will be notified about your response.",
            confirmButtonColor: "#3085d6",
          });
          
          // Refresh the requests list
          fetchCustomRequests();
        }
      } catch (error) {
        console.error("Error responding to request:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to send response. Please try again.",
        });
      } finally {
        setLoadingRequests(false);
      }
    }
  };

  // Handle marking a request as processed
  const handleMarkProcessed = async (id) => {
    try {
      await axios.patch(`/api/tours/customform/${id}`, { status: "processed" });
      
      // Update the status in the local state
      setCustomRequests(customRequests.map(request => 
        request._id === id ? { ...request, status: "processed" } : request
      ));
      
      Swal.fire(
        "Updated!",
        "The request has been marked as processed.",
        "success"
      );
    } catch (error) {
      Swal.fire(
        "Error!",
        "Failed to update the request status.",
        "error"
      );
    }
  };

  // Handle deleting a request
  const handleDeleteRequest = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        await axios.delete(`/api/tours/customform/${id}`);
        setCustomRequests(customRequests.filter(request => request._id !== id));
        Swal.fire(
          "Deleted!",
          "The request has been deleted.",
          "success"
        );
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        "Failed to delete the request.",
        "error"
      );
    }
  };

  // Generate status badge
  const getStatusBadge = (status) => {
    switch(status) {
      case "new":
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">New</span>;
      case "responded":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Responded</span>;
      case "processed":
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Processed</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">New</span>;
    }
  };

  function generatePDF(tickets) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Name Of Package",
      "Tour Category",
      "Duration",
      "Price",
      "Maximum Group Count",
      "Added By",
    ];
    const tableRows = [];

    tickets
      .slice(0)
      .reverse()
      .map((tour, index) => {
        const ticketData = [
          index + 1,
          tour.name,
          tour.category,
          tour.duration,
          tour.price,
          tour.groupCount,
          tour.currentUser,

          moment(tour.createdAt).format("MM/DD/YYYY h:mm A"), // format createdAt using moment
          moment(tour.updatedAt).format("MM/DD/YYYY h:mm A"), // format updatedAt using moment
        ];
        tableRows.push(ticketData);
      });

    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];

    doc.text("Traverly", 14, 15).setFontSize(16); // add heading
    doc.text("Tour Details Report", 14, 23).setFontSize(10);
    doc.text(`Report Generated Date: ${dateStr}`, 14, 30).setFontSize(10);
    doc
      .text("YatraNp.co,Nepal", 14, 37)
      .setFontSize(10);

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 42,
    });

    doc.save(`Tour-Details-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
          <div className="text-3xl font-bold">Tour Package Managment</div>
          <div className="grid md:grid-cols-2 gap-1">
            <Link
              to={"/addtour"}
              className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
            >
              Add Tour Package
            </Link>
            <button
              onClick={() => setShowCustomModal(true)}
              className="bg-purple-600 hover:bg-purple-800 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
            >
              Custom Requests
            </button>
          </div>
          <button
            onClick={() => {
              generatePDF(data);
            }}
            className="bg-gray-800 text-center hover:bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Generate report
          </button>
        </div>

        <div className="flex-grow bg-white">
          <Datatable columns={columns} />
        </div>
      </div>

      {/* Custom Requests Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-[90%] max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="bg-gradient-to-r bg-blue-400 text-white p-8 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-bold text-white">Custom Tour Requests</h2>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <FaTimes className="w-8 h-8" />
                </button>
              </div>
            </div>

            {loadingRequests ? (
              <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <div className="p-8 bg-white">
                {customRequests.length === 0 ? (
                  <div className="p-12 text-center rounded-lg border border-gray-200">
                    <p className="text-gray-600 text-2xl">No custom tour requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            User
                          </th>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            From
                          </th>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            To
                          </th>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            Days
                          </th>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th scope="col" className="px-8 py-5 text-left text-base font-bold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg font-medium text-gray-600">{request.currentUser}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg text-gray-600">{request.whereFrom}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg text-gray-600">{request.whereTo}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg text-gray-600">{request.days}</div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg text-gray-600">
                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              {request.status === "new" && (
                                <span className="px-4 py-2 text-base font-medium rounded-full bg-blue-100 text-blue-600">New</span>
                              )}
                              {request.status === "responded" && (
                                <span className="px-4 py-2 text-base font-medium rounded-full bg-green-100 text-green-600">Responded</span>
                              )}
                              {request.status === "processed" && (
                                <span className="px-4 py-2 text-base font-medium rounded-full bg-purple-100 text-purple-600">Processed</span>
                              )}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="flex items-center space-x-5">
                                <button
                                  onClick={() => handleRespondRequest(request._id, request.currentUser)}
                                  className="text-blue-500 hover:text-blue-700 bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors"
                                  title="Respond"
                                >
                                  <FaReply size={20} />
                                </button>
                                
                                <button
                                  onClick={() => handleMarkProcessed(request._id)}
                                  className="text-green-500 hover:text-green-700 bg-green-100 p-3 rounded-full hover:bg-green-200 transition-colors"
                                  title="Mark as Processed"
                                >
                                  <FaCheckCircle size={20} />
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteRequest(request._id)}
                                  className="text-red-500 hover:text-red-700 bg-red-100 p-3 rounded-full hover:bg-red-200 transition-colors"
                                  title="Delete"
                                >
                                  <FaTrash size={20} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            <div className="border-t border-gray-200 px-8 py-6 flex justify-end bg-white">
              <button
                onClick={() => setShowCustomModal(false)}
                className="bg-blue-500 text-white px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-medium text-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Tourlist;
