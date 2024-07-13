from web3 import Web3, HTTPProvider
import os
import json
import logging

logger = logging.getLogger(__name__)

# CHAIN_ID = os.environ.get("CHAIN_ID")
# WALLET = os.environ.get("WALLET")
# PRIVATE_KEY = os.environ.get("PRIVATE_KEY")
# PROVIDER_URL = os.environ.get("PROVIDER_URL")
# CONTRACT_ADDRESS = os.environ.get("CONTRACT_ADDRESS")
CHAIN_ID = 11155111
WALLET = "0x08Cad489Ad4542AF82Ee81eC949776775dea23be"
PRIVATE_KEY = "c38331b12e562919c0d636d90d526accf9e1b442f31cb6cd6254e1c231b97859"
PROVIDER_URL = "https://sepolia.infura.io/v3/098a45a55c344ef8ac3da0ba6270fd1f"
CONTRACT_ADDRESS = "0x9A0747a3555F00AA610553e07Cb84f15e60FD5cF"

def load_contract_abi():
    logger.info("into load_contract_abi()")
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "compiledSolidity.json")
    with open(json_path, "r") as file:
        compiled_solidity = json.load(file)
    abi = compiled_solidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["abi"]

    return abi

def set_data_on_blockchain(tournament):
    try:
        logger.info("Entering into set_data_on_blockchain")
        print("entering into set_data_on_blockchain")
        print(f"CONTRACT_ADDRESS: {CONTRACT_ADDRESS}")
        tournament_winner = tournament.get_winner()
        tournament_name = tournament.name

        abi = load_contract_abi()
        w3 = Web3(HTTPProvider(PROVIDER_URL))
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
        nonce = w3.eth.get_transaction_count(WALLET, 'pending')

        matches = []
        for match in tournament.matchups.all():
            matches.append({
                'round': str(match.round),
                'player1': match.player1,
                'scorePlayer1':str(match.score_player_1),
                'player2':match.player2,
                'scorePlayer2':str(match.score_player_2),
                'matchWinner': match.winner
            })

        transaction = contract.functions.addTournament(tournament_name,
                                                             tournament_winner,
                                                             matches
        ).build_transaction({
            'gasPrice': w3.eth.gas_price,
            'chainId': CHAIN_ID,
            'from': WALLET,
            'nonce': nonce
        })
        signed_transaction = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
        print("Waiting for transaction to finish...")
        transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
        print("Done! Matches and winner set.")
        return transaction_receipt
    except Exception as e:
        print(f"Error deploying contract: {e}")
        return f"Failed to initiate transaction: {str(e)}"
