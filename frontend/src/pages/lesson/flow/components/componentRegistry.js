import { DialogueComponent } from "./DialogueComponent";
import { MediaComponent } from "./MediaComponent";
import { MarkdownComponent } from "./MarkdownComponent";
import { McqComponent } from "./McqComponent";
import { QuizSequenceComponent } from "./QuizSequenceComponent";
import { MultiSelectComponent } from "./MultiSelectComponent";
import { TrueFalseComponent } from "./TrueFalseComponent";
import { MatchingColumnsComponent } from "./MatchingColumnsComponent";
import { CategorySortingComponent } from "./CategorySortingComponent";
import { TargetMatchingComponent } from "./TargetMatchingComponent";
import { MindmapRevealComponent } from "./MindmapRevealComponent";
import { SequenceSortingComponent } from "./SequenceSortingComponent";
import { FinalSummaryComponent } from "./FinalSummaryComponent";
import { ChainSortingComponent } from "./ChainSortingComponent";
import { KnowledgePieceComponent } from "./KnowledgePieceComponent";
import { MapTargetMatchingComponent } from "./MapTargetMatchingComponent";
import { ProgressionSpiralComponent } from "./ProgressionSpiralComponent";
import { TimelineExplorerComponent } from "./TimelineExplorerComponent";
import { HotspotGalleryComponent } from "./HotspotGalleryComponent";
import { ShinkeiMatchingComponent } from "./ShinkeiMatchingComponent";

export const COMPONENT_RENDERERS = {
  dialogue: DialogueComponent,
  media: MediaComponent,
  markdown: MarkdownComponent,
  mcq: McqComponent,
  quiz_sequence: QuizSequenceComponent,
  multi_select: MultiSelectComponent,
  true_false: TrueFalseComponent,
  matching_columns: MatchingColumnsComponent,
  category_sorting: CategorySortingComponent,
  target_matching: TargetMatchingComponent,
  mindmap_reveal: MindmapRevealComponent,
  sequence_sorting: SequenceSortingComponent,
  final_summary: FinalSummaryComponent,
  chain_sorting: ChainSortingComponent,
  knowledge_piece: KnowledgePieceComponent,
  map_target_matching: MapTargetMatchingComponent,
  progression_spiral: ProgressionSpiralComponent,
  timeline_explorer: TimelineExplorerComponent,
  hotspot_gallery: HotspotGalleryComponent,
  shinkei_matching: ShinkeiMatchingComponent,
};

export function getComponentName(type = "") {
  return (
    String(type)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("") + "Component"
  );
}

export function getComponentRenderer(type) {
  return COMPONENT_RENDERERS[type];
}
