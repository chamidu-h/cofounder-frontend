// src/components/CVManager.js
import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const CVManager = ({ onUploadSuccess }) => {
    const [currentUserCv, setCurrentUserCv] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchCvInfo = async () => {
            try {
                const data = await apiService.getUserCvInfo();
                if (data.cv) {
                    setCurrentUserCv(data.cv);
                }
            } catch (err) {
                // It's okay if this fails (e.g., 404 Not Found), means no CV yet.
                console.log("No existing CV found for user.");
            }
        };
        fetchCvInfo();
    }, []);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
        setError('');
        setSuccessMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a file first.');
            return;
        }
        setIsUploading(true);
        setError('');
        setSuccessMessage('');

        const formData = new FormData();
        formData.append('cvFile', selectedFile);

        try {
            const data = await apiService.uploadUserCv(formData);
            setSuccessMessage(data.message || 'CV uploaded successfully!');
            setCurrentUserCv(data.cv);
            setSelectedFile(null); // Reset file input
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <section className="cv-manager-section section-block">
            <h3>Your CV</h3>
            <div className="cv-status">
                {currentUserCv ? (
                    <p>Current CV on file: <strong>{currentUserCv.originalFilename}</strong> (Last updated: {new Date(currentUserCv.updatedAt).toLocaleDateString()})</p>
                ) : (
                    <p className="info-message">You have not uploaded a CV yet.</p>
                )}
            </div>
            <form onSubmit={handleUpload} className="upload-form">
                <label htmlFor="cv-upload">Upload New or Replace Existing CV (PDF/DOCX):</label>
                <div className="upload-controls">
                    <input id="cv-upload" type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                    <button type="submit" className="secondary-button" disabled={isUploading || !selectedFile}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </form>
            {error && <div className="error-message" style={{marginTop: '1rem'}}>{error}</div>}
            {successMessage && <div className="success-message" style={{marginTop: '1rem'}}>{successMessage}</div>}
        </section>
    );
};

export default CVManager;
