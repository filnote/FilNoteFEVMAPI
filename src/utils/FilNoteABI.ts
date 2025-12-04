export const FilNoteABI = [
  {
    "type": "constructor",
    "inputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "MAX_LIMIT",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "addAuditor",
    "inputs": [
      {
        "name": "auditor",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "closeNote",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "completeNote",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createNote",
    "inputs": [
      {
        "name": "targetAmount",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "interestRateBps",
        "type": "uint16",
        "internalType": "uint16"
      },
      {
        "name": "borrowingDays",
        "type": "uint16",
        "internalType": "uint16"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "defaultNote",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getAuditors",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address[]",
        "internalType": "address[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNote",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct Types.Note",
        "components": [
          {
            "name": "id",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "targetAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFeeRateBps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFeeAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "investor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "protocolContract",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "auditor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "contractHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "privacyCertificateHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "privacyCredentialsAbridgedHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "expiryTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "borrowingDays",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "interestRateBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "uint8"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNoteByIds",
    "inputs": [
      {
        "name": "ids",
        "type": "uint64[]",
        "internalType": "uint64[]"
      }
    ],
    "outputs": [
      {
        "name": "result",
        "type": "tuple[]",
        "internalType": "struct Types.Note[]",
        "components": [
          {
            "name": "id",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "targetAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFeeRateBps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFeeAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "investor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "protocolContract",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "auditor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "contractHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "privacyCertificateHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "privacyCredentialsAbridgedHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "expiryTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "borrowingDays",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "interestRateBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "uint8"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNotes",
    "inputs": [
      {
        "name": "offset",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "limit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Types.Note[]",
        "components": [
          {
            "name": "id",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "targetAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFeeRateBps",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "platformFeeAmount",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "investor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "protocolContract",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "auditor",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "contractHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "privacyCertificateHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "privacyCredentialsAbridgedHash",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "expiryTime",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "borrowingDays",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "interestRateBps",
            "type": "uint16",
            "internalType": "uint16"
          },
          {
            "name": "status",
            "type": "uint8",
            "internalType": "uint8"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNotesByCreator",
    "inputs": [
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "offset",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "limit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64[]",
        "internalType": "uint64[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getNotesByInvestor",
    "inputs": [
      {
        "name": "investor",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "offset",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "limit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64[]",
        "internalType": "uint64[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlatformFee",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getPlatformFeeRecipient",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getTotalNotes",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "invest",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "isAuditor",
    "inputs": [
      {
        "name": "auditor",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "owner",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "pendingNote",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "contractHash",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "encryptedPrivacyCertificateHash",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "privacyCredentialsAbridgedHash",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "removeAuditor",
    "inputs": [
      {
        "name": "auditor",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "renounceOwnership",
    "inputs": [],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setPlatformFee",
    "inputs": [
      {
        "name": "platformFee",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "setPlatformFeeRecipient",
    "inputs": [
      {
        "name": "platformFeeRecipient",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "stopNote",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint64",
        "internalType": "uint64"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferOwnership",
    "inputs": [
      {
        "name": "newOwner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "AuditorUpdated",
    "inputs": [
      {
        "name": "auditor",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "isActive",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Investment",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "indexed": true,
        "internalType": "uint64"
      },
      {
        "name": "investor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "protocolContract",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "NoteCreated",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "indexed": true,
        "internalType": "uint64"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "targetAmount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "interestRateBps",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      },
      {
        "name": "borrowingDays",
        "type": "uint16",
        "indexed": false,
        "internalType": "uint16"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "NoteStatusChanged",
    "inputs": [
      {
        "name": "id",
        "type": "uint64",
        "indexed": true,
        "internalType": "uint64"
      },
      {
        "name": "status",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "OwnershipTransferred",
    "inputs": [
      {
        "name": "previousOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "newOwner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "PlatformFeeChanged",
    "inputs": [
      {
        "name": "platformFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "platformFeeRecipient",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "WithdrawPlatformFee",
    "inputs": [
      {
        "name": "platformFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "platformFeeRecipient",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "AuditorAlreadyExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "AuditorNotExists",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InterestRateOutOfRange",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidAddress",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidBorrowingDays",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidContractHash",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidInvestor",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidNoteStatus",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPlatformFee",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidTargetAmount",
    "inputs": []
  },
  {
    "type": "error",
    "name": "LimitExceeded",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NoNote",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotPermission",
    "inputs": []
  },
  {
    "type": "error",
    "name": "OwnableInvalidOwner",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "OwnableUnauthorizedAccount",
    "inputs": [
      {
        "name": "account",
        "type": "address",
        "internalType": "address"
      }
    ]
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  }
] as const;

export const FilNoteAddress = '0xD88dB8719f066a88F7FA67Ce7761b428f95B7C30';
