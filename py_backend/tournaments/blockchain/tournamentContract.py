from web3 import Web3, HTTPProvider
import os
import json

# reset-up your env with the new libraries in the requirements.txt

def deploy_tournament_contract():
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        json_path = os.path.join(script_dir, "compiledSolidity.json")
        with open(json_path, "r") as file:
            compiledSolidity = json.load(file)

        w3 = Web3(HTTPProvider(PROVIDER_URL))

        abi = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["abi"]
        bytecode = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentData"]["evm"]["bytecode"]["object"]

        contract = w3.eth.contract(abi=abi, bytecode=bytecode)

        nonce = w3.eth.get_transaction_count(WALLET)

        transaction = contract.constructor().build_transaction({
            'gasPrice': w3.eth.gas_price,
            'chainId': CHAIN_ID,
            'from': WALLET,
            'nonce': nonce
        })

        signed_transaction = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
        print("Waiting for transaction for deploying contract to finish...")
        transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
        print("Done! Contract deployed.")

        contract_address = transaction_receipt.contractAddress

        if contract_address:
            print(f"contract address: {contract_address}")
            return contract_address
        else:
            print("contract address wasn't created.")
            return None

    except Exception as e:
        print(f"Error deploying contract: {e}")
        return None

if __name__ == "__main__":
    tournament_name = "tournamentName"
    deploy_tournament_contract(tournament_name)