import React from 'react';
import { Question, QuestionType } from '../types';
import { QuestionEditor } from './QuestionEditor';
import { createEmptyQuestion, generateId } from '../utils/assessmentUtils';

interface MainCanvasProps {
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
  currentQuestionId?: string;
  onCurrentQuestionChange: (questionId?: string) => void;
}

export const MainCanvas: React.FC<MainCanvasProps> = ({
  questions,
  onQuestionsChange,
  currentQuestionId,
  onCurrentQuestionChange,
}) => {
  const addQuestion = (type: QuestionType) => {
    const newQuestion = createEmptyQuestion(type);
    onQuestionsChange([...questions, newQuestion]);
    onCurrentQuestionChange(newQuestion.id);
  };

  const updateQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map(q =>
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    onQuestionsChange(updatedQuestions);
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onQuestionsChange(updatedQuestions);
    
    // If the deleted question was current, select another one
    if (currentQuestionId === questionId) {
      onCurrentQuestionChange(updatedQuestions.length > 0 ? updatedQuestions[0].id : undefined);
    }
  };

  const duplicateQuestion = (question: Question) => {
    const duplicatedQuestion = {
      ...question,
      id: generateId(),
      stem: `${question.stem} (Copy)`,
    };
    onQuestionsChange([...questions, duplicatedQuestion]);
    onCurrentQuestionChange(duplicatedQuestion.id);
  };

  const saveQuestion = () => {
    // In a real application, this would save to a backend
    // For now, we'll just show a success message
    alert('Question saved successfully!');
    console.log('Question saved:', questions.find(q => q.id === currentQuestionId));
    addQuestion('mcq');
  };

  const currentQuestion = questions.find(q => q.id === currentQuestionId);

  const questionTypes = [
    { type: 'mcq' as QuestionType, label: 'Multiple Choice', icon: '🔘', description: 'Students select from multiple options' },
    { type: 'ordering' as QuestionType, label: 'Ordering', icon: '🔢', description: 'Students arrange items in correct sequence' },
    { type: 'hotspot' as QuestionType, label: 'Hotspot', icon: '🎯', description: 'Students click on specific areas' },
  ];

  return (
    <div className="main-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-inner">
            <div className="header-title-section">
              <h1 className="header-title">Assessment Authoring Tool</h1>
              <p className="header-subtitle">Create and manage assessment questions</p>
            </div>
            <div className="header-stats">
              <span className="header-stats-text">
                {questions.length} question{questions.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Add Question Section */}
        <section className="add-question-section">
          <div className="section-card">
            <h2 className="section-title">Add New Question</h2>
            <div className="question-types-grid">
              {questionTypes.map(({ type, label, icon, description }) => (
                <button
                  key={type}
                  onClick={() => addQuestion(type)}
                  className="question-type-card"
                >
                  <div className="question-type-content">
                    <span className="question-type-icon">{icon}</span>
                    <div className="question-type-info">
                      <h3>{label}</h3>
                      <p>{description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Questions Layout */}
        <section className="questions-layout">
          {questions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="empty-state-title">No questions yet</h3>
              <p className="empty-state-text">Get started by adding your first question above</p>
            </div>
          ) : (
            <div className="questions-grid">
              {/* Questions Sidebar */}
              <aside className="questions-sidebar">
                <div className="sidebar-card">
                  <div className="sidebar-header">
                    <h3 className="sidebar-title">Questions</h3>
                    <span className="question-count">{questions.length}</span>
                  </div>
                  <div className="questions-list">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className={`question-card ${
                          currentQuestionId === question.id ? 'active' : ''
                        }`}
                        onClick={() => onCurrentQuestionChange(question.id)}
                      >
                        <div className="question-card-header">
                          <div className="question-card-content">
                            <div className="question-card-badges">
                              <span className="question-number">Q{index + 1}</span>
                              <span className={`badge ${
                                question.type === 'mcq' ? 'badge-blue' :
                                question.type === 'ordering' ? 'badge-green' :
                                'badge-purple'
                              }`}>
                                {question.type.toUpperCase()}
                              </span>
                              <span className={`badge ${
                                question.purpose === 'formative' ? 'badge-gray' :
                                'badge-orange'
                              }`}>
                                {question.purpose}
                              </span>
                            </div>
                            <p className="question-card-text">
                              {question.stem || 'Untitled question'}
                            </p>
                            {question.topic && (
                              <p className="question-card-meta">
                                Topic: {question.topic}
                              </p>
                            )}
                          </div>
                          <div className="question-card-actions">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateQuestion(question);
                              }}
                              className="btn btn-secondary btn-sm"
                              title="Duplicate question"
                            >
                              📋
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteQuestion(question.id);
                              }}
                              className="btn btn-danger btn-sm"
                              title="Delete question"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Question Editor Canvas */}
              <div className="editor-canvas">
                {currentQuestion ? (
                  <QuestionEditor
                    question={currentQuestion}
                    onChange={updateQuestion}
                    onDelete={() => deleteQuestion(currentQuestion.id)}
                    onSave={saveQuestion}
                  />
                ) : (
                  <div className="card">
                    <div className="card-body empty-editor">
                      <div className="empty-state-icon">
                        <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" />
                        </svg>
                      </div>
                      <h3 className="empty-state-title">Select a question to edit</h3>
                      <p className="empty-state-text">Choose a question from the list to start editing</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
