// src/pages/JobBoardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import JobCard from '../components/JobCard';

const JobBoardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Add entrance animation to the page
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      document.body.style.overflow = 'auto';
    }, 600);

    const fetchJobs = async () => {
      try {
        // Add a minimum loading time for better UX
        const [jobsData] = await Promise.all([
          apiService.getAllJobs(),
          new Promise(resolve => setTimeout(resolve, 800))
        ]);
        
        setJobs(jobsData || []);
      } catch (err) {
        setError('Failed to load job postings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  return (
    <div className="container job-board-page-container">
      <div className="page-header-section">
        <h1>Available Job Openings</h1>
        <Link to="/matcher" className="primary-button">Match Your CV</Link>
      </div>
      
      <div className="results-wrapper">
        {loading && (
          <div className="loading">
            Loading jobs...
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {!loading && !error && (
          <div className="job-list-container">
            {jobs.length > 0 ? (
              jobs.map((job, index) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  index={index}
                />
              ))
            ) : (
              <p className="info-message">
                No job openings are available at the moment. Please check back later.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBoardPage;
