import { Flex, Text } from '@chakra-ui/react'

export const Footer = ( { } ) => {
    return (
        <Flex h="15vh" p="2rem" justifyContent="center" alignItems="center">
            <Text> &copy; Quentin Werz { new Date().getFullYear() } </Text>
        </Flex>
    )
}