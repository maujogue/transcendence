from web3 import Web3
from django.conf import settings

def set_message_in_contract(contract_address):
    with open("compiledSolidity.json", "r") as file:
        compiledSolidity = json.load(file)
    
    w3 = Web3(HTTPProvider(settings.PROVIDER_URL))
    abi = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentsScore"]["abi"]

    contract = w3.eth.contract(
        address=contract_address,
        abi=abi
    )

    nonce = w3.eth.get_transaction_count(settings.WALLET)

    transaction = contract.functions.setMessage("communication is a SUCCESS").build_transaction({
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