let currentIndex = 0;
const slides = document.querySelector('.slides');
const totalSlides = slides ? slides.children.length : 0;

if (totalSlides > 0) {
    setInterval(() => {
        currentIndex = (currentIndex + 1) % totalSlides;
        slides.style.transform = `translateX(-${currentIndex * 100}%)`;
    }, 4000);
}
