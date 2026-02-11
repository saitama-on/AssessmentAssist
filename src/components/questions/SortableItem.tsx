import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { OrderingItem } from '../../types';

interface SortableItemProps {
  id: string;
  item: OrderingItem;
  index: number;
  onUpdate: (text: string) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  item,
  index,
  onUpdate,
  onRemove,
  canRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="ordering-item"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="ordering-drag-handle"
      >
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      {/* Order Number */}
      <div className="ordering-item-number">
        {index + 1}
      </div>

      {/* Text Input */}
      <input
        type="text"
        value={item.text}
        onChange={(e) => onUpdate(e.target.value)}
        className="ordering-item-input"
        placeholder={`Item ${index + 1}`}
      />

      {/* Remove Button */}
      {canRemove && (
        <button
          onClick={onRemove}
          className="ordering-item-remove"
        >
          Remove
        </button>
      )}
    </div>
  );
};
