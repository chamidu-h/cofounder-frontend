// src/pages/CvMatcherPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import CVManager from '../components/CVManager';
import JobCard from '../components/JobCard';

const CvMatcherPage = () => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [matchMessage, setMatchMessage] = useState('Upload your CV and click "Find Matches" to start.');
  const [animationTriggered, setAnimationTriggered] = useState(false);
  const pageRef = useRef(null);

  useEffect(() => {
    // Trigger entrance animations
    setTimeout(() => setAnimationTriggered(true), 300);
  }, []);

  const handleFindMatches = useCallback(async () => {
    setIsMatching(true);
    setMatchError('');
    setMatchMessage('');
    setMatchedJobs([]);
    
    try {
      const data = await apiService.getMatchesForUser();
      
      // Add a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMatchedJobs(data.matchedJobs || []);
      setMatchMessage(data.message || `Found ${data.matchedJobs.length} matches.`);
    } catch (err) {
      setMatchError(err.response?.data?.message || 'Could not find matches. Ensure you have a CV uploaded.');
    } finally {
      setIsMatching(false);
    }
  }, []);

  const handleUploadSuccess = useCallback(() => {
    setMatchMessage('CV updated! You can now find matches.');
    setMatchError('');
  }, []);

  return (
    <div 
      ref={pageRef}
      className={`profile-page-container ${animationTriggered ? 'animate-in' : ''}`}
    >
      {/* Enhanced Page Header */}
      <div className="profile-page-header">
        <div className="header-content">
          <div className="cv-matcher-title-section">
            <h1 className="page-title">CV Job Matcher</h1>
            <div className="matcher-subtitle">
              <span className="subtitle-icon">🎯</span>
              <span>AI-powered job matching for your career</span>
            </div>
          </div>
          
          <div className="header-actions">
            <Link to="/jobs" className="btn btn-secondary">
              <span className="btn-icon">📋</span>
              View All Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* CV Manager Section */}
      <div className="cv-manager-wrapper">
        <CVManager onUploadSuccess={handleUploadSuccess} />
      </div>

      {/* Find Matches Section */}
      <section className="section-block matcher-trigger-section">
        <div className="section-header-content">
          <h3>
            <span className="section-icon">🔍</span>
            Find Your Matches
          </h3>
          <div className="section-description">
            <p>Once you have a CV on file, click the button below to analyze our job listings and find the best matches for you.</p>
          </div>
        </div>
        
        <div className="matcher-action-container">
          <button 
            onClick={handleFindMatches} 
            className={`btn btn-primary matcher-button ${isMatching ? 'btn-loading' : ''}`}
            disabled={isMatching}
          >
            {isMatching ? (
              <>
                <span className="btn-spinner"></span>
                Analyzing your CV...
              </>
            ) : (
              <>
                <span className="btn-icon">✨</span>
                Find Matches with My Saved CV
              </>
            )}
          </button>
          
          {!isMatching && (
            <div className="matcher-features">
              <div className="feature-item">
                <span className="feature-icon">🤖</span>
                <span className="feature-text">AI-powered analysis</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span className="feature-text">Match score calculation</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span className="feature-text">Instant results</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="section-block results-section">
        <div className="section-header-content">
          <h3>
            <span className="section-icon">🎯</span>
            Matching Results
          </h3>
          {matchedJobs.length > 0 && !isMatching && !matchError && (
            <div className="results-count-badge">
              <span className="count-icon">📈</span>
              <span>{matchedJobs.length} matches found</span>
            </div>
          )}
        </div>
        
        <div className="results-content">
          {isMatching && (
            <div className="section-loading">
              <div className="loading-spinner-large"></div>
              <p>Searching for your perfect job...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          {matchError && (
            <div className="section-error">
              <span className="error-icon">⚠️</span>
              <div className="error-content">
                <h4>Matching Failed</h4>
                <p>{matchError}</p>
              </div>
            </div>
          )}
          
          {!isMatching && !matchError && matchedJobs.length === 0 && (
            <div className="section-empty">
              <span className="empty-icon">📄</span>
              <div className="empty-content">
                <h4>No Matches Yet</h4>
                <p>{matchMessage}</p>
                <small>Upload your CV and click "Find Matches" to discover opportunities!</small>
              </div>
            </div>
          )}
          
          {!isMatching && !matchError && matchedJobs.length > 0 && (
            <div className="job-list-container">
              {matchedJobs.map((job, index) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CvMatcherPage;
