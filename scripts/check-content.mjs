import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const contentPath = resolve("public/data/site-content.json");
const allowedLinkKeys = new Set(["website", "linkedin", "github", "email"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function isString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertString(value, path) {
  assert(isString(value), `${path} must be a non-empty string`);
}

function assertStringArray(value, path) {
  assert(Array.isArray(value) && value.length > 0, `${path} must be a non-empty array`);
  value.forEach((entry, index) => assertString(entry, `${path}[${index}]`));
}

function validate(content) {
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
    assert(!paper.figure || paper.figure.startsWith("/"), `${path}.figure must be root-relative`);
    assert(!paper.image || paper.image.startsWith("/"), `${path}.image must be root-relative`);
    assert(
      paper.href.startsWith("/") || paper.href.startsWith("https://"),
      `${path}.href must be root-relative or use HTTPS`
    );
    assert(!paperIds.has(paper.id), `${path}.id must be unique`);
    paperIds.add(paper.id);
  });

  assert(isRecord(content.people), "people must be an object");
  assertString(content.people.heading, "people.heading");
  assertString(content.people.countLabel, "people.countLabel");
  assert(Array.isArray(content.people.groups) && content.people.groups.length > 0, "people.groups must be a non-empty array");
  assert(Array.isArray(content.people.members) && content.people.members.length > 0, "people.members must be a non-empty array");

  const groupKeys = new Set();
  content.people.groups.forEach((group, index) => {
    const path = `people.groups[${index}]`;
    assert(isRecord(group), `${path} must be an object`);
    assertString(group.key, `${path}.key`);
    assertString(group.label, `${path}.label`);
    assertStringArray(group.roles, `${path}.roles`);
    assert(group.direction === 1 || group.direction === -1, `${path}.direction must be 1 or -1`);
    assert(!groupKeys.has(group.key), `${path}.key must be unique`);
    groupKeys.add(group.key);
  });

  content.people.members.forEach((member, index) => {
    const path = `people.members[${index}]`;
    assert(isRecord(member), `${path} must be an object`);
    ["name", "role", "initials", "bio"].forEach((key) => assertString(member[key], `${path}.${key}`));
    assertStringArray(member.universities, `${path}.universities`);
    assert(isRecord(member.links), `${path}.links must be an object`);
    Object.entries(member.links).forEach(([key, value]) => {
      assert(allowedLinkKeys.has(key), `${path}.links.${key} is not supported`);
      assertString(value, `${path}.links.${key}`);
    });
    const matchingGroups = content.people.groups.filter((group) => group.roles.includes(member.role));
    assert(matchingGroups.length === 1, `${path}.role must match exactly one people group`);
  });

  return {
    news: content.news.length,
    papers: content.papers.length,
    people: content.people.members.length,
  };
}

try {
  const content = JSON.parse(await readFile(contentPath, "utf8"));
  const counts = validate(content);
  console.log(`Content check passed: ${counts.news} news, ${counts.papers} papers, ${counts.people} people.`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Content check failed: ${message}`);
  process.exitCode = 1;
}
