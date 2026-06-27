import { BadRequestException } from '@nestjs/common';

const SUPPORTED_COMPONENT_TYPES = new Set([
  'dialogue',
  'media',
  'markdown',
  'target_matching',
  'category_sorting',
  'mindmap_reveal',
  'mcq',
  'matching_columns',
  'true_false',
  'sequence_sorting',
  'final_summary',
]);

function requireArray(value: any, label: string) {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${label} must be an array`);
  }
}

function requireString(value: any, label: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException(`${label} must be a non-empty string`);
  }
}

function requireObject(value: any, label: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException(`${label} must be a JSON object`);
  }
}

export class NodeSchemaValidator {
  static validateLessonFlow(data: any) {
    requireArray(data, 'lessonFlow');

    const ids = new Set<string>();
    data.forEach((component: any, idx: number) => {
      requireObject(component, `lessonFlow[${idx}]`);
      requireString(component.id, `lessonFlow[${idx}].id`);
      requireString(component.type, `lessonFlow[${idx}].type`);

      if (ids.has(component.id)) {
        throw new BadRequestException(`lessonFlow[${idx}].id duplicates "${component.id}"`);
      }
      ids.add(component.id);

      if (!SUPPORTED_COMPONENT_TYPES.has(component.type)) {
        throw new BadRequestException(`lessonFlow[${idx}].type "${component.type}" is not supported`);
      }

      requireObject(component.config, `lessonFlow[${idx}].config`);
      this.validateComponentConfig(component, idx);

      if (component.completionRule) {
        requireObject(component.completionRule, `lessonFlow[${idx}].completionRule`);
        requireString(component.completionRule.type, `lessonFlow[${idx}].completionRule.type`);
      }
    });
  }

  private static validateComponentConfig(component: any, idx: number) {
    const config = component.config;
    const label = `lessonFlow[${idx}].config`;

    if (component.type === 'dialogue') {
      requireArray(config.lines, `${label}.lines`);
      config.lines.forEach((line: any, lineIdx: number) => {
        requireString(line.text, `${label}.lines[${lineIdx}].text`);
      });
    }

    if (component.type === 'media') {
      requireString(config.url, `${label}.url`);
    }

    if (component.type === 'markdown') {
      requireString(config.content, `${label}.content`);
    }

    if (component.type === 'target_matching') {
      requireArray(config.targets, `${label}.targets`);
      requireArray(config.items, `${label}.items`);
    }

    if (component.type === 'category_sorting') {
      requireArray(config.categories, `${label}.categories`);
      requireArray(config.cards, `${label}.cards`);
    }

    if (component.type === 'mindmap_reveal') {
      requireArray(config.nodes, `${label}.nodes`);
    }

    if (component.type === 'mcq') {
      requireString(config.question, `${label}.question`);
      requireArray(config.options, `${label}.options`);
      if (!config.options.some((option: any) => option.isCorrect === true || option.correct === true)) {
        throw new BadRequestException(`${label}.options must contain at least one correct option`);
      }
    }

    if (component.type === 'matching_columns') {
      requireArray(config.leftColumn, `${label}.leftColumn`);
      requireArray(config.rightColumn, `${label}.rightColumn`);
      requireArray(config.correctPairs, `${label}.correctPairs`);
    }

    if (component.type === 'true_false') {
      requireString(config.statement, `${label}.statement`);
      if (typeof config.correctAnswer !== 'boolean') {
        throw new BadRequestException(`${label}.correctAnswer must be a boolean`);
      }
    }

    if (component.type === 'sequence_sorting') {
      requireArray(config.items, `${label}.items`);
    }

    if (component.type === 'final_summary') {
      if (config.keyTakeaways !== undefined) {
        requireArray(config.keyTakeaways, `${label}.keyTakeaways`);
      }
    }
  }

  static validateNode(lessonFlow: any) {
    this.validateLessonFlow(lessonFlow);
  }
}
