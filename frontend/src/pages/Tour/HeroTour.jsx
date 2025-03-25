import React from "react";
import SearchBar from "./SearchBar";

const image = {
  backgroundImage:
    "url('https://images.pexels.com/photos/950058/pexels-photo-950058.jpeg')",
  height: "500px",
  backgroundPosition: "center",
  backgroundSize: "cover",
  position: "relative",
};

const HeroTour = () => {
  return (
    // <!-- Container for demo purpose -->
    <div>
      <div className="">
        <div
          className="relative overflow-hidden bg-no-repeat bg-cover"
          style={image}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="flex h-full items-center justify-center text-center relative z-10">
            <div>
              <h2
                className="mb-5 text-6xl font-bold text-white"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bolder",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Do More With YatraNp
              </h2>
              <div>
                <div className="mt-12 w-1/2 mr-auto ml-auto">
                  <h4
                    className="mt-5 mb-6 text-xl uppercase animate-bounce text-white text-center"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "normal",
                      border: "solid 1px white",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      padding: "10px"
                    }}
                  >
                    DISCOVER NEPAL
                  </h4>
                </div>
              </div>
              <SearchBar />
            </div>
          </div>
        </div>
      </div>
    </div>
    // <!-- Container for demo purpose -->
  );
};

export default HeroTour;
