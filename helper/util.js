const { ethers, utils, providers, BigNumber } = require("ethers");

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

module.exports = {
    init
}