import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string>;

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps ->  provider, ethereum, contract (web3state)
export const hookFactory: AccountHookFactory =
  ({ provider }) =>
  () => {
    const swrRes = useSWR(
      provider ? "web3/useAccount" : null,
      async () => {
        const accounts = await provider!.listAccounts();
        const account = accounts[0];

        if (!account) {
          throw "Cannot retrieve account! Please connect to web3 wallet.";
        }
        return account;
      },
      // Preventing funtion trigger on focus
      {
        revalidateOnFocus: false,
      }
    );

    return swrRes;
  };
