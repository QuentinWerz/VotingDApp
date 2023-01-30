import { Button, Text, Card, CardHeader, CardBody, CardFooter } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

export const Proposal = ({ proposal }) => {
    const { address } = useAccount()
    return (
        <Card mt={["1rem", "1rem", 0,0]} minWidth="30%" ml="1%" mr="1%">
            <CardBody>
                <Text>
                    {proposal.id} {proposal.description}
                </Text>
                <Button onClick={()=>{}}>
                    Vote
                </Button>
            </CardBody>
        </Card>
    )
}