from solcx import compile_standard, install_solc
import json
import os

install_solc("0.8.19")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

os.path.abspath(os.path.join(CURRENT_DIR, "../../blockchain"))
contract_path = os.path.abspath(os.path.join(CURRENT_DIR, "/tournamentContract.sol"))
with open(contract_path, 'r') as file:
    contract = file.read()
    
compiledSolidity = compile_standard({
    "language": "Solidity",
    "sources": {
        "tournamentContract.sol": {
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
}, solc_version="0.8.19")

# print(compiledSolidity)
with open("compiledSolidity.json", "w") as file:
    json.dump(compiledSolidity, file)
    