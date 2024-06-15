from web3 import Web3, HTTPProvider
from django.conf import settings
import os
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOCKCHAIN_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../blockchain"))

def load_contract_abi():
    contract_json_path = os.path.abspath(os.path.join(BLOCKCHAIN_DIR, "compiledSolidity.json"))
    with open(contract_json_path, "r") as file:
        compiled_solidity = json.load(file)
    abi = compiled_solidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["abi"]

    return abi


def set_tournament_winner(contract_address, tournament_winner):
    abi = load_contract_abi()

    w3 = Web3(HTTPProvider(settings.PROVIDER_URL))
    contract = w3.eth.contract(address=contract_address, abi=abi)

    nonce = w3.eth.get_transaction_count(settings.WALLET)

    transaction = contract.functions.addMatch(tournament_winner).build_transaction({
        'gasPrice': w3.eth.gas_price,
        'chainId': settings.CHAIN_ID,
        'from': settings.WALLET,
        'nonce': nonce
    })
    signed_transaction = w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
    transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    print("Waiting for transaction to finish...")
    transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
    print("Done! Match added.")



def add_match(
        contract_address,
        match_id,
        round,
        player1,
        score_player1,
        player2,
        score_player2,
        match_winner):

    abi = load_contract_abi()

    w3 = Web3(HTTPProvider(settings.PROVIDER_URL))
    contract = w3.eth.contract(address=contract_address, abi=abi)

    nonce = w3.eth.get_transaction_count(settings.WALLET)

    transaction = contract.functions.addMatch(
        match_id,
        round,
        player1,
        score_player1,
        player2,
        score_player2,
        match_winner
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
    print("Done! Match added.")






# def set_message_in_contract(contract_address, new_message):
#     contract_json_path = os.path.abspath(os.path.join(BLOCKCHAIN_DIR, "compiledSolidity.json"))
#     with open(contract_json_path, "r") as file:
#         compiledSolidity = json.load(file)
    
#     w3 = Web3(HTTPProvider(settings.PROVIDER_URL))
#     abi = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentsScore"]["abi"]

#     contract = w3.eth.contract(
#         address=contract_address,
#         abi=abi
#     )

#     nonce = w3.eth.get_transaction_count(settings.WALLET)

#     transaction = contract.functions.setMessage(new_message).build_transaction({
#         'gasPrice': w3.eth.gas_price,
#         'chainId': settings.CHAIN_ID,
#         'from': settings.WALLET,
#         'nonce': nonce
#     })

#     signed_transaction = w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
#     transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
#     print("Waiting for transaction to finish...")
#     transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
#     print("Done! Message set.")