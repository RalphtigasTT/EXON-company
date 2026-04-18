(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");
  var navLinks = siteNav ? siteNav.querySelectorAll("a[href^='#']") : [];
  var yearEl = document.getElementById("year");
  var reveals = document.querySelectorAll("[data-reveal]");
  var statNums = document.querySelectorAll(".stat__num[data-count]");
  var form = document.getElementById("contact-form");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function setHeaderScrolled() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  setHeaderScrolled();
  window.addEventListener("scroll", setHeaderScrolled, { passive: true });

  function closeNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function openNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute("aria-expanded", "true");
    siteNav.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var expanded = navToggle.getAttribute("aria-expanded") === "true";
      if (expanded) closeNav();
      else openNav();
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 767px)").matches) closeNav();
      });
    });

    window.addEventListener("resize", function () {
      if (window.matchMedia("(min-width: 768px)").matches) closeNav();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  function animateCount(el, target, duration) {
    var start = performance.now();
    var from = 0;
    function frame(now) {
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(from + (target - from) * eased));
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && statNums.length) {
    var statsDone = false;
    var statsIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || statsDone) return;
          statsDone = true;
          var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          statNums.forEach(function (el) {
            var n = parseInt(el.getAttribute("data-count") || "0", 10);
            if (isNaN(n)) return;
            if (reduceMotion) el.textContent = String(n);
            else animateCount(el, n, 1200);
          });
          statsIo.disconnect();
        });
      },
      { threshold: 0.4 }
    );
    var heroStats = document.querySelector(".hero__stats");
    if (heroStats) statsIo.observe(heroStats);
  } else {
    statNums.forEach(function (el) {
      var n = parseInt(el.getAttribute("data-count") || "0", 10);
      if (!isNaN(n)) el.textContent = String(n);
    });
  }

  function clearErrors() {
    ["name-error", "email-error", "message-error", "consent-error"].forEach(function (id) {
      var node = document.getElementById(id);
      if (node) node.textContent = "";
    });
    var status = document.getElementById("form-status");
    if (status) {
      status.textContent = "";
      status.classList.remove("is-error");
    }
  }

  function validate(formEl) {
    var ok = true;
    var name = formEl.querySelector("#name");
    var email = formEl.querySelector("#email");
    var message = formEl.querySelector("#message");
    var consent = formEl.querySelector("#consent");

    function setErr(id, msg) {
      var node = document.getElementById(id);
      if (node) node.textContent = msg;
      ok = false;
    }

    if (!name || !name.value.trim()) setErr("name-error", "Please enter your name.");
    if (!email || !email.value.trim()) setErr("email-error", "Please enter your email.");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setErr("email-error", "Please enter a valid email address.");
    }
    if (!message || !message.value.trim()) setErr("message-error", "Please add a short project brief.");
    if (!consent || !consent.checked) setErr("consent-error", "Consent is required to proceed.");

    return ok;
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();

      if (!validate(form)) {
        var st = document.getElementById("form-status");
        if (st) {
          st.textContent = "Please fix the highlighted fields.";
          st.classList.add("is-error");
        }
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      if (btn) btn.classList.add("is-loading");

      window.setTimeout(function () {
        if (btn) btn.classList.remove("is-loading");
        var status = document.getElementById("form-status");
        if (status) {
          status.textContent = "Thank you — your message has been recorded for demo purposes. Connect a backend to send email.";
          status.classList.remove("is-error");
        }
        form.reset();
      }, 900);
    });
  }
})();
