import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps ->  provider, ethereum, contract (web3state)
export const hookFactory: AccountHookFactory =
  ({ provider }) =>
  (params) => {
    const swrRes = useSWR(provider ? "web3/useAccount" : null, () => {
      return "Test User";
    });

    return swrRes;
  };
