import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaUserSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchMembers();
  }, [currentPage, filterActive, searchTerm]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };
      if (searchTerm) params.search = searchTerm;
      if (filterActive) params.isActive = filterActive;
      
      const response = await axios.get('/api/members', { params });
      setMembers(response.data.members);
      setTotalPages(response.data.pages);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await axios.delete(`/api/members/${id}`);
        toast.success('Member deleted successfully');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  const handleMarkDeceased = async (id) => {
    const deathDate = prompt('Enter death date (YYYY-MM-DD):');
    if (deathDate) {
      try {
        await axios.put(`/api/members/${id}/deceased`, { deathDate });
        toast.success('Member marked as deceased');
        fetchMembers();
      } catch (error) {
        toast.error('Failed to update');
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-600 mt-1">Manage all citizens registered in the village</p>
        </div>
        <Link to="/members/add" className="btn-primary inline-flex items-center space-x-2">
          <FaPlus className="w-4 h-4" />
          <span>Add Member</span>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, Aadhar, Voter ID, or Member ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Members</option>
            <option value="true">Active Members</option>
            <option value="false">Deceased Members</option>
          </select>
          <button onClick={fetchMembers} className="btn-primary">Search</button>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-12">
          <p className="text-gray-500">No members found. Click "Add Member" to add your first member.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {members.map((member) => (
            <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">ID: {member.memberId}</p>
                    {member.familyId && (
                      <p className="text-sm text-gray-600 mt-1">
                        Family: {member.familyId.familyId} - {member.familyId.headOfFamily}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.isActive ? 'Active' : 'Deceased'}
                  </span>
                </div>
                
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">Relation: {member.relationToHead}</p>
                  <p className="text-sm text-gray-600">Gender: {member.gender} | Age: {member.age}</p>
                  {member.aadharNumber && (
                    <p className="text-sm text-gray-600">Aadhar: {member.aadharNumber}</p>
                  )}
                  {member.voterId && (
                    <p className="text-sm text-gray-600">Voter ID: {member.voterId}</p>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2 pt-3 border-t">
                  <Link to={`/members/${member._id}`} className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1">
                    <FaEye className="w-3 h-3" />
                    <span>View</span>
                  </Link>
                  <Link to={`/members/edit/${member._id}`} className="text-green-600 hover:text-green-800 text-sm flex items-center space-x-1">
                    <FaEdit className="w-3 h-3" />
                    <span>Edit</span>
                  </Link>
                  {member.isActive && (
                    <button onClick={() => handleMarkDeceased(member._id)} className="text-orange-600 hover:text-orange-800 text-sm flex items-center space-x-1">
                      <FaUserSlash className="w-3 h-3" />
                      <span>Deceased</span>
                    </button>
                  )}
                  <button onClick={() => handleDelete(member._id)} className="text-red-600 hover:text-red-800 text-sm flex items-center space-x-1">
                    <FaTrash className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Members;