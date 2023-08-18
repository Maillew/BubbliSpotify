var swiper = new Swiper(".slide-content", {
    slidesPerView: 5,
    spaceBetween: 25,
    loop: true,
    grabCursor: true,
    autoHeight: true, // Ensure equal height based on content
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
        1050: {
            slidesPerView: 5,
        },
        800:{
            slidesPerView: 4,
        },
        600: {
            slidesPerView: 3,
        },
        380:{
            slidesPerView: 2,
        },
        0: {
            slidesPerView: 1,
        }
    }
  });
  
//slidesPerGroup affects the looping 
