import ReactDOM from "react-dom";
import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IAdapter, IProvider, WEB3AUTH_NETWORK, WALLET_ADAPTERS } from "@web3auth/base";
import axios from "axios";
import RPC from "./solanaRPC";
import "./App.css";

// Adapters
import { getDefaultExternalAdapters } from "@web3auth/default-solana-adapter"; // All default Solana Adapters
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";

const clientId = "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null);
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const chainConfig = {
    chainId: "0x1",
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    rpcTarget: "https://api.devnet.solana.com",
    tickerName: "SOLANA",
    ticker: "SOL",
    decimals: 9,
    blockExplorerUrl: "https://explorer.solana.com/?cluster=devnet",
    logo: "https://images.toruswallet.io/sol.svg",
  };

  useEffect(() => {
    const init = async () => {
      try {
        const solanaPrivateKeyPrvoider = new SolanaPrivateKeyProvider({
          config: { chainConfig: chainConfig },
        });

        const web3auth = new Web3Auth({
          clientId,
          // uiConfig refers to the whitelabeling options, which is available only on Growth Plan and above
          // Please remove this parameter if you're on the Base Plan

          // chainConfig,

          uiConfig: {
            appName: "W3A Heroes",
            mode: "light",

            // loginMethodsOrder: ["apple", "google", "twitter"],
            // logoLight: "https://web3auth.io/images/web3authlog.png",
            // logoDark: "https://web3auth.io/images/web3authlogodark.png",
            defaultLanguage: "en", // en, de, ja, ko, zh, es, fr, pt, nl
            // loginGridCol: 3,
            primaryButton: "externalLogin", // "externalLogin" | "socialLogin" | "emailLogin"
            uxMode: "redirect",
          },
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET,
          privateKeyProvider: solanaPrivateKeyPrvoider,
        });

        // Setup external adapters
        const adapters = getDefaultExternalAdapters({
          options: {
            clientId,
            chainConfig,
          },
        });
        adapters.forEach((adapter: IAdapter<any>) => {
          web3auth.configureAdapter(adapter);
        });

        setWeb3auth(web3auth);

        // await web3auth.initModal();

        await web3auth.initModal({
          modalConfig: {

            [WALLET_ADAPTERS.AUTH]: {
              label: "auth",
              loginMethods: {
                // Disable facebook and reddit
                social: {
                  name: "facebook",
                  showOnModal: false,
                },
                facebook: {
                  name: "facebook",
                  showOnModal: false,
                },
                google: {
                  name: "google",
                  showOnModal: false,
                },
                reddit: {
                  name: "reddit",
                  showOnModal: false,
                },

                // Disable email_passwordless and sms_passwordless
                email_passwordless: {
                  name: "email_passwordless",
                  showOnModal: false,
                },
                sms_passwordless: {
                  name: "sms_passwordless",
                  showOnModal: false,
                },
              },
            },

            // Disable Wallet Connect V2
            [WALLET_ADAPTERS.WALLET_CONNECT_V2]: {
              label: "wallet_connect",
              showOnModal: true,
            },
          },
        });

        setProvider(web3auth.provider);

        if (web3auth.connected) {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const playWrapper = document.getElementById('play-wrapper');
  const rootWrapper = document.getElementById('root');

  const login = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();

    if (web3auth.connected) {
      setLoggedIn(true);
      getAccounts();
    }
    setProvider(web3authProvider);
  };

  const playForFun = async () => {
    if (playWrapper && rootWrapper) {
      playWrapper.style.display = 'block';
      rootWrapper.style.display = 'none';
    }
  };

  const addChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const chainConfig = {
      chainId: "0x2",
      displayName: "Solana Testnet",
      chainNamespace: CHAIN_NAMESPACES.SOLANA,
      tickerName: "SOLANA",
      ticker: "SOL",
      decimals: 18,
      rpcTarget: "https://api.testnet.solana.com",
      blockExplorerUrl: "https://explorer.solana.com/?cluster=testnet",
      logo: "https://images.toruswallet.io/sol.svg",
    };

    await web3auth?.addChain(chainConfig);
    uiConsole("New Chain Added");
  };

  const switchChain = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    await web3auth?.switchChain({ chainId: "0x2" });
    uiConsole("Chain Switched");
  };

  const authenticateUser = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    uiConsole(idToken);
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    uiConsole(user);
  };

  const logout = async () => {
    if (!web3auth) {
      uiConsole("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setLoggedIn(false);
    window.location.reload();
  };

  const saveWallet = async (walletAddress: string) => {
    try {
      const response = await axios.post("http://95.164.45.224/api/add_wallet.php", {
        address: walletAddress,
      });

      if (response.data.success) {
        console.log("Wallet saved with ID:", response.data.id);
      } else {
        console.error("Error saving wallet:", response.data.message);
      }
    } catch (error) {
      console.error("Error connecting to API:", error);
    }
  };

  const getAccounts = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }

    const rpc = new RPC(provider);
    const address = await rpc.getAccounts();
    let sol_address = null;
    // uiConsole(address);

    const addressElement = document.getElementById("address");

    if(addressElement && address) {

      if (Array.isArray(address) && address.length > 0) {
        sol_address = address[0]?.toString();

        addressElement.innerText = `Solana Address: ${sol_address}`;
      } else if(address != null) {
        sol_address = address.toString();

        addressElement.innerText = `Solana Address: ${sol_address}`;
      }

      if (sol_address) {
        saveWallet(sol_address);
      }

      playForFun();
    }
  };

  const getBalance = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const balance = await rpc.getBalance();
    uiConsole(balance);
  };

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendTransaction();
    uiConsole(receipt);
  };

  const sendVersionTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.sendVersionTransaction();
    uiConsole(receipt);
  };

  const signVersionedTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.signVersionedTransaction();
    uiConsole(receipt);
  };

  const signAllVersionedTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.signAllVersionedTransaction();
    uiConsole(receipt);
  };

  const signAllTransaction = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const receipt = await rpc.signAllTransaction();
    uiConsole(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const signedMessage = await rpc.signMessage();
    uiConsole(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!provider) {
      uiConsole("provider not initialized yet");
      return;
    }
    const rpc = new RPC(provider);
    const privateKey = await rpc.getPrivateKey();
    uiConsole(privateKey);
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
    }
  }

  const loggedInViewOriginal = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={authenticateUser} className="card">
            Get ID Token
          </button>
        </div>
        <div>
          <button onClick={addChain} className="card">
            Add Chain
          </button>
        </div>
        <div>
          <button onClick={switchChain} className="card">
            Switch Chain
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Account
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={sendVersionTransaction} className="card">
            Send Version Transaction
          </button>
        </div>
        <div>
          <button onClick={signVersionedTransaction} className="card">
            Sign Versioned Transaction
          </button>
        </div>
        <div>
          <button onClick={signAllVersionedTransaction} className="card">
            Sign All Versioned Transaction
          </button>
        </div>
        <div>
          <button onClick={signAllTransaction} className="card">
            Sign All Transaction
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={getPrivateKey} className="card">
            Get Private Key
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}>Logged in Successfully!</p>
      </div>
    </>
  );

  const loggedInView = (
    <>
      <div className="flex-container">
        <button onClick={logout} className="card">
          Log Out
        </button>
      </div>
    </>
  );

  const unloggedInView = (
    <div>
      <button onClick={login} className="card">
        Airdrop Game
      </button>
      <button onClick={playForFun} className="card">
        Play For Fun
      </button>
    </div>
  );

  // const renderPortal = () => {
  //   if (!loggedIn) return null; // Only render the portal when logged in
  //   const logOutExitElement = document.getElementById("logOutExit");
  //   if (logOutExitElement) {
  //     return ReactDOM.createPortal(loggedInView, logOutExitElement);
  //   }
  //   return null;
  // };

  const renderPortal = () => {
    const logOutExitElement = document.getElementById("logOutExit");

    if (!loggedIn) {
      if (!logOutExitElement) return null;

      return ReactDOM.createPortal(
        <button
          onClick={handleLinkWalletClick}
          className="card"
        >
          Link Wallet
        </button>,
        logOutExitElement
      );
    }

    if (logOutExitElement) {
      return ReactDOM.createPortal(loggedInView, logOutExitElement);
    }
    return null;
  };

  const handleLinkWalletClick = () => {
    if (playWrapper && rootWrapper) {
      playWrapper.style.display = "none";
      rootWrapper.style.display = "block";
    }
  };

  if(loggedIn) {
    // playForFun();
    getAccounts();
  }

  return (
    <div className="container">
      <div className="grid">{loggedIn ? loggedInView : unloggedInView}</div>
      {/* Render Portal */}
      {renderPortal()}
    </div>
  );
}

export default App;
