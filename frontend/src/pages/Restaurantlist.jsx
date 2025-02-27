import React from "react";
import Datatable from "../components/datatable/Datatable";
import useFetch from "../hooks/useFetch";
import { Link } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { restaurantColumns } from "../components/datatable/datatablesource";

const Restaurantlist = () => {
  const { data, loading, error } = useFetch("/api/restaurant");

  const generatePDF = (data) => {
    if (!data) return;
    
    const doc = new jspdf();
    const tableColumn = ["Name", "Type", "City", "Contact", "Capacity", "Price Range", "Staff"];
    const tableRows = [];

    data.forEach((item) => {
      const restaurantData = [
        item.name,
        item.type,
        item.city,
        item.contactNo,
        item.capacity,
        item.priceRange,
        item.staffAmount,
      ];
      tableRows.push(restaurantData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: {
        fontSize: 12,
        cellPadding: 3,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 14
      }
    });

    const date = moment().format("YYYY-MM-DD");
    doc.save(`Restaurants_Report_${date}.pdf`);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Restaurant Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <Link 
            to="/addrestaurant" 
            className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Add Restaurant
          </Link>
          <button
            onClick={() => generatePDF(data)}
            className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div>
        <Datatable columns={restaurantColumns} />
      </div>
    </>
  );
};

export default Restaurantlist; 