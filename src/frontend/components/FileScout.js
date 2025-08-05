import React, { useState } from 'react';
import {
    createFile, deleteFile, deleteDuplicates, keywordSearch,
    countWords, loadFilesFromDirectory, writeFile
} from '../services/FileScoutService';
import './FileScout.css';

const FileScout = () => {
    const [files, setFiles] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [wordCountResults, setWordCountResults] = useState([]);
    const [directory, setDirectory] = useState('');
    const [message, setMessage] = useState('');
    const [isDirectoryLoaded, setIsDirectoryLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [messageType, setMessageType] = useState('info');

    const showMessage = (msg, type = 'info') => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => setMessage(''), 5000);
    };

    const handleLoadFilesFromDirectory = async () => {
        if (!directory.trim()) {
            showMessage('Please enter a directory path', 'error');
            return;
        }
        
        setIsLoading(true);
        try {
            const encodedDirectoryPath = encodeURIComponent(directory);
            const response = await loadFilesFromDirectory(encodedDirectoryPath);
            const fileList = response.data.map(file => ({
                fileName: file.fileName,
                wordCount: file.wordCount,
                charCount: file.charCount
            }));
            setFiles(fileList);
            showMessage(`✅ Successfully loaded ${fileList.length} files from directory`, 'success');
            setIsDirectoryLoaded(true);
        } catch (error) {
            showMessage('❌ Error loading files from directory', 'error');
            console.error('Error loading files from the directory:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateFile = async (fileName, fileContent) => {
        try {
            await createFile(fileName, fileContent);
            setMessage(`File ${fileName} created successfully`);
            handleLoadFilesFromDirectory();
        } catch (error) {
            setMessage(`Error creating file ${fileName}: ${error.response?.data?.message || error.message}`);
            console.error('Error creating file:', error);
        }
    };

    const handleDeleteFile = async (fileName) => {
        try {
            await deleteFile(fileName);
            setMessage(`File ${fileName} deleted successfully`);
            handleLoadFilesFromDirectory();
        } catch (error) {
            setMessage(`Error deleting file ${fileName}: ${error.response?.data?.message || error.message}`);
            console.error('Error deleting file:', error);
        }
    };

    const handleDeleteDuplicates = async () => {
        try {
            await deleteDuplicates();
            setMessage('Duplicates deleted successfully');
            handleLoadFilesFromDirectory();
        } catch (error) {
            setMessage(`Error deleting duplicates: ${error.response?.data?.message || error.message}`);
            console.error('Error deleting duplicates:', error);
        }
    };

    const handleKeywordSearch = async () => {
        try {
            const response = await keywordSearch(keyword);
            setSearchResults(response.data);
            if (response.data.length === 0) {
                setMessage('No files found containing the keyword');
            } else {
                setMessage('Search completed');
            }
        } catch (error) {
            setMessage(`Error searching keyword: ${error.response?.data?.message || error.message}`);
            console.error('Error searching keyword:', error);
        }
    };

    const handleCountWords = async (fileName, numThreads) => {
        try {
            const response = await countWords(fileName, numThreads);
            if (Array.isArray(response.data)) {
                setWordCountResults(response.data.map((entry) => {
                    const [word, count] = entry.split(': ');
                    return { word, count: parseInt(count, 10) };
                }));
                setMessage('Word count completed');
            }
        } catch (error) {
            setMessage(`Error counting words: ${error.response?.data?.message || error.message}`);
            console.error('Error counting words:', error);
        }
    };

    const handleWriteFile = async (fileName, content) => {
        try {
            await writeFile(fileName, content);
            setMessage(`Content written to file ${fileName} successfully`);
            handleLoadFilesFromDirectory();
        } catch (error) {
            setMessage(`Error writing to file ${fileName}: ${error.response?.data?.message || error.message}`);
            console.error('Error writing to file:', error);
        }
    };

    return (
        <div className="file-scout">
            <h1>🗂️ FileScout</h1>
            {message && <div className={`message ${messageType}`}>{message}</div>}

            <div className="row">
                <div className="column">
                    <h2 className="directory">Select Directory</h2>
                    <p>First step! Enter the path of the directory to load text-based files from.</p>
                    <input
                        type="text"
                        value={directory}
                        onChange={(e) => setDirectory(e.target.value)}
                        placeholder="C:\Users\User\OneDrive\Projects\FileScout"
                    />
                    <button 
                        onClick={handleLoadFilesFromDirectory}
                        disabled={isLoading}
                        className={isLoading ? 'loading' : ''}
                    >
                        {isLoading ? 'Loading...' : '📂 Load Files from Directory'}
                    </button>
                </div>

                <div className="column">
                    <h2>📄 Files Overview</h2>
                    <p>Directory contents with word and character counts.</p>
                    {files && files.length > 0 ? (
                        <ul>
                            {files.map((file, index) => (
                                <li key={index}>
                                    <strong>📄 {file.fileName}</strong>
                                    <div>📝 Words: {file.wordCount.toLocaleString()}</div>
                                    <div>🔤 Characters: {file.charCount.toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No files found in directory</p>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <h2 className="create">Create New File</h2>
                    <p>Create a new file with custom content.</p>
                    <input 
                        type="text" 
                        placeholder="📄 newFile.txt" 
                        id="fileName" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <textarea 
                        placeholder="✏️ Enter your file content here..." 
                        id="fileContent" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <button 
                        onClick={() => handleCreateFile(document.getElementById('fileName').value, document.getElementById('fileContent').value)} 
                        disabled={!isDirectoryLoaded}
                    >
                        ➕ Create File
                    </button>
                </div>

                <div className="column">
                    <h2 className="delete">Delete File</h2>
                    <p>Remove a specific file from the directory.</p>
                    <input 
                        type="text" 
                        placeholder="🗑️ File Name.txt to Delete" 
                        id="deleteFileName" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <button 
                        onClick={() => handleDeleteFile(document.getElementById('deleteFileName').value)} 
                        disabled={!isDirectoryLoaded}
                    >
                        🗑️ Delete File
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <h2 className="duplicate">Remove Duplicates</h2>
                    <p>Automatically detect and remove duplicate files.</p>
                    <button 
                        onClick={handleDeleteDuplicates} 
                        disabled={!isDirectoryLoaded}
                    >
                        🔄 Clean Duplicates
                    </button>
                </div>

                <div className="column">
                    <h2 className="search">Keyword Search</h2>
                    <p>Find files containing specific keywords.</p>
                    <input 
                        type="text" 
                        placeholder="🔍 Enter keyword to search..." 
                        value={keyword} 
                        onChange={(e) => setKeyword(e.target.value)} 
                        disabled={!isDirectoryLoaded} 
                    />
                    <button 
                        onClick={handleKeywordSearch} 
                        disabled={!isDirectoryLoaded}
                    >
                        🔍 Search Files
                    </button>
                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h3>Search Results</h3>
                            <ul>
                                {searchResults.map((result, index) => (
                                    <li key={index}>📄 {result}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="row">
                <div className="column">
                    <h2 className="count">Word Frequency Analysis</h2>
                    <p>Analyze the most common words in a file using multithreading.</p>
                    <input 
                        type="text" 
                        placeholder="📄 File Name" 
                        id="countFileName" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <input 
                        type="number" 
                        placeholder="🧵 Number of Threads (1-10)" 
                        id="numThreads" 
                        min="1" 
                        max="10" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <button 
                        onClick={() => handleCountWords(document.getElementById('countFileName').value, document.getElementById('numThreads').value)} 
                        disabled={!isDirectoryLoaded}
                    >
                        📊 Analyze Words
                    </button>
                    {wordCountResults.length > 0 && (
                        <div className="word-count-results">
                            <h3>Top 10 Most Frequent Words</h3>
                            <ul>
                                {wordCountResults.map((result, index) => (
                                    <li key={index}>
                                        <span>🏆 {result.word}</span>
                                        <strong>{result.count} times</strong>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="column">
                    <h2 className="write">Append to File</h2>
                    <p>Add new content to the end of an existing file.</p>
                    <input 
                        type="text" 
                        placeholder="📄 File Name.txt" 
                        id="writeFileName" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <textarea 
                        placeholder="✏️ Content to append..." 
                        id="writeContent" 
                        disabled={!isDirectoryLoaded} 
                    />
                    <button 
                        onClick={() => handleWriteFile(document.getElementById('writeFileName').value, document.getElementById('writeContent').value)} 
                        disabled={!isDirectoryLoaded}
                    >
                        ✏️ Append Content
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileScout;