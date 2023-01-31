import { Heading, Flex, Text, Textarea, Input, Button, useToast, Alert, AlertIcon } from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { useAccount, useContractRead, useProvider, useSigner } from 'wagmi'
import Contract from "../Voting.json"
import { ethers } from 'ethers'
import Link from 'next/link'
import { Proposal } from '@/components/Proposal/Proposal'

export default function Home({ }) {
  //WAGMI
  const { address, isConnected } = useAccount()
  const provider = useProvider()
  const { data: signer } = useSigner()

  //CHAKRA-UI
  const toast = useToast()

  //ADDRESS OF THE SMART CONTRACT
  const contractAddress = process.env.NEXT_PUBLIC_SCADDRESS

  //STATES//////////////////////

  //GLOBAL
  const [status, setStatus] = useState('Registering Voters')
  const [owner, setOwner] = useState('')
  const [isRegistered, setIsRegistered] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [voters, setVoters] = useState([])
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(false)
  const [ID, setID] = useState()
  const [winningProposal, setWinningProposal] = useState()

  //INPUTS
  const [proposalWritten, setProposalWritten] = useState('')
  const [addressVoter, setAddressVoter] = useState()

  //LISTENERS LOG
  useEffect(() => { console.log({ voters }) }, [voters])
  useEffect(() => { console.log({ isRegistered }) }, [isRegistered])
  useEffect(() => { console.log({ status }) }, [status])
  useEffect(() => { console.log('Listener proposal : ', { proposals }) }, [proposals])
  useEffect(() => { console.log({ proposalWritten }) }, [proposalWritten])
  useEffect(() => { console.log({ ID }) }, [ID])

  //USE EFFECT EVENTS
  useEffect(() => {
    if (isConnected) {
      getEvents()
    }
  }, [isConnected, address])

  //FUNCTIONS/////////////////////////

  //GET EVENTS AND STRUCTURE DATAS
  const getEvents = async () => {
    const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
    let owner = await contract.owner()
    setOwner(owner)

    //let blockNumber = await provider.getBlockNumber()

    let filter = {
      address: contractAddress,
      fromBlock: 0
    };

    let events = await contract.queryFilter(filter)
    let voterRegistered = [], workflowStatusChange = [], proposalRegistered = [], voted = [];

    events.forEach(e => {
      if (e.event === "VoterRegistered") {
        voterRegistered.push(e.args)
      }
      else if (e.event === "WorkflowStatusChange") {
        workflowStatusChange.push(e.args)
      }
      else if (e.event === "ProposalRegistered") {
        proposalRegistered.push(Number(e.args.proposalId.toString()))
      }
      else if (e.event === 'Voted') {
        voted.push(e.args)
      }
    })
    console.log({ voterRegistered, workflowStatusChange, proposalRegistered, voted })

    //SETTERS
    // is registered
    let voter = await getVoter(address)
    voter?.isRegistered ? setIsRegistered(true) : setIsRegistered(false)
    voter?.hasVoted ? setHasVoted(true) : setHasVoted(false)
    // voters
    setVoters(voterRegistered.map(e => e.voterAddress))
    //structure the voters array
    console.log('voter test : ', await getVoter(address))
    let votersModified = voters.map(async (voter) => {
      let vote = await getVoter(voter)
      console.log({ vote })
      return {
        votedProposalId: vote?.votedProposalId.toString(),
        isRegistered: vote?.isRegistered,
        hasVoted: vote?.hasVoted,
      }
    })
    Promise.all(votersModified).then(function (results) { setVoters(results) })
    //status
    let status;
    switch (workflowStatusChange.reduce(function (prev, cur) { return prev.newStatus > cur.newStatus ? prev.newStatus : cur.newStatus }, -Infinity)) {
      case 0: status = 'Registering voters'; break
      case 1: status = 'Proposals registration started'; break
      case 2: status = 'Proposals registration ended'; break
      case 3: status = 'Voting session started'; break
      case 4: status = 'Voting session ended'; break
      case 5: status = 'Votes tallied'; break
      default: status = 'Registering voters'; break
    }
    setStatus(status)
    //structure the proposals array
    const proposalsFound = proposalRegistered.map(async (id) => {
      let proposalFound = await getOneProposal(id)
      console.log({ proposalFound })
      return {
        id: id,
        description: proposalFound?.description,
        voteCount: voted.filter(e => Number(e.proposalId.toString()) === id).length
      }
    })
    Promise.all(proposalsFound).then(function (results) { setProposals(results) })
    //winning proposal
    for (let i = 0; i < proposals.length ; i++) {
      if(proposals[i].voteCount > proposals[i-1]?.voteCount) {setWinningProposal(proposals[i].id)}
    }
  }

  //ADDING VOTER
  ///@notice Allows to add a voter
  ///@param _addressVoter Address of the voter  
  const addVoter = async (addressVoter) => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.addVoter(addressVoter)
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Voter added !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured adding the voter : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  // STARTING THE PROPOSAL SESSION
  ///@notice Allows to start adding proposals
  const startProposalsRegistering = async () => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.startProposalsRegistering()
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Proposal Registering started !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured starting the proposal registering session : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  //ADD PROPOSAL
  ///@notice Allows to add a proposal to the voting process
  ///@param _description Description of the proposal
  const addProposal = async (description) => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.addProposal(description)
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Proposal added !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured adding the proposal : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  //GET PROPOSAL
  ///@notice Allows to get a proposal
  ///@param _id Id of the proposal
  const getOneProposal = async (id) => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
      let proposal = await contract.connect(address).getOneProposal(id)
      console.log('proposal in getOneProposal : ', proposal.voteCount.toString())
      return proposal
    }
    catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  //GET VOTER
  ///@notice Allows to get a voter
  ///@param _address Address of the voter
  const getVoter = async (address) => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, provider)
      let voter = await contract.connect(address).getVoter(address)
      console.log('voter in getVoter : ', voter)
      return voter
    }
    catch (err) {
      console.log(err)
    }
    setLoading(false)
  }

  // ENDING THE PROPOSAL SESSION
  ///@notice Allows to end the proposal registering session
  const endProposalsRegistering = async () => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.endProposalsRegistering()
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Proposal Registering ended !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured ending the proposal registering session : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  // STARTING THE VOTING SESSION
  ///@notice Allows to start the voting session
  ///@param _id Id of the proposal
  const startVotingSession = async () => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.startVotingSession()
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Voting session started !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured starting the voting session : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  //SET VOTE
  ///@notice Allows to vote for a proposal
  const setVote = async (id) => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.setVote(id)
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Vote saved !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured saving the vote : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  // ENDING THE VOTING SESSION
  ///@notice Allows to end the voting session
  const endVotingSession = async () => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.endVotingSession()
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Voting session ended !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured ending the voting session : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  // TALLYING VOTES
  ///@notice Allows to tally votes
  const tallyVotes = async () => {
    try {
      setLoading(true)
      const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
      let transaction = await contract.tallyVotes()
      await transaction.wait()
      getEvents()
      toast({
        title: 'Success',
        description: "Votes tallied !",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    }
    catch (err) {
      let start = err.toString().search("reverted with reason string") + 29
      let end = err.toString().search(`'"`)
      toast({
        title: 'Error',
        description: "An error occured tallying votes : " + err.toString().slice(start, end),
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  //NEXT STATUS
  ///@notice Allows to go to next Workflow status according to the current one
  const nextStatus = () => {
    switch (status) {
      case 'Registering voters':
        startProposalsRegistering()
        break
      case 'Proposals registration started':
        endProposalsRegistering()
        break
      case 'Proposals registration ended':
        startVotingSession()
        break
      case 'Voting session started':
        endVotingSession()
        break
      case 'Voting session ended':
        tallyVotes()
        break
      case 'Votes tallied':
        toast({
          title: 'The end',
          description: "Voting process fully ended, votes tallied.",
          status: 'warning',
          duration: 5000,
          isClosable: true,
        })
        break
      default: break
    }
  }

  return (
    <Flex width="100%" direction="column" alignItems="center" flexWrap="wrap" backgroundColor='#E2E8F0'>

      {isConnected ?
        <>
          <Flex width='100%' height='100%' flexDirection='column' alignItems='center'>
            <Flex width='100%' direction='row' justifyContent='space-between' alignItems='center' backgroundColor='#FFF' padding={5} borderRadius={10}>
              <Flex width="30%" direction='row' justifyContent='flex-start' alignItems='center'>
                <Text fontWeight='bold' >Current status : </Text>
                <Text margin='0px 20px 0px 5px' fontWeight='bold' >{status}</Text>
                {address === owner && status !== 'Votes tallied' && <Button colorScheme="blue" onClick={() => { nextStatus() }}>{status === 'Voting session ended' ? 'Tally votes' : 'Next step'}</Button>}
              </Flex>
              {address === owner && status === 'Registering voters' &&
                <Flex width="70%" direction="row" justifyContent='flex-end' alignItems='center'>
                  <Text fontWeight='bold'>Address : </Text>
                  <Input placeholder={`Voter's address`} width='50%' margin='0px 20px 0px 20px' onChange={e => setAddressVoter(e.target.value)} />
                  <Button colorScheme='blue' onClick={() => { addVoter(addressVoter) }}>Add voter</Button>
                </Flex>
              }
              {status === 'Proposals registration started' && isRegistered &&
                <Flex width="70%" direction="row" justifyContent='flex-end' alignItems='center'>
                  <Text fontWeight='bold'>Proposal :</Text>
                  <Input margin='0px 20px 0px 20px' width='50%' placeholder={`Enter your proposal here`} onChange={e => setProposalWritten(e.target.value)} />
                  <Button colorScheme='blue' onClick={() => { addProposal(proposalWritten) }}>Add proposal</Button>
                </Flex>
              }
              {status === 'Votes tallied' && isRegistered &&
                <Flex width="70%" direction="row" justifyContent='flex-end' alignItems='center'>
                  <Text fontWeight='bold'>Winning proposal : {winningProposal}</Text>
                </Flex>
              }
            </Flex>
            <Flex grow={1} width="100%" direction='row' justifyContent='space-evenly' flexWrap='wrap'>
              {proposals?.length > 0 ?
                proposals.map(proposal => {
                  return (
                    <Proposal proposal={proposal} setVote={setVote} status={status} isRegistered={isRegistered} hasVoted={hasVoted} loading={loading} winningProposal={winningProposal}/>
                  )
                })
                :
                <Flex height="100%" width="100%" alignItems="center" justifyContent="center">
                  <Alert status='warning' width="300px">
                    <AlertIcon />
                    <Flex direction="column">
                      <Text as='span'>No proposal yet.</Text>
                      <Text><Link href="addaproposal" style={{ "fontWeight": "bold" }}>Add a proposal !</Link></Text>
                    </Flex>
                  </Alert>
                </Flex>
              }
            </Flex>
          </Flex>
        </>
        :
        <Flex height="100%" width="100%" alignItems="center" justifyContent="center">
          <Alert status='warning' width="250px">
            <AlertIcon />
            <Flex direction="column">
              <Text as='span'>Connect your wallet !</Text>
            </Flex>
          </Alert>
        </Flex>
      }

    </Flex >

  )
}
