import React from 'react';

export default function ProjectInsights({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <section className="section-block profile-empty-state">
        <div className="empty-icon" aria-hidden="true">🚀</div>
        <p>No project insights available.</p>
      </section>
    );
  }

  return (
    <section className="section-block project-insights-section">
      <h3 className="section-header">
        <span className="section-icon" aria-hidden="true">🚀</span>
        Project Insights
      </h3>
      <div className="projects-grid">
        {items.map((p, i) => (
          <div key={i} className="project-card">
            <h4 className="project-title">{p.name}</h4>
            <p className="project-highlight">{p.highlight}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
