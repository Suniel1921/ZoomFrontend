import React, { useState } from 'react';
import { Modal, Input, Button, Form } from 'antd';
import axios from 'axios';
import { toast } from "react-hot-toast";
// import './ForgotPasswordModal.css';  //note: need to fix this later 

const ForgotPasswordModal = ({ visible, onClose }) => {
    const [step, setStep] = useState(1); 
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false); 

    const buttonStyle = {
        backgroundColor: '#FEDC00',
        borderColor: '#FEDC00',
        color: '#000',
    };

    const handleEmailSubmit = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/forgotPassword`, { email });
            if (response.data.success) {
                toast.success(response.data.message);
                setStep(2);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setLoading(true); 
        try {
            const response = await axios.post(`${import.meta.env.VITE_REACT_APP_URL}/api/v1/auth/resetPassword`, { email, otp, newPassword });
            if (response.data.success) {
                toast.success(response.data.message);
                onClose();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error occurred');
        } finally {
            setLoading(false); 
        }
    };

    return (
        <Modal open={visible} onCancel={onClose} footer={null}>
            <h3>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h3>
            {step === 1 ? (
                <Form onFinish={handleEmailSubmit}>
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[{ required: true, message: 'Please enter your email' }]}
                    >
                        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                        style={buttonStyle}
                    >
                        Send OTP
                    </Button>
                </Form>
            ) : (
                <Form onFinish={handleResetPassword}>
                    <Form.Item
                        label="OTP"
                        name="otp"
                        rules={[{ required: true, message: 'Please enter the OTP sent to your email' }]}
                    >
                        <Input value={otp} onChange={(e) => setOtp(e.target.value)} />
                    </Form.Item>
                    <Form.Item
                        label="New Password"
                        name="newPassword"
                        rules={[{ required: true, message: 'Please enter your new password' }]}
                    >
                        <Input.Password value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    </Form.Item>
                    <Form.Item
                        label="Confirm Password"
                        name="confirmPassword"
                        rules={[{ required: true, message: 'Please confirm your new password' }]}
                    >
                        <Input.Password value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                        style={buttonStyle}
                    >
                        Reset Password
                    </Button>
                </Form>
            )}
        </Modal>
    );
};

export default ForgotPasswordModal;
