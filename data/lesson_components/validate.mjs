import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.dirname(new URL(import.meta.url).pathname);

const supportedTypes = new Set([
  "component_group",
  "dialogue",
  "media",
  "markdown",
  "target_matching",
  "category_sorting",
  "mindmap_reveal",
  "mcq",
  "quiz_sequence",
  "multi_select",
  "matching_columns",
  "true_false",
  "sequence_sorting",
  "chain_sorting",
  "knowledge_piece",
  "map_target_matching",
  "progression_spiral",
  "timeline_explorer",
  "hotspot_gallery",
  "shinkei_matching",
  "final_summary",
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function requireString(value, label) {
  assert(
    typeof value === "string" && value.trim() !== "",
    `${label} must be a non-empty string`,
  );
}

function requireArray(value, label) {
  assert(Array.isArray(value), `${label} must be an array`);
}

function validateComponent(component, label, ids, isChild = false) {
  assert(isObject(component), `${label} must be an object`);
  requireString(component.id, `${label}.id`);
  requireString(component.type, `${label}.type`);
  assert(!ids.has(component.id), `${label}.id duplicates "${component.id}"`);
  ids.add(component.id);
  assert(
    supportedTypes.has(component.type),
    `${label}.type "${component.type}" is not supported`,
  );
  assert(
    !(isChild && component.type === "component_group"),
    `${label}.type cannot be component_group`,
  );
  assert(isObject(component.config), `${label}.config must be an object`);

  const config = component.config;

  if (component.type === "component_group") {
    requireArray(config.components, `${label}.config.components`);
    assert(
      config.components.length > 0,
      `${label}.config.components must not be empty`,
    );
    config.components.forEach((child, index) =>
      validateComponent(
        child,
        `${label}.config.components[${index}]`,
        ids,
        true,
      ),
    );
  }

  if (component.type === "dialogue") {
    requireArray(config.lines, `${label}.config.lines`);
    config.lines.forEach((line, index) =>
      requireString(line.text, `${label}.config.lines[${index}].text`),
    );
  }

  if (component.type === "markdown")
    requireString(config.content, `${label}.config.content`);
  if (component.type === "media")
    requireString(config.url, `${label}.config.url`);
  if (
    component.type === "target_matching" ||
    component.type === "map_target_matching"
  ) {
    requireArray(config.targets, `${label}.config.targets`);
    requireArray(config.items, `${label}.config.items`);
  }
  if (component.type === "category_sorting") {
    requireArray(config.categories, `${label}.config.categories`);
    requireArray(config.cards, `${label}.config.cards`);
  }
  if (component.type === "mindmap_reveal") {
    requireArray(config.nodes, `${label}.config.nodes`);
    config.nodes.forEach((node, index) => {
      requireString(node.id, `${label}.config.nodes[${index}].id`);
      assert(
        node.label !== undefined ||
          node.detail !== undefined ||
          node.front !== undefined ||
          node.back !== undefined,
        `${label}.config.nodes[${index}] must have label/detail or front/back`,
      );
    });
  }
  if (component.type === "mcq") {
    requireString(config.question, `${label}.config.question`);
    requireArray(config.options, `${label}.config.options`);
    assert(
      config.options.some(
        (option) => option?.isCorrect === true || option?.correct === true,
      ),
      `${label}.config.options must contain at least one correct option`,
    );
  }
  if (component.type === "quiz_sequence") {
    requireArray(config.questions, `${label}.config.questions`);
    config.questions.forEach((question, index) => {
      requireString(
        question.question || question.prompt,
        `${label}.config.questions[${index}].question`,
      );
      requireArray(
        question.options,
        `${label}.config.questions[${index}].options`,
      );
      assert(
        typeof question.correctIndex === "number" ||
          question.options.some(
            (option) => option?.isCorrect === true || option?.correct === true,
          ),
        `${label}.config.questions[${index}] must define correctIndex or a correct option`,
      );
    });
  }
  if (component.type === "multi_select") {
    requireString(config.question, `${label}.config.question`);
    requireArray(config.options, `${label}.config.options`);
    assert(
      config.options.some(
        (option) => option?.isCorrect === true || option?.correct === true,
      ),
      `${label}.config.options must contain at least one correct option`,
    );
  }
  if (component.type === "matching_columns") {
    requireArray(config.leftColumn, `${label}.config.leftColumn`);
    requireArray(config.rightColumn, `${label}.config.rightColumn`);
    requireArray(config.correctPairs, `${label}.config.correctPairs`);
  }
  if (component.type === "shinkei_matching") {
    requireArray(config.pairs, `${label}.config.pairs`);
    assert(config.pairs.length > 0, `${label}.config.pairs must not be empty`);
  }
  if (component.type === "true_false") {
    requireString(config.statement, `${label}.config.statement`);
    assert(
      typeof config.correctAnswer === "boolean",
      `${label}.config.correctAnswer must be boolean`,
    );
  }
  if (
    component.type === "sequence_sorting" ||
    component.type === "chain_sorting"
  ) {
    requireArray(config.items, `${label}.config.items`);
  }
  if (component.type === "knowledge_piece")
    requireString(config.label || component.title, `${label}.config.label`);
  if (component.type === "progression_spiral")
    requireArray(config.milestones, `${label}.config.milestones`);
  if (component.type === "timeline_explorer")
    requireArray(config.periods, `${label}.config.periods`);
  if (component.type === "hotspot_gallery")
    requireArray(config.items, `${label}.config.items`);
  if (component.type === "final_summary" && config.keyTakeaways !== undefined) {
    requireArray(config.keyTakeaways, `${label}.config.keyTakeaways`);
  }
}

const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf8"),
);
const errors = [];

for (const lesson of manifest.lessons) {
  try {
    const data = JSON.parse(
      fs.readFileSync(path.join(root, lesson.file), "utf8"),
    );
    requireArray(data.lessonFlow, `${lesson.file}.lessonFlow`);
    const ids = new Set();
    data.lessonFlow.forEach((component, index) =>
      validateComponent(component, `${lesson.file}.lessonFlow[${index}]`, ids),
    );
    console.log(
      `ok ${lesson.key} ${lesson.file}: ${data.lessonFlow.length} top-level components`,
    );
  } catch (error) {
    errors.push(`${lesson.file}: ${error.message}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
