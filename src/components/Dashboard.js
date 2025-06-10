import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Welcome to CipherPay Dashboard</h1>
      <nav>
        <ul>
          <li><Link to="/transaction">Initiate Transaction</Link></li>
          <li><Link to="/proof">Generate Proof</Link></li>
          <li><Link to="/auditor">Auditor View</Link></li>
        </ul>
      </nav>
      <div className="account-info">
        <h2>Account Information</h2>
        <p>View your account details, transaction history, and manage your keys here.</p>
      </div>
    </div>
  );
}

export default Dashboard; 