from solcx import compile_standard, install_solc
import json

install_solc("0.8.19")

contract_path = "/home/jrenault/Documents/42/transcendance/blockchain/smartContract.sol"
with open(contract_path, 'r') as file:
    contract = file.read()
    
compiledSolidity = compile_standard({
    "language": "Solidity",
    "sources": {
        "tournament.sol": {
            "content": contract
        }
    },
    "settings": {
        "outputSelection": {
            "*": {
                "*": ["abi", "metadata", "evm.bytecode", "evm.bytecode.sourceMap"]
            }
        }
    }
}, solc_version="0.8.0")

# print(compiledSolidity)
with open("compiledSolidity.json", "w") as file:
    json.dump(compiledSolidity, file)