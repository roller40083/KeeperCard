document.addEventListener('DOMContentLoaded', function () {
    const mainImg = document.getElementById('galleryMain');
    const thumbsContainer = document.querySelector('.gallery__thumbs');
    const thumbs = document.querySelectorAll('.gallery__thumb:not(.gallery__thumb--more)');
    const moreBtn = document.querySelector('.gallery__thumb--more');
    const hiddenImgs = Array.from(document.querySelectorAll('.gallery__hidden img')).map(i => i.src);

    let hiddenIndex = 0;

    // helper: плавно сменить главное изображение
    function changeMain(src) {
        if (!mainImg || !src) return;
        const parent = mainImg.parentElement;
        parent.classList.add('is-changing');
        setTimeout(() => {
            mainImg.src = src;
            setTimeout(() => parent.classList.remove('is-changing'), 320);
        }, 90);
    }

    // обработка клика по миниатюре + автопрокрутка при клике у края
    thumbs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const src = btn.dataset.src;
            if (src) changeMain(src);

            if (!thumbsContainer) return;
            const btnRect = btn.getBoundingClientRect();
            const contRect = thumbsContainer.getBoundingClientRect();
            const edgeThreshold = 28; // px — расстояние до края, при котором сработает автопрокрутка

            // клик у правого края — скроллим следующий элемент в видимую область (не заменяем main)
            if (btnRect.right > contRect.right - edgeThreshold) {
                const next = btn.nextElementSibling;
                if (next) {
                    next.scrollIntoView({behavior: 'smooth', inline: 'end', block: 'nearest'});
                } else {
                    // если нет следующего — прокрутим контейнер в самый конец
                    thumbsContainer.scrollTo({ left: thumbsContainer.scrollWidth, behavior: 'smooth' });
                }
            }

            // клик у левого края — скроллим предыдущий элемент в видимую область
            if (btnRect.left < contRect.left + edgeThreshold) {
                const prev = btn.previousElementSibling;
                if (prev) prev.scrollIntoView({behavior: 'smooth', inline: 'start', block: 'nearest'});
                else thumbsContainer.scrollTo({ left: 0, behavior: 'smooth' });
            }
        });
    });

    // кнопка "ещё" — показывает скрытые по очереди
    if (moreBtn) {
        const extraCount = hiddenImgs.length;
        if (extraCount > 0) moreBtn.textContent = `+${extraCount}`;

        moreBtn.addEventListener('click', () => {
            if (hiddenImgs.length === 0) return;
            const src = hiddenImgs[hiddenIndex % hiddenImgs.length];
            hiddenIndex++;
            changeMain(src);
        });
    }

    // LIGHTBOX -------------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    // собираем список всех изображений: превью + скрытые; если main не в списке — добавляем
    const galleryImages = [];
    document.querySelectorAll('.gallery__thumb').forEach(t => { if (t.dataset && t.dataset.src) galleryImages.push(t.dataset.src); });
    document.querySelectorAll('.gallery__hidden img').forEach(i => galleryImages.push(i.src));
    if (mainImg && mainImg.src && !galleryImages.includes(mainImg.src)) galleryImages.unshift(mainImg.src);

    let currentIndex = 0;

    function openLightbox(index) {
        if (!lightbox || !lightboxImg) return;
        currentIndex = Math.max(0, Math.min(galleryImages.length - 1, index || 0));
        // плавная смена
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = galleryImages[currentIndex] || '';
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('menu-open');
            setTimeout(() => lightboxImg.style.opacity = '1', 50);
        }, 160);
    }

    function closeLightbox() {
        if (!lightbox || !lightboxImg) return;
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImg.style.opacity = '0';
        setTimeout(() => { lightboxImg.src = ''; }, 240);
        document.body.classList.remove('menu-open');
    }

    function showNext() { openLightbox((currentIndex + 1) % galleryImages.length); }
    function showPrev() { openLightbox((currentIndex - 1 + galleryImages.length) % galleryImages.length); }

    // открыть по клику на большое изображение
    if (mainImg) {
        mainImg.style.cursor = 'zoom-in';
        mainImg.addEventListener('click', () => {
            const idx = galleryImages.indexOf(mainImg.src);
            openLightbox(idx === -1 ? 0 : idx);
        });
    }

    // открыть по клику на миниатюре (один клик)
    
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNext);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);

    document.addEventListener('keydown', (e) => {
        if (!lightbox || lightbox.getAttribute('aria-hidden') === 'true') return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNext();
        if (e.key === 'ArrowLeft') showPrev();
    });

    if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
});