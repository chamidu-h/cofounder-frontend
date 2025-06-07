// src/components/JobCard.js
import React, { useEffect, useRef } from 'react';
import ExpandableContent from './ExpandableContent';
import StructuredDescription from './StructuredDescription';

const JobCard = ({ job, index = 0 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    // Add staggered animation delay based on card index
    if (cardRef.current) {
      cardRef.current.style.setProperty('--card-index', index);
      
      // Add intersection observer for scroll-triggered animations
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('fade-in-up');
            }
          });
        },
        { threshold: 0.1 }
      );
      
      observer.observe(cardRef.current);
      
      return () => observer.disconnect();
    }
  }, [index]);

  return (
    <div 
      ref={cardRef}
      className="job-card section-block"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="job-card-header">
        <h3 className="job-title">{job.job_title}</h3>
        {job.finalScore && (
          <span className="match-score">
            {(job.finalScore * 100).toFixed(0)}% Match
          </span>
        )}
      </div>
      
      <h4 className="company-name">{job.company_name}</h4>

      {job.aiAnalysis && job.aiAnalysis.reason && (
        <div className="ai-analysis-badge">
          <span className="ai-icon">🤖</span>
          AI Insight: {job.aiAnalysis.reason}
        </div>
      )}

      <ExpandableContent collapsedHeight="100px">
        <StructuredDescription
          rawText={job.description_html}
          jobTitle={job.job_title}
        />
      </ExpandableContent>

      <a 
        href={job.job_url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="primary-button job-link-button"
      >
        View & Apply
      </a>
    </div>
  );
};

export default JobCard;
