import React, { useState, useEffect } from 'react';
import { PlusCircle, Loader2, Trash2, Download, AlertCircle, FileText, PhoneCall, Search, Pencil, NotebookTabs, Notebook } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Input from '../../components/Input';

interface CallLog {
    _id: string;
    name: string;
    phone: string;
    purpose: string;
    followUp: string;
    handler: string;
    remarks: 'Done' | 'Working on it' | 'Stuck' | 'Complete';
    date: string;
    createdAt: string;
    updatedAt: string;
    notes: string[];
}

interface NewCallLog {
    name: string;
    phone: string;
    purpose: string;
    handler: string;
    followUp: string;
    remarks: 'Done' | 'Working on it' | 'Stuck' | 'Complete';
    date: string;
}

const INITIAL_NEW_ROW: NewCallLog = {
    name: '',
    phone: '',
    purpose: '',
    handler: '',
    followUp: 'No',
    remarks: 'Working on it',
    date: '',
};

const CallLogs: React.FC = () => {
    const [rows, setRows] = useState<CallLog[]>([]);
    const [newRow, setNewRow] = useState<NewCallLog>(INITIAL_NEW_ROW);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [handlers, setHandlers] = useState<{ id: string; name: string }[]>([]);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCallLog, setSelectedCallLog] = useState<CallLog | null>(null);
    const [notesInput, setNotesInput] = useState<string>('');
    const rowsPerPage = 20;
    const [searchQuery, setSearchQuery] = useState("");

    const fetchCallLogs = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('token') || '{}');
            const token = userData.token;

            if (!token) {
                throw new Error('Token not found. Please log in again.');
            }

            const response = await fetch(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/get-all-call-logs`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const responseData = await response.json();
            setRows(responseData.callLogs || []);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch call logs';
            setError(message);
            toast.error(message);
        }
    };

    useEffect(() => {
        fetchCallLogs();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this call log?')) {
            return;
        }

        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('token') || '{}');
            const token = userData?.token;

            if (!token) {
                throw new Error('Please login first');
            }

            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/delete-callLogs/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            setRows((prevRows) => prevRows.filter((row) => row._id !== id));
            toast.success('Call log deleted successfully');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete call log';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const csvContent = [
            ['Name', 'Phone', 'Purpose', 'Handler', 'Follow Up', 'Remarks', 'Date'],
            ...rows.map((row) => [
                row.name,
                row.phone,
                row.purpose,
                row.handler,
                row.followUp,
                row.remarks,
                format(new Date(row.createdAt), 'yyyy-MM-dd HH:mm:ss')
            ])
        ]
            .map((row) => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `call_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleInputChange = async (
        id: string,
        field: keyof Omit<CallLog, '_id'>,
        value: string
    ) => {
        setRows((prevRows) =>
            prevRows.map((row) =>
                row._id === id ? { ...row, [field]: value } : row
            )
        );

        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('token') || '{}');
            const token = userData?.token;

            if (!token) {
                throw new Error('Please login first');
            }

            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/update-callLogs/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ [field]: value }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const responseData = await response.json();
            if (!responseData.success) {
                throw new Error(responseData.message);
            }
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update call log';
            setError(message);
            fetchCallLogs();
        } finally {
            setLoading(false);
        }
    };

    const handleNewRowChange = (field: keyof NewCallLog, value: string) => {
        setNewRow((prev) => ({ ...prev, [field]: value }));
    };

    const addNewRow = async () => {
        if (!newRow.name || !newRow.phone || !newRow.purpose || !newRow.handler || !newRow.followUp) {
            const message = 'Please fill in all required fields';
            setError(message);
            toast.error(message);
            return;
        }

        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('token') || '{}');
            const token = userData?.token;

            if (!token) {
                throw new Error('Please login first');
            }

            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/create-callLogs`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newRow),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const responseData = await response.json();
            if (responseData.success) {
                setRows((prevRows) => [...prevRows, responseData.callLogs]);
                setNewRow(INITIAL_NEW_ROW);
                setError(null);
                toast.success('Call log added successfully');
            } else {
                throw new Error(responseData.message);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to add new row';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchHandlers = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_REACT_APP_URL}/api/v1/admin/getAllAdmin`
                );
                setHandlers(response.data.admins);
            } catch (error: any) {
                console.error("Failed to fetch handlers:", error);
                toast.error(error.response?.data?.message || 'Failed to fetch handlers');
            }
        };

        fetchHandlers();
    }, []);

    const validatePhoneNumber = (value: string): boolean => {
        return /^\d+$/.test(value);
    };

    const handlePhoneChange = (value: string, id?: string) => {
        if (value && !validatePhoneNumber(value)) {
            setPhoneError('Only numbers are allowed');
            return;
        }
        setPhoneError(null);

        if (id) {
            handleInputChange(id, 'phone', value);
        } else {
            handleNewRowChange('phone', value);
        }
    };

    const handlePhoneClick = (phone: string) => {
        if (phone) {
            window.open(`viber://chat?number=${phone}`, '_blank');
        }
    };

    const getFollowUpColor = (value: string) => {
        switch (value) {
            case 'Yes':
                return 'bg-red-50 text-red-900';
            case 'No':
                return 'bg-green-50 text-green-900';
            default:
                return 'bg-gray-50 text-gray-900';
        }
    };

    const getRemarksColor = (value: string) => {
        switch (value) {
            case 'Done':
                return 'bg-green-50 text-green-900';
            case 'Working on it':
                return 'bg-blue-50 text-blue-900';
            case 'Stuck':
                return 'bg-red-50 text-red-900';
            case 'Complete':
                return 'bg-purple-50 text-purple-900';
            default:
                return 'bg-gray-50 text-gray-900';
        }
    };

    const filterRows = (rows: CallLog[], query: string) => {
        if (!query) return rows;

        return rows.filter((row) =>
            Object.values(row).some((value) =>
                String(value).toLowerCase().includes(query.toLowerCase())
            )
        );
    };

    const filteredRows = filterRows(rows, searchQuery);
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const handleNotesClick = (callLog: CallLog) => {
        setSelectedCallLog(callLog);
        setNotesInput(callLog.notes?.join('\n') || '');
    };

    const handleNotesUpdate = async () => {
        if (!selectedCallLog) return;

        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('token') || '{}');
            const token = userData?.token;

            if (!token) {
                throw new Error('Please login first');
            }

            const response = await fetch(
                `${import.meta.env.VITE_REACT_APP_URL}/api/v1/callLogs/update-notes/${selectedCallLog._id}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ notes: notesInput.split('\n') }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message);
            }

            const responseData = await response.json();
            if (responseData.success) {
                setRows((prevRows) =>
                    prevRows.map((row) =>
                        row._id === selectedCallLog._id ? { ...row, notes: notesInput.split('\n') } : row
                    )
                );
                setSelectedCallLog(null);
                setNotesInput('');
                toast.success('Notes updated successfully');
            } else {
                throw new Error(responseData.message);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update notes';
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PhoneCall className="h-6 w-6 text-gray-400" />
                        <h1 className="text-xl font-semibold text-gray-900">
                            Call Logs
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search designs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#fedc00] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        {loading && (
                            <div className="flex items-center text-gray-500">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-300">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handler</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Follow Up</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="bg-gray-50">
                            <td className="px-6 py-4">
                                <input
                                    className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                    value={newRow.name}
                                    onChange={(e) => handleNewRowChange('name', e.target.value)}
                                    placeholder="Name"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <div className="space-y-1">
                                    <input
                                        className={`w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 bg-white transition duration-200 ease-in-out ${
                                            phoneError ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'
                                        }`}
                                        value={newRow.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        onClick={() => newRow.phone && handlePhoneClick(newRow.phone)}
                                        placeholder="Phone"
                                        type="tel"
                                    />
                                    {phoneError && (
                                        <p className="text-xs text-red-500">{phoneError}</p>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <input
                                    className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                    value={newRow.purpose}
                                    onChange={(e) => handleNewRowChange('purpose', e.target.value)}
                                    placeholder="Purpose"
                                />
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                    value={newRow.handler}
                                    onChange={(e) => handleNewRowChange('handler', e.target.value)}
                                >
                                    <option value="">Select handler</option>
                                    {handlers.map((handler) => (
                                        <option key={handler.id} value={handler.name}>
                                            {handler.name}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    className={`w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${getFollowUpColor(newRow.followUp)} transition duration-200 ease-in-out`}
                                    value={newRow.followUp}
                                    onChange={(e) => handleNewRowChange('followUp', e.target.value as CallLog['followUp'])}
                                >
                                    <option value="No" className="bg-green-50">No</option>
                                    <option value="Yes" className="bg-red-50">Yes</option>
                                </select>
                            </td>
                            <td className="px-6 py-4">
                                <select
                                    className={`w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${getRemarksColor(newRow.remarks)} transition duration-200 ease-in-out`}
                                    value={newRow.remarks}
                                    onChange={(e) => handleNewRowChange('remarks', e.target.value as CallLog['remarks'])}
                                >
                                    <option value="Done" className="bg-green-50">Done</option>
                                    <option value="Working on it" className="bg-blue-50">Working on it</option>
                                    <option value="Stuck" className="bg-red-50">Stuck</option>
                                    <option value="Complete" className="bg-purple-50">Complete</option>
                                </select>
                            </td>
                            <td></td>
                            <td className="px-6 py-4">
                                <button
                                    onClick={addNewRow}
                                    disabled={loading || !!phoneError}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#fedc00] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition duration-200 ease-in-out whitespace-nowrap"
                                >
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    <span>Add New</span>
                                </button>
                            </td>
                        </tr>
                        {currentRows.map((row) => (
                            <tr key={row._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <input
                                        className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                        value={row.name}
                                        onChange={(e) => handleInputChange(row._id, 'name', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                        value={row.phone}
                                        onChange={(e) => handlePhoneChange(e.target.value, row._id)}
                                        onClick={() => handlePhoneClick(row.phone)}
                                        type="tel"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                        value={row.purpose}
                                        onChange={(e) => handleInputChange(row._id, 'purpose', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="w-full h-9 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                                        value={row.handler}
                                        onChange={(e) => handleInputChange(row._id, 'handler', e.target.value)}
                                    >
                                        {handlers.map((handler) => (
                                            <option key={handler.id} value={handler.name}>
                                                {handler.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className={`w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${getFollowUpColor(row.followUp)} transition duration-200 ease-in-out`}
                                        value={row.followUp}
                                        onChange={(e) => handleInputChange(row._id, 'followUp', e.target.value as CallLog['followUp'])}
                                    >
                                        <option value="No" className="bg-green-50">No</option>
                                        <option value="Yes" className="bg-red-50">Yes</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className={`w-full h-10 px-3 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${getRemarksColor(row.remarks)} transition duration-200 ease-in-out`}
                                        value={row.remarks}
                                        onChange={(e) => handleInputChange(row._id, 'remarks', e.target.value as CallLog['remarks'])}
                                    >
                                        <option value="Done" className="bg-green-50">Done</option>
                                        <option value="Working on it" className="bg-blue-50">Working on it</option>
                                        <option value="Stuck" className="bg-red-50">Stuck</option>
                                        <option value="Complete" className="bg-purple-50">Complete</option>
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {format(new Date(row.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleDelete(row._id)}
                                            className="inline-flex items-center p-1.5 border border-red-200 rounded-md hover:bg-red-50 transition-colors duration-200"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-10 h-4 text-red-500" />
                                        </button>
                                        <button
                                            onClick={() => handleNotesClick(row)}
                                            className="inline-flex items-center p-1.5 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors duration-200"
                                            title="Notes"
                                        >
                                            <Notebook className="w-10 h-4 text-blue-500" />
                                        </button>
                                        
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Conditional Pagination */}
            {filteredRows.length > rowsPerPage && (
                <div className="flex justify-center mt-6">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {Array.from({ length: Math.ceil(filteredRows.length / rowsPerPage) }, (_, i) => i + 1).map((pageNumber) => (
                            <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                                    currentPage === pageNumber
                                        ? 'bg-blue-50 text-blue-600 border-blue-500'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                {pageNumber}
                            </button>
                        ))}
                    </nav>
                </div>
            )}

            {/* Notes Modal */}
            {selectedCallLog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">Notes for {selectedCallLog.name}</h2>
                        <textarea
                            className="w-full h-32 px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-yellow-300 focus:ring-blue-500 bg-white transition duration-200 ease-in-out"
                            value={notesInput}
                            onChange={(e) => setNotesInput(e.target.value)}
                            placeholder="Add notes..."
                        />
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setSelectedCallLog(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200 ease-in-out"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleNotesUpdate}
                                className="px-4 py-2 text-sm font-medium text-white bg-[#FEDC00] rounded-md hover:bg-yellow-300 transition duration-200 ease-in-out"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallLogs;




