from web3 import Web3, HTTPProvider
import os
import json

# reset-up your env with the new libraries in the requirements.txt

# constants
CHAIN_ID = 11155111  # Sepolia chain ID
WALLET = '0x08Cad489Ad4542AF82Ee81eC949776775dea23be'
PRIVATE_KEY = 'c38331b12e562919c0d636d90d526accf9e1b442f31cb6cd6254e1c231b97859'
PROVIDER_URL = "https://sepolia.infura.io/v3/098a45a55c344ef8ac3da0ba6270fd1f"

def deploy_tournament_contract(tournament_name):
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

        transaction = contract.constructor(tournament_name).build_transaction({
            'gasPrice': w3.eth.gas_price,
            'chainId': CHAIN_ID,
            'from': WALLET,
            'nonce': nonce
        })

        signed_transaction = w3.eth.account.sign_transaction(transaction, PRIVATE_KEY)
        transaction_hash = w3.eth.send_raw_transaction(signed_transaction.rawTransaction)
        print("Waiting for transaction to finish...")
        transaction_receipt = w3.eth.wait_for_transaction_receipt(transaction_hash)
        print("Done! Contract deployed.")

        contract_address = transaction_receipt.contractAddress

        print(f"contract address: {contract_address}")
        if contract_address:
            return contract_address
        else:
            return "contract address doesnt exist"

    except Exception as e:
        print(f"Error deploying contract: {e}")
        return "Error"

if __name__ == "__main__":
    tournament_name = "tournamentName"
    deploy_tournament_contract(tournament_name)