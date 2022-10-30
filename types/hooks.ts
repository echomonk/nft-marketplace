import { MetaMaskInpageProvider } from "@metamask/providers";
import { Contract, providers } from "ethers";
import { SWRResponse } from "swr";

export type Web3Dependencies = {
  ethereum: MetaMaskInpageProvider;
  provider: providers.Web3Provider;
  contract: Contract;
};

export type CryptoSWRResponse = SWRResponse;

export type CryptoHandlerHook = (params: string) => CryptoSWRResponse;

export type CryptoHookFactory = {
  (d: Partial<Web3Dependencies>): CryptoHandlerHook;
};
