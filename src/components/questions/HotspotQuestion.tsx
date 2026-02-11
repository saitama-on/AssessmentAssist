import React, { useState, useRef, MouseEvent, ChangeEvent } from 'react';
import { HotspotQuestion as HotspotQuestionType, HotspotZone } from '../../types';
import { generateId } from '../../utils/assessmentUtils';

interface HotspotQuestionProps {
  question: HotspotQuestionType;
  onChange: (question: HotspotQuestionType) => void;
  validationErrors?: string[];
}

export const HotspotQuestion: React.FC<HotspotQuestionProps> = ({
  question,
  onChange,
  validationErrors = [],
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentZone, setCurrentZone] = useState<{ x: number; y: number }[]>([]);
  const imageRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateStem = (stem: string) => {
    onChange({ ...question, stem });
  };

  const updateImageUrl = (imageUrl: string) => {
    onChange({ ...question, imageUrl, imageFile: undefined });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file must be less than 5MB');
      return;
    }

    // Convert file to data URL for display
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onChange({ ...question, imageUrl: dataUrl, imageFile: file });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    onChange({ ...question, imageUrl: undefined, imageFile: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (isDrawing) {
      setCurrentZone([...currentZone, { x, y }]);
    } else {
      // Start a new zone
      setIsDrawing(true);
      setCurrentZone([{ x, y }]);
    }
  };

  const finishZone = () => {
    if (currentZone.length >= 3) {
      const newZone: HotspotZone = {
        id: generateId(),
        coordinates: currentZone,
        label: `Zone ${question.zones.length + 1}`,
      };
      onChange({ ...question, zones: [...question.zones, newZone] });
    }
    setCurrentZone([]);
    setIsDrawing(false);
  };

  const cancelDrawing = () => {
    setCurrentZone([]);
    setIsDrawing(false);
  };

  const removeZone = (zoneId: string) => {
    const updatedZones = question.zones.filter(zone => zone.id !== zoneId);
    onChange({ ...question, zones: updatedZones });
  };

  const updateZoneLabel = (zoneId: string, label: string) => {
    const updatedZones = question.zones.map(zone =>
      zone.id === zoneId ? { ...zone, label } : zone
    );
    onChange({ ...question, zones: updatedZones });
  };

  const getZonePath = (coordinates: { x: number; y: number }[]) => {
    if (coordinates.length < 2) return '';
    return coordinates.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
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

      {/* Image Upload */}
      <div className="form-group">
        <label className="form-label">
          Image
        </label>
        
        <div className="space-y-2">
          {/* File Upload Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={triggerFileUpload}
              className="btn btn-secondary"
            >
              Upload Image from Local Files
            </button>
            
            {question.imageUrl && (
              <button
                type="button"
                onClick={clearImage}
                className="btn btn-danger btn-sm"
              >
                Clear Image
              </button>
            )}
          </div>
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* OR URL Input */}
          <div className="flex items-center gap-2 text-sm text-gray-500 my-2">
            <span>or</span>
          </div>
          
          <input
            type="text"
            value={question.imageUrl && !question.imageFile ? question.imageUrl : ''}
            onChange={(e) => updateImageUrl(e.target.value)}
            className="form-input"
            placeholder="Enter image URL"
            disabled={!!question.imageFile}
          />
          
          {/* File Info */}
          {question.imageFile && (
            <div className="text-sm text-gray-600">
              Uploaded: {question.imageFile.name} ({(question.imageFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
      </div>

      {/* Hotspot Drawing Area */}
      <div className="form-group">
        <label className="form-label">
          Click to Define Hotspot Zones
        </label>
        
        {/* Instructions */}
        <div className="hotspot-instructions">
          <p className="hotspot-instructions-text">
            {isDrawing 
              ? `Click to add points to your zone (${currentZone.length} points). Click "Finish Zone" when done.`
              : "Click on the image to start drawing a hotspot zone. Click multiple points to create a polygon."
            }
          </p>
        </div>

        {/* Drawing Controls */}
        {isDrawing && (
          <div className="hotspot-controls">
            <button
              onClick={finishZone}
              disabled={currentZone.length < 3}
              className="btn btn-primary btn-sm"
            >
              Finish Zone ({currentZone.length} points)
            </button>
            <button
              onClick={cancelDrawing}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Image Canvas */}
        <div
          ref={imageRef}
          onClick={handleImageClick}
          className="hotspot-canvas"
          style={{ backgroundImage: question.imageUrl ? `url(${question.imageUrl})` : undefined }}
        >
          {!question.imageUrl && (
            <div className="hotspot-canvas-placeholder">
              <div>
                <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Click to define hotspot zones</p>
              </div>
            </div>
          )}

          {/* SVG Overlay for Zones */}
          <svg className="hotspot-svg-overlay">
            {/* Existing Zones */}
            {question.zones.map((zone) => (
              <g key={zone.id}>
                <path
                  d={getZonePath(zone.coordinates)}
                  className="hotspot-zone"
                />
                <text
                  x={zone.coordinates[0]?.x || 0}
                  y={zone.coordinates[0]?.y || 0}
                  className="hotspot-zone-label"
                >
                  {zone.label}
                </text>
              </g>
            ))}

            {/* Current Drawing Zone */}
            {currentZone.length > 0 && (
              <g>
                {currentZone.map((point, index) => (
                  <circle
                    key={index}
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    className="hotspot-point"
                  />
                ))}
                {currentZone.length > 1 && (
                  <path
                    d={getZonePath(currentZone)}
                    className="hotspot-zone-drawing"
                  />
                )}
              </g>
            )}
          </svg>
        </div>
      </div>

      {/* Zone List */}
      {question.zones.length > 0 && (
        <div className="form-group">
          <label className="form-label">
            Defined Zones
          </label>
          <div className="space-y-2">
            {question.zones.map((zone) => (
              <div key={zone.id} className="hotspot-zone-item">
                <div className="hotspot-zone-content">
                  <input
                    type="text"
                    value={zone.label || ''}
                    onChange={(e) => updateZoneLabel(zone.id, e.target.value)}
                    className="hotspot-zone-input"
                    placeholder="Zone label"
                  />
                  <p className="hotspot-zone-coords">
                    {zone.coordinates.length} points: {zone.coordinates.map(p => `(${p.x},${p.y})`).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => removeZone(zone.id)}
                  className="hotspot-zone-remove"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
