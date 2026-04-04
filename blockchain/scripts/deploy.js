const { ethers } = require('hardhat');

async function main() {
    console.log('Deploying AgriTrustChain contract...');

    // Get the ContractFactory
    const AgriTrustChain = await ethers.getContractFactory('AgriTrustChain');

    // Deploy the contract
    const agriTrustChain = await AgriTrustChain.deploy();

    await agriTrustChain.deployed();

    console.log('AgriTrustChain deployed to:', agriTrustChain.address);

    // Verify contract on Etherscan (optional)
    if (process.env.ETHERSCAN_API_KEY) {
        console.log('Waiting for block confirmations...');
        await agriTrustChain.deployTransaction.wait(5);

        console.log('Verifying contract...');
        try {
            await hre.run('verify:verify', {
                address: agriTrustChain.address,
                constructorArguments: [],
            });
        } catch (error) {
            console.log('Error verifying contract:', error);
        }
    }

    // Save deployment info
    const deploymentInfo = {
        contractAddress: agriTrustChain.address,
        deployer: await agriTrustChain.signer.getAddress(),
        network: await agriTrustChain.provider.getNetwork(),
        deploymentTime: new Date().toISOString()
    };

    console.log('Deployment Info:', deploymentInfo);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
