import useSWR from "swr";

// deps ->  provider, ethereum, contract (web3state)
export const hookFactory = (deps: any) => (params: any) => {
  const swrRes = useSWR("web3/useAccount", () => {
    return "Test User";
  });
  console.log(deps);
  console.log(params);
  return swrRes;
};

export const useAccount = hookFactory({ ethereum: null, provider: null });
