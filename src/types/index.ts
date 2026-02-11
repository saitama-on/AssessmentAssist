export type QuestionType = 'mcq' | 'ordering' | 'hotspot';

export type Purpose = 'formative' | 'summative';

export type BloomsLevel = 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create';

export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback?: string; // Required for formative
}

export interface OrderingItem {
  id: string;
  text: string;
  order: number;
}

export interface HotspotZone {
  id: string;
  coordinates: { x: number; y: number }[];
  label?: string;
}

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  purpose: Purpose;
  stem: string;
  topic?: string;
  
  // Summative specific fields
  learningObjective?: string;
  bloomsLevel?: BloomsLevel;
}

export interface MCQQuestion extends BaseQuestion {
  type: 'mcq';
  options: MCQOption[];
}

export interface OrderingQuestion extends BaseQuestion {
  type: 'ordering';
  items: OrderingItem[];
}

export interface HotspotQuestion extends BaseQuestion {
  type: 'hotspot';
  zones: HotspotZone[];
  imageUrl?: string;
  imageFile?: File;
}

export type Question = MCQQuestion | OrderingQuestion | HotspotQuestion;

export interface AssessmentState {
  questions: Question[];
  currentQuestionId?: string;
}
