import React from 'react';
import { MCQQuestion as MCQQuestionType, Purpose } from '../../types';
import { generateId } from '../../utils/assessmentUtils';

interface MCQQuestionProps {
  question: MCQQuestionType;
  onChange: (question: MCQQuestionType) => void;
  validationErrors?: string[];
}

export const MCQQuestion: React.FC<MCQQuestionProps> = ({
  question,
  onChange,
  validationErrors = [],
}) => {
  const updateStem = (stem: string) => {
    onChange({ ...question, stem });
  };

  const updateOption = (optionId: string, field: 'text' | 'isCorrect' | 'feedback', value: string | boolean) => {
    const updatedOptions = question.options.map(opt =>
      opt.id === optionId ? { ...opt, [field]: value } : opt
    );
    onChange({ ...question, options: updatedOptions });
  };

  const addOption = () => {
    const newOption = {
      id: generateId(),
      text: '',
      isCorrect: false,
      feedback: '',
    };
    onChange({ ...question, options: [...question.options, newOption] });
  };

  const removeOption = (optionId: string) => {
    if (question.options.length > 2) {
      const updatedOptions = question.options.filter(opt => opt.id !== optionId);
      onChange({ ...question, options: updatedOptions });
    }
  };

  const setCorrectOption = (optionId: string) => {
    const updatedOptions = question.options.map(opt =>
      ({ ...opt, isCorrect: opt.id === optionId })
    );
    onChange({ ...question, options: updatedOptions });
  };

  return (
    <div className="space-y-4">
      {/* Question Stem */}
      <div className="form-group">
        <label className="form-label">
          Question Stem
        </label>
        <textarea
          value={question.stem}
          onChange={(e) => updateStem(e.target.value)}
          className="form-textarea"
          rows={3}
          placeholder="Enter your question here..."
        />
      </div>

      {/* Options */}
      <div className="form-group">
        <label className="form-label">
          Answer Options
        </label>
        <div className="mcq-options-container">
          {question.options.map((option, index) => (
            <div key={option.id} className="mcq-option">
              <div className="mcq-option-header">
                <div className="mcq-option-radio">
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={option.isCorrect}
                    onChange={() => setCorrectOption(option.id)}
                  />
                  <span className="mcq-option-radio-label">Correct</span>
                </div>
                
                <div className="mcq-option-content">
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, 'text', e.target.value)}
                    className="mcq-option-input"
                    placeholder={`Option ${index + 1}`}
                  />
                  
                  {question.purpose === 'formative' && (
                    <input
                      type="text"
                      value={option.feedback || ''}
                      onChange={(e) => updateOption(option.id, 'feedback', e.target.value)}
                      className="mcq-option-feedback"
                      placeholder="Feedback for this option (required for formative)"
                    />
                  )}
                </div>
                
                {question.options.length > 2 && (
                  <button
                    onClick={() => removeOption(option.id)}
                    className="mcq-option-remove"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <button
          onClick={addOption}
          className="mcq-add-option"
        >
          + Add Option
        </button>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="validation-error">
          <h4 className="validation-error-title">Validation Errors:</h4>
          <ul className="validation-error-list space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="validation-error-item">{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
