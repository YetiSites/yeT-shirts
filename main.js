/**
 * Yeti Atelier - Main Script
 * -------------------------
 * This script is bundled for local file compatibility (file://).
 * It uses an IIFE to avoid global scope pollution.
 */
(() => {
  "use strict";

  // --- Modules ---

  /**
   * Toast Notifications
   */
  const Toast = (() => {
    const toast = document.querySelector(".toast");
    let toastTimer;

    function show(message) {
      if (!toast) return;
      const text = toast.querySelector("p");
      if (text && message) {
        text.textContent = message;
      }
      toast.classList.add("is-visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove("is-visible");
      }, 3200);
    }

    return { show };
  })();

  /**
   * Navigation & Smooth Scroll
   */
  const Navigation = (() => {
    function init() {
      const navToggle = document.querySelector(".nav-toggle");
      const nav = document.querySelector(".nav-primary");
      if (navToggle && nav) {
        navToggle.addEventListener("click", () => {
          nav.classList.toggle("is-open");
        });
      }

      document.querySelectorAll("[data-scroll-to]").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const target = e.currentTarget.getAttribute("data-scroll-to");
          if (!target) return;
          const el = document.querySelector(target);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      });
    }
    return { init };
  })();

  /**
   * Modals
   */
  const Modal = (() => {
    function init(showToast) {
      // CTA Modal
      const ctaBackdrop = document.querySelector("[data-cta-modal]");
      const openCta = () => ctaBackdrop?.classList.add("is-open");
      const closeCta = () => ctaBackdrop?.classList.remove("is-open");

      document.querySelectorAll("[data-open-cta-modal]").forEach((btn) => {
        btn.addEventListener("click", () => {
          openCta();
          showToast?.("カートに追加しました。（オンラインストア先行プレビュー）");
        });
      });

      if (ctaBackdrop) {
        ctaBackdrop.addEventListener("click", (e) => {
          if (e.target === ctaBackdrop) closeCta();
        });
        ctaBackdrop.querySelector(".modal-close")?.addEventListener("click", closeCta);
        ctaBackdrop.querySelector(".modal-ok")?.addEventListener("click", closeCta);
      }

      // Size Modal
      const sizeBackdrop = document.querySelector("[data-size-modal]");
      const openSize = () => sizeBackdrop?.classList.add("is-open");
      const closeSize = () => sizeBackdrop?.classList.remove("is-open");

      document.querySelector("[data-open-size-modal]")?.addEventListener("click", openSize);

      if (sizeBackdrop) {
        sizeBackdrop.addEventListener("click", (e) => {
          if (e.target === sizeBackdrop) closeSize();
        });
        sizeBackdrop.querySelector(".modal-close")?.addEventListener("click", closeSize);
        sizeBackdrop.querySelector(".modal-ok")?.addEventListener("click", closeSize);
      }
    }
    return { init };
  })();

  /**
   * Hero Slider
   */
  const Slider = (() => {
    function init() {
      const heroSlides = document.querySelectorAll(".hero-slide");
      const heroDots = document.querySelectorAll(".hero-dot");
      
      if (heroSlides.length > 1) {
        let current = 0;

        function setHero(index) {
          heroSlides.forEach((slide, i) => {
            slide.classList.toggle("is-active", i === index);
          });
          heroDots.forEach((dot, i) => {
            dot.classList.toggle("is-active", i === index);
          });
          current = index;
        }

        heroDots.forEach((dot) => {
          dot.addEventListener("click", () => {
            const idx = Number(dot.getAttribute("data-hero-index") || "0");
            setHero(idx);
          });
        });

        setInterval(() => {
          const next = (current + 1) % heroSlides.length;
          setHero(next);
        }, 6000);
      }
    }
    return { init };
  })();

  /**
   * Product Detail Actions
   */
  const Product = (() => {
    function init() {
      // Gallery
      const mainImg = document.getElementById("product-main-image");
      const thumbs = document.querySelectorAll(".thumb");
      if (mainImg && thumbs.length) {
        thumbs.forEach((thumb) => {
          thumb.addEventListener("click", () => {
            const src = thumb.getAttribute("data-image");
            if (!src) return;
            mainImg.src = src;
            thumbs.forEach((t) => t.classList.remove("is-active"));
            thumb.classList.add("is-active");
          });
        });
      }

      // Chips
      document.querySelectorAll(".chip-group").forEach((group) => {
        const chips = Array.from(group.querySelectorAll(".chip"));
        chips.forEach((chip) => {
          chip.addEventListener("click", () => {
            chips.forEach((c) => {
              c.classList.remove("is-selected");
              c.setAttribute("aria-checked", "false");
            });
            chip.classList.add("is-selected");
            chip.setAttribute("aria-checked", "true");
          });
        });
      });

      // Quantity
      const qtyInput = document.querySelector(".quantity-stepper input[type='number']");
      const decBtn = document.querySelector("[data-qty-decrease]");
      const incBtn = document.querySelector("[data-qty-increase]");
      if (qtyInput && decBtn && incBtn) {
        const min = parseInt(qtyInput.min || "1", 10);
        const max = parseInt(qtyInput.max || "1", 10);
        decBtn.addEventListener("click", () => {
          const v = parseInt(qtyInput.value || "1", 10);
          if (v > min) qtyInput.value = String(v - 1);
        });
        incBtn.addEventListener("click", () => {
          const v = parseInt(qtyInput.value || "1", 10);
          if (v < max) qtyInput.value = String(v + 1);
        });
      }
    }
    return { init };
  })();

  /**
   * Forms
   */
  const Forms = (() => {
    function init(showToast) {
      document.querySelectorAll(".cta-form").forEach((form) => {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          showToast?.("ニュースレターのご登録ありがとうございます。");
        });
      });
    }
    return { init };
  })();

  // --- Main Execution ---

  document.addEventListener("DOMContentLoaded", () => {
    Navigation.init();
    Modal.init(Toast.show);
    Slider.init();
    Product.init();
    Forms.init(Toast.show);
  });

})();
