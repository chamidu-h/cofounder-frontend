import React from 'react';

export default function ProjectInsights({ items }) {
  return (
    <section>
      <h3>Project Insights</h3>
      <div className="projects">
        {items.map((p, i) => (
          <div key={i} className="project-card">
            <h4>{p.name}</h4>
            <p>{p.highlight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
