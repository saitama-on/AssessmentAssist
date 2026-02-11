import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import { OrderingQuestion as OrderingQuestionType } from '../../types';
import { generateId } from '../../utils/assessmentUtils';

interface OrderingQuestionProps {
  question: OrderingQuestionType;
  onChange: (question: OrderingQuestionType) => void;
  validationErrors?: string[];
}

export const OrderingQuestion: React.FC<OrderingQuestionProps> = ({
  question,
  onChange,
  validationErrors = [],
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateStem = (stem: string) => {
    onChange({ ...question, stem });
  };

  const updateItem = (itemId: string, text: string) => {
    const updatedItems = question.items.map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    onChange({ ...question, items: updatedItems });
  };

  const addItem = () => {
    const newItem = {
      id: generateId(),
      text: '',
      order: question.items.length,
    };
    onChange({ ...question, items: [...question.items, newItem] });
  };

  const removeItem = (itemId: string) => {
    if (question.items.length > 2) {
      const updatedItems = question.items
        .filter(item => item.id !== itemId)
        .map((item, index) => ({ ...item, order: index }));
      onChange({ ...question, items: updatedItems });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = question.items.findIndex(item => item.id === active.id);
      const newIndex = question.items.findIndex(item => item.id === over.id);
      
      const reorderedItems = arrayMove(question.items, oldIndex, newIndex)
        .map((item, index) => ({ ...item, order: index }));
      
      onChange({ ...question, items: reorderedItems });
    }
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

      {/* Ordering Items */}
      <div className="form-group">
        <label className="form-label">
          Items to Order (drag to reorder)
        </label>
        <div className="ordering-items-container">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={question.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {question.items.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    index={index}
                    onUpdate={(text) => updateItem(item.id, text)}
                    onRemove={() => removeItem(item.id)}
                    canRemove={question.items.length > 2}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        
        <button
          onClick={addItem}
          className="ordering-add-item"
        >
          + Add Item
        </button>
      </div>

      {/* Order Display */}
      <div className="ordering-preview">
        <h4 className="ordering-preview-title">Current Order:</h4>
        <ol className="ordering-preview-list space-y-1">
          {question.items.map((item, index) => (
            <li key={item.id} className="ordering-preview-item">
              {item.text || `Item ${index + 1}`}
            </li>
          ))}
        </ol>
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
