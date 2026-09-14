const ASSET_VERSION = "deepprior-20260914i";
const CONTENT_URL = "/data/site-content.json";
const MAIN_BUNDLE = "/_astro/index.astro_astro_type_script_index_0_lang.Cu0uHvXK.js";
const { parseRuns, venueLine, buildCoverSvg, svgToDataUrl } = await import(`/paper-cover.js?v=${ASSET_VERSION}`);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertString(value, path) {
  assert(isNonEmptyString(value), `${path} must be a non-empty string`);
}

function assertStringArray(value, path) {
  assert(Array.isArray(value) && value.length > 0, `${path} must be a non-empty array`);
  value.forEach((entry, index) => assertString(entry, `${path}[${index}]`));
}

function validateContent(content) {
  assert(isRecord(content), "content root must be an object");
  assert(isRecord(content.hero), "hero must be an object");
  assertString(content.hero.academicCollaborators, "hero.academicCollaborators");

  assert(Array.isArray(content.news) && content.news.length > 0, "news must be a non-empty array");
  content.news.forEach((item, index) => {
    const path = `news[${index}]`;
    assert(isRecord(item), `${path} must be an object`);
    assertString(item.displayDate, `${path}.displayDate`);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(item.datetime), `${path}.datetime must use YYYY-MM-DD`);
    assertString(item.text, `${path}.text`);
  });

  assert(Array.isArray(content.paperCategories) && content.paperCategories.length > 0, "paperCategories must be a non-empty array");
  const categoryKeys = new Set();
  content.paperCategories.forEach((group, index) => {
    assertString(group.key, `paperCategories[${index}].key`);
    assertString(group.label, `paperCategories[${index}].label`);
    categoryKeys.add(group.key);
  });
  assert(Array.isArray(content.papers) && content.papers.length >= 2, "papers must contain at least two items");
  const paperIds = new Set();
  content.papers.forEach((paper, index) => {
    const path = `papers[${index}]`;
    assert(isRecord(paper), `${path} must be an object`);
    ["id", "title", "authors", "href", "category"].forEach((key) => {
      assertString(paper[key], `${path}.${key}`);
    });
    ["displayDate", "datetime", "details", "venue", "year", "affiliations"].forEach((key) => {
      assert(paper[key] === undefined || typeof paper[key] === "string", `${path}.${key} must be a string when present`);
    });
    assert(categoryKeys.has(paper.category), `${path}.category must be one of ${[...categoryKeys].join(", ")}`);
    assertStringArray(paper.categories, `${path}.categories`);
    assert(!paper.figure || /^\/(?!\/)/.test(paper.figure), `${path}.figure must be root-relative`);
    assert(!paper.image || /^\/(?!\/)/.test(paper.image), `${path}.image must be root-relative`);
    assert(/^\/(?!\/)/.test(paper.href) || paper.href.startsWith("https://"), `${path}.href must be root-relative or use https`);
    assert(!paperIds.has(paper.id), `${path}.id must be unique`);
    paperIds.add(paper.id);
  });

  assert(isRecord(content.people), "people must be an object");
  assertString(content.people.heading, "people.heading");
  assertString(content.people.countLabel, "people.countLabel");
  assert(Array.isArray(content.people.groups) && content.people.groups.length > 0, "people.groups must be a non-empty array");
  assert(Array.isArray(content.people.members) && content.people.members.length > 0, "people.members must be a non-empty array");
}

function element(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (typeof text === "string") node.textContent = text;
  return node;
}

function setPaperLink(anchor, href) {
  anchor.setAttribute("href", href);
  if (href.startsWith("https://")) {
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer");
  }
}

function buildNews(news) {
  const fragment = document.createDocumentFragment();

  news.forEach((entry) => {
    const item = element("article", "News__newsItem");
    const date = element("time", "News__newsDate", entry.displayDate);
    date.setAttribute("datetime", entry.datetime);
    const text = element("p", "News__newsText", entry.text);
    item.append(date, text);
    fragment.append(item);
  });

  return fragment;
}

/* ---------------------------------------------------------------- paper covers (layout in /paper-cover.js) */
function runsToHtml(runs) {
  const fragment = document.createDocumentFragment();
  runs.forEach((run) => fragment.append(run.bold ? element("b", "", run.text) : document.createTextNode(run.text)));
  return fragment;
}

async function fileToDataUrl(url) {
  const response = await fetch(encodeURI(url), { credentials: "same-origin" });
  if (!response.ok) throw new Error(`figure request failed (${response.status}) for ${url}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function buildCovers(papers) {
  return Promise.all(papers.map(async (paper, index) => {
    if (paper.image) return paper.image; // static cover from `npm run build:covers`
    let figure = null;
    if (paper.figure) {
      try {
        figure = await fileToDataUrl(paper.figure);
      } catch (error) {
        console.warn(`[DeepPrior content] ${error instanceof Error ? error.message : error}`);
      }
    }
    return svgToDataUrl(buildCoverSvg(index, paper, figure));
  }));
}

/* ---------------------------------------------------------------- paper index (All papers) */
function buildPaperIndex(content, covers) {
  const section = document.querySelector("[data-paper-index]");
  if (!section) return;
  const rail = (side) => {
    const node = element("div", `PaperIndex__rail PaperIndex__rail--${side}`);
    node.setAttribute("aria-hidden", "true");
    const ticks = element("div", "PaperIndex__railTicks");
    for (let i = 0; i < 48; i += 1) ticks.append(element("i", i % 6 === 0 ? "is-major" : ""));
    node.append(element("span", "PaperIndex__railLabel", side === "left" ? "DeepPrior / Research index" : `${content.papers.length} papers · ${content.paperCategories.length} tracks`), ticks);
    return node;
  };
  const header = element("header", "PaperIndex__header");
  header.append(element("span", "PaperIndex__eyebrow", "03 — Research"));
  const title = element("h2", "PaperIndex__title");
  title.id = "paper-index-title";
  title.append(document.createTextNode("All "), element("em", "", "papers"));
  const meta = element("p", "PaperIndex__meta", `${content.papers.length} publications`);
  header.append(title, meta);

  const PAGE = 16;
  const columns = element("div", "PaperIndex__columns");
  const cards = content.papers.map((paper, index) => {
    const card = element("article", "PaperIndex__card");
    card.dataset.category = paper.category;
    const thumb = element("a", "PaperIndex__thumb");
    setPaperLink(thumb, paper.href);
    const img = element("img");
    img.src = covers[index];
    img.alt = `Cover of ${paper.title}`;
    img.loading = "lazy";
    thumb.append(img);
    const body = element("div", "PaperIndex__body");
    const top = element("div", "PaperIndex__cardMeta");
    top.append(element("span", "", String(index + 1).padStart(2, "0")), element("time", "", paper.year || ""));
    const cardTitle = element("h4", "PaperIndex__cardTitle");
    const link = element("a", "", paper.title);
    setPaperLink(link, paper.href);
    cardTitle.append(link);
    const authors = element("p", "PaperIndex__cardAuthors");
    authors.append(runsToHtml(parseRuns(paper.authors)));
    const affiliations = element("p", "PaperIndex__cardDetails", paper.affiliations || "");
    const venue = element("p", "PaperIndex__cardVenue", venueLine(paper));
    body.append(top, cardTitle, authors, affiliations, venue);
    card.append(thumb, body);
    if (index >= PAGE) card.hidden = true;
    columns.append(card);
    return card;
  });
  const more = element("div", "PaperIndex__more");
  const moreButton = element("button", "PaperIndex__moreButton");
  moreButton.type = "button";
  let shown = Math.min(PAGE, cards.length);
  const updateMore = () => {
    const remaining = cards.length - shown;
    moreButton.textContent = `Show ${Math.min(PAGE, remaining)} more papers`;
    moreButton.hidden = remaining <= 0;
  };
  moreButton.addEventListener("click", () => {
    cards.slice(shown, shown + PAGE).forEach((card) => { card.hidden = false; });
    shown = Math.min(cards.length, shown + PAGE);
    updateMore();
    window.dispatchEvent(new Event("resize")); // let the scroll triggers re-measure the taller section
  });
  updateMore();
  more.append(moreButton);
  section.replaceChildren(rail("left"), header, columns, more, rail("right"));
}

function setupFooterContact() {
  const toggle = document.querySelector("[data-contact-toggle]");
  const details = document.querySelector("[data-contact-details]");
  if (!toggle || !details) return;
  toggle.addEventListener("click", () => {
    const open = details.hidden;
    details.hidden = !open;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

function buildPapers(papers, covers) {
  const captions = document.createDocumentFragment();
  const textures = document.createDocumentFragment();

  papers.forEach((paper, index) => {
    const item = element("div", "Works__item");
    item.setAttribute("data-works_item", "");

    const info = element("div", "Works__item_info");
    const date = element("time", "Works__item_date", paper.year || "");
    if (paper.year) date.setAttribute("datetime", paper.year);
    info.append(date);

    const title = element("h3", "Works__item_title");
    title.setAttribute("data-works_title", "");
    const titleLink = element("a", "Works__item_title_link", paper.title);
    setPaperLink(titleLink, paper.href);
    title.append(titleLink);

    const details = element("p", "Works__item_title_ja", venueLine(paper));
    item.append(info, title, details);
    captions.append(item);

    const texture = element("div", "Works__scroll_item");
    texture.setAttribute("data-top_works_item", covers[index]);
    texture.setAttribute("data-works_id", paper.id);
    texture.append(element("div", "Works__scroll_item_thumb"));
    textures.append(texture);
  });

  return { captions, textures };
}

function renderContent(content, covers) {
  const collaborators = document.querySelector("#tweakpane-mainlogo-material .DeepPriorAcademicCard p");
  const newsList = document.querySelector("#news .News__newsList");
  const worksList = document.querySelector("#works .Works__list");
  const worksScroll = document.querySelector("#works .Works__scroll");

  assert(collaborators, "academic collaborator target is missing");
  assert(newsList, "News list target is missing");
  assert(worksList, "Works caption target is missing");
  assert(worksScroll, "Works texture target is missing");

  const news = buildNews(content.news);
  const CAROUSEL_COUNT = 10;
  const papers = buildPapers(content.papers.slice(0, CAROUSEL_COUNT), covers);

  collaborators.textContent = content.hero.academicCollaborators;
  newsList.replaceChildren(news);
  worksList.replaceChildren(papers.captions);
  worksScroll.replaceChildren(papers.textures);

  const count = Math.min(CAROUSEL_COUNT, content.papers.length);
  assert(worksList.querySelectorAll(".Works__item[data-works_item]").length === count, "Works captions did not render the carousel papers");
  assert(worksScroll.querySelectorAll(".Works__scroll_item[data-top_works_item][data-works_id]").length === count, "Works textures did not render the carousel papers");
  buildPaperIndex(content, covers);
  setupFooterContact();
}

async function initialize() {
  try {
    const response = await fetch(CONTENT_URL, { credentials: "same-origin", cache: "no-cache" });
    assert(response.ok, `content request failed (${response.status})`);
    const content = await response.json();
    validateContent(content);

    window.DeepPriorContent = content;
    const covers = await buildCovers(content.papers);
    window.DeepPriorPaperCovers = covers;
    renderContent(content, covers);

    await import(`/people-section.js?v=${ASSET_VERSION}`);
    await import(`/market-engine.js?v=${ASSET_VERSION}`);
    await import(`/news-panel.js?v=${ASSET_VERSION}`);
    await import(`${MAIN_BUNDLE}?v=${ASSET_VERSION}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[DeepPrior content] Initialization failed: ${message}`);
  }
}

await initialize();
