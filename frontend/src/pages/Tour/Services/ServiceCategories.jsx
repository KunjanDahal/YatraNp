import React from "react";
import tourCategoris from "../../../assets/data/tourCategoris";

const ServiceCategories = () => {
  // Local images for categories
  const localImages = {
    hiking: "https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg",
    beach: "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg",
    safari: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg",
    cultural: "https://images.pexels.com/photos/1271619/pexels-photo-1271619.jpeg",
    special: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg",
    festival: "https://images.pexels.com/photos/1157557/pexels-photo-1157557.jpeg"
  };

  const getLocalImage = (index) => {
    switch(index) {
      case 0: return localImages.hiking;
      case 1: return localImages.beach;
      case 2: return localImages.safari;
      case 3: return localImages.cultural;
      case 4: return localImages.special;
      case 5: return localImages.festival;
      default: return localImages.hiking;
    }
  };

  return (
    <div className="bg-white">
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {tourCategoris.map((tours, index) => (
          <div
            key={tours.id}
            className="group relative rounded-t-3xl shadow-2xl rounded-b-xl border-2"
          >
            <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-3xl lg:aspect-none lg:h-80">
              <img
                src={getLocalImage(index)}
                alt={tours.title}
                className="h-full w-full object-cover object-center rounded-3xl p-4 lg:h-full lg:w-full"
              />
            </div>

            <h3 className="text-2xl p-6 font-bold text-gray-700 text-center">
              {tours.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategories;
