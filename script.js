let currentIndex = 0;
const slides = document.querySelector('.slides');
const images = slides ? Array.from(slides.children).filter(img => img.tagName === 'IMG' && img.src) : [];
const totalSlides = images.length;

// 画像が1枚以上ある場合のみスライド
if (slides && totalSlides > 0) {
    // 不要なimg（srcが空など）を非表示
    Array.from(slides.children).forEach(img => {
        if (img.tagName === 'IMG' && !img.src) img.style.display = 'none';
    });

    // 横並び
    slides.style.display = 'flex';
    images.forEach(img => {
        img.style.flex = '0 0 auto';
        img.style.maxWidth = '100%';
    });

    // 各画像の幅を取得
    function getOffset(index) {
        let offset = 0;
        for (let i = 0; i < index; i++) {
            offset += images[i].clientWidth;
        }
        return offset;
    }

    // スライドの幅を設定
    const slideWidth = images.reduce((total, img) => total + img.clientWidth, 0);
    slides.style.width = `${slideWidth}px`;

    setInterval(() => {
        if (totalSlides <= 1) return;
        currentIndex = (currentIndex + 1) % totalSlides;
        slides.style.transform = `translateX(-${getOffset(currentIndex)}px)`;
    }, 4000);
}
