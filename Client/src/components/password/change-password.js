// client/src/components/ChangePassword.js

import React, { useState } from 'react';
import axios from 'axios';
import { FaLock, FaKey } from 'react-icons/fa';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      setMessage('');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('User is not authenticated. Please log in.');
        setMessage('');
        return;
      }

      const payload = {
        currentPassword,
        newPassword,
      };

      const response = await axios.put(
        '/api/change-password', // Ensure proxy or baseURL is correctly set
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || 'Password changed successfully.');
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const resMsg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(resMsg);
      setMessage('');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '420px', borderRadius: '12px' }}>
        <h4 className="text-center mb-4 text-primary">🔐 Change Password</h4>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleChangePassword}>
          <div className="form-group mb-3">
            <label className="fw-bold">
              <FaKey className="me-2" />
              Current Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="fw-bold">
              <FaLock className="me-2" />
              New Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-4">
            <label className="fw-bold">
              <FaLock className="me-2" />
              Confirm New Password
            </label>
            <input
              type="password"
              className="form-control"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 fw-bold"
            style={{ borderRadius: '8px' }}
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
