import React from 'react';

export default function TagList({ title, tags }) {
  return (
    <section>
      <h3>{title}</h3>
      <div className="tag-list">
        {tags.map((tag, i) => (
          <span key={i} className="tag">{tag}</span>
        ))}
      </div>
    </section>
  );
}
