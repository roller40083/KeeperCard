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
});