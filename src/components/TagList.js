import React from 'react';

export default function TagList({ title, tags }) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return null;
  }

  return (
    <section className="section-block tag-list-section">
      <h3 className="section-header">
        <span className="section-icon" aria-hidden="true">🏷️</span>
        {title}
      </h3>
      <div className="tag-list">
        {tags.map((tag, i) => (
          <span key={i} className="tag accent-tag">{tag}</span>
        ))}
      </div>
    </section>
  );
}
