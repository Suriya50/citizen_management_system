import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Families from './pages/Families';
import AddFamily from './pages/AddFamily';
import EditFamily from './pages/EditFamily';
import FamilyDetails from './pages/FamilyDetails';
import AddMember from './pages/AddMember';
import EditMember from './pages/EditMember';
import MemberDetails from './pages/MemberDetails';
import SearchResults from './pages/SearchResults';
import Reports from './pages/Reports';
import Schemes from './pages/Schemes';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="main-content-wrapper">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <PrivateRoute>
                <Dashboard toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
              </PrivateRoute>
            } />
            <Route path="/families" element={
              <PrivateRoute>
                <Families />
              </PrivateRoute>
            } />
            <Route path="/families/add" element={
              <PrivateRoute>
                <AddFamily />
              </PrivateRoute>
            } />
            <Route path="/families/edit/:id" element={
              <PrivateRoute>
                <EditFamily />
              </PrivateRoute>
            } />
            <Route path="/families/:id" element={
              <PrivateRoute>
                <FamilyDetails />
              </PrivateRoute>
            } />
            <Route path="/families/:familyId/members/add" element={
              <PrivateRoute>
                <AddMember />
              </PrivateRoute>
            } />
            <Route path="/members/:id" element={
              <PrivateRoute>
                <MemberDetails />
              </PrivateRoute>
            } />
            <Route path="/members/edit/:id" element={
              <PrivateRoute>
                <EditMember />
              </PrivateRoute>
            } />
            <Route path="/search" element={
              <PrivateRoute>
                <SearchResults />
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            <Route path="/schemes" element={
              <PrivateRoute>
                <Schemes />
              </PrivateRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;