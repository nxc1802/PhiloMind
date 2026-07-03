import React, { useEffect, useState } from "react";

const banners = [
  {
    image: "/banner/banner1.png",

  },
  {
    image: "/banner/banner2.png",
 
  },
  {
    image: "/banner/banner3.png",

  },
  {
    image: "/banner/banner4.png",
  },
];

export default function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const next = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prev = () => {
    setCurrent((prev) =>
      prev === 0 ? banners.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative w-full h-[550px] overflow-hidden rounded-3xl shadow-xl">

      {banners.map((banner, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ${
            current === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={banner.image}
            alt={banner.title}
            className="w-full h-full object-cover"
          />

<div className="absolute inset-0 flex items-center">

          </div>

        </div>
      ))}

      <button
        onClick={prev}
        className="absolute left-5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 text-2xl shadow"
      >
        ❮
      </button>

      <button
        onClick={next}
        className="absolute right-5 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-12 h-12 text-2xl shadow"
      >
        ❯
      </button>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3">

        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full ${
              current === index
                ? "bg-white"
                : "bg-white/40"
            }`}
          />
        ))}

      </div>
    </div>
  );
}