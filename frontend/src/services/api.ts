import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';
console.log('API_URL:', API_URL); // Debug to confirm the value

export const signup = async (email: string, password: string, subscription: string, phone: string) =>
  axios.post(`${API_URL}/signup`, { email, password, subscription, phone }).then(res => res.data);

export const login = async (email: string, password: string) =>
  axios.post(`${API_URL}/login`, { email, password }).then(res => res.data);

export const uploadResume = async (file: File, token: string) => {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('token', token);
  return axios.post(`${API_URL}/upload-resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);
};

export const updateResume = async (token: string, resumePath: string, prompt: string) =>
  axios.post(`${API_URL}/update-resume`, { token, resumePath, prompt }).then(res => res.data);

export const selectCompanies = async (token: string, companyResumeMap: { company: string; resumePath: string }[]) =>
  axios.post(`${API_URL}/select-companies`, { token, companyResumeMap }).then(res => res.data);

export const confirmAutoApply = async (token: string) =>
  axios.post(`${API_URL}/confirm-auto-apply`, { token }).then(res => res.data);

export const autoApply = async (token: string) =>
  axios.post(`${API_URL}/auto-apply`, { token }).then(res => res.data);

export const getUserData = async (token: string) =>
  axios.get(`${API_URL}/user-data`, { params: { token } }).then(res => res.data);