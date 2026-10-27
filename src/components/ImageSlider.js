import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/styles.css'; // Import CSS file

const ImageSlider = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = [
    './images/marvel.jpg',
    './images/marvel1.jpg',
    './images/marvel.jpg',
    './images/marvel1.jpg',
  ];

  // Tự động chuyển slide mỗi 7 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length); // Lướt qua ảnh
    }, 7000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Hàm chuyển slide sang trái
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  // Hàm chuyển slide sang phải
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="slider-container">
      <div
        className="slider"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`, // Chuyển ảnh sang trái theo index
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index}`}
            className="slide"
            onClick={() => navigate('/movies')}
            style={{ cursor: 'pointer' }}
            title="Bấm để xem danh sách phim"
          />
        ))}
      </div>
      <button className="slider-button prev" onClick={prevSlide}>
        &#10094;
      </button>
      <button className="slider-button next" onClick={nextSlide}>
        &#10095;
      </button>
    </div>
  );
};

export default ImageSlider;
