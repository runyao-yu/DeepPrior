(function () {
  "use strict";

  function suppressAcademicCardEvent(event) {
    var target = event.target;
    if (!(target instanceof Element)) return;
    if (!target.closest(".DeepPriorAcademicCard")) return;
    event.stopImmediatePropagation();
  }

  ["pointerdown", "pointerup", "click", "dblclick"].forEach(function (type) {
    window.addEventListener(type, suppressAcademicCardEvent, true);
  });

  Array.prototype.slice.call(document.querySelectorAll("a")).forEach(function (anchor) {
    if (anchor.textContent.trim().toLowerCase() !== "news") return;
    if (anchor.closest(".News__newsArea")) return;

    var navigationItem = anchor.closest(
      ".Header__nav_item, .SideMenu__menu_item"
    );
    (navigationItem || anchor).remove();
  });

  var panel = document.getElementById("news");
  var list = panel && panel.querySelector(".News__newsList");
  if (!panel || !list) return;

  var items = Array.prototype.slice.call(
    list.querySelectorAll(".News__newsItem")
  );
  var measureFrame = 0;

  function scheduleMeasure() {
    window.cancelAnimationFrame(measureFrame);
    measureFrame = window.requestAnimationFrame(measureThreeItems);
  }

  function measureThreeItems() {
    var measuredItems = items.slice(0, 3);
    if (measuredItems.length < 3) return;

    list.style.height = "auto";
    var gap = parseFloat(window.getComputedStyle(list).rowGap) || 0;
    var height = measuredItems.reduce(function (total, item) {
      return total + item.getBoundingClientRect().height;
    }, gap * (measuredItems.length - 1));
    list.style.height = height + "px";
  }

  window.addEventListener("resize", scheduleMeasure, { passive: true });

  if ("ResizeObserver" in window) {
    var resizeObserver = new ResizeObserver(scheduleMeasure);
    items.forEach(function (item) {
      resizeObserver.observe(item);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scheduleMeasure);
  }

  scheduleMeasure();
})();
