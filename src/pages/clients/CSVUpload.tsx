import React, { useState } from 'react';
import axios from 'axios';

function CSVUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('csvFile', file); // Send only the CSV file

    try {
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/uploadCsvFile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('CSV data imported successfully');
    } catch (err) {
      console.error('Error uploading CSV:', err); // Log the error for debugging
      alert('Error importing CSV data');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit">Upload CSV</button>
      </form>
    </div>
  );
}

export default CSVUpload;


// this component is just for testing purpose of csv file upload