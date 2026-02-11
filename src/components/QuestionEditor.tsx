import React from 'react';
import { Question, QuestionType, Purpose, BloomsLevel } from '../types';
import { MCQQuestion } from './questions/MCQQuestion';
import { OrderingQuestion } from './questions/OrderingQuestion';
import { HotspotQuestion } from './questions/HotspotQuestion';
import { validateQuestion, generateAISuggestions } from '../utils/assessmentUtils';

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete?: () => void;
  onSave?: () => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  onChange,
  onDelete,
  onSave,
}) => {
  const validation = validateQuestion(question);

  const updateQuestionType = (type: QuestionType) => {
    // This is a simplified approach - in a real app, you might want to preserve some data
    const baseData = {
      id: question.id,
      type,
      purpose: question.purpose,
      stem: question.stem,
      topic: question.topic,
      learningObjective: question.learningObjective,
      bloomsLevel: question.bloomsLevel,
    };

    switch (type) {
      case 'mcq':
        onChange({
          ...baseData,
          type: 'mcq',
          options: [
            { id: 'opt1', text: '', isCorrect: false },
            { id: 'opt2', text: '', isCorrect: true },
            { id: 'opt3', text: '', isCorrect: false },
            { id: 'opt4', text: '', isCorrect: false },
          ],
        });
        break;
      case 'ordering':
        onChange({
          ...baseData,
          type: 'ordering',
          items: [
            { id: 'item1', text: '', order: 0 },
            { id: 'item2', text: '', order: 1 },
            { id: 'item3', text: '', order: 2 },
          ],
        });
        break;
      case 'hotspot':
        onChange({
          ...baseData,
          type: 'hotspot',
          zones: [],
          imageUrl: '',
        });
        break;
    }
  };

  const updatePurpose = (purpose: Purpose) => {
    onChange({ ...question, purpose });
  };

  const updateMetadata = (field: keyof Question, value: any) => {
    onChange({ ...question, [field]: value });
  };

  const handleAISuggest = () => {
    const topic = question.topic || 'the topic';
    const suggestions = generateAISuggestions(topic, question);
    
    // Create a properly typed updated question
    const updatedQuestion = { ...question };
    
    // Update base fields
    if (suggestions.stem) updatedQuestion.stem = suggestions.stem;
    // if (suggestions.difficulty) updatedQuestion.difficulty = suggestions.difficulty;
    if (suggestions.topic) updatedQuestion.topic = suggestions.topic;
    
    // Update type-specific fields
    if (question.type === 'mcq' && 'options' in suggestions) {
      (updatedQuestion as any).options = suggestions.options;
    } else if (question.type === 'ordering' && 'items' in suggestions) {
      (updatedQuestion as any).items = suggestions.items;
    } else if (question.type === 'hotspot' && 'zones' in suggestions) {
      (updatedQuestion as any).zones = suggestions.zones;
    }
    
    onChange(updatedQuestion);
  };

  const questionTypes: { value: QuestionType; label: string; icon: string }[] = [
    { value: 'mcq', label: 'Multiple Choice', icon: '🔘' },
    { value: 'ordering', label: 'Ordering', icon: '🔢' },
    { value: 'hotspot', label: 'Hotspot', icon: '🎯' },
  ];

  const purposes: { value: Purpose; label: string; description: string }[] = [
    { value: 'formative', label: 'Formative', description: 'Learning with feedback' },
    { value: 'summative', label: 'Summative', description: 'Assessment with objectives' },
  ];

  const bloomsLevels: BloomsLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  return (
    <div className="card">
      {/* Header */}
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Question Type Selector */}
            <div>
              <label className="form-label">
                Question Type
              </label>
              <div className="toggle-group">
                {questionTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateQuestionType(type.value)}
                    className={`toggle-btn ${
                      question.type === type.value ? 'active' : ''
                    }`}
                  >
                    <span style={{marginRight: '4px'}}>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Purpose Toggle */}
            <div>
              <label className="form-label">
                Purpose
              </label>
              <div className="toggle-group">
                {purposes.map((purpose) => (
                  <button
                    key={purpose.value}
                    onClick={() => updatePurpose(purpose.value)}
                    className={`toggle-btn ${
                      question.purpose === purpose.value ? 'active' : ''
                    }`}
                    title={purpose.description}
                  >
                    {purpose.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {onSave && (
              <button
                onClick={onSave}
                disabled={!validation.isValid}
                className="btn btn-primary btn-sm"
                title={validation.isValid ? "Save question" : "Fix validation errors before saving"}
              >
                Save Question
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="btn btn-danger btn-sm"
              >
                Delete Question
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Topic Input */}
          <div>
            <label className="form-label">
              Topic
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={question.topic || ''}
                onChange={(e) => updateMetadata('topic', e.target.value)}
                className="form-input"
                placeholder="Enter topic..."
              />
              <button
                onClick={handleAISuggest}
                className="btn btn-purple btn-sm"
                title="Generate AI suggestions based on topic"
              >
                ✨ AI Suggest
              </button>
            </div>
          </div>

          {/* Summative-specific fields */}
          {question.purpose === 'summative' && (
            <>
              <div>
                <label className="form-label">
                  Learning Objective *
                </label>
                <input
                  type="text"
                  value={question.learningObjective || ''}
                  onChange={(e) => updateMetadata('learningObjective', e.target.value)}
                  className="form-input"
                  placeholder="Required for summative"
                />
              </div>

              <div>
                <label className="form-label">
                  Bloom's Level *
                </label>
                <select
                  value={question.bloomsLevel || ''}
                  onChange={(e) => updateMetadata('bloomsLevel', e.target.value as BloomsLevel)}
                  className="form-select"
                >
                  <option value="">Select level</option>
                  {bloomsLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Question Type Specific Content */}
      <div className="card-body">
        {question.type === 'mcq' && (
          <MCQQuestion
            question={question}
            onChange={onChange}
            validationErrors={validation.errors}
          />
        )}
        {question.type === 'ordering' && (
          <OrderingQuestion
            question={question}
            onChange={onChange}
            validationErrors={validation.errors}
          />
        )}
        {question.type === 'hotspot' && (
          <HotspotQuestion
            question={question}
            onChange={onChange}
            validationErrors={validation.errors}
          />
        )}
      </div>

      {/* Validation Status */}
      <div className="card-footer">
        <div className={`validation-success ${
          validation.isValid ? '' : 'validation-error'
        }`}>
          {validation.isValid ? (
            <>
              <svg className="validation-success-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Question is valid</span>
            </>
          ) : (
            <>
              <svg className="validation-error-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Question has {validation.errors.length} validation error(s)</span>
            </>
          )}
        </div>
        
        {validation.errors.length > 0 && (
          <div className="validation-error">
            <h4 className="validation-error-title">Validation Errors:</h4>
            <ul className="validation-error-list">
              {validation.errors.map((error, index) => (
                <li key={index} className="validation-error-item">{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
