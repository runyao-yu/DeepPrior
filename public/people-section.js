(function () {
  "use strict";

  const SECTION_SELECTOR = ".MissionVision__container[data-mission-container]";
  const SECTION_CLASS = "PeopleSection";
  const AUTO_SCROLL_SPEED = 15;
  const RESUME_DELAY = 2000;
  const RESUME_RAMP = 900;
  const LINK_LABELS = {
    website: "Website",
    linkedin: "LinkedIn",
    github: "GitHub",
    email: "Email",
  };

  function element(tagName, className, textContent) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (typeof textContent === "string") node.textContent = textContent;
    return node;
  }

  function createLinkList(person, duplicate) {
    const links = element("nav", `${SECTION_CLASS}__links`);
    links.setAttribute("aria-label", `Links for ${person.name}`);

    if (duplicate) return links;

    Object.entries(LINK_LABELS).forEach(([key, label]) => {
      const value = person.links && person.links[key];
      if (!value) return;

      const anchor = element("a", `${SECTION_CLASS}__link`, label);
      anchor.href = key === "email" ? `mailto:${value}` : value;
      if (key !== "email") {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      links.append(anchor);
    });

    return links;
  }

  function createCard(person, duplicate) {
    const card = element("article", `${SECTION_CLASS}__profile`);

    const meta = element("div", `${SECTION_CLASS}__profileMeta`);
    meta.append(
      element("span", `${SECTION_CLASS}__initials`, person.initials),
      element("span", `${SECTION_CLASS}__role`, person.role)
    );

    const name = element("h4", `${SECTION_CLASS}__name`, person.name);
    const universities = element("p", `${SECTION_CLASS}__universities`);
    universities.textContent = Array.isArray(person.universities)
      ? person.universities.join(" · ")
      : "";

    const bio = element("div", `${SECTION_CLASS}__bio`);
    bio.setAttribute("data-lenis-prevent", "");
    bio.append(element("p", "", person.bio));

    card.append(meta, name, universities, bio, createLinkList(person, duplicate));
    return card;
  }

  function createTrack(people, duplicate) {
    const track = element(
      "div",
      `${SECTION_CLASS}__track${duplicate ? ` ${SECTION_CLASS}__track--duplicate` : ""}`
    );

    if (duplicate) {
      track.setAttribute("aria-hidden", "true");
      track.setAttribute("inert", "");
    }

    people.forEach((person) => track.append(createCard(person, duplicate)));
    return track;
  }

  function createGroup(group, people) {
    const wrapper = element("section", `${SECTION_CLASS}__group`);
    wrapper.dataset.peopleGroup = group.key;
    wrapper.dataset.scrollDirection = group.direction > 0 ? "down" : "up";

    const heading = element("div", `${SECTION_CLASS}__groupHeading`);
    const title = element("h3", `${SECTION_CLASS}__groupTitle`, group.label);
    const count = element(
      "span",
      `${SECTION_CLASS}__groupCount`,
      String(people.length).padStart(2, "0")
    );
    heading.append(title, count);

    const viewport = element("div", `${SECTION_CLASS}__window`);
    viewport.setAttribute("data-lenis-prevent", "");
    viewport.setAttribute("tabindex", "0");
    viewport.setAttribute("aria-label", `${group.label} profiles`);

    const stream = element("div", `${SECTION_CLASS}__stream`);
    stream.append(createTrack(people, false), createTrack(people, true));
    viewport.append(stream);

    wrapper.append(heading, viewport);
    return wrapper;
  }

  function setupMobileViewportState(section) {
    const mobileViewport = window.matchMedia("(max-width: 768px)");
    let observer = null;

    const setInView = (inView) => {
      if (inView) {
        section.dataset.mobileInView = "true";
        document.body.setAttribute("data-people-section-in-view", "true");
      } else {
        delete section.dataset.mobileInView;
        document.body.removeAttribute("data-people-section-in-view");
      }
    };

    const configure = () => {
      if (observer) observer.disconnect();
      observer = null;

      if (!mobileViewport.matches) {
        setInView(false);
        return;
      }

      observer = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        setInView(Boolean(entry && entry.isIntersecting && entry.intersectionRatio >= 0.01));
      }, { threshold: [0, 0.01] });
      observer.observe(section);
    };

    configure();
    mobileViewport.addEventListener("change", configure);
  }

  function createSection(data) {
    const section = element("section", SECTION_CLASS);
    section.setAttribute("aria-labelledby", "people-section-title");
    section.dataset.backgroundReady = "true";

    const header = element("header", `${SECTION_CLASS}__header`);
    const title = element(
      "h2",
      `${SECTION_CLASS}__title`,
      typeof data?.heading === "string" ? data.heading : ""
    );
    title.id = "people-section-title";
    const memberCount = Array.isArray(data?.members) ? data.members.length : 0;
    const countLabel = typeof data?.countLabel === "string" ? data.countLabel : "";
    const count = element(
      "p",
      `${SECTION_CLASS}__total`,
      `${memberCount} ${countLabel}`.trim()
    );
    header.append(title, count);

    const status = element("p", `${SECTION_CLASS}__status`, "Loading people…");
    status.setAttribute("role", "status");
    const groups = element("div", `${SECTION_CLASS}__groups`);

    section.append(header, status, groups);
    return { section, status, groups };
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function isValidLinks(links) {
    if (!links || typeof links !== "object" || Array.isArray(links)) return false;

    return Object.entries(links).every(
      ([key, value]) => Object.hasOwn(LINK_LABELS, key) && isNonEmptyString(value)
    );
  }

  function isValidMember(member) {
    return Boolean(
      member
      && typeof member === "object"
      && isNonEmptyString(member.name)
      && isNonEmptyString(member.role)
      && isNonEmptyString(member.initials)
      && Array.isArray(member.universities)
      && member.universities.every(isNonEmptyString)
      && isNonEmptyString(member.bio)
      && isValidLinks(member.links)
    );
  }

  function isValidGroup(group) {
    return Boolean(
      group
      && typeof group === "object"
      && isNonEmptyString(group.key)
      && isNonEmptyString(group.label)
      && Array.isArray(group.roles)
      && group.roles.length > 0
      && group.roles.every(isNonEmptyString)
      && (group.direction === 1 || group.direction === -1)
    );
  }

  function isPeopleContent(data) {
    if (
      !data
      || typeof data !== "object"
      || !isNonEmptyString(data.heading)
      || !isNonEmptyString(data.countLabel)
      || !Array.isArray(data.groups)
      || data.groups.length === 0
      || !data.groups.every(isValidGroup)
      || !Array.isArray(data.members)
      || data.members.length === 0
      || !data.members.every(isValidMember)
    ) {
      return false;
    }

    const groupKeys = new Set(data.groups.map((group) => group.key));
    if (groupKeys.size !== data.groups.length) return false;

    return data.members.every(
      (member) => data.groups.filter((group) => group.roles.includes(member.role)).length === 1
    );
  }

  function setupAutoScroll(section) {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const controllers = Array.from(section.querySelectorAll(`.${SECTION_CLASS}__window`)).map(
      (viewport) => {
        const group = viewport.closest(`.${SECTION_CLASS}__group`);
        const firstTrack = viewport.querySelector(`.${SECTION_CLASS}__track:not(.${SECTION_CLASS}__track--duplicate)`);
        const state = {
          direction: group && group.dataset.scrollDirection === "up" ? -1 : 1,
          firstTrack,
          pointerHeld: false,
          resumeAt: performance.now() + RESUME_DELAY,
          lastTime: performance.now(),
        };

        const scheduleResume = () => {
          state.resumeAt = performance.now() + RESUME_DELAY;
          state.lastTime = performance.now();
        };
        const releasePointer = () => {
          if (!state.pointerHeld) return;
          state.pointerHeld = false;
          scheduleResume();
        };

        viewport.addEventListener("wheel", scheduleResume, { passive: true });
        viewport.addEventListener("touchstart", () => {
          state.pointerHeld = true;
          state.lastTime = performance.now();
        }, { passive: true });
        viewport.addEventListener("touchmove", () => {
          state.lastTime = performance.now();
        }, { passive: true });
        viewport.addEventListener("touchend", releasePointer, { passive: true });
        viewport.addEventListener("touchcancel", releasePointer, { passive: true });
        viewport.addEventListener("pointerdown", () => {
          state.pointerHeld = true;
          state.lastTime = performance.now();
        });
        window.addEventListener("pointerup", releasePointer);
        window.addEventListener("pointercancel", releasePointer);
        viewport.addEventListener("mouseenter", scheduleResume);
        viewport.addEventListener("mouseleave", scheduleResume);
        viewport.addEventListener("focusin", scheduleResume);
        viewport.addEventListener("focusout", scheduleResume);
        viewport.addEventListener("keydown", scheduleResume);

        requestAnimationFrame(() => {
          if (state.direction < 0 && state.firstTrack) {
            viewport.scrollTop = state.firstTrack.offsetHeight;
          }
        });

        return { viewport, state };
      }
    );

    let wasMissionActive = false;

    function advance(now) {
      const missionActive = document.body.getAttribute("data-current_section") === "mission"
        || section.dataset.mobileInView === "true";

      if (missionActive && !wasMissionActive) {
        controllers.forEach(({ viewport, state }) => {
          const loopHeight = state.firstTrack ? state.firstTrack.offsetHeight : 0;
          viewport.scrollTop = state.direction < 0 ? loopHeight : 0;
          state.resumeAt = now + RESUME_DELAY;
          state.lastTime = now;
        });
      }

      wasMissionActive = missionActive;

      controllers.forEach(({ viewport, state }) => {
        const elapsed = Math.min(Math.max(now - state.lastTime, 0), 64);
        state.lastTime = now;

        if (
          reducedMotion.matches ||
          !missionActive ||
          document.hidden ||
          state.pointerHeld ||
          now < state.resumeAt
        ) {
          return;
        }

        const loopHeight = state.firstTrack ? state.firstTrack.offsetHeight : 0;
        if (!loopHeight) return;

        const ramp = Math.min((now - state.resumeAt) / RESUME_RAMP, 1);
        viewport.scrollTop += state.direction * AUTO_SCROLL_SPEED * (elapsed / 1000) * ramp;

        if (state.direction > 0 && viewport.scrollTop >= loopHeight) {
          viewport.scrollTop -= loopHeight;
        } else if (state.direction < 0 && viewport.scrollTop <= 0) {
          viewport.scrollTop += loopHeight;
        }
      });

      requestAnimationFrame(advance);
    }

    requestAnimationFrame(advance);
  }

  function populateSection(nodes, data) {
    if (!isPeopleContent(data)) {
      nodes.status.textContent = "People data is temporarily unavailable.";
      return;
    }

    data.groups.forEach((group) => {
      const people = data.members.filter((person) => group.roles.includes(person.role));
      if (people.length) nodes.groups.append(createGroup(group, people));
    });

    if (!nodes.groups.children.length) {
      nodes.status.textContent = "People data is temporarily unavailable.";
      return;
    }

    nodes.status.remove();
    nodes.section.dataset.ready = "true";
    setupAutoScroll(nodes.section);
  }

  function initializePeopleSection() {
    if (document.querySelector(`.${SECTION_CLASS}`)) return;

    const missionContainer = document.querySelector(SECTION_SELECTOR);
    if (!missionContainer) return;

    const data = window.DeepPriorContent && window.DeepPriorContent.people;
    const nodes = createSection(data);
    missionContainer.append(nodes.section);
    setupMobileViewportState(nodes.section);
    populateSection(nodes, data);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePeopleSection, { once: true });
  } else {
    initializePeopleSection();
  }
})();
