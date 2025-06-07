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
        const fetchJobs = async () => {
            try {
                const jobsData = await apiService.getAllJobs();
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
        <div className="container job-board-page-container"> {/* New class for grid targeting */}
            <div className="page-header-section">
                <h1>Available Job Openings</h1>
                <Link to="/matcher" className="primary-button">Match Your CV</Link>
            </div>
            <div className="results-wrapper"> {/* New wrapper for visual grouping */}
                {loading && <div className="loading">Loading jobs...</div>}
                {error && <div className="error-message">{error}</div>}
                {!loading && !error && (
                    <>
                        {jobs.length > 0 ? (
                            <div className="job-list-container">
                                {jobs.map((job, index) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        className="fade-in-up"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="info-message">No job openings are available at the moment. Please check back later.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default JobBoardPage;
