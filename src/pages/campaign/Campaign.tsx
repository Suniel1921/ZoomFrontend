import React, { useEffect, useState } from 'react';
import { ArrowBigUpDash } from 'lucide-react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Campaign = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pastCampaigns, setPastCampaigns] = useState([]);

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/client/getCategories`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCategories(response.data.categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to fetch categories.');
      }
    };

    fetchCategories();
  }, []);

  const handleSendEmail = async () => {
    if (!selectedCategory || !subject || !message) {
      toast.error('Please select a category, enter a subject, and write a message.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_URL}/api/V1/client/sendEmailByCategory`,
        { category: selectedCategory, subject, message },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      toast.success(response.data.message);
      // Add the sent campaign to the past campaigns list
      setPastCampaigns([...pastCampaigns, { category: selectedCategory, subject, message, date: new Date().toLocaleString() }]);
      // Clear the form after successful submission
      setSelectedCategory('');
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Campaign Heading */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ArrowBigUpDash className="h-6 w-6 text-gray-400" />
            <h1 className="text-xl font-semibold text-gray-900">Campaign</h1>
          </div>
        </div>
      </div>

      {/* Campaign Form */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="mt-6 space-y-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select a category</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter email subject"
            />
          </div>

          {/* Rich Text Editor for Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <ReactQuill
              value={message}
              onChange={setMessage}
              modules={{
                toolbar: [
                  [{ header: [1, 2, 3, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  ['clean'],
                ],
              }}
              placeholder="Write your email message here..."
              className="bg-white rounded-md h-64"
            />
          </div>

          {/* Send Email Button */}
          <button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="px-4 py-2 mt-64 bg-[#fedc00] text-black rounded-md hover:bg-[#f0d000] flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <ClipLoader size={20} color="#000000" className="mr-2" />
                Sending...
              </>
            ) : (
              'Send Email'
            )}
          </button>
        </div>
      </div>

      {/* Past Campaigns Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Past Campaigns</h2>
        {pastCampaigns.length > 0 ? (
          <div className="space-y-4">
            {pastCampaigns.map((campaign, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <div className="text-sm text-gray-500">{campaign.date}</div>
                <div className="font-semibold text-gray-900">{campaign.subject}</div>
                <div className="text-sm text-gray-700">{campaign.category}</div>
                <div className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: campaign.message }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">No past campaigns to display.</div>
        )}
      </div>
    </div>
  );
};

export default Campaign;