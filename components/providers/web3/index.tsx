import {
  createContext,
  FunctionComponent,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  createDefaultState,
  createWeb3State,
  loadContract,
  Web3State,
} from "./utils";
import { ethers } from "ethers";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { NftMarketContract } from "@_types/nftMarketContract";

const Web3Context = createContext<Web3State>(createDefaultState());

const Web3Provider: FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [web3Api, setWeb3Api] = useState<Web3State>(createDefaultState());

  // To Initialize Web3 State
  useEffect(() => {
    async function initWeb3() {
      try {
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        // Loading contract
        const contract = await loadContract("NftMarket", provider);

        // Connecting signer
        const signer = provider.getSigner();
        const signedContract = contract.connect(signer);

        // Setting global listeners
        setGlobalListeners(window.ethereum);

        /// Setting web3 state
        setWeb3Api(
          createWeb3State({
            ethereum: window.ethereum,
            provider,
            contract: signedContract as unknown as NftMarketContract,
            isLoading: false,
          })
        );
      } catch (error: any) {
        console.error("Please install web3 wallet.");

        // Setting web3 state if error
        setWeb3Api((api) =>
          createWeb3State({
            ...(api as any),
            isLoading: false,
          })
        );
      }
    }

    initWeb3();
    // Removing global listeners
    return () => removeGlobalListeners(window.ethereum);
  }, []);

  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

// Custom hook to use web3 context
export function UseWeb3() {
  return useContext(Web3Context);
}

// Custom hook to use web3 state
export function useHooks() {
  const { hooks } = UseWeb3();
  return hooks;
}

export default Web3Provider;

// To reload page on chain change
const pageReload = () => {
  window.location.reload();
};

/**
 *  To handle account change
 * @param ethereum
 */
const handleAccount = (ethereum: MetaMaskInpageProvider) => async () => {
  const isLocked = !(await ethereum._metamask.isUnlocked());
  if (isLocked) {
    pageReload();
  }
};

/**
 * Setting global listeners
 * @param ethereum
 */
const setGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.on("chainChanged", pageReload);
  ethereum?.on("accountsChanged", handleAccount(ethereum));
};

/**
 * Removing global listeners
 * @param ethereum
 */
const removeGlobalListeners = (ethereum: MetaMaskInpageProvider) => {
  ethereum?.removeListener("chainChanged", pageReload);
  ethereum?.removeListener("accountsChanged", handleAccount(ethereum));
};
