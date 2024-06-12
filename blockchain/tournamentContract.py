from web3 import Web3, HTTPProvider
import json

def deployContract(newMessage):
    with open("compiledSolidity.json", "r") as file:
        compiledSolidity = json.load(file)

    provider_url = "https://sepolia.infura.io/v3/098a45a55c344ef8ac3da0ba6270fd1f"
    w3 = Web3(HTTPProvider(provider_url))

    abi = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentsScore"]["abi"]
    bytecode = compiledSolidity["contracts"]["tournamentContract.sol"]["StoreTournamentScore"]["evm"]["bytecode"]["object"]
    
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    chainId = 11155111
    wallet = '0x08Cad489Ad4542AF82Ee81eC949776775dea23be'
    private_key = 'c38331b12e562919c0d636d90d526accf9e1b442f31cb6cd6254e1c231b97859'
    nonce = w3.eth.get_transaction_count(wallet)

    transaction = contract.constructor().build_transaction({
        'gasPrice': w3.eth.gas_price,
        'chainId': chainId,
        'from': wallet,
        'nonce': nonce
    })

    signedTransaction = w3.eth.account.sign_transaction(transaction, private_key)
    transactionHash = w3.eth.send_raw_transaction(signedTransaction.rawTransaction)
    transactionReceipt = w3.eth.wait_for_transaction_receipt(transactionHash)
    contractAddress = transactionReceipt.contractAddress