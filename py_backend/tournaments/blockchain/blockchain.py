from web3 import Web3, HTTPProvider
from django.conf import settings
import os
import json

from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

def load_contract_abi():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "compiledSolidity.json")
    with open(json_path, "r") as file:
        compiled_solidity = json.load(file)
    abi = compiled_solidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["abi"]

    return abi

@database_sync_to_async
def set_data_on_blockchain(tournament):
    contract_address = tournament.contract_address
    tournament_winner = tournament.get_winner()

    abi = load_contract_abi()
    w3 = Web3(HTTPProvider(settings.PROVIDER_URL))
    contract = w3.eth.contract(address=contract_address, abi=abi)
    nonce = w3.eth.get_transaction_count(settings.WALLET)

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

    #get all matches into an array or something like that before sending them
    transaction = contract.functions.setDataOnBlockchain(tournament_winner, matches
    ).build_transaction({
        'gasPrice': w3.eth.gas_price,
        'chainId': settings.CHAIN_ID,
        'from': settings.WALLET,
        'nonce': nonce
    })
    signed_transaction = w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
    transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    print("Waiting for transaction to finish...")
    transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
    print("Done! Matches and winner set.")
