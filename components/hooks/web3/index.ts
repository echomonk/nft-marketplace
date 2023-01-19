import { useHooks } from "@providers/web3";

// Use Account Hook
export const useAccount = () => {
  const hooks = useHooks();
  const swrRes = hooks.useAccount();
  return {
    account: swrRes,
  };
};

// Use Network Hook
export const useNetwork = () => {
  const hooks = useHooks();
  const swrRes = hooks.useNetwork();
  return {
    network: swrRes,
  };
};

// Use Listed Nfts Hook
export const useListedNfts = () => {
  const hooks = useHooks();
  const swrRes = hooks.useListedNfts();

  return {
    nfts: swrRes,
  };
};

// Use Owned Nfts Hook
export const useOwnedNfts = () => {
  const hooks = useHooks();
  const swrRes = hooks.useOwnedNfts();

  return {
    nfts: swrRes,
  };
};
