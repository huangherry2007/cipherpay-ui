import React, { useState } from 'react';

function Proof() {
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement proof generation logic here
    console.log('Proof generation attempt for transaction:', transactionId);
  };

  return (
    <div className="proof">
      <h1>Generate Proof</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Transaction ID:</label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            required
          />
        </div>
        <button type="submit">Generate Proof</button>
      </form>
    </div>
  );
}

export default Proof; 