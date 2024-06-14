from web3 import Web3, HTTPProvider
from django.conf import settings
import os
import json


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOCKCHAIN_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../../../blockchain"))

def get_contract_address():
    contract_address_path = os.path.abspath(os.path.join(BLOCKCHAIN_DIR, "contract_address.txt"))
    try:
        with open(contract_address_path, "r") as file:
            contract_address = file.read().strip()
        return contract_address
    except Exception as e:
        print(f"Error loading contract address: {e}")
        return None


def set_message_in_contract(contract_address, new_message):
    contract_json_path = os.path.abspath(os.path.join(BLOCKCHAIN_DIR, "compiledSolidity.json"))
    with open(contract_json_path, "r") as file:
        compiledSolidity = json.load(file)
    
    w3 = Web3(HTTPProvider(settings.PROVIDER_URL))
    abi = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentsScore"]["abi"]

    contract = w3.eth.contract(
        address=contract_address,
        abi=abi
    )

    nonce = w3.eth.get_transaction_count(settings.WALLET)

    transaction = contract.functions.setMessage(new_message).build_transaction({
        'gasPrice': w3.eth.gas_price,
        'chainId': settings.CHAIN_ID,
        'from': settings.WALLET,
        'nonce': nonce
    })

    signed_transaction = w3.eth.account.sign_transaction(transaction, settings.PRIVATE_KEY)
    transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
    print("Waiting for transaction to finish...")
    transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
    print("Done! Message set.")