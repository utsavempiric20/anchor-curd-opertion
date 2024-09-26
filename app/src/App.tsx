import "./App.css";
import Home from "./components/Home";

import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from "@reown/appkit-adapter-solana/react";
import { solana, solanaTestnet, solanaDevnet } from "@reown/appkit/networks";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import { Connection } from "@solana/web3.js";

import { AnchorProvider } from "@coral-xyz/anchor";

function App() {
  const solanaWeb3JsAdapter = new SolanaAdapter({
    wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
  });

  const projectId = "bae88779195748e5adc36a1a36f0ae3f";

  const metadata = {
    name: "AppKit",
    description: "AppKit Solana Example",
    url: "https://web3modal.com",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
  };

  createAppKit({
    adapters: [solanaWeb3JsAdapter],
    networks: [solana, solanaTestnet, solanaDevnet],
    metadata: metadata,
    projectId,
    features: {
      analytics: true,
    },
  });

  const wallet = useAnchorWallet();

  function getProvider() {
    if (!wallet) {
      return null;
    }

    const network = "http://127.0.0.1:8899";
    const connection = new Connection(network, "processed");

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "processed",
    });
    return provider;
  }

  return (
    <>
      <center>
        <w3m-button />
      </center>
      <Home getProvider={getProvider} />
    </>
  );
}

export default App;
