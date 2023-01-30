const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

//min 500 lignes - ideal 1200 lignes

//beforeEach
    //function by function 
    //modifier by modifier

//workflow general status

// expect revert et events
// assert
// read me ++
// mini 90% de coverage
// changer une valeur, la récupérer et compare avec l'attendu
// before async

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Units tests of Voting smart contract : ", function () {
        let accounts;
        let voting;
        before(async () => {
            accounts = await ethers.getSigners() 
            deployer = accounts[0]
        })

        // WORKFLOW EVERYTHING IS OK
        describe("Registering", async function() {
            beforeEach(async() => {
                await deployments.fixture(["voting"])
                voting = await ethers.getContract("Voting")
                //add owner as voter here to access all getters then
                await voting.addVoter(deployer.getAddress())
            })

            it("Should have added owner as voter", async function() {          
                //check if owner well registered during beforeEach  
                let voter = await voting.getVoter(deployer.getAddress())
                assert(voter.isRegistered === true)
            })
            it("Should add any address as voter", async function() {            
                await voting.addVoter(accounts[1].getAddress())
                let voter = await voting.getVoter(accounts[1].getAddress())
                assert(voter.isRegistered === true)
            })
            it("Should emit the event VoterRegistered", async function() {            
                await expect(await voting.addVoter(accounts[2].getAddress())).to.emit(
                    voting,
                    "VoterRegistered"
                )
            })
            it("Should NOT add an address as voter if i am NOT the owner", async function() {            
                await expect(voting.connect(accounts[1]).addVoter(accounts[3].getAddress())).to.be.revertedWith("Ownable: caller is not the owner")
            })
            it("Should NOT add an address as voter if already registered", async function() {            
                await voting.addVoter(accounts[1].getAddress())
                await expect(voting.addVoter(accounts[1].getAddress())).to.be.revertedWith("Already registered")
            })

            it("Should be possible to check a voter registeration", async function() {
                await voting.startProposalsRegistering()
                let voter = await voting.getVoter(deployer.getAddress())
                assert(voter.isRegistered === true)
            })

            it("Should NOT be possible to submit a proposal", async function() {                            
                await expect(voting.addProposal("Too early")).to.be.revertedWith("Proposals are not allowed yet")
            })

            it("Should NOT be possible to vote", async function() {                            
                await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet")
            })

            it("Should NOT be possible to tally votes now ", async function() { 
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended")
            })

            it("Should NOT be possible to end anything now or start voting", async function() { 
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet")
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet")
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished")
                
            })

        })

        //STEP BY STEP
        describe("Registering", async function() {
            beforeEach(async() => {
                await deployments.fixture(["voting"])
                voting = await ethers.getContract("Voting")
                //add owner as voter here to access all getters then
                await voting.addVoter(deployer.getAddress())
            })

            it("Should have added owner as voter", async function() {          
                //check if owner well registered during beforeEach  
                let voter = await voting.getVoter(deployer.getAddress())
                assert(voter.isRegistered === true)
            })
            it("Should add any address as voter", async function() {            
                await voting.addVoter(accounts[1].getAddress())
                let voter = await voting.getVoter(accounts[1].getAddress())
                assert(voter.isRegistered === true)
            })
            it("Should emit the event VoterRegistered", async function() {            
                await expect(await voting.addVoter(accounts[2].getAddress())).to.emit(
                    voting,
                    "VoterRegistered"
                )
            })
            it("Should NOT add an address as voter if i am NOT the owner", async function() {            
                await expect(voting.connect(accounts[1]).addVoter(accounts[3].getAddress())).to.be.revertedWith("Ownable: caller is not the owner")
            })
            it("Should NOT add an address as voter if already registered", async function() {            
                await voting.addVoter(accounts[1].getAddress())
                await expect(voting.addVoter(accounts[1].getAddress())).to.be.revertedWith("Already registered")
            })

            it("Should be possible to check a voter registeration", async function() {
                await voting.startProposalsRegistering()
                let voter = await voting.getVoter(deployer.getAddress())
                assert(voter.isRegistered === true)
            })

            it("Should NOT be possible to submit a proposal", async function() {                            
                await expect(voting.addProposal("Too early")).to.be.revertedWith("Proposals are not allowed yet")
            })

            it("Should NOT be possible to vote", async function() {                            
                await expect(voting.setVote(0)).to.be.revertedWith("Voting session havent started yet")
            })

            it("Should NOT be possible to tally votes now ", async function() { 
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended")
            })

            it("Should NOT be possible to end anything now or start voting", async function() { 
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet")
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet")
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished")
                
            })

        })


        describe("Adding proposals", async function() {
            beforeEach(async() => {
                await deployments.fixture(["voting"])
                voting = await ethers.getContract("Voting")
                //add owner as voter here to access all getters then
                await voting.addVoter(deployer.getAddress())
            })

            it("Should open adding session, so get a proposals[0] equal to GENESIS", async function() {          
                await voting.startProposalsRegistering()
                let proposal = await voting.getOneProposal(0)
                console.log(proposal.description) 
                assert(proposal.description === "GENESIS")
            })
            it("Should NOT open adding session if not the owner", async function() {          
                await expect(voting.connect(accounts[1]).startProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner")
            })
            it("Should emit the event WorkflowStatusChange", async function() {
                await expect(await voting.startProposalsRegistering()).to.emit(
                    voting,
                    "WorkflowStatusChange"
                )
            })
            
            it("Should NOT be possible to vote at this step", async function() {        
                await voting.startProposalsRegistering()    
                await expect(voting.setVote(1)).to.be.revertedWith("Voting session havent started yet")
            })
            
            it("Should be possible to get a proposal description", async function() {
                await voting.startProposalsRegistering()
                await voting.addProposal("Here is a proposal")
                let proposal = await voting.getOneProposal(1)
                console.log(proposal.description)
                assert(proposal.description === "Here is a proposal")
            })
            it("Should be possible to check a voter registeration", async function() {
                await voting.startProposalsRegistering()
                let voter = await voting.getVoter(deployer.getAddress())
                assert(voter.isRegistered === true)
            })

            it("Should be possible to add a proposal", async function() {
                await voting.startProposalsRegistering()
                await voting.addProposal("First")
                let first = await voting.getOneProposal(1)
                console.log(first.description)
                assert(first.description === "First")
            })
            it("Should NOT be possible to add a proposal if not registered", async function() {
                await voting.startProposalsRegistering()
                await expect(voting.connect(accounts[3]).addProposal("Other one")).to.be.revertedWith(`You're not a voter`)
            })
            it("Should NOT be possible to add an empty proposal", async function() {
                await voting.startProposalsRegistering()
                await expect(voting.addProposal("")).to.be.revertedWith(`Vous ne pouvez pas ne rien proposer`)
            })

            it("Should NOT be possible to add a voter now", async function() {
                await voting.startProposalsRegistering()            
                await expect(voting.addVoter(accounts[3].getAddress())).to.be.revertedWith("Voters registration is not open yet")
            })

            it("Should close correctly when ending proposal registering", async function() {
                await voting.startProposalsRegistering()
                await expect(await voting.endProposalsRegistering()).to.emit(
                    voting,
                    "WorkflowStatusChange"
                )
            })
            it("Should NOT be possible to add a proposal when closed", async function() {
                await voting.startProposalsRegistering()
                await voting.endProposalsRegistering()
                await expect(voting.addProposal('Too late')).to.be.revertedWith("Proposals are not allowed yet")
            })

            it("Should emit a WorkflowStatus event when closing", async function() {
                await voting.startProposalsRegistering()
                await expect(await voting.endProposalsRegistering()).to.emit(
                    voting,
                    "WorkflowStatusChange"
                )
            })

            it("Should NOT close proposal session if not the owner", async function() {          
                await expect(voting.connect(accounts[1]).endProposalsRegistering()).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("Should NOT be possible to tally votes now ", async function() { 
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended")
            })

        })

        describe("Voting", async function() {
            beforeEach(async() => {
                await deployments.fixture(["voting"])
                voting = await ethers.getContract("Voting")
                //... register deployer + 2 accounts ...
                await voting.addVoter(deployer.getAddress())
                await voting.addVoter(accounts[1].getAddress())
                await voting.addVoter(accounts[2].getAddress())
                //open proposal session...
                await voting.startProposalsRegistering()                
                //... and add 3 proposals
                await voting.connect(accounts[1]).addProposal("First")
                await voting.connect(accounts[2]).addProposal("Second")
                await voting.addProposal("Third") 
                //end proposal registering
                await voting.endProposalsRegistering()           
            })

            it("Should NOT open voting session if NOT the owner", async function() {          
                await expect(voting.connect(accounts[1]).startVotingSession()).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("should be possible to get a proposal description", async function() {
                let proposal = await voting.getOneProposal(3)
                assert(proposal.description === "Third") 
            })

            it("Should vote for a proposal and see the voted proposal id", async function() {          
                await voting.startVotingSession()
                await voting.setVote(1)
                let voter = await voting.getVoter(deployer.getAddress())
                console.log(voter.votedProposalId.toString()) 
                assert(voter.votedProposalId.toString() === "1")
            })
            it("Should increment the voted proposal vote count", async function() {          
                await voting.startVotingSession()
                await voting.setVote(1)
                await voting.connect(accounts[1]).setVote(1)
                let vote = await voting.getOneProposal(1)
                console.log(vote.voteCount.toString()) 
                assert(vote.voteCount.toString() === "2")
            })
            it("Should set hasVoted in order to vote only once", async function() {          
                await voting.startVotingSession()
                await voting.setVote(1)
                let voter = await voting.getVoter(deployer.getAddress())
                console.log(voter.hasVoted) 
                assert(voter.hasVoted === true)
            })
            it("Should NOT vote a second time so, or to change the vote", async function() {          
                await voting.startVotingSession()
                await voting.setVote(1)
                await expect(voting.setVote(2)).to.be.revertedWith("You have already voted")
            })
            it("Should NOT vote for a proposal if NOT registered", async function() {          
                await voting.startVotingSession()
                await expect(voting.connect(accounts[3]).setVote(1)).to.be.revertedWith(`You're not a voter`)
            })
            it("Should NOT vote for a unexisting proposal", async function() {          
                await voting.startVotingSession()
                await expect(voting.setVote(5)).to.be.revertedWith(`Proposal not found`)
            })

            it("Should NOT be possible to add a proposal now it's closed", async function() {
                await voting.startVotingSession()  
                await expect(voting.addProposal('Too late')).to.be.revertedWith("Proposals are not allowed yet")
            })
            it("Should NOT be possible to add a voter now", async function() {  
                await voting.startVotingSession()                          
                await expect(voting.addVoter(accounts[3].getAddress())).to.be.revertedWith("Voters registration is not open yet")
            })

            it("Should emit a Voted event", async function() {
                await voting.startVotingSession()  
                await expect(await voting.setVote(1)).to.emit(
                    voting,
                    "Voted"
                )
            })

            it("Should NOT be possible to vote after closing voting session", async function() {
                await voting.startVotingSession()  
                await voting.endVotingSession()  
                await expect(voting.setVote(1)).to.be.revertedWith("Voting session havent started yet")
            })

            it("Should emit a WorkflowStatus event when closing", async function() { 
                await voting.startVotingSession()  
                await expect(await voting.endVotingSession()).to.emit(
                    voting,
                    "WorkflowStatusChange"
                )
            })

            it("Should NOT close voting session if not the owner", async function() {          
                await expect(voting.connect(accounts[1]).endVotingSession()).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("Should NOT be possible to start registering proposal now ", async function() { 
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it("Should NOT be possible to end proposal registering now ", async function() { 
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet")
            })

            it("Should NOT be possible to tally votes now ", async function() { 
                await expect(voting.tallyVotes()).to.be.revertedWith("Current status is not voting session ended")
            })

        })

        describe("Closing session", async function() {
            beforeEach(async() => {
                await deployments.fixture(["voting"])
                voting = await ethers.getContract("Voting")
                //... register deployer + 2 accounts ...
                await voting.addVoter(deployer.getAddress())
                await voting.addVoter(accounts[1].getAddress())
                await voting.addVoter(accounts[2].getAddress())
                //open proposal session...
                await voting.startProposalsRegistering()                
                //... and add 3 proposals
                await voting.connect(accounts[1]).addProposal("First")
                await voting.connect(accounts[2]).addProposal("Second")
                await voting.addProposal("Third") 
                //end proposal registering
                await voting.endProposalsRegistering()
                //start voting session
                await voting.startVotingSession()
                //vote with 3 voters for a winning proposal 1 (First) with a vote count of 2 
                await voting.setVote(1)
                await voting.connect(accounts[1]).setVote(1)
                await voting.connect(accounts[2]).setVote(2)
                //end voting session
                await voting.endVotingSession()
            })

            it("Should emit a WorkflowStatus event when closing the whole session", async function() { 
                await expect(await voting.tallyVotes()).to.emit(
                    voting,
                    "WorkflowStatusChange"
                )
            })

            it("Should NOT be possible to close the whole process if NOT the owner", async function() { 
                await expect(voting.connect(accounts[2]).tallyVotes()).to.be.revertedWith("Ownable: caller is not the owner")
            })

            it("Should be possible to get a proposal description", async function() { 
                let proposal = await voting.getOneProposal(1)
                assert(proposal.description === "First")
            })

            it("Should be possible to get a proposal vote count", async function() { 
                let proposal = await voting.getOneProposal(1)
                assert(proposal.voteCount.toString() === "2")
            })

            it("Should be possible to get a voter vote", async function() { 
                let voter = await voting.getVoter(accounts[1].getAddress())
                assert(voter.votedProposalId.toString() === "1")
            })

            it("Should be possible to check a voter registration", async function() { 
                let voter = await voting.getVoter(accounts[1].getAddress())
                assert(voter.isRegistered === true)
            })

            it("Should be possible to check a voter vote status", async function() { 
                let voter = await voting.getVoter(accounts[1].getAddress())
                assert(voter.hasVoted === true)
            })

            it("Should NOT be possible to check a voter or proposal if not registered", async function() { 
                await expect(voting.connect(accounts[3]).getOneProposal(1)).to.be.revertedWith(`You're not a voter`)
                await expect(voting.connect(accounts[3]).getVoter(accounts[1].getAddress())).to.be.revertedWith(`You're not a voter`)
            })

            it("Should give the right winningProposalID after tallying votes", async function() { 
                await voting.tallyVotes()
                let result = await voting.winningProposalID()         
                assert(result.toString() === ethers.BigNumber.from("1").toString())
            })

            it("Should NOT give the right winningProposalID before tallying votes", async function() { 
                let result = await voting.winningProposalID()       
                assert(result.toString() === ethers.BigNumber.from("0").toString())
            })

            it("should NOT be possible to register a voter before and after tally", async function() { 
                await expect(voting.addVoter(accounts[5].getAddress())).to.be.revertedWith("Voters registration is not open yet")
                await voting.tallyVotes()
                await expect(voting.addVoter(accounts[5].getAddress())).to.be.revertedWith("Voters registration is not open yet")
            })
            
            it("should NOT be possible to add proposal before and after tally", async function() { 
                await expect(voting.addProposal("Really too late")).to.be.revertedWith("Proposals are not allowed yet")
                await voting.tallyVotes()
                await expect(voting.addProposal("Really too late")).to.be.revertedWith("Proposals are not allowed yet")
            })

            it("should NOT be possible to vote for a proposal before and after tally", async function() { 
                await expect(voting.setVote(2)).to.be.revertedWith("Voting session havent started yet")
                await voting.tallyVotes()
                await expect(voting.setVote(2)).to.be.revertedWith("Voting session havent started yet")
            })
            
            it("Should NOT be possible to start registering proposal now ", async function() { 
                await expect(voting.startProposalsRegistering()).to.be.revertedWith("Registering proposals cant be started now")
            })

            it("Should NOT be possible to start voting now ", async function() { 
                await expect(voting.startVotingSession()).to.be.revertedWith("Registering proposals phase is not finished")
            })

            it("Should NOT be possible to end anything now ", async function() { 
                await expect(voting.endVotingSession()).to.be.revertedWith("Voting session havent started yet")
                await expect(voting.endProposalsRegistering()).to.be.revertedWith("Registering proposals havent started yet")
            })

        })
    })