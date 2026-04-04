// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AgriTrustChain is Ownable, ReentrancyGuard {
    struct ProduceBatch {
        string batchId;
        address farmer;
        uint256 timestamp;
        uint8 quality; // 1-3 (C, B, A)
        uint8 status; // 0: harvested, 1: in_transit, 2: at_retailer, 3: sold
        bool exists;
        uint256 totalPayment;
        bool paymentReleased;
    }

    mapping(string => ProduceBatch) public batches;
    mapping(address => uint256) public farmerEarnings;
    mapping(address => bool) public authorizedUpdaters;

    event BatchCreated(
        string indexed batchId,
        address indexed farmer,
        uint256 timestamp,
        uint8 quality
    );

    event BatchUpdated(
        string indexed batchId,
        uint8 status,
        uint256 timestamp,
        address updatedBy
    );

    event PaymentReleased(
        string indexed batchId,
        address indexed farmer,
        uint256 amount,
        address releasedBy
    );

    event UpdaterAuthorized(address indexed updater, bool authorized);

    modifier onlyAuthorized() {
        require(
            authorizedUpdaters[msg.sender] || msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    modifier batchExists(string memory batchId) {
        require(batches[batchId].exists, "Batch does not exist");
        _;
    }

    constructor() {
        authorizedUpdaters[msg.sender] = true;
    }

    /**
     * @dev Create a new produce batch on the blockchain
     */
    function createBatch(
        string memory batchId,
        address farmer,
        uint256 timestamp,
        uint8 quality
    ) external onlyAuthorized {
        require(!batches[batchId].exists, "Batch already exists");
        require(farmer != address(0), "Invalid farmer address");
        require(quality >= 1 && quality <= 3, "Invalid quality grade");

        batches[batchId] = ProduceBatch({
            batchId: batchId,
            farmer: farmer,
            timestamp: timestamp,
            quality: quality,
            status: 0, // harvested
            exists: true,
            totalPayment: 0,
            paymentReleased: false
        });

        emit BatchCreated(batchId, farmer, timestamp, quality);
    }

    /**
     * @dev Update batch status in the supply chain
     */
    function updateBatchStatus(
        string memory batchId,
        uint8 status,
        uint256 timestamp
    ) external onlyAuthorized batchExists(batchId) {
        require(status >= 0 && status <= 3, "Invalid status");
        require(timestamp > 0, "Invalid timestamp");

        batches[batchId].status = status;

        emit BatchUpdated(batchId, status, timestamp, msg.sender);
    }

    /**
     * @dev Release payment to farmer when produce is sold
     */
    function releaseFarmerPayment(
        string memory batchId,
        address farmer,
        uint256 amount
    ) external payable onlyAuthorized batchExists(batchId) nonReentrant {
        require(msg.value >= amount, "Insufficient payment");
        require(farmer == batches[batchId].farmer, "Farmer mismatch");
        require(!batches[batchId].paymentReleased, "Payment already released");

        batches[batchId].totalPayment = amount;
        batches[batchId].paymentReleased = true;
        farmerEarnings[farmer] += amount;

        // Transfer payment to farmer
        (bool success, ) = farmer.call{value: amount}("");
        require(success, "Payment transfer failed");

        // Refund excess if any
        if (msg.value > amount) {
            (bool refundSuccess, ) = msg.sender.call{value: msg.value - amount}("");
            require(refundSuccess, "Refund failed");
        }

        emit PaymentReleased(batchId, farmer, amount, msg.sender);
    }

    /**
     * @dev Authorize/deauthorize addresses to update batches
     */
    function setAuthorizedUpdater(address updater, bool authorized) 
        external onlyOwner {
        authorizedUpdaters[updater] = authorized;
        emit UpdaterAuthorized(updater, authorized);
    }

    /**
     * @dev Get batch information
     */
    function getBatch(string memory batchId) 
        external view returns (ProduceBatch memory) {
        require(batches[batchId].exists, "Batch does not exist");
        return batches[batchId];
    }

    /**
     * @dev Get farmer's total earnings
     */
    function getFarmerEarnings(address farmer) 
        external view returns (uint256) {
        return farmerEarnings[farmer];
    }

    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }

    /**
     * @dev Receive function to accept payments
     */
    receive() external payable {}
}