import { Question, QuestionType, Purpose } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const createEmptyQuestion = (type: QuestionType): Question => {
  const baseQuestion = {
    id: generateId(),
    type,
    purpose: 'formative' as Purpose,
    stem: '',
  };

  switch (type) {
    case 'mcq':
      return {
        ...baseQuestion,
        type: 'mcq',
        options: [
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: true },
          { id: generateId(), text: '', isCorrect: false },
          { id: generateId(), text: '', isCorrect: false },
        ],
      };
    case 'ordering':
      return {
        ...baseQuestion,
        type: 'ordering',
        items: [
          { id: generateId(), text: '', order: 0 },
          { id: generateId(), text: '', order: 1 },
          { id: generateId(), text: '', order: 2 },
        ],
      };
    case 'hotspot':
      return {
        ...baseQuestion,
        type: 'hotspot',
        zones: [],
        imageUrl: '',
      };
    default:
      throw new Error(`Unknown question type: ${type}`);
  }
};

export const validateQuestion = (question: Question): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Base validation
  if (!question.stem.trim()) {
    errors.push('Question stem is required');
  }

  // Purpose-specific validation
  if (question.purpose === 'summative') {
    if (!question.learningObjective?.trim()) {
      errors.push('Learning objective is required for summative questions');
    }
    if (!question.bloomsLevel) {
      errors.push('Bloom\'s level is required for summative questions');
    }
  }

  // Type-specific validation
  switch (question.type) {
    case 'mcq':
      const hasCorrectOption = question.options.some(opt => opt.isCorrect);
      if (!hasCorrectOption) {
        errors.push('At least one option must be marked as correct');
      }
      
      const hasEmptyOption = question.options.some(opt => !opt.text.trim());
      if (hasEmptyOption) {
        errors.push('All options must have text');
      }

      if (question.purpose === 'formative') {
        const hasEmptyFeedback = question.options.some(opt => !opt.feedback?.trim());
        if (hasEmptyFeedback) {
          errors.push('All options must have feedback for formative questions');
        }
      }
      break;

    case 'ordering':
      const hasEmptyItem = question.items.some(item => !item.text.trim());
      if (hasEmptyItem) {
        errors.push('All items must have text');
      }
      
      if (question.items.length < 2) {
        errors.push('Ordering questions must have at least 2 items');
      }
      break;

    case 'hotspot':
      if (question.zones.length === 0) {
        errors.push('At least one hotspot zone is required');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// AI Suggest mock data generation
export const generateAISuggestions = (topic: string, question: Question): Partial<Question> => {
  const mockData = {
    stem: `Explain the concept of ${topic} and its importance in modern applications.`,
    difficulty: 'medium' as const,
    topic,
  };

  switch (question.type) {
    case 'mcq':
      return {
        ...mockData,
        options: [
          { id: question.options[0]?.id || generateId(), text: `${topic} is a fundamental concept`, isCorrect: true, feedback: 'Correct! This is the right answer.' },
          { id: question.options[1]?.id || generateId(), text: `${topic} is obsolete technology`, isCorrect: false, feedback: 'Incorrect. ${topic} is still widely used.' },
          { id: question.options[2]?.id || generateId(), text: `${topic} only works on Windows`, isCorrect: false, feedback: 'Incorrect. ${topic} is cross-platform.' },
          { id: question.options[3]?.id || generateId(), text: `${topic} requires no programming`, isCorrect: false, feedback: 'Incorrect. ${topic} requires programming knowledge.' },
        ],
      };

    case 'ordering':
      return {
        ...mockData,
        items: [
          { id: question.items[0]?.id || generateId(), text: `Initialize ${topic} environment`, order: 0 },
          { id: question.items[1]?.id || generateId(), text: `Configure ${topic} settings`, order: 1 },
          { id: question.items[2]?.id || generateId(), text: `Implement ${topic} functionality`, order: 2 },
          { id: question.items[3]?.id || generateId(), text: `Test ${topic} implementation`, order: 3 },
        ],
      };

    case 'hotspot':
      return {
        ...mockData,
        zones: [
          { id: generateId(), coordinates: [{ x: 100, y: 100 }, { x: 200, y: 100 }, { x: 200, y: 200 }, { x: 100, y: 200 }], label: 'Main component' },
          { id: generateId(), coordinates: [{ x: 300, y: 150 }, { x: 400, y: 150 }, { x: 400, y: 250 }, { x: 300, y: 250 }], label: 'Secondary component' },
        ],
      };

    default:
      return mockData;
  }
};
