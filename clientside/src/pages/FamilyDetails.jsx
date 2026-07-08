import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaEdit, FaTrash, FaUserPlus, FaPrint, FaMale, FaFemale, FaChild, FaUser, FaIdCard, FaVoteYea, FaSearch } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const FamilyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [villageName, setVillageName] = useState('');
  const [highlightedMember, setHighlightedMember] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const village = localStorage.getItem('village') || '';
    setVillageName(village);
    
    // Check for highlight param from search
    const params = new URLSearchParams(window.location.search);
    const highlight = params.get('highlight');
    if (highlight) {
      setSearchQuery(highlight);
    }
    
    fetchFamilyDetails();
  }, [id]);

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching family details for ID:', id);
      
      const [familyRes, membersRes] = await Promise.all([
        api.get(`/families/${id}`),
        api.get(`/members/family/${id}`)
      ]);
      
      console.log('Family data:', familyRes.data.data);
      console.log('Members data:', membersRes.data);
      
      setFamily(familyRes.data.data);
      setMembers(membersRes.data);
      
      // Highlight member if search query exists
      if (searchQuery && membersRes.data.length > 0) {
        const found = membersRes.data.find(m => 
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (found) {
          setHighlightedMember(found._id);
          setTimeout(() => {
            const el = document.getElementById(`member-${found._id}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 500);
        }
      }
      
    } catch (error) {
      console.error('Error fetching family details:', error);
      toast.error('Failed to load family details');
      navigate('/families');
    } finally {
      setLoading(false);
    }
  };

  const highlightMatch = (text) => {
    if (!searchQuery || !text) return text;
    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? <span key={i} className="bg-yellow-300 font-bold px-0.5 rounded">{part}</span> : part
    );
  };

  const handleDeleteMember = async (memberId, name, e) => {
    e.stopPropagation();
    if (window.confirm(`Remove ${name} from this family?`)) {
      try {
        await api.delete(`/members/${memberId}`);
        toast.success(`${name} removed successfully`);
        fetchFamilyDetails();
      } catch (error) {
        console.error('Error deleting member:', error);
        toast.error('Failed to remove member');
      }
    }
  };

  const handleDeleteFamily = async () => {
    if (window.confirm(`Delete ${family?.headOfFamily}'s family? This will delete all members too.`)) {
      try {
        await api.delete(`/families/${id}`);
        toast.success('Family deleted successfully');
        navigate('/families');
      } catch (error) {
        console.error('Error deleting family:', error);
        toast.error('Failed to delete family');
      }
    }
  };

  const handleMemberClick = (memberId) => {
    navigate(`/members/${memberId}`);
  };

  const printFamilyCard = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>Family Card - ${family?.familyId}</title>
          <style>
            body{font-family:Arial;padding:20px}
            .header{text-align:center;border-bottom:2px solid #000;margin-bottom:20px}
            .family-info{margin-bottom:20px}
            table{width:100%;border-collapse:collapse;margin-top:10px}
            th,td{border:1px solid #ddd;padding:8px;text-align:left}
            th{background:#f2f2f2}
            .highlight{background:#ffeb3b;font-weight:bold}
            .footer{margin-top:20px;text-align:center;font-size:12px}
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Village Panchayat - Family Card</h2>
            <p>Government of Tamil Nadu</p>
            <p><strong>Village:</strong> ${villageName || 'N/A'}</p>
          </div>
          <div class="family-info">
            <p><strong>Family ID:</strong> ${family?.familyId}</p>
            <p><strong>Head of Family:</strong> ${family?.headOfFamily}</p>
            <p><strong>Address:</strong> ${family?.address?.street} ${family?.address?.area ? ', ' + family.address.area : ''} ${family?.address?.pincode ? ' - ' + family.address.pincode : ''}</p>
            <p><strong>Status:</strong> ${family?.economicStatus}</p>
            <p><strong>Total Members:</strong> ${members.length}</p>
          </div>
          <h3>Family Members</h3>
          <table>
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Relation</th>
                <th>Aadhar Number</th>
                <th>Voter ID</th>
                <th>Mobile Number</th>
              </tr>
            </thead>
            <tbody>
              ${members.map((m, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${m.name}</td>
                  <td>${m.age}</td>
                  <td>${m.gender}</td>
                  <td>${m.relationToHead}</td>
                  <td>${m.aadharNumber || '-'}</td>
                  <td>${m.voterId || '-'}</td>
                  <td>${m.mobileNumber || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>This is a computer generated document - Village Panchayat System</p>
          </div>
        </body>
      </html>
    `);
    win.print();
  };

  const maleCount = members.filter(m => m.gender === 'Male' && m.isAlive !== false).length;
  const femaleCount = members.filter(m => m.gender === 'Female' && m.isAlive !== false).length;
  const childrenCount = members.filter(m => m.age < 18 && m.isAlive !== false).length;
  const seniorCount = members.filter(m => m.age >= 60 && m.isAlive !== false).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
            <p className="ml-2 text-gray-500">Loading family details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="text-center">
              <p className="text-gray-500">Family not found in your village</p>
              <button onClick={() => navigate('/families')} className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm">
                Back to Families
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="lg:ml-64 pt-14">
        <main className="p-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate('/families')} className="text-gray-600 hover:text-gray-800">
                <FaArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">{family.headOfFamily}'s Family</h1>
                <p className="text-sm text-gray-500">Family ID: {family.familyId}</p>
                {villageName && <p className="text-xs text-green-600">🏠 {villageName}</p>}
                {searchQuery && (
                  <p className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <FaSearch size={10} /> Highlighting: <strong>"{searchQuery}"</strong>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={printFamilyCard} className="bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-gray-700 flex items-center gap-1">
                <FaPrint size={12} /> Print
              </button>
              <Link to={`/families/edit/${family._id}`} className="bg-green-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-green-700 flex items-center gap-1">
                <FaEdit size={12} /> Edit
              </Link>
              <Link to={`/families/${family._id}/members/add`} className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 flex items-center gap-1">
                <FaUserPlus size={12} /> Add Member
              </Link>
              <button onClick={handleDeleteFamily} className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-red-700 flex items-center gap-1">
                <FaTrash size={12} /> Delete
              </button>
            </div>
          </div>

          {/* Family Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">📍 Address</p>
              <p className="text-base font-medium">{family.address?.street || 'N/A'}</p>
              {family.address?.area && <p className="text-sm text-gray-500 mt-1">{family.address.area}, {family.address.pincode}</p>}
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">📊 Status</p>
              <p className={`text-base font-medium ${family.economicStatus === 'BPL' ? 'text-orange-600' : 'text-green-600'}`}>
                {family.economicStatus} {family.economicStatus === 'BPL' ? '(Below Poverty Line)' : '(Above Poverty Line)'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">🍚 Ration Card</p>
              <p className="text-base font-medium">{family.bplCardNumber || 'Not Provided'}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">📅 Registered On</p>
              <p className="text-base font-medium">{new Date(family.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-3 text-white text-center">
              <FaUser className="mx-auto text-xl mb-1" />
              <p className="text-2xl font-bold">{members.length}</p>
              <p className="text-xs opacity-90">Total Members</p>
            </div>
            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg shadow p-3 text-white text-center">
              <FaMale className="mx-auto text-xl mb-1" />
              <p className="text-2xl font-bold">{maleCount}</p>
              <p className="text-xs opacity-90">Male</p>
            </div>
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg shadow p-3 text-white text-center">
              <FaFemale className="mx-auto text-xl mb-1" />
              <p className="text-2xl font-bold">{femaleCount}</p>
              <p className="text-xs opacity-90">Female</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow p-3 text-white text-center">
              <FaChild className="mx-auto text-xl mb-1" />
              <p className="text-2xl font-bold">{childrenCount}</p>
              <p className="text-xs opacity-90">Children (&lt;18)</p>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-3 text-white text-center">
              <FaUser className="mx-auto text-xl mb-1" />
              <p className="text-2xl font-bold">{seniorCount}</p>
              <p className="text-xs opacity-90">Senior (60+)</p>
            </div>
          </div>

          {/* Members List Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Family Members ({members.length})</h2>
              {searchQuery && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <FaSearch size={10} /> Matches: <strong>"{searchQuery}"</strong>
                </span>
              )}
            </div>
            
            {members.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaUser className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-500">No members added yet</p>
                <Link to={`/families/${family._id}/members/add`} className="inline-block mt-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                  Add First Member
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Relation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aadhar</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Voter ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member, index) => {
                      const isHighlighted = highlightedMember === member._id;
                      return (
                        <tr 
                          key={member._id} 
                          id={`member-${member._id}`}
                          onClick={() => handleMemberClick(member._id)}
                          className={`hover:bg-gray-50 cursor-pointer transition ${isHighlighted ? 'bg-yellow-50 border-l-4 border-yellow-500' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {searchQuery ? highlightMatch(member.name) : member.name}
                            {isHighlighted && <span className="ml-2 text-xs bg-yellow-300 text-yellow-800 px-1 py-0.5 rounded">Match</span>}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{member.age}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{member.gender}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{member.relationToHead}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {member.aadharNumber ? (
                              <span className="font-mono text-xs">{member.aadharNumber}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {member.voterId ? (
                              <span className="font-mono text-xs">{member.voterId}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {member.mobileNumber || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <Link 
                                to={`/members/edit/${member._id}`} 
                                className="text-green-600 hover:text-green-800"
                                title="Edit Member"
                              >
                                <FaEdit size={14} />
                              </Link>
                              <button 
                                onClick={(e) => handleDeleteMember(member._id, member.name, e)}
                                className="text-red-600 hover:text-red-800"
                                title="Remove Member"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            <Link 
              to={`/families/${family._id}/members/add`}
              className="bg-blue-600 text-white p-3 rounded-lg text-center hover:bg-blue-700 transition"
            >
              <FaUserPlus className="mx-auto text-xl mb-1" />
              <p className="text-sm font-medium">Add New Member</p>
            </Link>
            <Link 
              to={`/families/edit/${family._id}`}
              className="bg-green-600 text-white p-3 rounded-lg text-center hover:bg-green-700 transition"
            >
              <FaEdit className="mx-auto text-xl mb-1" />
              <p className="text-sm font-medium">Edit Family Details</p>
            </Link>
            <button 
              onClick={printFamilyCard}
              className="bg-purple-600 text-white p-3 rounded-lg text-center hover:bg-purple-700 transition"
            >
              <FaPrint className="mx-auto text-xl mb-1" />
              <p className="text-sm font-medium">Print Family Card</p>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FamilyDetails;