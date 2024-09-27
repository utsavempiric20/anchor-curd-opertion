import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import "./App.css";
import Home from "./components/Home";
import { useEffect, useState } from "react";
import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import idl from "./utils/idl.json";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [program, setProgram] = useState<Program>();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [anchorProvider, setAnchorProvider] = useState<AnchorProvider | null>(
    null
  );

  const connectWallet = async () => {
    if (window.solana) {
      try {
        const response = await window.solana.connect();
        console.log(response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
        connectAnchorProvider();
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Doesn't have solana wallet");
    }
  };

  const checkIfConnected = async () => {
    if (window.solana) {
      try {
        const response = await window.solana.connect({ onltIfParsed: true });
        setWalletAddress(response.publicKey.toString());
        connectAnchorProvider();
      } catch (err) {
        console.log(err);
      }
    } else {
      console.log("Doesn't have solana wallet");
    }
  };

  useEffect(() => {
    window.addEventListener("load", () => {
      if (window.solana && window.solana.isPhantom) {
        checkIfConnected();
      }
    });
  }, []);

  const connectAnchorProvider = () => {
    try {
      const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

      const wallet = window.solana;

      if (!wallet || !wallet.isPhantom) {
        throw new Error(
          "Phantom wallet not found. Please install and connect Phantom."
        );
      }

      const anchorProvider = new AnchorProvider(connection, wallet, {
        preflightCommitment: "processed",
      });

      const programId = new PublicKey(idl.metadata.address);

      const program = new Program(idl as Idl, programId, anchorProvider);
      setConnection(connection);
      setProgram(program);
      setAnchorProvider(anchorProvider);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {walletAddress ? (
        <div>connected wallet : {walletAddress}</div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      <Home
        program={program}
        walletAddress={walletAddress}
        connection={connection}
        anchorProvider={anchorProvider}
      />
    </>
  );
}

export default App;
