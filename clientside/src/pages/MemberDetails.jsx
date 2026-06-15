import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaEdit, FaTrash, FaPhone, FaIdCard, FaVenusMars, FaTint, FaBriefcase, FaGraduationCap, FaHeart, FaCalendarAlt, FaUser } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const MemberDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberDetails();
  }, [id]);

  const fetchMemberDetails = async () => {
    try {
      const memberRes = await api.get(`/members/${id}`);
      const memberData = memberRes.data;
      setMember(memberData);
      
      let familyId = memberData.familyId;
      if (typeof familyId === 'object') familyId = familyId._id;
      
      const familyRes = await api.get(`/families/${familyId}`);
      setFamily(familyRes.data.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load member details');
      navigate('/families');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${member?.name}? This cannot be undone.`)) {
      try {
        await api.delete(`/members/${id}`);
        toast.success('Member deleted');
        let familyId = member?.familyId;
        if (typeof familyId === 'object') familyId = familyId._id;
        navigate(`/families/${familyId}`);
      } catch (error) {
        toast.error('Failed to delete member');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="lg:ml-64 pt-14">
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) return null;

  const familyName = family?.headOfFamily || (typeof member?.familyId === 'object' ? member.familyId?.headOfFamily : 'Family');

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="lg:ml-64 pt-14">
        <main className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => {
              let familyId = member?.familyId;
              if (typeof familyId === 'object') familyId = familyId._id;
              navigate(`/families/${familyId}`);
            }} className="text-gray-600">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Member Details</h1>
              <p className="text-sm text-gray-500">{familyName}'s family</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-5 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <FaUser className="text-green-600 text-3xl" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{member.name}</h2>
                  <p className="text-sm opacity-90">{member.relationToHead} of the family</p>
                  <p className="text-xs opacity-75">Citizen ID: {member.citizenId}</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2"><FaCalendarAlt className="text-gray-400" /><span>Age:</span><span className="font-medium">{member.age} years</span></div>
                  <div className="flex items-center gap-2"><FaVenusMars className="text-gray-400" /><span>Gender:</span><span>{member.gender}</span></div>
                  <div className="flex items-center gap-2"><FaTint className="text-gray-400" /><span>Blood Group:</span><span>{member.bloodGroup || 'Not specified'}</span></div>
                  <div className="flex items-center gap-2"><FaHeart className="text-gray-400" /><span>Marital Status:</span><span>{member.maritalStatus || 'Not specified'}</span></div>
                </div>
              </div>

              {/* Professional Details */}
              <div>
                <h3 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">Professional Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><FaBriefcase className="text-gray-400" /><span>Occupation:</span><span>{member.occupation || 'Not specified'}</span></div>
                  <div className="flex items-center gap-2"><FaGraduationCap className="text-gray-400" /><span>Education:</span><span>{member.education || 'Not specified'}</span></div>
                </div>
              </div>

              {/* Contact Information */}
              {member.mobileNumber && (
                <div>
                  <h3 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">Contact Information</h3>
                  <div className="flex items-center gap-2"><FaPhone className="text-gray-400" /><span>Mobile:</span><span>{member.mobileNumber}</span></div>
                </div>
              )}

              {/* Government IDs */}
              {(member.aadharNumber || member.voterId || member.panNumber || member.rationCardNumber) && (
                <div>
                  <h3 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">Government IDs</h3>
                  <div className="space-y-2 text-sm">
                    {member.aadharNumber && <div className="flex items-center gap-2"><FaIdCard className="text-gray-400" /><span>Aadhar:</span><span>{member.aadharNumber}</span></div>}
                    {member.voterId && <div className="flex items-center gap-2"><span>🗳️</span><span>Voter ID:</span><span>{member.voterId}</span></div>}
                    {member.panNumber && <div className="flex items-center gap-2"><span>📄</span><span>PAN:</span><span>{member.panNumber}</span></div>}
                    {member.rationCardNumber && <div className="flex items-center gap-2"><span>📇</span><span>Ration Card:</span><span>{member.rationCardNumber}</span></div>}
                  </div>
                </div>
              )}

              {/* Disabilities */}
              {member.disabilities && member.disabilities !== 'None' && (
                <div>
                  <h3 className="text-md font-bold text-gray-700 mb-3 border-b pb-2">Additional Info</h3>
                  <p className="text-sm">Disabilities: {member.disabilities}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t flex gap-3 bg-gray-50">
              <Link to={`/members/edit/${member._id}`} className="flex-1 bg-green-600 text-white text-center py-2 rounded-md">Edit Member</Link>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded-md">Delete Member</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MemberDetails;