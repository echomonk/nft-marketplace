import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string, string>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps ->  provider, ethereum, contract (web3state)
export const hookFactory: AccountHookFactory = (deps) => (params) => {
  const swrRes = useSWR("web3/useAccount", () => {
    return "Test User";
  });

  return swrRes;
};
