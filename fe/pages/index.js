import dynamic from "next/dynamic";

const CoinFlip = dynamic(() => import("../components/CoinFlip"), { ssr: false });

export default function Home() {
  return (
    <main>
      <h1>⚡ Coin Flip Game</h1>
      <CoinFlip />
    </main>
  );
}
