const sigUtil = require("eth-sig-util");
const ethUtils = require("ethereumjs-util");
const { ethers, utils, providers, BigNumber } = require("ethers");
const erc20ABI = require("./abi/erc20ABI.json");
const { init } = require("./helper/util");
const web3Abi = require("web3-eth-abi");
// Data
const contractAddress = "0x0792702B0862da86df1E4D4aAb17aAd794B8FB07";
const rpcProvider = "https://rinkeby.infura.io/v3/66b8e081633b4153b9e2600b8e607697";
const privateKey = "8b0d6db70393d2ca98e6a5c34a46503cb3b0378287eb589fd00b985f453f2720";

const domainType = [
    {
        name: "name",
        type: "string",
    },
    {
        name: "version",
        type: "string",
    },
    {
        name: "verifyingContract",
        type: "address",
    },
    {
        name: "salt",
        type: "bytes32",
    },
];

const metaTransactionType = [
    {
        name: "nonce",
        type: "uint256",
    },
    {
        name: "from",
        type: "address",
    },
    {
        name: "functionSignature",
        type: "bytes",
    },
];

const erc20ApproveABI = {
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
}

// Function Data
const toAddress = "0xA90807c89BFAF388F4f60d437ecC35c8822D006b";
const tokenValue = "10000000000000";
const params = [toAddress,tokenValue]

// Initialization
const signer = new providers.JsonRpcProvider(rpcProvider);
const wallet = new ethers.Wallet(privateKey, signer);
const initResp = init(contractAddress, erc20ABI, wallet);
const contractInstance = initResp.contractInstance;
const contractInterface = initResp.contractInterface;


const prepareDomainData = async () => {
    let name;
    let version = "1";
    let nonce;
    let chainId
    try {
        name = await contractInstance.name();
        nonce = await contractInstance.getNonce(wallet.getAddress());
        chainId = await contractInstance.getChainId();
        console.log(`Name is : ${name}`);
        console.log(`Nonce is : ${nonce}`);
        console.log(`ChainId is : ${chainId}`);
    } catch (error) {
        console.error("Error in getting chain Data", error);
        return null;
    }

    let domainData = {
        name: name,
        version: version,
        verifyingContract: contractInstance.address,
        salt: '0x' + chainId.toHexString().substring(2).padStart(64, '0'),
    };
    console.log(`Domain Data is :`, domainData);
    return { nonce, domainData };
}

function getFunctionSignature(contractInterface, functionName, parameters) {
    try {
        const functionSignature = contractInterface.encodeFunctionData(functionName, parameters);
        return functionSignature;
    } catch (error) {
        throw "Error in getting function signature"
    }
}

const getTransactionData = async (user, nonce, abi, domainData) => {
    const functionSignature = web3Abi.encodeFunctionCall(erc20ApproveABI, params);

    console.log(`Function Signature is : ${functionSignature}`);

    let message = {};
    message.nonce = parseInt(nonce);
    message.from = await user.getAddress();
    message.functionSignature = functionSignature;
    console.log(`Message is :`, message);

    const dataToSign = {
        types: {
            EIP712Domain: domainType,
            MetaTransaction: metaTransactionType,
        },
        domain: domainData,
        primaryType: "MetaTransaction",
        message: message,
    };

    console.log(`Data To Sign is : `, dataToSign);

    const signature = sigUtil.signTypedData(ethUtils.toBuffer(user.privateKey), {
        data: dataToSign,
    });
    console.log(`Signataure is  : ${signature}`);

    let r = signature.slice(0, 66);
    let s = "0x".concat(signature.slice(66, 130));
    let v = "0x".concat(signature.slice(130, 132));
    v = parseInt(v);
    if (![27, 28].includes(v)) v += 27;

    console.log(`R is  : ${r}`);
    console.log(`S is  : ${s}`);
    console.log(`v is  : ${v}`);

    return {
        r,
        s,
        v,
        functionSignature,
    };
}


const estimateGasForMeta = async (functionSignature, r, s, v) => {
    let user = await wallet.getAddress();
    try {
        let gasFee = await contractInstance.estimateGas.executeMetaTransaction(
            user,
            functionSignature,
            r,
            s,
            v
        );
        console.log(`Gas Fee is ${gasFee}`);
    } catch (error) {
        console.error(`Error in Estimate Gas : ${error}`);
    }

    try {
        let tx = await contractInstance.executeMetaTransaction(
            user,
            functionSignature,
            r,
            s,
            v
        );
        console.log(`TX is`, tx);
    } catch (error) {
        console.error(`Error in Sending Transaction : ${error}`,error);

    }
}

const start = async () => {
    let { domainData, nonce } = await prepareDomainData();

    let { r, s, v, functionSignature } = await getTransactionData(
        wallet,
        nonce,
        erc20ABI,
        domainData,
        [toAddress, tokenValue]
    );
    estimateGasForMeta(functionSignature, r, s, v);
}

start();