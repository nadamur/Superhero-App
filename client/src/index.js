// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import HomeScreen from './HomeScreen';
import './index.css'; // Import your global CSS file
import { AuthProvider } from './authContext';

ReactDOM.render(
  <React.StrictMode>
    <AuthProvider>
    <HomeScreen />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
