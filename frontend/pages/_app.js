import '@/styles/globals.css'
import { ChakraProvider } from '@chakra-ui/react'
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { hardhat, goerli } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { Layout } from '@/components/Layout/Layout';
import { useState } from 'react'

const { chains, provider } = configureChains(
  [hardhat, goerli],
  [
    //alchemyProvider({ apiKey: process.env.ALCHEMY }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider
})

export default function App({ Component, pageProps }) {

  return (
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <ChakraProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ChakraProvider>
    </RainbowKitProvider>
  </WagmiConfig>
  )
}