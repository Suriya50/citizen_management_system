import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

const AddMember = () => {
  const { familyId } = useParams();
  const navigate = useNavigate();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [member, setMember] = useState({
    name: '',
    age: '',
    gender: 'Male',
    relationToHead: '',
    aadharNumber: '',
    voterId: '',
    mobileNumber: '',
    occupation: 'Other',
    education: 'Other',
    bloodGroup: '',
    maritalStatus: 'Single',
    disabilities: 'None'
  });

  const relations = ['Self', 'Wife', 'Husband', 'Son', 'Daughter', 'Father', 'Mother', 'Grandfather', 'Grandmother', 'Brother', 'Sister', 'Other'];
  const occupations = ['Farmer', 'Teacher', 'Daily Wage', 'Business', 'Government Employee', 'Private Employee', 'Student', 'Housewife', 'Retired', 'Unemployed', 'Other'];
  const educations = ['Illiterate', 'Primary (1-5)', 'Middle (6-8)', 'High School (9-10)', 'Higher Secondary (11-12)', 'Graduate', 'Post Graduate', 'Diploma', 'Other'];
  const maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed', 'Other'];

  useEffect(() => {
    console.log('Family ID from URL:', familyId);
    fetchFamily();
  }, [familyId]);

  const fetchFamily = async () => {
    try {
      if (!familyId) {
        toast.error('No family ID found');
        navigate('/families');
        return;
      }
      
      const response = await api.get(`/families/${familyId}`);
      setFamily(response.data.data);
    } catch (error) {
      console.error('Error fetching family:', error);
      toast.error('Failed to load family');
      navigate('/families');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted - Family ID:', familyId);
    console.log('Member data:', member);
    
    // Validation
    if (!member.name.trim()) {
      toast.error('Please enter member name');
      return;
    }
    if (!member.age || member.age < 1 || member.age > 120) {
      toast.error('Please enter valid age (1-120)');
      return;
    }
    if (!member.relationToHead) {
      toast.error('Please select relation to head');
      return;
    }
    if (!familyId) {
      toast.error('Family ID is missing');
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare data to send - INCLUDING Aadhar and Voter ID
      const memberData = {
        familyId: familyId,
        name: member.name.trim(),
        age: parseInt(member.age),
        gender: member.gender,
        relationToHead: member.relationToHead,
        aadharNumber: member.aadharNumber || null,
        voterId: member.voterId || null,
        mobileNumber: member.mobileNumber || null,
        occupation: member.occupation,
        education: member.education,
        bloodGroup: member.bloodGroup,
        maritalStatus: member.maritalStatus,
        disabilities: member.disabilities
      };
      
      console.log('Sending member data:', memberData);
      
      const response = await api.post('/members', memberData);
      console.log('Response:', response.data);
      
      toast.success('Member added successfully!');
      
      // Reset form for next member
      setMember({
        name: '',
        age: '',
        gender: 'Male',
        relationToHead: '',
        aadharNumber: '',
        voterId: '',
        mobileNumber: '',
        occupation: 'Other',
        education: 'Other',
        bloodGroup: '',
        maritalStatus: 'Single',
        disabilities: 'None'
      });
      
      // Focus back on name input
      document.getElementById('member-name')?.focus();
      
      // Refresh family data to update member count
      const familyRes = await api.get(`/families/${familyId}`);
      setFamily(familyRes.data.data);
      
    } catch (error) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      
      const message = error.response?.data?.message || 'Failed to add member';
      toast.error(message);
    } finally {
      setSubmitting(false);
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

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="lg:ml-64 pt-14">
        <main className="p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(`/families/${familyId}`)} className="text-gray-600 hover:text-gray-800">
              <FaArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Add Member</h1>
              <p className="text-sm text-gray-500">Adding to {family?.headOfFamily}'s family</p>
              <p className="text-xs text-green-600">✓ Auto-generated Citizen ID | ✓ Add unlimited members</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input 
                  id="member-name"
                  type="text" 
                  value={member.name} 
                  onChange={(e) => setMember({...member, name: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  required 
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                <input 
                  type="number" 
                  value={member.age} 
                  onChange={(e) => setMember({...member, age: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  value={member.gender} 
                  onChange={(e) => setMember({...member, gender: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation to Head *</label>
                <select 
                  value={member.relationToHead} 
                  onChange={(e) => setMember({...member, relationToHead: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Relation</option>
                  {relations.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input 
                  type="tel" 
                  value={member.mobileNumber} 
                  onChange={(e) => setMember({...member, mobileNumber: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  maxLength="10"
                  placeholder="10 digit mobile number (optional)"
                />
              </div>
            </div>

            {/* Aadhar and Voter ID Section */}
            <div className="bg-blue-50 p-4 rounded-md mb-6 border border-blue-200">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Government ID Documents</h3>
              <p className="text-xs text-blue-600 mb-3">
                📋 Enter Aadhar and Voter ID numbers (optional but recommended)
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                  <input 
                    type="text" 
                    value={member.aadharNumber} 
                    onChange={(e) => setMember({...member, aadharNumber: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    maxLength="12"
                    placeholder="12 digit Aadhar number"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter 12 digits Aadhar number</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Voter ID / Election Card</label>
                  <input 
                    type="text" 
                    value={member.voterId} 
                    onChange={(e) => setMember({...member, voterId: e.target.value})} 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                    placeholder="Voter ID number"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter Voter ID / Election Card number</p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                <select 
                  value={member.occupation} 
                  onChange={(e) => setMember({...member, occupation: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {occupations.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <select 
                  value={member.education} 
                  onChange={(e) => setMember({...member, education: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {educations.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select 
                  value={member.bloodGroup} 
                  onChange={(e) => setMember({...member, bloodGroup: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select</option>
                  <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                  <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select 
                  value={member.maritalStatus} 
                  onChange={(e) => setMember({...member, maritalStatus: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {maritalStatuses.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Disabilities</label>
                <input 
                  type="text" 
                  value={member.disabilities} 
                  onChange={(e) => setMember({...member, disabilities: e.target.value})} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="None"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button 
                type="button" 
                onClick={() => navigate(`/families/${familyId}`)} 
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={submitting} 
                className="px-6 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave size={14} /> {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </form>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-center text-sm text-blue-700 border border-blue-200">
            💡 <strong>Quick Add:</strong> Form resets after each member. Add unlimited members to this family!
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddMember;