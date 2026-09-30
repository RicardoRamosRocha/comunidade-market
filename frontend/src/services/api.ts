import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3333',
});

// Injeta o Token JWT em todas as requisições caso ele exista no LocalStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@comunidade:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});