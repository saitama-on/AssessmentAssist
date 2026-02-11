import React, { useState } from 'react';
import { MainCanvas } from './components/MainCanvas';
import { Question, AssessmentState } from './types';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/questions.css';

function App() {
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    questions: [],
    currentQuestionId: undefined,
  });

  const handleQuestionsChange = (questions: Question[]) => {
    setAssessmentState(prev => ({ ...prev, questions }));
  };

  const handleCurrentQuestionChange = (questionId?: string) => {
    setAssessmentState(prev => ({ ...prev, currentQuestionId: questionId }));
  };

  return (
    <MainCanvas
      questions={assessmentState.questions}
      onQuestionsChange={handleQuestionsChange}
      currentQuestionId={assessmentState.currentQuestionId}
      onCurrentQuestionChange={handleCurrentQuestionChange}
    />
  );
}

export default App;
