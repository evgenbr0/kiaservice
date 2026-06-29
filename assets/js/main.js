/* ============================================================
   KIA Service — интерактив
   Чистый JavaScript без зависимостей.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Год ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Шапка + кнопка «наверх» ---------- */
  var hdr = document.getElementById("hdr");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (hdr) hdr.classList.toggle("is-scrolled", y > 8);
    if (toTop) {
      var show = y > 700;
      toTop.classList.toggle("is-visible", show);
      toTop.hidden = !show;
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- Мобильное меню с управлением фокусом ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  var mainEl = document.getElementById("main");
  var footerEl = document.querySelector(".foot");
  var barEl = document.querySelector(".bar");
  var logoEl = document.querySelector(".hdr .logo");
  var supportsInert = "inert" in HTMLElement.prototype;
  var MENU_BP = 1024;

  function setInert(on) {
    [mainEl, footerEl, barEl, toTop, logoEl].forEach(function (el) {
      if (!el) return;
      if (on) { el.setAttribute("aria-hidden", "true"); if (supportsInert) el.inert = true; }
      else { el.removeAttribute("aria-hidden"); if (supportsInert) el.inert = false; }
    });
  }
  function isOpen() { return nav && nav.classList.contains("is-open"); }
  function openMenu() {
    nav.classList.add("is-open");
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Закрыть меню");
    document.body.classList.add("nav-open");
    setInert(true);
    var first = nav.querySelector(".nav__link");
    if (first) first.focus();
  }
  function closeMenu(returnFocus) {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Открыть меню");
    document.body.classList.remove("nav-open");
    setInert(false);
    if (returnFocus) burger.focus();
  }
  if (burger && nav) {
    burger.addEventListener("click", function () { isOpen() ? closeMenu(true) : openMenu(); });
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link, .nav__cta")) {
        closeMenu(false);
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) { closeMenu(true); return; }
      if (e.key === "Tab" && isOpen()) {
        var f = [burger].concat(Array.prototype.slice.call(nav.querySelectorAll("a, button")));
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > MENU_BP && isOpen()) closeMenu(false);
    });
  }

  /* ---------- Reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var el = entry.target;
          var sib = el.parentElement
            ? Array.prototype.filter.call(el.parentElement.children, function (n) { return n.classList && n.classList.contains("reveal"); })
            : [];
          var idx = sib.indexOf(el);
          el.style.transitionDelay = Math.min(idx < 0 ? 0 : idx, 6) * 70 + "ms";
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Фильтр цен по категориям ---------- */
  var priceTabs = Array.prototype.slice.call(document.querySelectorAll(".price__tab"));
  var priceItems = Array.prototype.slice.call(document.querySelectorAll(".price__item"));
  var priceStatus = document.getElementById("priceStatus");
  if (priceTabs.length && priceItems.length) {
    priceTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var cat = tab.getAttribute("data-cat");
        priceTabs.forEach(function (t) {
          var active = t === tab;
          t.classList.toggle("is-active", active);
          t.setAttribute("aria-pressed", active ? "true" : "false");
        });
        var shown = 0;
        priceItems.forEach(function (item) {
          var show = cat === "all" || item.getAttribute("data-cat") === cat;
          item.classList.toggle("is-hidden", !show);
          if (show) shown++;
        });
        if (priceStatus) priceStatus.textContent = "Показано услуг: " + shown + " — категория «" + tab.textContent.trim() + "».";
      });
    });
  }

  /* ---------- FAQ — один открыт ---------- */
  var faqItems = Array.prototype.slice.call(document.querySelectorAll(".faq__item"));
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) faqItems.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* ---------- Тост ---------- */
  var toast = document.getElementById("toast");
  var toastTimer = null;
  function showToast(msg, assertive) {
    if (!toast) return;
    toast.setAttribute("aria-live", assertive ? "assertive" : "polite");
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3500);
  }

  /* ---------- Валидация формы ---------- */
  function isValidPhone(v) { return (v || "").replace(/\D/g, "").length >= 11; }
  function markInvalid(input, invalid) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("is-invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    var errId = input.getAttribute("aria-describedby");
    if (errId) {
      var err = document.getElementById(errId);
      if (err && invalid) {
        var msg = err.getAttribute("data-msg") || err.textContent;
        err.setAttribute("data-msg", msg);
        err.textContent = ""; err.textContent = msg;
      }
    }
  }

  var bookingForm = document.getElementById("bookingForm");
  var formSuccess = document.getElementById("formSuccess");
  function setFormInert(on) {
    if (!bookingForm) return;
    Array.prototype.forEach.call(bookingForm.children, function (c) {
      if (c === formSuccess) return;
      if (supportsInert) { c.inert = on; return; }
      if (on) c.setAttribute("aria-hidden", "true"); else c.removeAttribute("aria-hidden");
      Array.prototype.forEach.call(c.querySelectorAll("input, select, textarea, button, a"), function (el) {
        if (on) { el.setAttribute("data-was-tabbable", ""); el.setAttribute("tabindex", "-1"); }
        else if (el.hasAttribute("data-was-tabbable")) { el.removeAttribute("tabindex"); el.removeAttribute("data-was-tabbable"); }
      });
    });
  }
  if (bookingForm) {
    var consentEl = bookingForm.elements["consent"];
    var consentLabel = consentEl ? consentEl.closest(".consent") : null;
    bookingForm.addEventListener("input", function (e) {
      if (e.target.closest && e.target.closest(".field")) markInvalid(e.target, false);
    });
    if (consentEl) {
      consentEl.addEventListener("change", function () {
        if (consentEl.checked && consentLabel) {
          consentLabel.classList.remove("is-invalid");
          consentEl.removeAttribute("aria-invalid");
        }
      });
    }
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = bookingForm.elements["name"];
      var phone = bookingForm.elements["phone"];
      var firstInvalid = null;
      var nameOk = !!name.value.trim();
      var phoneOk = isValidPhone(phone.value);
      markInvalid(name, !nameOk); if (!nameOk && !firstInvalid) firstInvalid = name;
      markInvalid(phone, !phoneOk); if (!phoneOk && !firstInvalid) firstInvalid = phone;

      if (firstInvalid) { firstInvalid.focus(); showToast("Проверьте обязательные поля", true); return; }
      if (consentEl && !consentEl.checked) {
        if (consentLabel) consentLabel.classList.add("is-invalid");
        consentEl.setAttribute("aria-invalid", "true");
        consentEl.focus();
        showToast("Подтвердите согласие на обработку данных", true);
        return;
      }
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.setAttribute("tabindex", "-1");
        setFormInert(true);
        formSuccess.focus();
        bookingForm.reset();
        setTimeout(function () {
          formSuccess.hidden = true;
          setFormInert(false);
          if (formSuccess.contains(document.activeElement) && name) name.focus();
        }, 6000);
      }
      showToast("Спасибо! Ваша заявка отправлена.");
    });
  }

  /* ---------- Маска телефона с сохранением каретки ---------- */
  function formatPhone(input) {
    var oldValue = input.value;
    var selStart = input.selectionStart === null ? oldValue.length : input.selectionStart;
    var digitsBefore = oldValue.slice(0, selStart).replace(/\D/g, "").length;
    var raw = oldValue.replace(/\D/g, "");
    if (!raw) { input.value = ""; return; }
    var digits = raw;
    if (digits[0] === "8") digits = "7" + digits.slice(1);
    if (digits[0] !== "7") digits = "7" + digits;
    var added = digits.length - raw.length;
    digits = digits.slice(0, 11);
    var out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += "-" + digits.slice(7, 9);
    if (digits.length >= 9) out += "-" + digits.slice(9, 11);
    input.value = out;
    var target = digitsBefore + added, pos, seen = 0;
    if (target <= 1) { pos = Math.min(out.length, 2); }
    else {
      pos = out.length;
      for (var i = 0; i < out.length; i++) {
        if (/\d/.test(out.charAt(i))) { seen++; if (seen >= target) { pos = i + 1; break; } }
      }
    }
    try { input.setSelectionRange(pos, pos); } catch (err) {}
  }
  Array.prototype.slice.call(document.querySelectorAll('input[type="tel"]')).forEach(function (input) {
    input.addEventListener("input", function () { formatPhone(input); });
  });

})();
