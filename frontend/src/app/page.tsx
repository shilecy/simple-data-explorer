'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, RefreshCcw, Loader2, Filter } from 'lucide-react';

// --- Interfaces and Types ---

interface Record {
    id: number;
    name: string;
    category: string;
    status: string;
    price: number;
    created_at: string;
}

interface PaginatedResponse {
    data: Record[];
    total_records: number;
    total_pages: number;
    current_page: number;
    limit: number;
}

type SortBy = "id" | "name" | "category" | "status" | "price" | "created_at";
type SortOrder = "asc" | "desc";

interface QueryParams {
    page: number;
    limit: number;
    sort_by: SortBy;
    sort_order: SortOrder;
    search: string;
    category_filter: string;
    status_filter: string;
    price_range: string;
    date_range: string;
}

// --- Constants ---
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const CATEGORY_OPTIONS = ["tools", "electronics", "clothing", "books", "home goods"];
const STATUS_OPTIONS = ["discontinued", "in stock", "out of stock", "on order"];
const PRICE_RANGES = [
    { label: "Under $20", value: "0-20" },
    { label: "$20 - $40", value: "20-40" },
    { label: "$40 - $60", value: "40-60" },
    { label: "$60 - $80", value: "60-80" },
    { label: "$80 - $100", value: "80-100" },
    { label: "Over $100", value: "100-99999" },
];
const DATE_RANGES = [
    "today",
    "yesterday",
    "last week",
    "early this month",
    "last month",
    "early this year",
    "long time ago",
];


// --- Helper Components ---

const LoadingSpinner = () => (
    <div className="flex items-center justify-center p-8 bg-white rounded-xl shadow-inner col-span-1 md:col-span-4">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-3 text-lg text-gray-600">Loading data...</span>
    </div>
);

// Generic Filter Select Component for Category, Status, Price, and Date
const FilterSelect = ({ label, options, value, onChange }: { 
    label: string; 
    options: string[] | { label: string; value: string }[]; 
    value: string; 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
}) => {
    return (
        <div className="flex flex-col space-y-1 min-w-[150px]">
            <label htmlFor={label} className="text-xs font-medium text-gray-700">{label}:</label>
            <select
                id={label}
                value={value}
                onChange={onChange}
                className="py-2 pl-3 pr-8 border border-gray-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm bg-white"
            >
                <option value="">All {label.replace(' Range', '').replace(' Added', '')}</option>
                {options.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option.charAt(0).toUpperCase() + option.slice(1) : option.label;
                    return (
                        <option key={index} value={optionValue}>
                            {optionLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};


const DataTable = ({ records, query, handleSort, isLoading, offset }: {
    records: Record[];
    query: QueryParams;
    handleSort: (column: SortBy) => void;
    isLoading: boolean;
    offset: number; // For row numbering
}) => {
    const headers: { key: SortBy | 'index'; label: string }[] = useMemo(() => [
        { key: 'index', label: '#' }, // Row numbering column
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status' },
        { key: 'price', label: 'Price' },
        { key: 'created_at', label: 'Date Added' },
    ], []);

    const SortIcon = ({ columnKey }: { columnKey: SortBy | 'index' }) => {
        if (columnKey === 'index') return null; // Index column is not sortable

        if (query.sort_by !== columnKey) return <ChevronUp size={14} className="opacity-30 ml-1" />;
        return query.sort_order === 'asc' 
            ? <ChevronUp size={14} className="ml-1 text-indigo-600" />
            : <ChevronDown size={14} className="ml-1 text-indigo-600" />;
    };

    if (isLoading) return <LoadingSpinner />;
    if (records.length === 0) return <div className="text-center p-12 text-gray-500 bg-white rounded-xl shadow-xl">No records found matching your criteria.</div>;

    return (
        <div className="overflow-x-auto shadow-2xl rounded-xl">
            <table className="min-w-full divide-y divide-indigo-200 bg-white">
                <thead className="bg-indigo-50 border-b border-indigo-200">
                    <tr>
                        {headers.map(header => (
                            <th
                                key={header.key}
                                className={`px-4 sm:px-6 py-3 text-left text-xs font-semibold text-indigo-800 uppercase tracking-wider select-none transition duration-150 ${
                                    header.key !== 'index' ? 'cursor-pointer hover:bg-indigo-100' : ''
                                }`}
                                // Only allow sorting if the column is not the index
                                onClick={() => header.key !== 'index' && handleSort(header.key as SortBy)}
                            >
                                <div className="flex items-center">
                                    {header.label}
                                    <SortIcon columnKey={header.key} />
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {records.map((record, index) => (
                        <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-100 transition duration-150`}>
                            {/* 1. Row Numbering (Product Name Requirement) */}
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                                {offset + index + 1} 
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-xs">{record.name}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.category}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                    record.status.toLowerCase() === 'in stock' ? 'bg-green-200 text-green-900' :
                                    record.status.toLowerCase() === 'on order' ? 'bg-yellow-200 text-yellow-900' :
                                    'bg-red-200 text-red-900'
                                }`}>
                                    {record.status}
                                </span>
                            </td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono font-semibold">${record.price.toFixed(2)}</td>
                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(record.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Consolidated Control Panel for all filtering and search
const ControlPanel = ({ query, setQuery, handleApplyFilters }: {
    query: QueryParams;
    setQuery: React.Dispatch<React.SetStateAction<QueryParams>>;
    handleApplyFilters: () => void;
}) => {
    // Handlers for inputs that *stage* the new query parameters
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(prev => ({ ...prev, search: e.target.value }));
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuery(prev => ({ ...prev, limit: Number(e.target.value) }));
    };

    const handleFilterChange = (key: keyof QueryParams) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setQuery(prev => ({ ...prev, [key]: e.target.value }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleApplyFilters();
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5 bg-white rounded-xl shadow-lg border border-indigo-100">
            {/* Top Row: Search, Limit, and Apply Button */}
            <div className="flex flex-wrap items-center gap-4 border-b pb-4 mb-2">
                {/* Search Input */}
                <div className="relative grow min-w-[200px] md:grow-0">
                    <input
                        type="text"
                        placeholder="Search by product name..."
                        value={query.search}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
                </div>
                
                {/* Records per Page Limit */}
                <div className="flex items-center space-x-2">
                    <label htmlFor="limit" className="text-sm font-medium text-gray-700">Records per Page:</label>
                    <select
                        id="limit"
                        value={query.limit}
                        onChange={handleLimitChange}
                        className="py-2 pl-3 pr-8 border border-gray-300 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 shadow-sm"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                
                {/* Apply Button */}
                <button
                    onClick={handleApplyFilters}
                    className="flex items-center bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:bg-indigo-700 transition duration-200 transform hover:scale-[1.02] active:scale-[0.98] ml-auto"
                >
                    <Filter size={18} className="mr-2" />
                    Apply Filters
                </button>
            </div>

            {/* Bottom Row: New Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* 2. Category Filter */}
                <FilterSelect 
                    label="Category" 
                    options={CATEGORY_OPTIONS} 
                    value={query.category_filter} 
                    onChange={handleFilterChange('category_filter')}
                />

                {/* 3. Status Filter */}
                <FilterSelect 
                    label="Status" 
                    options={STATUS_OPTIONS} 
                    value={query.status_filter} 
                    onChange={handleFilterChange('status_filter')}
                />
                
                {/* 4. Price Range Filter */}
                <FilterSelect 
                    label="Price Range" 
                    options={PRICE_RANGES} 
                    value={query.price_range} 
                    onChange={handleFilterChange('price_range')}
                />

                {/* 5. Date Added Filter */}
                <FilterSelect 
                    label="Date Added" 
                    options={DATE_RANGES} 
                    value={query.date_range} 
                    onChange={handleFilterChange('date_range')}
                />
            </div>
        </div>
    );
};


const Pagination = ({ response, setQuery }: {
    response: PaginatedResponse;
    setQuery: React.Dispatch<React.SetStateAction<QueryParams>>;
}) => {
    // 1. ADD NULL/ZERO CHECK HERE:
    if (!response || response.total_records === 0) {
        return null;
    }
    const { current_page, total_pages, total_records } = response;

    const handlePageChange = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= total_pages) {
            // Only update the page number, filters remain in the appliedFilters state
            setQuery(prev => ({ ...prev, page: newPage }));
        }
    }, [total_pages, setQuery]);

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let startPage = Math.max(1, current_page - Math.floor(maxVisible / 2));
        let endPage = Math.min(total_pages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Add 1st page and ellipsis if needed
        if (startPage > 1) {
            pages.push(
                <button key={1} onClick={() => handlePageChange(1)} className="px-4 py-2 rounded-xl text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition duration-150 shadow-md">1</button>
            );
            if (startPage > 2) pages.push(<span key="start-ellipsis" className="px-2 py-2 text-gray-500 text-sm">...</span>);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-150 shadow-md ${
                        i === current_page 
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400' 
                        : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        }
        
        // Add last page and ellipsis if needed
        if (endPage < total_pages) {
            if (endPage < total_pages - 1) pages.push(<span key="end-ellipsis" className="px-2 py-2 text-gray-500 text-sm">...</span>);
            pages.push(
                <button key={total_pages} onClick={() => handlePageChange(total_pages)} className="px-4 py-2 rounded-xl text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 transition duration-150 shadow-md">{total_pages}</button>
            );
        }
        
        return pages; 
    };
    
    return (
        <div className="flex flex-wrap items-center justify-between p-5 bg-white rounded-xl shadow-lg mt-6">
            <p className="text-sm text-gray-600 mb-2 md:mb-0">
                Showing page <span className='font-bold'>{current_page}</span> of <span className='font-bold'>{total_pages}</span> (Total Records: <span className='font-bold'>{total_records}</span>)
            </p>
            <div className="flex space-x-2">
                <button
                    onClick={() => handlePageChange(current_page - 1)}
                    disabled={current_page === 1}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 shadow-sm"
                >
                    Previous
                </button>
                {renderPageNumbers()}
                <button
                    onClick={() => handlePageChange(current_page + 1)}
                    disabled={current_page === total_pages}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-xl text-sm bg-white hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 shadow-sm"
                >
                    Next
                </button>
            </div>
        </div>
    );
};


// --- Main Application Component ---
export default function App() {
    // query holds the state of the UI controls (filters, search, limit, current page)
    const [query, setQuery] = useState<QueryParams>({
        page: 1,
        limit: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
        search: '',
        category_filter: '',
        status_filter: '',
        price_range: '',
        date_range: '',
    });
    
    // appliedFilters holds the query parameters that are *actually* sent to the API. 
    // This allows page/sort changes to be instant, while other filters require an "Apply" click.
    const [appliedFilters, setAppliedFilters] = useState<Omit<QueryParams, 'page' | 'limit'>>({
        sort_by: 'created_at',
        sort_order: 'desc',
        search: '',
        category_filter: '',
        status_filter: '',
        price_range: '',
        date_range: '',
    });

    const [data, setData] = useState<PaginatedResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate the offset for row numbering in the current view
    const offset = useMemo(() => {
        if (!data) return 0;
        return (data.current_page - 1) * data.limit;
    }, [data]);


    const fetchRecords = useCallback(async (currentQuery: QueryParams) => {
        setIsLoading(true);
        setError(null);

        // Construct the URLSearchParams from the current query state
        const params = new URLSearchParams({
            page: String(currentQuery.page),
            limit: String(currentQuery.limit),
            sort_by: currentQuery.sort_by,
            sort_order: currentQuery.sort_order,
        });

        // Add optional filters only if they have a value
        if (currentQuery.search) params.append('search', currentQuery.search);
        if (currentQuery.category_filter) params.append('category_filter', currentQuery.category_filter);
        if (currentQuery.status_filter) params.append('status_filter', currentQuery.status_filter);
        if (currentQuery.price_range) params.append('price_range', currentQuery.price_range);
        if (currentQuery.date_range) params.append('date_range', currentQuery.date_range);


        let apiUrl = `${API_BASE_URL}/records?${params.toString()}`;

        // Exponential Backoff for API Calls
        const MAX_RETRIES = 3;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                const response = await fetch(apiUrl);
                
                if (!response.ok) {
                    const errorBody = await response.json();
                    throw new Error(errorBody.detail || `HTTP error! status: ${response.status}`);
                }

                const json: PaginatedResponse = await response.json();
                setData(json);
                setIsLoading(false); // <-- FIX: Turn off loading on SUCCESS
                break; // Success, break the retry loop
            } catch (err: any) {
                if (attempt === MAX_RETRIES - 1) {
                    setError(`Failed to fetch data after ${MAX_RETRIES} attempts. Error: ${err.message}`);
                    setIsLoading(false); // <-- FIX: Turn off loading on FINAL FAILURE
                }
                const delay = Math.pow(2, attempt) * 1000;
                // 1s, 2s, 4s...
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        setIsLoading(false);
    }, []);

    // Effect to trigger data fetch whenever page, limit, or appliedFilters state changes
    useEffect(() => {
        // Construct the full query for fetching by merging pagination and applied filters
        const fetchQuery: QueryParams = {
            page: query.page,
            limit: query.limit,
            ...appliedFilters,
        };
        fetchRecords(fetchQuery);
    }, [query.page, query.limit, appliedFilters, fetchRecords]);


    // Handler for search/filter button press
    const handleApplyFilters = () => {
        // When the apply button is hit, apply all currently set filters and reset to page 1.
        setAppliedFilters({
            sort_by: query.sort_by,
            sort_order: query.sort_order,
            search: query.search,
            category_filter: query.category_filter,
            status_filter: query.status_filter,
            price_range: query.price_range,
            date_range: query.date_range,
        });
        setQuery(prev => ({ ...prev, page: 1 }));
    };

    // Handler for sorting columns
    const handleSort = useCallback((column: SortBy) => {
    setQuery(prev => {
        let newOrder: SortOrder = 'desc';

        if (prev.sort_by === column) {
            newOrder = prev.sort_order === 'asc' ? 'desc' : 'asc';
        }

        const updatedFilters = {
            ...appliedFilters,
            sort_by: column,
            sort_order: newOrder,
        };

        setAppliedFilters(updatedFilters);

        return {
            ...prev,
            sort_by: column,
            sort_order: newOrder,
            page: 1,
        };
    });
}, [appliedFilters]);


    const handleRefresh = () => {
        // Reset all query parameters to initial state and refetch
        const initialQuery: QueryParams = {
            page: 1,
            limit: 10,
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            category_filter: '',
            status_filter: '',
            price_range: '',
            date_range: '',
        };
        setQuery(initialQuery);
        setAppliedFilters({
            sort_by: 'created_at',
            sort_order: 'desc',
            search: '',
            category_filter: '',
            status_filter: '',
            price_range: '',
            date_range: '',
        });
    }

    return (
        <main className="min-h-screen bg-gray-100 p-4 sm:p-8 font-['Inter']">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b-2 border-indigo-200 pb-3">
                    <h1 className="text-3xl font-extrabold text-indigo-800">
                        Product Data Explorer
                    </h1>
                    <button 
                        onClick={handleRefresh}
                        className="flex items-center text-sm text-gray-600 hover:text-indigo-600 transition duration-150 mt-2 sm:mt-0"
                        disabled={isLoading}
                    >
                        <RefreshCcw size={16} className={`mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                        Reset All Filters
                    </button>
                </div>
                
                {/* Error Display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 shadow-md" role="alert">
                        <strong className="font-bold">API Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                {/* Controls (Search and Filters) */}
                <ControlPanel 
                    query={query} 
                    setQuery={setQuery} 
                    handleApplyFilters={handleApplyFilters} 
                />

                {/* Table */}
                <div className="mt-8">
                    <DataTable 
                        records={data?.data || []} 
                        query={query} 
                        handleSort={handleSort}
                        isLoading={isLoading}
                        offset={offset}
                    />
                </div>
                
                {/* Pagination */}
                {data && data.total_records > 0 && (
                    <Pagination 
                        response={data} 
                        setQuery={setQuery} 
                    />
                )}
            </div>
        </main>
    );
}