// src/pages/CvMatcherPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import CVManager from '../components/CVManager';
import JobCard from '../components/JobCard';

const CvMatcherPage = () => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [matchMessage, setMatchMessage] = useState('Upload your CV and click "Find Matches" to start.');

  useEffect(() => {
    // Add entrance animation to the page
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 600);
  }, []);

  const handleFindMatches = async () => {
    setIsMatching(true);
    setMatchError('');
    setMatchMessage('');
    setMatchedJobs([]);
    
    try {
      const data = await apiService.getMatchesForUser();
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMatchedJobs(data.matchedJobs || []);
      setMatchMessage(data.message || `Found ${data.matchedJobs.length} matches.`);
    } catch (err) {
      setMatchError(err.response?.data?.message || 'Could not find matches. Ensure you have a CV uploaded.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header-section">
        <h1>CV Job Matcher</h1>
        <Link to="/jobs" className="secondary-button">View All Jobs</Link>
      </div>

      <CVManager 
        onUploadSuccess={() => setMatchMessage('CV updated! You can now find matches.')} 
      />

      <section className="match-trigger-section section-block">
        <h3>Find Your Matches</h3>
        <p>Once you have a CV on file, click the button below to analyze our job listings and find the best matches for you.</p>
        <button 
          onClick={handleFindMatches} 
          className={`primary-button large-button ${isMatching ? 'disabled-button' : ''}`}
          disabled={isMatching}
        >
          {isMatching ? (
            <>
              <span className="loading-spinner"></span>
              Analyzing...
            </>
          ) : (
            'Find Matches with My Saved CV'
          )}
        </button>
      </section>

      <section className="results-section">
        <h3>Matching Results</h3>
        <div className="results-wrapper">
          {isMatching && (
            <div className="loading">
              Searching for your perfect job...
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          {matchError && (
            <div className="error-message">
              {matchError}
            </div>
          )}
          
          {!isMatching && !matchError && (
            <>
              {matchedJobs.length === 0 && (
                <p className="info-message">{matchMessage}</p>
              )}
              <div className="job-list-container">
                {matchedJobs.map((job, index) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CvMatcherPage;
