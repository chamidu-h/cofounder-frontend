// src/components/JobCard.js
import React from 'react';
import ExpandableContent from './ExpandableContent';
import StructuredDescription from './StructuredDescription';

// The component now accepts `className` and `style` to allow for animations.
const JobCard = ({ job, className, style }) => {
    // Note: The internal logic remains the same.
    // The new props are simply applied to the root div of the component.
    return (
        <div className={`job-card section-block ${className || ''}`} style={style}>
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
            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="primary-button job-link-button">
                View & Apply
            </a>
        </div>
    );
};

export default JobCard;
