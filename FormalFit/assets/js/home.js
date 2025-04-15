document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.slider');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const slideWidth = document.querySelector('.slide').offsetWidth;
    const slideMargin = slideWidth * 0.02; // 2% margin
    const slidesToScroll = 1;
    
    nextBtn.addEventListener('click', function() {
        slider.scrollLeft += (slideWidth + slideMargin) * slidesToScroll;
    });
    
    prevBtn.addEventListener('click', function() {
        slider.scrollLeft -= (slideWidth + slideMargin) * slidesToScroll;
    });
    

    let autoScrollInterval;
    
    function startAutoScroll() {
        autoScrollInterval = setInterval(function() {
            slider.scrollLeft += (slideWidth + slideMargin) * slidesToScroll;
            if (slider.scrollLeft >= (slider.scrollWidth - slider.clientWidth)) {
                slider.scrollLeft = 0;
            }
        }, 3000);
    }
    
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    startAutoScroll();
    
    slider.addEventListener('mouseenter', stopAutoScroll);
    slider.addEventListener('mouseleave', startAutoScroll);
    
});

document.addEventListener("DOMContentLoaded", function() {
let links = document.querySelectorAll("a"); // Ambil semua link
links.forEach(link => {
if (link.href === window.location.href) {
link.classList.add("active"); // Tambahkan kelas 'active' ke link yang sesuai
}
});
});
