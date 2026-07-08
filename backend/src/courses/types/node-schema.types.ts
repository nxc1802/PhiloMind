/**
 * TypeScript interfaces for the PhiloMind lesson component schema.
 * These define the shape of JSON stored in ConceptNode.lessonFlow and ConceptNode.lessonMedia.
 */

// ─── Lesson Media (center column in 3-column layout) ──────────────────────────

export type LessonMediaType = "video" | "image";

export interface LessonMediaItem {
  /** Unique identifier for this media item */
  id: string;
  /** Type of media */
  type: LessonMediaType;
  /** URL to the media resource */
  url: string;
  /** Optional display title */
  title?: string;
  /** Optional subtitle / caption */
  subtitle?: string;
  /** Alt text for accessibility (images) */
  alt?: string;
  /** Optional descriptive text shown below media */
  description?: string;
  /** Optional badge label overlay */
  badge?: string;
  /** Optional display width, e.g. 320, "50%", "18rem" */
  width?: number | string;
  /** Optional display height, e.g. 180, "12rem" */
  height?: number | string;
  /** Optional maximum display width */
  maxWidth?: number | string;
  /** Optional maximum display height */
  maxHeight?: number | string;
  /** Optional aspect ratio such as "16/9" */
  aspectRatio?: string;
  /** Optional image fit behavior */
  fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

// ─── Component Media (inline media within a component) ────────────────────────

export type ComponentImageAsset =
  | string
  | {
      url?: string;
      src?: string;
      imageUrl?: string;
      alt?: string;
      caption?: string;
      title?: string;
      fit?: "cover" | "contain" | "fill" | "none" | "scale-down";
      position?: string;
      aspectRatio?: string;
      width?: number | string;
      height?: number | string;
      minWidth?: number | string;
      minHeight?: number | string;
      maxWidth?: number | string;
      maxHeight?: number | string;
      radius?: number | string;
      borderRadius?: number | string;
      align?: "left" | "center" | "right";
      size?: {
        width?: number | string;
        height?: number | string;
        minWidth?: number | string;
        minHeight?: number | string;
        maxWidth?: number | string;
        maxHeight?: number | string;
        aspectRatio?: string;
        radius?: number | string;
        borderRadius?: number | string;
        align?: "left" | "center" | "right";
      };
      display?: Record<string, number | string | undefined>;
      layout?: Record<string, number | string | undefined>;
    };

export interface ComponentMedia {
  /** Image shown at the top of the component body */
  image?: ComponentImageAsset;
  /** Component-level hero/supporting image */
  componentImage?: ComponentImageAsset;
  /** Image shown in question prompt */
  questionImage?: ComponentImageAsset;
  /** Map of answerId → image asset */
  answerImages?: Record<string, ComponentImageAsset>;
  /** Map of optionId → image asset */
  optionImages?: Record<string, ComponentImageAsset>;
  /** Map of questionId → image asset */
  questionImages?: Record<string, ComponentImageAsset>;
  /** Map of dialogueLineId/index → image asset */
  dialogueImages?: Record<string, ComponentImageAsset>;
  /** Background/decorative image for the component */
  backgroundImage?: ComponentImageAsset;
}

// ─── Layout Config ─────────────────────────────────────────────────────────────

export type MindmapLayoutType = "vertical" | "horizontal" | "matrix" | "custom";

export interface MindmapLayoutConfig {
  type: MindmapLayoutType;
  /** Number of columns (used when type = 'matrix') */
  cols?: number;
  /** Number of rows (used when type = 'matrix') */
  rows?: number;
  /** Custom row sizes, e.g. [3, 2, 4] — each value is number of tiles in that row */
  rowSizes?: number[];
}

// ─── Lesson Component (items in lessonFlow array) ─────────────────────────────

export type ComponentType =
  | "component_group"
  | "media"
  | "dialogue"
  | "markdown"
  | "mcq"
  | "quiz_sequence"
  | "multi_select"
  | "true_false"
  | "matching_columns"
  | "category_sorting"
  | "target_matching"
  | "mindmap_reveal"
  | "sequence_sorting"
  | "chain_sorting"
  | "knowledge_piece"
  | "map_target_matching"
  | "progression_spiral"
  | "timeline_explorer"
  | "hotspot_gallery"
  | "shinkei_matching"
  | "final_summary";

export interface CompletionRule {
  type: "viewed" | "correct" | "completed" | "any";
  /** Minimum score required (for 'correct' type) */
  minScore?: number;
}

export interface LessonComponent {
  /** Unique identifier within the lesson flow */
  id: string;
  /** Component renderer type */
  type: ComponentType;
  /** Display title */
  title: string;
  /** Inline media within the component (question images, dialogue images, etc.) */
  media?: ComponentMedia;
  /** Completion rule for advancing to next component */
  completionRule?: CompletionRule;
  /** Main configuration data — varies by component type */
  config: Record<string, any>;
}

// ─── MindMap Node with front/back card support ────────────────────────────────

export interface MindmapNode {
  id: string;
  /** Front face of the card (shown before reveal) */
  front?: {
    text?: string;
    image?: ComponentImageAsset;
  };
  /** Back face of the card (shown after reveal) */
  back?: {
    text?: string;
    image?: ComponentImageAsset;
  };
  /** Shorthand: label shown when card is revealed (backward-compat) */
  label?: string;
  /** Shorthand: detail text shown when card is revealed (backward-compat) */
  detail?: string;
  /** Optional image for the revealed card (backward-compat) */
  image?: ComponentImageAsset;
  /** Layout config specific to this node's row placement */
  layoutConfig?: MindmapLayoutConfig;
}

// ─── Matching Columns ──────────────────────────────────────────────────────────

export interface MatchingColumnItem {
  id: string;
  text: string;
  /** Optional image to show alongside the text */
  image?: ComponentImageAsset;
}

export interface MatchingPair {
  leftId: string;
  rightId: string;
  /** Optional shorthand for many left cards matching one right card */
  leftIds?: string[];
  /** Optional shorthand for one left card accepting several right cards */
  rightIds?: string[];
}

export interface ShinkeiPairCard {
  id?: string;
  text?: string;
  label?: string;
  title?: string;
  name?: string;
  description?: string;
  image?: ComponentImageAsset;
  imageUrl?: string;
  media?: ComponentImageAsset;
  thumbnail?: ComponentImageAsset;
}

export interface ShinkeiMatchingPair {
  id: string;
  left: string | ShinkeiPairCard;
  right: string | ShinkeiPairCard;
}
