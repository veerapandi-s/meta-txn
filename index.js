const sigUtil = require("eth-sig-util");
const ethUtils = require("ethereumjs-util");
const { ethers, utils, providers, BigNumber } = require("ethers");
const abi = require("./abi/erc20ABI.json");
const { init } = require("./helper/util");
// Data
const contractAddress = "0x394022F5d20475D37d6904Cc2Df0BaE43DACa610";
const rpcProvider = "https://rpc.sx.technology";
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

// Function Data
const toAddress = "0xA90807c89BFAF388F4f60d437ecC35c8822D006b";
const tokenValue = "10000000000000";
const params = [toAddress, tokenValue];
const functionName = "approve";

// Initialization
const signer = new providers.JsonRpcProvider(rpcProvider);
const wallet = new ethers.Wallet(privateKey, signer);
const initResp = init(contractAddress, abi, wallet);
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

const getTransactionData = async (user, nonce, functionName, domainData) => {
    const functionSignature = getFunctionSignature(contractInterface, functionName, params);

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
        return gasFee;
    } catch (error) {
        console.error(`Error in Estimate Gas : ${error}`);
    }
    return null;
}

const executeMeta = async (functionSignature, r, s, v) => {
    let user = await wallet.getAddress();
    try {
        let tx = await contractInstance.executeMetaTransaction(
            user,
            functionSignature,
            r,
            s,
            v
        );
        console.log(`TX is`, tx);
        return tx;
    } catch (error) {
        console.error(`Error in Sending Transaction : ${error}`, error);
    }
    return null;
}

const start = async () => {
    let { domainData, nonce } = await prepareDomainData();

    let { r, s, v, functionSignature } = await getTransactionData(
        wallet,
        nonce,
        functionName,
        domainData,
        [toAddress, tokenValue]
    );
    const gasFee = await estimateGasForMeta(functionSignature, r, s, v);
    // const txHash = await executeMeta(functionSignature, r, s, v);
}

start();