import { CryptoHookFactory } from "@_types/hooks";
import { useEffect } from "react";
import useSWR from "swr";

type AccountHookFactory = CryptoHookFactory<string, UseAccountResponse>;

type UseAccountResponse = {
  connect: () => void;
  isLoading: boolean;
  isInstalled: boolean;
};

export type UseAccountHook = ReturnType<AccountHookFactory>;

// deps ->  provider, ethereum, contract (web3state)
export const hookFactory: AccountHookFactory =
  ({ provider, ethereum, isLoading }) =>
  () => {
    const { data, mutate, isValidating, ...swr } = useSWR(
      provider ? "web3/useAccount" : null,
      async () => {
        const accounts = await provider!.listAccounts();
        const account = accounts[0];

        if (!account) {
          throw "Cannot retrieve account! Please connect to web3 wallet.";
        }
        return account;
      },

      // Preventing function trigger on focus
      {
        revalidateOnFocus: false,
      }
    );

    //--------------------------------------------------------------------------------------//
    //                                Account Change Handler                                //
    //--------------------------------------------------------------------------------------//

    useEffect(() => {
      ethereum?.on("accountsChanged", handleAccountChange);
      return () => {
        ethereum?.removeListener("accountsChanged", handleAccountChange);
      };
    });

    const handleAccountChange = (...args: unknown[]) => {
      const accounts = args[0] as string;

      if (accounts.length === 0) {
        console.error("Please connect to web3 wallet.");
      } else if (accounts[0] !== data) {
        // To display the address when use changes
        mutate(accounts[0]);
      }
    };

    //--------------------------------------------------------------------------------------//
    //                                   Connect Metamask                                   //
    //--------------------------------------------------------------------------------------//

    const connect = async () => {
      try {
        ethereum?.request({ method: "eth_requestAccounts" });
      } catch (error) {
        console.log(error);
      }
    };

    return {
      ...swr,
      data,
      isValidating,
      isLoading: isLoading || isValidating,
      isInstalled: ethereum?.isMetaMask || false,
      mutate,
      connect,
    };
  };
