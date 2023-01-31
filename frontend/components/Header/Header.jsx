import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Flex, Text } from '@chakra-ui/react'
import Link from 'next/link'
import Head from 'next/head'

export const Header = ({  }) => {
    return (
        <>
            <Head>
                <title>Voting DApp</title>
                <meta name="description" content="Voting DApp" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Flex h="10vh" p="2rem" justifyContent="space-between" alignItems="center">
                <Text fontWeight={'extrabold'} fontSize={20}>💌 Voting DApp</Text>
                <Flex
                    direction='row'
                    justifyContent="space-between"
                    alignItems="center"
                    width="25%"
                >

                </Flex>
                <ConnectButton />
            </Flex>
        </>
    )
}