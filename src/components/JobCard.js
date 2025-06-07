// src/components/JobCard.js
import React from 'react';
import DOMPurify from 'dompurify';

const JobCard = ({ job, matchScore = null }) => {
    // Sanitize the HTML description to prevent XSS attacks
    const sanitizedHtml = job.description_html ? DOMPurify.sanitize(job.description_html) : '<p>No description available.</p>';

    return (
        <div className="job-card section-block">
            <div className="job-card-header">
                <h3 className="job-title">{job.job_title}</h3>
                {matchScore && <span className="match-score">Match Score: {matchScore.toFixed(2)}%</span>}
            </div>
            <h4 className="company-name">{job.company_name}</h4>

            <div
                className="job-description-content"
                dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />

            <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="primary-button job-link-button">
                View & Apply
            </a>
        </div>
    );
};

export default JobCard;
