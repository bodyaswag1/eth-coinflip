"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useContractWrite, useWaitForTransaction } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const ABI = [
  // Minimal ABI for joinGame
  {
    "inputs": [
      { "internalType": "uint8", "name": "side", "type": "uint8" }
    ],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

export default function CoinFlip() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({ connector: new MetaMaskConnector() });
  const { disconnect } = useDisconnect();

  const [side, setSide] = useState(0);
  const [stake, setStake] = useState("0.01");

  const { data, write, isLoading } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "joinGame",
    value: parseEther(stake),
    args: [side],
  });

  const { isLoading: txLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <div>
      {!isConnected ? (
        <button onClick={() => connect()}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
        </div>
      )}

      <div>
        <label>Choose Side: </label>
        <select value={side} onChange={(e) => setSide(Number(e.target.value))}>
          <option value={0}>Heads</option>
          <option value={1}>Tails</option>
        </select>
      </div>

      <div>
        <label>Stake (ETH): </label>
        <input value={stake} onChange={(e) => setStake(e.target.value)} />
      </div>

      <button disabled={isLoading} onClick={() => write?.()}>
        Join Game
      </button>

      {txLoading && <p>Waiting for confirmation...</p>}
      {isSuccess && <p>Transaction confirmed!</p>}
    </div>
  );
}
