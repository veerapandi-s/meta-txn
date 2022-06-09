const { ethers, utils, providers, BigNumber } = require("ethers");
let sigUtil = require("eth-sig-util");

const getSignatureParameters = signature => {
    if (!utils.isHexString(signature)) {
        throw new Error(
            'Given value "'.concat(signature, '" is not a valid hex string.')
        );
    }
    var r = signature.slice(0, 66);
    var s = "0x".concat(signature.slice(66, 130));
    var v = "0x".concat(signature.slice(130, 132));
    v = BigNumber.from(v).toNumber();
    if (![27, 28].includes(v)) v += 27;
    return {
        r: r,
        s: s,
        v: v
    };
};

const rageAbi = [
    {
        "type": "constructor",
        "stateMutability": "nonpayable",
        "inputs": []
    },
    {
        "type": "event",
        "name": "Approval",
        "inputs": [
            {
                "type": "address",
                "name": "owner",
                "internalType": "address",
                "indexed": true
            },
            {
                "type": "address",
                "name": "spender",
                "internalType": "address",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "value",
                "internalType": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "MetaTransactionExecuted",
        "inputs": [
            {
                "type": "address",
                "name": "userAddress",
                "internalType": "address",
                "indexed": false
            },
            {
                "type": "address",
                "name": "relayerAddress",
                "internalType": "address payable",
                "indexed": false
            },
            {
                "type": "bytes",
                "name": "functionSignature",
                "internalType": "bytes",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RoleAdminChanged",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32",
                "indexed": true
            },
            {
                "type": "bytes32",
                "name": "previousAdminRole",
                "internalType": "bytes32",
                "indexed": true
            },
            {
                "type": "bytes32",
                "name": "newAdminRole",
                "internalType": "bytes32",
                "indexed": true
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RoleGranted",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32",
                "indexed": true
            },
            {
                "type": "address",
                "name": "account",
                "internalType": "address",
                "indexed": true
            },
            {
                "type": "address",
                "name": "sender",
                "internalType": "address",
                "indexed": true
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "RoleRevoked",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32",
                "indexed": true
            },
            {
                "type": "address",
                "name": "account",
                "internalType": "address",
                "indexed": true
            },
            {
                "type": "address",
                "name": "sender",
                "internalType": "address",
                "indexed": true
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Transfer",
        "inputs": [
            {
                "type": "address",
                "name": "from",
                "internalType": "address",
                "indexed": true
            },
            {
                "type": "address",
                "name": "to",
                "internalType": "address",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "value",
                "internalType": "uint256",
                "indexed": false
            }
        ],
        "anonymous": false
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "CHILD_CHAIN_ID",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bytes",
                "name": "",
                "internalType": "bytes"
            }
        ],
        "name": "CHILD_CHAIN_ID_BYTES",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bytes32",
                "name": "",
                "internalType": "bytes32"
            }
        ],
        "name": "DEFAULT_ADMIN_ROLE",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bytes32",
                "name": "",
                "internalType": "bytes32"
            }
        ],
        "name": "DEPOSITOR_ROLE",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "string",
                "name": "",
                "internalType": "string"
            }
        ],
        "name": "ERC712_VERSION",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "ROOT_CHAIN_ID",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bytes",
                "name": "",
                "internalType": "bytes"
            }
        ],
        "name": "ROOT_CHAIN_ID_BYTES",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "allowance",
        "inputs": [
            {
                "type": "address",
                "name": "owner",
                "internalType": "address"
            },
            {
                "type": "address",
                "name": "spender",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [
            {
                "type": "bool",
                "name": "",
                "internalType": "bool"
            }
        ],
        "name": "approve",
        "inputs": [
            {
                "type": "address",
                "name": "spender",
                "internalType": "address"
            },
            {
                "type": "uint256",
                "name": "amount",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "balanceOf",
        "inputs": [
            {
                "type": "address",
                "name": "account",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint8",
                "name": "",
                "internalType": "uint8"
            }
        ],
        "name": "decimals",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [
            {
                "type": "bool",
                "name": "",
                "internalType": "bool"
            }
        ],
        "name": "decreaseAllowance",
        "inputs": [
            {
                "type": "address",
                "name": "spender",
                "internalType": "address"
            },
            {
                "type": "uint256",
                "name": "subtractedValue",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [],
        "name": "deposit",
        "inputs": [
            {
                "type": "address",
                "name": "user",
                "internalType": "address"
            },
            {
                "type": "bytes",
                "name": "depositData",
                "internalType": "bytes"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "payable",
        "outputs": [
            {
                "type": "bytes",
                "name": "",
                "internalType": "bytes"
            }
        ],
        "name": "executeMetaTransaction",
        "inputs": [
            {
                "type": "address",
                "name": "userAddress",
                "internalType": "address"
            },
            {
                "type": "bytes",
                "name": "functionSignature",
                "internalType": "bytes"
            },
            {
                "type": "bytes32",
                "name": "sigR",
                "internalType": "bytes32"
            },
            {
                "type": "bytes32",
                "name": "sigS",
                "internalType": "bytes32"
            },
            {
                "type": "uint8",
                "name": "sigV",
                "internalType": "uint8"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "pure",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "getChainId",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bytes32",
                "name": "",
                "internalType": "bytes32"
            }
        ],
        "name": "getDomainSeperator",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "nonce",
                "internalType": "uint256"
            }
        ],
        "name": "getNonce",
        "inputs": [
            {
                "type": "address",
                "name": "user",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bytes32",
                "name": "",
                "internalType": "bytes32"
            }
        ],
        "name": "getRoleAdmin",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "address",
                "name": "",
                "internalType": "address"
            }
        ],
        "name": "getRoleMember",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            },
            {
                "type": "uint256",
                "name": "index",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "getRoleMemberCount",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [],
        "name": "grantRole",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            },
            {
                "type": "address",
                "name": "account",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "bool",
                "name": "",
                "internalType": "bool"
            }
        ],
        "name": "hasRole",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            },
            {
                "type": "address",
                "name": "account",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [
            {
                "type": "bool",
                "name": "",
                "internalType": "bool"
            }
        ],
        "name": "increaseAllowance",
        "inputs": [
            {
                "type": "address",
                "name": "spender",
                "internalType": "address"
            },
            {
                "type": "uint256",
                "name": "addedValue",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [],
        "name": "initialize",
        "inputs": [
            {
                "type": "string",
                "name": "name_",
                "internalType": "string"
            },
            {
                "type": "string",
                "name": "symbol_",
                "internalType": "string"
            },
            {
                "type": "uint8",
                "name": "decimals_",
                "internalType": "uint8"
            },
            {
                "type": "address",
                "name": "childChainManager",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "string",
                "name": "",
                "internalType": "string"
            }
        ],
        "name": "name",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [],
        "name": "renounceRole",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            },
            {
                "type": "address",
                "name": "account",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [],
        "name": "revokeRole",
        "inputs": [
            {
                "type": "bytes32",
                "name": "role",
                "internalType": "bytes32"
            },
            {
                "type": "address",
                "name": "account",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "string",
                "name": "",
                "internalType": "string"
            }
        ],
        "name": "symbol",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "view",
        "outputs": [
            {
                "type": "uint256",
                "name": "",
                "internalType": "uint256"
            }
        ],
        "name": "totalSupply",
        "inputs": []
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [
            {
                "type": "bool",
                "name": "",
                "internalType": "bool"
            }
        ],
        "name": "transfer",
        "inputs": [
            {
                "type": "address",
                "name": "recipient",
                "internalType": "address"
            },
            {
                "type": "uint256",
                "name": "amount",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [
            {
                "type": "bool",
                "name": "",
                "internalType": "bool"
            }
        ],
        "name": "transferFrom",
        "inputs": [
            {
                "type": "address",
                "name": "sender",
                "internalType": "address"
            },
            {
                "type": "address",
                "name": "recipient",
                "internalType": "address"
            },
            {
                "type": "uint256",
                "name": "amount",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "stateMutability": "nonpayable",
        "outputs": [],
        "name": "withdraw",
        "inputs": [
            {
                "type": "uint256",
                "name": "amount",
                "internalType": "uint256"
            }
        ]
    }
]
function init(address, abi, signer) {
    try {
        const contractInstance = new ethers.Contract(address, abi, signer);
        let contractInterface = new ethers.utils.Interface(abi);
        return {
            contractInstance,
            contractInterface
        }
    } catch (error) {
        throw "Error in creating instance"
    }
}

function getFunctionSignature(contractInterface, functionName, parameters) {
    try {
        const functionSignature = contractInterface.encodeFunctionData(functionName, parameters);
        return functionSignature;
    } catch (error) {
        throw "Error in getting function signature"
    }
}

async function check() {
    let signer = new providers.JsonRpcProvider("https://rpc.sx.technology");
    let contractAddress = "0x0D17C90668d5e7d993F3f7af7c47dBBA659DA6b3";
    let initResp = init(contractAddress, rageAbi, signer);
    let tokenContract = initResp.contractInstance;
    let tokenInterface = initResp.contractInterface;
    let funtionName = "approve";
    let params = ["0xA90807c89BFAF388F4f60d437ecC35c8822D006b", "10000000000000"];
    let toAddress = "0xA90807c89BFAF388F4f60d437ecC35c8822D006b";
    let tokenValue = "10000000000000";
    let userAddress = "0x1A78b07cF867F4BBb708479C17669a56C8a9a2a3";
    let functionSignature = getFunctionSignature(tokenInterface, "approve", [toAddress, tokenValue]);
    let nonce;
    try {
        nonce = await tokenContract.getNonce(userAddress);
        let name = await tokenContract.name()
        let chainId = await tokenContract.getChainId();
        console.log(nonce);
    } catch (error) {
        console.error("error in nonce", error);
        return null;
    }
    try {
        let message = {
            nonce: parseInt(nonce),
            from: userAddress,
            functionSignature: functionSignature
        };

        const dataToSign = {
            types: {
                EIP712Domain: [
                    { name: "name", type: "string" },
                    { name: "version", type: "string" },
                    { name: "verifyingContract", type: "address" },
                    { name: "salt", type: "bytes32" },
                ],
                MetaTransaction: [
                    { name: "nonce", type: "uint256" },
                    { name: "from", type: "address" },
                    { name: "functionSignature", type: "bytes" }
                ],
            },
            domain: {
                name: "RageToken",
                version: "1",
                verifyingContract: contractAddress,
                salt: '0x' + (416).toString(16).padStart(64, '0'),
            },
            primaryType: "MetaTransaction",
            message: message
        };
        let privateKey = "8b0d6db70393d2ca98e6a5c34a46503cb3b0378287eb589fd00b985f453f2720";
        const signature = sigUtil.signTypedMessage(new Buffer.from(privateKey, 'hex'), { data: dataToSign }, 'V3');
        let { r, s, v } = getSignatureParameters(signature);
        rawTx = {
            to: contractAddress,
            data: tokenInterface.encodeFunctionData(
                "executeMetaTransaction",
                [userAddress, functionSignature, r, s, v]
            ),
            from: userAddress,
        };
        let wallet = new ethers.Wallet(privateKey);
        tx = await wallet.signTransaction(rawTx);
        try {
            let estimate = await signer.estimateGas(rawTx);
            console.log(estimate);
        } catch (error) {

            console.error(error);
            throw ("Network is busy, Please try again")
            // return res.status(200).send({
            //     Status: false,
            //     Message: "Network is busy, Please try again"
            // });
        }
        console.log("done");
    } catch (error) {
        console.error("error", error);
    }

}




check();

