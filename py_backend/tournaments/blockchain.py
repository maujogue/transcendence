from web3 import Web3, HTTPProvider
import os
import json
from dotenv import load_dotenv
# import logging
# from asgiref.sync import sync_to_async

# logger = logging.getLogger(__name__)

CONTRACT_ADDRESS = os.environ.get("CONTRACT_ADDRESS")

load_dotenv(".env.tournament")

CHAIN_ID = 11155111 #Sepolia chain ID
WALLET = os.getenv("WALLET")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
PROVIDER_URL = os.getenv("PROVIDER_URL")

def load_abi_from_file(json_path):
    with open(json_path, "r") as file:
        compiled_solidity = json.load(file)
    return compiled_solidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["abi"]

def load_contract_abi():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "compiledSolidity.json")
    abi = load_abi_from_file(json_path)

    return abi

def set_data_on_blockchain(tournament):
    try:
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
        transaction = contract.functions.addTournament(
            tournament_name,
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
        transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash, timeout=600)
        print("Done! Matches and winner set.")
        return transaction_receipt
    except Exception as e:
        print(f"Error deploying contract: {e}")
        return None
