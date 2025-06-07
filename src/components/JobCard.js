// src/components/JobCard.js
import React from 'react';
import ExpandableContent from './ExpandableContent'; // Keep your existing ExpandableContent
import StructuredDescription from './StructuredDescription'; // Import our new formatter

const JobCard = ({ job, matchScore = null }) => {
    return (
        <div className="job-card section-block">
            <div className="job-card-header">
                <h3 className="job-title">{job.job_title}</h3>
                {matchScore && <span className="match-score">Match Score: {matchScore.toFixed(2)}%</span>}
            </div>
            <h4 className="company-name">{job.company_name}</h4>

            {/* Use the ExpandableContent component as before */}
            <ExpandableContent collapsedHeight="120px">
                {/*
                  Pass the raw description text from the database to our new
                  StructuredDescription component, which will handle all the formatting.
                */}
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
