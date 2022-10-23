import { createContext, FunctionComponent, useContext, useState } from "react";
// interface Props {
//   children: React.ReactNode;
// }
const Web3Context = createContext<any>(null);

const Web3Provider: FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [web3Api, setWeb3Api] = useState({ test: " Hello Provider" });

  return (
    <Web3Context.Provider value={web3Api}>{children}</Web3Context.Provider>
  );
};

export function UseWeb3() {
  return useContext(Web3Context);
}

export default Web3Provider;
