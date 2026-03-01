document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // 1) HERO CROSSFADE SLIDESHOW
    // =========================
    const slideA = document.querySelector(".hero-slide-a");
    const slideB = document.querySelector(".hero-slide-b");

    if (slideA && slideB) {
        const heroImages = [
            "assets/hero/hero-01.webp",
            "assets/hero/hero-02.webp",
            "assets/hero/hero-03.webp",
        ];

        let index = 0;
        let showingA = true;

        slideA.style.backgroundImage = `url("${heroImages[index]}")`;
        slideA.style.opacity = "1";
        slideB.style.opacity = "0";

        slideA.style.transition = "opacity 1.2s ease";
        slideB.style.transition = "opacity 1.2s ease";

        setInterval(() => {
            index = (index + 1) % heroImages.length;
            const nextSrc = heroImages[index];

            if (showingA) {
                slideB.style.backgroundImage = `url("${nextSrc}")`;
                slideB.style.opacity = "1";
                slideA.style.opacity = "0";
            } else {
                slideA.style.backgroundImage = `url("${nextSrc}")`;
                slideA.style.opacity = "1";
                slideB.style.opacity = "0";
            }

            showingA = !showingA;
        }, 5000);
    }

    // Footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // =========================
    // 2) DROPDOWNS
    // =========================
    const dropdowns = document.querySelectorAll("details.dropdown");
    const hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (hoverCapable) {
        dropdowns.forEach((dd) => {
            dd.addEventListener("mouseenter", () => {
                dropdowns.forEach((other) => { if (other !== dd) other.open = false; });
                dd.open = true;
            });
            dd.addEventListener("mouseleave", () => { dd.open = false; });
        });
    }

    dropdowns.forEach((dd) => {
        dd.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => { dd.open = false; });
        });
    });

    dropdowns.forEach((dd) => {
        dd.addEventListener("toggle", () => {
            if (!dd.open) return;
            dropdowns.forEach((other) => { if (other !== dd) other.open = false; });
        });
    });

    document.addEventListener("click", (e) => {
        const clickedInside = e.target.closest("details.dropdown");
        if (!clickedInside) dropdowns.forEach((dd) => (dd.open = false));
    });

    // =========================
    // 3) CARD COLOUR PLACEHOLDERS
    // =========================
    document.querySelectorAll(".image-card[data-color]").forEach((card) => {
        const c = card.getAttribute("data-color");
        if (c) card.style.setProperty("--card-color", c);
    });

    // =========================
    // 4) THUMBNAIL AUTO-WIRING (Portfolio)
    // =========================
    const THUMB_SIZES = [800, 1600];
    const FULL_SIZE = 2400;

    function sizesForTile(btn) {
        const isWide = btn.classList.contains("w2");
        if (!isWide) {
            return "(max-width: 520px) 50vw, (max-width: 700px) 50vw, (max-width: 1000px) 33vw, 25vw";
        }
        return "(max-width: 520px) 50vw, (max-width: 700px) 100vw, (max-width: 1000px) 66vw, 50vw";
    }

    function getPortfolioRoot(imgEl) {
        const masonry = imgEl.closest(".masonry");
        const gallery = masonry?.getAttribute("data-gallery") || "home1";
        return `assets/portfolio/${gallery}`;
    }

    function thumbSrc(root, base, w) {
        return `${root}/thumb/${base}-${w}.webp`;
    }

    function fullSrc(root, base) {
        return `${root}/full/${base}-${FULL_SIZE}.webp`;
    }

    document.querySelectorAll("#portfolio img[data-img]").forEach((img) => {
        const base = img.getAttribute("data-img");
        const btn = img.closest(".masonry-item");
        if (!base || !btn) return;

        const root = getPortfolioRoot(img);

        img.src = thumbSrc(root, base, THUMB_SIZES[0]);
        img.srcset = THUMB_SIZES.map((w) => `${thumbSrc(root, base, w)} ${w}w`).join(", ");
        img.sizes = sizesForTile(btn);
        img.decoding = "async";
        img.loading = "lazy";
    });

    // =========================
    // 5) SCROLL LOCK
    // =========================
    let scrollLocks = 0;
    function lockScroll() {
        scrollLocks += 1;
        document.body.style.overflow = "hidden";
    }
    function unlockScroll() {
        scrollLocks = Math.max(0, scrollLocks - 1);
        if (scrollLocks === 0) document.body.style.overflow = "";
    }

    // =========================
    // 6) LIGHTBOX
    // =========================
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxPrev = document.querySelector(".lightbox-prev");
    const lightboxNext = document.querySelector(".lightbox-next");

    let lightboxImages = [];
    let lightboxIndex = 0;

    function preloadImage(url) {
        if (!url) return;
        const im = new Image();
        im.src = url;
    }

    function renderLightbox() {
        if (!lightboxImg || lightboxImages.length === 0) return;

        const url = lightboxImages[lightboxIndex];
        lightboxImg.src = url;

        const next = lightboxImages[(lightboxIndex + 1) % lightboxImages.length];
        const prev = lightboxImages[(lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length];
        preloadImage(next);
        preloadImage(prev);
    }

    function openLightbox(images, startIndex = 0) {
        if (!lightbox) return;
        lightboxImages = images;
        lightboxIndex = startIndex;
        renderLightbox();
        lightbox.hidden = false;
        lockScroll();
    }

    function closeLightbox() {
        if (!lightbox || lightbox.hidden) return;
        lightbox.hidden = true;
        if (lightboxImg) lightboxImg.src = "";
        unlockScroll();
    }

    function prevLightbox() {
        if (lightboxImages.length === 0) return;
        lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        renderLightbox();
    }

    function nextLightbox() {
        if (lightboxImages.length === 0) return;
        lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
        renderLightbox();
    }

    if (lightboxPrev) lightboxPrev.addEventListener("click", prevLightbox);
    if (lightboxNext) lightboxNext.addEventListener("click", nextLightbox);
    document.querySelectorAll("[data-lightbox-close]").forEach((el) => el.addEventListener("click", closeLightbox));

    // =========================
    // 7) ABOUT OVERLAY
    // =========================
    const aboutOverlay = document.getElementById("aboutOverlay");
    const aboutOpenBtn = document.getElementById("aboutOpen");

    function openAboutOverlay() {
        if (!aboutOverlay) return;
        aboutOverlay.hidden = false;
        lockScroll();
    }

    function closeAboutOverlay() {
        if (!aboutOverlay || aboutOverlay.hidden) return;
        aboutOverlay.hidden = true;
        unlockScroll();
    }

    if (aboutOpenBtn) aboutOpenBtn.addEventListener("click", openAboutOverlay);
    document.querySelectorAll("[data-about-close]").forEach((el) => el.addEventListener("click", closeAboutOverlay));

    // =========================
    // 8) PROJECT OVERLAY (Commissioned + Personal)
    // =========================
    const overlay = document.getElementById("projectOverlay");
    const overlayHeroImg = document.getElementById("overlayHeroImg");
    const overlayTitle = document.getElementById("overlayTitle");
    const overlayByline = document.getElementById("overlayByline");
    const overlayDescription = document.getElementById("overlayDescription");
    const overlayGallery = document.getElementById("overlayGallery");

    function parseGallery(csv) {
        return String(csv || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    function openProjectOverlay(card) {
        if (!overlay || !overlayHeroImg || !overlayGallery) return;

        const title = card.getAttribute("data-title") || "Project";
        const byline = card.getAttribute("data-byline") || "";
        const desc = card.getAttribute("data-description") || "";
        const hero = card.getAttribute("data-hero") || "";
        const gallery = parseGallery(card.getAttribute("data-gallery"));

        overlayTitle.textContent = title;
        overlayByline.textContent = byline;
        overlayDescription.textContent = desc;

        const heroSrc = hero || gallery[0] || "";
        overlayHeroImg.src = heroSrc;
        overlayHeroImg.alt = title;

        overlayGallery.innerHTML = "";

        gallery.forEach((src, index) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = `masonry-item${index % 3 === 0 ? " h2" : ""}`;
            btn.innerHTML = `<img src="${src}" alt="${title} image ${index + 1}" loading="lazy" decoding="async">`;
            btn.addEventListener("click", () => openLightbox(gallery, index));
            overlayGallery.appendChild(btn);
        });

        overlay.hidden = false;
        lockScroll();
    }

    function closeOverlay() {
        if (!overlay || overlay.hidden) return;
        if (lightbox && !lightbox.hidden) closeLightbox();
        overlay.hidden = true;
        unlockScroll();
    }

    document.querySelectorAll("#projects .image-card, #personal .image-card").forEach((card) => {
        card.addEventListener("click", () => openProjectOverlay(card));
    });

    document.querySelectorAll("[data-overlay-close]").forEach((el) => el.addEventListener("click", closeOverlay));

    // =========================
    // 9) PORTFOLIO -> LIGHTBOX WIRING (Full-res)
    // =========================
    document.querySelectorAll("#portfolio .masonry").forEach((grid) => {
        const items = Array.from(grid.querySelectorAll(".masonry-item"));
        if (items.length === 0) return;

        const fullList = items
            .map((btn) => {
                const img = btn.querySelector("img[data-img]");
                if (!img) return null;
                const base = img.getAttribute("data-img");
                if (!base) return null;

                const root = getPortfolioRoot(img);
                return fullSrc(root, base);
            })
            .filter(Boolean);

        items.forEach((btn, index) => {
            btn.addEventListener("click", () => {
                openLightbox(fullList, index);
            });
        });
    });

    // =========================
    // 10) KEYBOARD HANDLING
    // =========================
    document.addEventListener("keydown", (e) => {
        if (lightbox && !lightbox.hidden) {
            if (e.key === "Escape") return closeLightbox();
            if (e.key === "ArrowLeft") return prevLightbox();
            if (e.key === "ArrowRight") return nextLightbox();
        }

        if (e.key === "Escape") {
            if (overlay && !overlay.hidden) closeOverlay();
            if (aboutOverlay && !aboutOverlay.hidden) closeAboutOverlay();
        }
    });

    // =========================
    // 11) CONTACT: SUBMIT TO BACKEND
    // =========================
    const contactForm = document.getElementById("contactForm");
    const contactStatus = document.getElementById("contactStatus");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (contactStatus) contactStatus.textContent = "Sending…";

            const fd = new FormData(contactForm);
            const payload = {
                name: fd.get("name"),
                email: fd.get("email"),
                type: fd.get("type"),
                message: fd.get("message"),
                botField: fd.get("bot-field"),
            };

            try {
                const res = await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Contact failed");

                contactForm.reset();
                if (contactStatus) contactStatus.textContent = "Thanks — we’ll get back to you shortly.";
            } catch {
                if (contactStatus) contactStatus.textContent = "Sorry — message failed. Please try again.";
            }
        });
    }
});