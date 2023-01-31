import { Button, Text, Card, CardHeader, CardBody, CardFooter, Flex } from '@chakra-ui/react'
import { useAccount } from 'wagmi'

export const Proposal = ({ proposal, setVote, status, isRegistered, hasVoted, loading, winningProposal }) => {
    const { address } = useAccount()
    return (
        <Card margin={5} minWidth="30%" height='40%' backgroundColor={status === 'Votes tallied' && winningProposal === proposal.id ? '#2F8' : '#FFF'}>
            <CardBody>
                <Flex height='100%' direction='column' justifyContent='space-between' alignItems='center'>
                    <Flex width='100%' direction='row' justifyContent='space-between' alignItems='center' >
                        <Text mb={2} width='30%' textAlign='start' fontWeight='bolder'> Proposal n°{proposal.id}</Text>
                        <Text mb={2} width='30%' textAlign='end' fontWeight='bolder'> 💌 {proposal.voteCount}</Text>
                    </Flex>
                    <Text fontSize={22} mb={2}>{proposal.description}</Text>
                    {status === 'Voting session started' && isRegistered && !hasVoted ?
                    <Button isLoading={loading} colorScheme='green' width='22%' onClick={()=>{setVote(proposal.id)}}>
                        Vote
                    </Button>
                    :
                    <Button cursor='not-allowed' colorScheme='gray' width='22%'>
                        Vote
                    </Button>
                    }
                </Flex>
            </CardBody>
        </Card>
    )
}