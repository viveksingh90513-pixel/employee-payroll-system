import { useState, useRef } from 'react';
import { Row, Col, Button, Form, Card, Spinner } from 'react-bootstrap';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineCamera } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api, { getUploadURL } from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { getInitials } from '../../utils/formatters';

const Profile = () => {
  const { user, setUser, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Profile Form (Only non-critical info like phone can be updated by user)
  const [profileData, setProfileData] = useState({
    phone: user?.phone || '',
  });

  // Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return showError('Please select a valid image file (JPEG or PNG).');
    }

    if (file.size > 2 * 1024 * 1024) {
      return showError('File size must be less than 2MB.');
    }

    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const res = await api.post('/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        const photoFilename = res.data.data.profilePhoto;
        const updatedUser = { ...user, profilePhoto: photoFilename };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        showSuccess('Profile photo updated successfully!');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/profile', profileData);
      if (res.data.success) {
        showSuccess('Profile updated successfully.');
        const updatedUser = { ...user, phone: profileData.phone };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showError('New passwords do not match');
    }

    try {
      setLoading(true);
      const res = await api.put('/profile/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        showSuccess('Password updated successfully. Please login with new password.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => logout(), 2000);
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = () => getUploadURL(user?.profilePhoto);

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="My Profile" 
        breadcrumbs="Account / Profile"
      />

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm text-center h-100">
            <Card.Body className="p-4 d-flex flex-column align-items-center">
              {/* Profile Avatar with Photo Upload Button */}
              <div className="position-relative mb-3">
                {getPhotoUrl() ? (
                  <img 
                    src={getPhotoUrl()} 
                    alt="Profile Avatar" 
                    className="rounded-circle shadow object-fit-cover"
                    style={{ width: '120px', height: '120px', border: '4px solid #ffffff' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle bg-gradient-violet d-flex align-items-center justify-content-center text-white shadow"
                    style={{ width: '120px', height: '120px', fontSize: '2.5rem', fontWeight: 'bold' }}
                  >
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                )}

                {/* Upload Button Overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-2 shadow d-flex align-items-center justify-content-center"
                  style={{ width: '38px', height: '38px' }}
                  title="Upload profile photo"
                >
                  {uploadingPhoto ? <Spinner animation="border" size="sm" /> : <HiOutlineCamera size={20} />}
                </button>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoSelect} 
                  accept="image/jpeg,image/png,image/jpg" 
                  style={{ display: 'none' }} 
                />
              </div>

              <h4 className="font-weight-bold mb-1">{user?.firstName} {user?.lastName}</h4>
              <p className="text-muted mb-2 text-capitalize">{user?.role}</p>
              <div className="badge bg-success-light text-success px-3 py-2 rounded-pill mt-2">Active Account</div>
              <small className="text-muted mt-2 d-block">Click camera icon to change photo</small>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <div className="form-section mb-4">
            <h4 className="form-section-title"><HiOutlineUser className="icon" /> Account Settings</h4>
            <p className="form-section-subtitle">Update your contact information</p>

            <Form onSubmit={handleProfileSubmit}>
              <Row>
                <Col md={6}>
                  <FormInput label="First Name" value={user?.firstName} disabled />
                </Col>
                <Col md={6}>
                  <FormInput label="Last Name" value={user?.lastName} disabled />
                </Col>
                <Col md={6}>
                  <FormInput label="Email Address" value={user?.email} disabled />
                  <Form.Text className="text-muted d-block mt-n2 mb-3">Contact HR to change email.</Form.Text>
                </Col>
                <Col md={6}>
                  <FormInput label="Phone Number" name="phone" value={profileData.phone} onChange={handleProfileChange} />
                </Col>
              </Row>
              <div className="text-right">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            </Form>
          </div>

          <div className="form-section border-danger border-opacity-25 bg-danger bg-opacity-10">
            <h4 className="form-section-title text-danger"><HiOutlineLockClosed className="icon text-danger" /> Change Password</h4>
            <p className="form-section-subtitle border-danger border-opacity-25 text-danger opacity-75">Ensure your account is using a long, random password to stay secure.</p>

            <Form onSubmit={handlePasswordSubmit}>
              <Row>
                <Col md={12}>
                  <FormInput 
                    label="Current Password" 
                    type="password" 
                    name="currentPassword" 
                    value={passwordData.currentPassword} 
                    onChange={handlePasswordChange} 
                    required 
                  />
                </Col>
                <Col md={6}>
                  <FormInput 
                    label="New Password" 
                    type="password" 
                    name="newPassword" 
                    value={passwordData.newPassword} 
                    onChange={handlePasswordChange} 
                    required 
                    placeholder="Min 6 characters"
                  />
                </Col>
                <Col md={6}>
                  <FormInput 
                    label="Confirm New Password" 
                    type="password" 
                    name="confirmPassword" 
                    value={passwordData.confirmPassword} 
                    onChange={handlePasswordChange} 
                    required 
                  />
                </Col>
              </Row>
              <div className="text-right">
                <Button type="submit" variant="danger" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;
