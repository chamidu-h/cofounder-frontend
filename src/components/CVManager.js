// src/components/CVManager.js
import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/apiService';

const CVManager = ({ onUploadSuccess }) => {
    const [currentUserCv, setCurrentUserCv] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [animationTriggered, setAnimationTriggered] = useState(false);
    const fileInputRef = useRef(null);
    const cvManagerRef = useRef(null);

    useEffect(() => {
        // Trigger entrance animation
        setTimeout(() => setAnimationTriggered(true), 200);
        
        const fetchCvInfo = async () => {
            try {
                const data = await apiService.getUserCvInfo();
                if (data.cv) {
                    setCurrentUserCv(data.cv);
                }
            } catch (err) {
                console.log("No existing CV found for user.");
            }
        };
        fetchCvInfo();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            setError('Please upload a PDF or DOCX file only.');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB.');
            return;
        }

        setSelectedFile(file);
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
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleRemoveCV = async () => {
        if (!window.confirm('Are you sure you want to remove your CV?')) {
            return;
        }

        try {
            await apiService.removeUserCv();
            setCurrentUserCv(null);
            setSuccessMessage('CV removed successfully!');
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            setError('Failed to remove CV. Please try again.');
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <section 
            ref={cvManagerRef}
            className={`cv-manager-section section-block ${animationTriggered ? 'animate-in' : ''}`}
        >
            <div className="section-header-content">
                <h3>
                    <span className="section-icon">📄</span>
                    Your CV
                </h3>
            </div>

            {/* Current CV Status */}
            {currentUserCv && (
                <div className="file-info">
                    <div className="file-details">
                        <span className="file-icon">📄</span>
                        <div className="file-meta">
                            <span className="file-name">{currentUserCv.originalFilename}</span>
                            <div className="file-stats">
                                <span className="file-size">
                                    {currentUserCv.size ? formatFileSize(currentUserCv.size) : 'Unknown size'}
                                </span>
                                <span className="file-date">
                                    Last updated: {new Date(currentUserCv.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={handleRemoveCV}
                        className="remove-file-btn"
                        title="Remove CV"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Upload Section */}
            <div className="upload-section">
                <label className="form-label">
                    {currentUserCv ? 'Upload New or Replace Existing CV (PDF/DOCX):' : 'Upload Your CV (PDF/DOCX):'}
                </label>
                
                <div 
                    className={`cv-upload-area ${dragOver ? 'dragover' : ''} ${isUploading ? 'uploading' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <div className="upload-loading">
                            <div className="loading-spinner-large"></div>
                            <p>Uploading your CV...</p>
                        </div>
                    ) : (
                        <>
                            <div className="upload-icon">📁</div>
                            <div className="upload-text">
                                <p><strong>Click to browse</strong> or drag and drop your CV here</p>
                                <small>Supports PDF and DOCX files up to 10MB</small>
                            </div>
                        </>
                    )}
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="file-input"
                    disabled={isUploading}
                />

                {selectedFile && (
                    <div className="file-info" style={{ marginTop: '1rem' }}>
                        <div className="file-details">
                            <span className="file-icon">📄</span>
                            <div className="file-meta">
                                <span className="file-name">{selectedFile.name}</span>
                                <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                setSelectedFile(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="remove-file-btn"
                            title="Remove selected file"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {selectedFile && (
                    <button 
                        onClick={handleUpload}
                        className={`btn btn-primary ${isUploading ? 'btn-loading' : ''}`}
                        disabled={isUploading}
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {isUploading ? (
                            <>
                                <span className="btn-spinner"></span>
                                Uploading...
                            </>
                        ) : (
                            <>
                                <span className="btn-icon">📤</span>
                                Upload CV
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Messages */}
            {error && (
                <div className="error-message" style={{ marginTop: '1rem' }}>
                    <span className="error-icon">⚠️</span>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="success-message" style={{ marginTop: '1rem' }}>
                    <span className="success-icon">✅</span>
                    {successMessage}
                </div>
            )}

            {/* Upload Tips */}
            {!currentUserCv && (
                <div className="upload-tips">
                    <h4>Tips for best results:</h4>
                    <ul>
                        <li>Use a clear, well-formatted CV</li>
                        <li>Include relevant keywords for your field</li>
                        <li>Keep file size under 10MB</li>
                        <li>PDF format is preferred for better parsing</li>
                    </ul>
                </div>
            )}
        </section>
    );
};

export default CVManager;
