from web3 import Web3, HTTPProvider
import json

def deployContract(newMessage):
    with open("compiledSolidity.json", "r") as file:
        compiledSolidity = json.load(file)

    provider_url = "https://sepolia.infura.io/v3/2dc50a5c22934a019f88758e28ba4bfc"
    w3 = Web3(HTTPProvider(provider_url))

    
    public_key = '0x08Cad489Ad4542AF82Ee81eC949776775dea23be'
    private_key = 'c38331b12e562919c0d636d90d526accf9e1b442f31cb6cd6254e1c231b97859'