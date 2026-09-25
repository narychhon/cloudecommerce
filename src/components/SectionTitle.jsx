import React from 'react';
import { ArrowRight } from 'lucide-react';

export function SectionTitle({ eyebrow, title, action, onAction }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {action && (
        <button className="text-action" type="button" onClick={onAction}>
          {action}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default SectionTitle;
