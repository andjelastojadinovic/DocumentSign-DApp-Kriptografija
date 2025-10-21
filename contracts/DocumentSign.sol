// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

using MessageHashUtils for bytes32;

contract DocumentSign {
    using ECDSA for bytes32;

    struct Document {
        address owner;
        uint256 registeredAt;
        address[] signers;
        mapping(address => bool) hasSigned;
        mapping(address => bytes) signatureOf;
        mapping(address => uint256) signedAt;
    }

    mapping(bytes32 => Document) private documents;

    event DocumentRegistered(bytes32 indexed hash, address indexed owner, uint256 timestamp);
    event DocumentSigned(bytes32 indexed hash, address indexed signer, uint256 timestamp, bytes signature);
    event DocumentVerified(bytes32 indexed hash, address indexed verifier, bool isValid, uint256 timestamp);

    function registerDocument(bytes32 hash) external {
        require(hash != bytes32(0), "Invalid hash");
        require(documents[hash].owner == address(0), "Already registered");
        Document storage doc = documents[hash];
        doc.owner = msg.sender;
        doc.registeredAt = block.timestamp;
        emit DocumentRegistered(hash, msg.sender, block.timestamp);
    }

    function signDocument(bytes32 hash, bytes calldata signature) external {
        require(documents[hash].owner != address(0), "Document not found");
        require(signature.length == 65, "Invalid signature length");
        bytes32 ethSigned = hash.toEthSignedMessageHash();
        address recovered = ECDSA.recover(ethSigned, signature);
        require(recovered == msg.sender, "Signature doesn't match sender");
        Document storage doc = documents[hash];
        require(!doc.hasSigned[msg.sender], "Already signed");
        doc.hasSigned[msg.sender] = true;
        doc.signatureOf[msg.sender] = signature;
        doc.signedAt[msg.sender] = block.timestamp;
        doc.signers.push(msg.sender);
        emit DocumentSigned(hash, msg.sender, block.timestamp, signature);
    }

    function verifySignature(bytes32 hash, address signer, bytes calldata signature) external returns (bool) {
        if (documents[hash].owner == address(0) || signature.length != 65) {
            emit DocumentVerified(hash, msg.sender, false, block.timestamp);
            return false;
        }
        bytes32 ethSigned = hash.toEthSignedMessageHash();
        bool ok = ECDSA.recover(ethSigned, signature) == signer;
        emit DocumentVerified(hash, msg.sender, ok, block.timestamp);
        return ok;
    }

    function getDocument(bytes32 hash) external view returns (address owner, uint256 registeredAt, uint256 signersCount) {
        Document storage doc = documents[hash];
        return (doc.owner, doc.registeredAt, doc.signers.length);
    }

    function getSigners(bytes32 hash) external view returns (address[] memory) {
        return documents[hash].signers;
    }

    function getSignature(bytes32 hash, address signer) external view returns (bytes memory, uint256) {
        Document storage doc = documents[hash];
        return (doc.signatureOf[signer], doc.signedAt[signer]);
    }

    function hasSigned(bytes32 hash, address signer) external view returns (bool) {
        return documents[hash].hasSigned[signer];
    }
}
