import { CryptoHookFactory } from "@_types/hooks";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>;

type UseAccountResponse = {
  connect: () => void;
};

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps ->  provider, ethereum, contract (web3state)
export const hookFactory: AccountHookFactory =
  ({ provider, ethereum }) =>
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
      // Preventing funcion trigger on focus
      {
        revalidateOnFocus: false,
      }
    );

    const connect = async () => {
      try {
        ethereum?.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log(error);
      }
    };

    return {
      ...swrRes,
      connect,
    };
  };
