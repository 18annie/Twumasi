/* =========================================================
   Peter Oduro Twumasi Senior — portfolio scripts
   Vanilla JS, no dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Mobile menu ---------- */
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Close the menu when a link is clicked or Escape is pressed
  menu.addEventListener("click", function (e) {
    if (e.target.closest(".nav__link")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---------- 2. Active-section highlighting ---------- */
  var links = Array.prototype.slice.call(menu.querySelectorAll(".nav__link"));
  var sections = links
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 3. Scroll reveal (respects prefers-reduced-motion) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealTargets = document.querySelectorAll(
    ".section__head, .skill-group, .service-card, .project, .timeline__item, .edu__card, .achievements__list li, .about__grid, .contact__grid, .cv__box p, .cv__box .btn, .media__gallery"
  );

  if (!reduceMotion && "IntersectionObserver" in window) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- 4. Project gallery lightbox ----------
     HOW IT WORKS WITH REAL PHOTOS:
     When you add photos, give each <button class="gallery__item"> an <img>
     child (and remove the .gallery__placeholder span). The lightbox reads
     the images inside .project__gallery automatically — 1 to 8 images. */
  var galleryButtons = Array.prototype.slice.call(
    document.querySelectorAll(".project__gallery .gallery__item")
  );
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  var lbCaption = document.getElementById("lightboxCaption");
  var lbClose = document.getElementById("lightboxClose");
  var lbPrev = document.getElementById("lightboxPrev");
  var lbNext = document.getElementById("lightboxNext");
  var currentIndex = 0;
  var lastFocused = null;

  function galleryImages() {
    // Collect the <img> tags inside gallery buttons (real photos only).
    return galleryButtons
      .map(function (btn) { return btn.querySelector("img"); })
      .filter(Boolean);
  }

  function openLightbox(index) {
    var imgs = galleryImages();
    if (!imgs.length) return; // placeholders only — nothing to show yet
    lastFocused = document.activeElement;
    currentIndex = index;
    updateLightbox(imgs);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function updateLightbox(imgs) {
    var imgs = imgs || galleryImages();
    var img = imgs[currentIndex];
    lbImg.src = img.src;
    lbImg.alt = img.alt || "";
    lbCaption.textContent =
      (img.alt || "Project photo") + " — " + (currentIndex + 1) + " of " + imgs.length;
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  }

  function stepLightbox(dir) {
    var imgs = galleryImages();
    if (!imgs.length) return;
    currentIndex = (currentIndex + dir + imgs.length) % imgs.length;
    updateLightbox(imgs);
  }

  galleryButtons.forEach(function (btn, i) {
    btn.addEventListener("click", function () { openLightbox(i); });
  });
  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { stepLightbox(-1); });
  lbNext.addEventListener("click", function () { stepLightbox(1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
    // Simple focus trap
    if (e.key === "Tab") {
      var focusables = [lbClose, lbPrev, lbNext];
      var first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  /* ---------- 5. Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- 6. Media gallery lightbox ---------- */

  /* ---------- 7. Contact form submission (Formspree) ---------- */
  (function () {
    var form = document.getElementById("contactForm");
    if (!form) return;

    var statusEl = document.getElementById("formStatus");
    var submitBtn = document.getElementById("formSubmitBtn");

    function showStatus(message, type) {
      statusEl.textContent = message;
      statusEl.className = "form-status form-status--" + type;
      statusEl.hidden = false;
    }

    function setLoading(loading) {
      submitBtn.disabled = loading;
      submitBtn.textContent = loading ? "Sending…" : "Send Message";
    }

    form.addEventListener("submit", function (e) {
      var endpoint = form.getAttribute("action");
      if (!endpoint || endpoint.indexOf("YOUR_FORM_ID") !== -1) {
        e.preventDefault();
        showStatus(
          "Form not yet configured. Please replace YOUR_FORM_ID in the form action with your Formspree endpoint.",
          "error"
        );
        return;
      }

      e.preventDefault();
      setLoading(true);

      var formData = new FormData(form);

      fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { "Accept": "application/json" }
      })
        .then(function (response) {
          if (response.ok) {
            showStatus("Your message has been sent! I will get back to you soon.", "success");
            form.reset();
          } else {
            return response.json().then(function (data) {
              showStatus(data.error || "Something went wrong. Please try again.", "error");
            }).catch(function () {
              showStatus("Something went wrong. Please try again.", "error");
            });
          }
        })
        .catch(function () {
          showStatus("Network error. Please check your connection and try again.", "error");
        })
        .finally(function () {
          setLoading(false);
        });
    });
  })();

  (function () {
    var mediaButtons = Array.prototype.slice.call(
      document.querySelectorAll("#media .gallery__item")
    );
    var mLightbox = document.getElementById("mediaLightbox");
    var mPreview = document.getElementById("mediaPreview");
    var mPreviewImg = mPreview ? mPreview.querySelector("img") : null;
    var mPreviewCaption = mPreview ? mPreview.querySelector("figcaption") : null;

    /* --- Hover preview: show full image + correct description on hover --- */
    if (mPreview && mPreviewImg) {
      mediaButtons.forEach(function (btn, i) {
        var img = btn.querySelector("img");
        if (!img) return;

        /* Preload the full-size image for instant preview */
        var preload = new Image();
        preload.src = img.src;

        btn.addEventListener("mouseenter", function () {
          mPreviewImg.src = img.src;
          mPreviewImg.alt = img.alt || "Full size preview";
          if (mPreviewCaption) {
            mPreviewCaption.textContent = img.alt || "";
          }
          mPreview.style.display = "flex";
        });
        btn.addEventListener("mouseleave", function () {
          /* Keep preview visible briefly if cursor moved to the preview itself */
          setTimeout(function () {
            if (!mPreview.matches(":hover")) {
              mPreview.style.display = "none";
              mPreviewImg.src = "";
            }
          }, 150);
        });
      });

      mPreview.addEventListener("mouseleave", function () {
        mPreview.style.display = "none";
        mPreviewImg.src = "";
      });
    }

    if (!mLightbox || !mediaButtons.length) return;

    var mImg = document.getElementById("mediaLightboxImg");
    var mCaption = document.getElementById("mediaLightboxCaption");
    var mClose = document.getElementById("mediaLightboxClose");
    var mPrev = document.getElementById("mediaLightboxPrev");
    var mNext = document.getElementById("mediaLightboxNext");
    var mIndex = 0;
    var mLastFocus = null;

    function mImages() {
      return mediaButtons
        .map(function (btn) { return btn.querySelector("img"); })
        .filter(Boolean);
    }

    function mOpen(index) {
      var imgs = mImages();
      if (!imgs.length) return;
      mLastFocus = document.activeElement;
      mIndex = index;
      mUpdate(imgs);
      mLightbox.hidden = false;
      document.body.style.overflow = "hidden";
      mClose.focus();
    }

    function mUpdate(imgs) {
      var img = imgs[mIndex];
      mImg.src = img.src;
      mImg.alt = img.alt || "";
      mCaption.textContent =
        (img.alt || "Photo") + " — " + (mIndex + 1) + " of " + imgs.length;
    }

    function mCloseFn() {
      mLightbox.hidden = true;
      document.body.style.overflow = "";
      if (mLastFocus) mLastFocus.focus();
    }

    function mStep(dir) {
      var imgs = mImages();
      if (!imgs.length) return;
      mIndex = (mIndex + dir + imgs.length) % imgs.length;
      mUpdate(imgs);
    }

    mediaButtons.forEach(function (btn, i) {
      btn.addEventListener("click", function () { mOpen(i); });
    });
    mClose.addEventListener("click", mCloseFn);
    mPrev.addEventListener("click", function () { mStep(-1); });
    mNext.addEventListener("click", function () { mStep(1); });
    mLightbox.addEventListener("click", function (e) {
      if (e.target === mLightbox) mCloseFn();
    });
    document.addEventListener("keydown", function (e) {
      if (mLightbox.hidden) return;
      if (e.key === "Escape") mCloseFn();
      if (e.key === "ArrowLeft") mStep(-1);
      if (e.key === "ArrowRight") mStep(1);
    });
  })();
})();
