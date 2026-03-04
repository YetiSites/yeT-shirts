document.addEventListener("DOMContentLoaded", () => {
  const toast = document.querySelector(".toast");
  let toastTimer;

  function showToast(message) {
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

  document.querySelectorAll(".cta-form").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      showToast("デモ表示：メールアドレスは送信されません。");
    });
  });

  const ctaBackdrop = document.querySelector("[data-cta-modal]");
  function openCtaModal() {
    if (!ctaBackdrop) return;
    ctaBackdrop.classList.add("is-open");
  }
  function closeCtaModal() {
    if (!ctaBackdrop) return;
    ctaBackdrop.classList.remove("is-open");
  }

  document.querySelectorAll("[data-open-cta-modal]").forEach((btn) => {
    btn.addEventListener("click", () => {
      openCtaModal();
      showToast("デモ表示：このサイトでは実際の購入はできません。");
    });
  });

  if (ctaBackdrop) {
    ctaBackdrop.addEventListener("click", (e) => {
      if (e.target === ctaBackdrop) {
        closeCtaModal();
      }
    });
    const closeBtn = ctaBackdrop.querySelector(".modal-close");
    const okBtn = ctaBackdrop.querySelector(".modal-ok");
    closeBtn?.addEventListener("click", closeCtaModal);
    okBtn?.addEventListener("click", closeCtaModal);
  }

  const sizeBackdrop = document.querySelector("[data-size-modal]");
  function openSizeModal() {
    if (!sizeBackdrop) return;
    sizeBackdrop.classList.add("is-open");
  }
  function closeSizeModal() {
    if (!sizeBackdrop) return;
    sizeBackdrop.classList.remove("is-open");
  }

  document
    .querySelector("[data-open-size-modal]")
    ?.addEventListener("click", () => {
      openSizeModal();
    });

  if (sizeBackdrop) {
    sizeBackdrop.addEventListener("click", (e) => {
      if (e.target === sizeBackdrop) {
        closeSizeModal();
      }
    });
    const closeBtn = sizeBackdrop.querySelector(".modal-close");
    const okBtn = sizeBackdrop.querySelector(".modal-ok");
    closeBtn?.addEventListener("click", closeSizeModal);
    okBtn?.addEventListener("click", closeSizeModal);
  }

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

  const qtyInput = document.querySelector(
    ".quantity-stepper input[type='number']"
  );
  const decBtn = document.querySelector("[data-qty-decrease]");
  const incBtn = document.querySelector("[data-qty-increase]");
  if (qtyInput && decBtn && incBtn) {
    const min = parseInt(qtyInput.min || "1", 10);
    const max = parseInt(qtyInput.max || "9", 10);
    decBtn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value || "1", 10);
      if (current > min) {
        qtyInput.value = String(current - 1);
      }
    });
    incBtn.addEventListener("click", () => {
      const current = parseInt(qtyInput.value || "1", 10);
      if (current < max) {
        qtyInput.value = String(current + 1);
      }
    });
  }
});

