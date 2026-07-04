import { BadRequestException } from "@nestjs/common";

const SUPPORTED_COMPONENT_TYPES = new Set([
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
  "final_summary",
]);

function requireArray(value: any, label: string) {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${label} must be an array`);
  }
}

function requireString(value: any, label: string) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new BadRequestException(`${label} must be a non-empty string`);
  }
}

function requireObject(value: any, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException(`${label} must be a JSON object`);
  }
}

export class NodeSchemaValidator {
  static validateLessonFlow(data: any) {
    requireArray(data, "lessonFlow");

    const ids = new Set<string>();
    data.forEach((component: any, idx: number) => {
      this.validateComponent(component, `lessonFlow[${idx}]`, ids);
    });
  }

  private static validateComponent(
    component: any,
    path: string,
    ids: Set<string>,
    isChild = false,
  ) {
    requireObject(component, path);
    requireString(component.id, `${path}.id`);
    requireString(component.type, `${path}.type`);

    if (ids.has(component.id)) {
      throw new BadRequestException(`${path}.id duplicates "${component.id}"`);
    }
    ids.add(component.id);

    if (!SUPPORTED_COMPONENT_TYPES.has(component.type)) {
      throw new BadRequestException(
        `${path}.type "${component.type}" is not supported`,
      );
    }

    if (isChild && component.type === "component_group") {
      throw new BadRequestException(`${path}.type cannot be component_group`);
    }

    requireObject(component.config, `${path}.config`);
    this.validateComponentConfig(component, path, ids);

    if (component.completionRule) {
      requireObject(component.completionRule, `${path}.completionRule`);
      requireString(
        component.completionRule.type,
        `${path}.completionRule.type`,
      );
    }
  }

  private static validateComponentConfig(
    component: any,
    path: string,
    ids: Set<string>,
  ) {
    const config = component.config;
    const label = `${path}.config`;

    if (component.type === "component_group") {
      requireArray(config.components, `${label}.components`);
      if (config.components.length === 0) {
        throw new BadRequestException(
          `${label}.components must contain at least one child component`,
        );
      }
      config.components.forEach((child: any, childIdx: number) => {
        this.validateComponent(
          child,
          `${label}.components[${childIdx}]`,
          ids,
          true,
        );
      });
    }

    if (component.type === "dialogue") {
      requireArray(config.lines, `${label}.lines`);
      config.lines.forEach((line: any, lineIdx: number) => {
        requireString(line.text, `${label}.lines[${lineIdx}].text`);
      });
    }

    if (component.type === "media") {
      requireString(config.url, `${label}.url`);
    }

    if (component.type === "markdown") {
      requireString(config.content, `${label}.content`);
    }

    if (component.type === "target_matching") {
      requireArray(config.targets, `${label}.targets`);
      requireArray(config.items, `${label}.items`);
    }

    if (component.type === "category_sorting") {
      requireArray(config.categories, `${label}.categories`);
      requireArray(config.cards, `${label}.cards`);
    }

    if (component.type === "mcq") {
      requireString(config.question, `${label}.question`);
      requireArray(config.options, `${label}.options`);
      if (
        !config.options.some(
          (option: any) => option.isCorrect === true || option.correct === true,
        )
      ) {
        throw new BadRequestException(
          `${label}.options must contain at least one correct option`,
        );
      }
    }

    if (component.type === "quiz_sequence") {
      requireArray(config.questions, `${label}.questions`);
      config.questions.forEach((question: any, questionIdx: number) => {
        requireString(
          question.question || question.prompt,
          `${label}.questions[${questionIdx}].question`,
        );
        requireArray(
          question.options,
          `${label}.questions[${questionIdx}].options`,
        );
        if (
          typeof question.correctIndex !== "number" &&
          !question.options.some(
            (option: any) =>
              option?.isCorrect === true || option?.correct === true,
          )
        ) {
          throw new BadRequestException(
            `${label}.questions[${questionIdx}] must define correctIndex or a correct option`,
          );
        }
      });
    }

    if (component.type === "multi_select") {
      requireString(config.question, `${label}.question`);
      requireArray(config.options, `${label}.options`);
      if (
        !config.options.some(
          (option: any) => option.isCorrect === true || option.correct === true,
        )
      ) {
        throw new BadRequestException(
          `${label}.options must contain at least one correct option`,
        );
      }
    }

    if (component.type === "matching_columns") {
      requireArray(config.leftColumn, `${label}.leftColumn`);
      requireArray(config.rightColumn, `${label}.rightColumn`);
      requireArray(config.correctPairs, `${label}.correctPairs`);
    }

    if (component.type === "true_false") {
      requireString(config.statement, `${label}.statement`);
      if (typeof config.correctAnswer !== "boolean") {
        throw new BadRequestException(
          `${label}.correctAnswer must be a boolean`,
        );
      }
    }

    if (
      component.type === "sequence_sorting" ||
      component.type === "chain_sorting"
    ) {
      requireArray(config.items, `${label}.items`);
    }

    if (component.type === "knowledge_piece") {
      requireString(config.label || component.title, `${label}.label`);
      if (config.takeaways !== undefined) {
        requireArray(config.takeaways, `${label}.takeaways`);
      }
    }

    if (component.type === "final_summary") {
      if (config.keyTakeaways !== undefined) {
        requireArray(config.keyTakeaways, `${label}.keyTakeaways`);
      }
    }

    if (component.type === "mindmap_reveal") {
      requireArray(config.nodes, `${label}.nodes`);
      // Validate each node supports both legacy format and new front/back format
      config.nodes.forEach((node: any, nodeIdx: number) => {
        if (!node.id) {
          throw new BadRequestException(
            `${label}.nodes[${nodeIdx}].id is required`,
          );
        }
        // Must have either legacy label/detail or new front/back
        const hasLegacy = node.label !== undefined || node.detail !== undefined;
        const hasNewFormat =
          node.front !== undefined || node.back !== undefined;
        if (!hasLegacy && !hasNewFormat) {
          throw new BadRequestException(
            `${label}.nodes[${nodeIdx}] must have either label/detail or front/back fields`,
          );
        }
      });
      // Validate optional layout config
      if (config.layoutConfig) {
        const validTypes = ["vertical", "horizontal", "matrix", "custom"];
        if (!validTypes.includes(config.layoutConfig.type)) {
          throw new BadRequestException(
            `${label}.layoutConfig.type must be one of: ${validTypes.join(", ")}`,
          );
        }
      }
    }
  }

  /**
   * Validate the lessonMedia array (center column media items).
   * Each item must have id, type, and url.
   */
  static validateLessonMedia(data: any) {
    if (data === null || data === undefined) return; // Optional field
    requireArray(data, "lessonMedia");

    const ids = new Set<string>();
    data.forEach((item: any, idx: number) => {
      requireObject(item, `lessonMedia[${idx}]`);
      requireString(item.id, `lessonMedia[${idx}].id`);
      requireString(item.type, `lessonMedia[${idx}].type`);
      requireString(item.url, `lessonMedia[${idx}].url`);

      if (ids.has(item.id)) {
        throw new BadRequestException(
          `lessonMedia[${idx}].id duplicates "${item.id}"`,
        );
      }
      ids.add(item.id);

      const validTypes = ["video", "image"];
      if (!validTypes.includes(item.type)) {
        throw new BadRequestException(
          `lessonMedia[${idx}].type must be one of: ${validTypes.join(", ")}`,
        );
      }
    });
  }

  static validateNode(lessonFlow: any) {
    this.validateLessonFlow(lessonFlow);
  }
}
