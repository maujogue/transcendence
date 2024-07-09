from web3 import Web3, HTTPProvider
import os
import json

CHAIN_ID = os.environ.get("CHAIN_ID")
WALLET = os.environ.get("WALLET")
PRIVATE_KEY = os.environ.get("PRIVATE_KEY")
PROVIDER_URL = os.environ.get("PROVIDER_URL")
CONTRACT_ADDRESS = os.environ.get("CONTRACT_ADDRESS")

def load_contract_abi():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "compiledSolidity.json")
    with open(json_path, "r") as file:
        compiled_solidity = json.load(file)
    abi = compiled_solidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["abi"]

    return abi

def set_data_on_blockchain(tournament):
    try:
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

# def get_matches_by_player(tournament, player_name):
#     contract_address = CONTRACT_ADDRESS

#     abi = load_contract_abi()
#     w3 = Web3(HTTPProvider(PROVIDER_URL))
#     contract = w3.eth.contract(address=contract_address, abi=abi)
#     matches = contract.functions.getMatches().call()

#     player_matches = [{
#             'round': match[1],
#             'player1': match[2],
#             'score_player_1': match[3],
#             'player2': match[4],
#             'score_player_2': match[5],
#             'match_winner': match[6],
#         }
#         for match in matches if match[2] == player_name or match[4] == player_name
#     ]
#     return player_matches