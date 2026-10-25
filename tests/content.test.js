import test from "node:test";
import assert from "node:assert/strict";
import { slugify, validateProject, validateSite } from "../src/content.js";

const site = {
  heroLocation: "Houston, Texas",
  heroTitle: "LHANA",
  heroLink: "Selected work",
  workTitle: "Selected work",
  projectsTitle: "Our projects",
  projectsIntro: "A collection of thoughtful homes.",
  aboutTitle: "A family-owned design studio in Houston.",
  aboutBody: "Thoughtful interiors.",
  contactTitle: "Get in touch",
  contactEmail: "hello@example.com",
  contactPhone: "713 516 4683",
  contactLocation: "Houston, Texas"
};

test("validates editable site details", () => {
  assert.equal(validateSite(site), null);
  assert.match(validateSite({ ...site, contactEmail: "not-an-email" }), /email/i);
  assert.match(validateSite({ ...site, heroTitle: "x".repeat(81) }), /heroTitle/);
});

test("validates project visibility and featured state", () => {
  const project = {
    name: "Cedar Creek",
    type: "Residential",
    description: "A considered home.",
    featured: true,
    visible: true
  };
  assert.equal(validateProject(project), null);
  assert.match(validateProject({ ...project, featured: true, visible: false }), /visibility/i);
  assert.match(validateProject({ ...project, type: "" }), /project name/i);
});

test("creates URL-safe project slugs", () => {
  assert.equal(slugify("Cedar Creek — Houston"), "cedar-creek-houston");
  assert.equal(slugify("   "), "");
});
