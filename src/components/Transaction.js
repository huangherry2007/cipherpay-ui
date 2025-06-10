import React, { useState } from 'react';

function Transaction() {
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement transaction logic here
    console.log('Transaction attempt:', amount, recipient);
  };

  return (
    <div className="transaction">
      <h1>Initiate Transaction</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Recipient:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <button type="submit">Submit Transaction</button>
      </form>
    </div>
  );
}

export default Transaction; 