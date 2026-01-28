 import CryptoCurrencyTicker1 from "../component/home/CryptoCurrencyTicker1";
import Navbar from "../component/user/layout/Navbar";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <CryptoCurrencyTicker1 />
      <main>{children}</main>
    </>
  );
}
