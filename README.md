# FilNote FEVM API

[中文文档](./README.zh-CN.md)

## Description

A blockchain verification service built with NestJS framework, providing secure file upload and verification capabilities on the Filecoin FEVM network. This service implements a two-step verification process: first, clients obtain a temporary verification ID (verifyId), then use it to upload files with cryptographic signature verification. The service ensures that only authorized auditors can upload files by verifying both on-chain permissions and cryptographic signatures.

## Features

- 🔐 **Two-Step Verification**: Secure UUID signature-based authentication flow
- 📋 **Auditor Verification**: On-chain smart contract validation for auditor permissions
- ✍️ **Signature Verification**: Cryptographic signature validation to ensure address ownership
- 📁 **File Upload**: Support PDF file upload with size limits (512KB max)
- 🌐 **IPFS Storage**: Integration with Pinata for decentralized file storage, direct memory upload
- 🔗 **Smart Contract Integration**: Interact with FilNote smart contracts on FEVM
- 🛡️ **Security**: Built-in rate limiting, helmet protection, input validation, and one-time UUID tokens
- 📊 **Lightweight Database**: Using LowDB for temporary verification data storage with TTL
- ⚡ **High Performance**: Direct memory upload to IPFS, no local disk storage required

## Technology Stack

- **Framework**: NestJS v11.0.1
- **Language**: TypeScript
- **Blockchain**: Ethers.js v6.15.0
- **Storage**: Pinata (IPFS)
- **Validation**: class-validator, class-transformer, joi
- **Security**: helmet, express-rate-limit
- **Database**: lowdb
- **Package Manager**: pnpm

## Project Structure

```
.
├── src/
│   ├── config/           # Configuration files
│   ├── filters/          # Exception filters
│   ├── interceptors/     # Response interceptors
│   ├── utils/            # Utilities, ABIs, and database helpers
│   │   ├── FilNoteABI.ts
│   │   ├── verify.service.utils.ts
│   │   └── lowdb.json
│   ├── verify/           # Core verification module
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── entities/     # Entity definitions
│   │   ├── verify.controller.ts
│   │   ├── verify.service.ts
│   │   └── verify.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/                 # E2E tests
└── package.json
```

## Prerequisites

- Node.js (v16 or higher recommended)
- pnpm (package manager)
- A Filecoin FEVM RPC endpoint
- FilNote smart contract deployed on FEVM network
- Pinata account with JWT token and gateway URL

## Installation

```bash
# Install dependencies
pnpm install
```

## Environment Configuration

Create `.env.development` and `.env.production` files in the root directory:

```env
# Server port
PORT=3300

# Filecoin RPC endpoint
RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# FilNote smart contract address
FIL_NOTE_CONTRACT_ADDRESS=0xa07CC461166F49E584CD15abA8E60367699be05C

# Pinata configuration
PINATA_JWT=your_pinata_jwt_token
PINATA_GATEWAY=your_pinata_gateway_url

# Verify ID TTL in milliseconds (default: 5 minutes)
VERIFY_ID_TTL_MS=300000
```

## Running the Application

```bash
# Development mode (with watch)
pnpm run dev

# Production mode
pnpm run prod

# Build the project
pnpm run build

# Standard start
pnpm run start
```

## API Endpoints

### Get Verification UUID

**GET** `/verify/get-verify-uuid/:address`

Obtain a temporary verification UUID for the specified address. This UUID needs to be signed by the client using their private key. The UUID has a configurable TTL (default: 5 minutes) and is one-time use - it will be deleted after successful file upload.

**Parameters:**

- `address`: Ethereum address to get UUID for

**Response:**

```json
{
  "success": true,
  "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Notes:**

- If a valid UUID already exists for the address, it will be returned (not regenerated)
- Expired UUIDs are automatically cleaned up
- The UUID is one-time use and will be deleted after successful upload
- Clients need to sign this UUID and submit the signature when uploading

### Upload and Verify File

**POST** `/verify/upload`

Upload a PDF file with comprehensive verification. This endpoint performs multiple security checks:

1. **UUID Validation**: Retrieves the UUID for the address from database and validates it hasn't expired
2. **Signature Verification**: Uses the database UUID as plaintext to verify the signature was signed by the claimed address
3. **On-chain Permission Check**: Verifies that the address is an authorized auditor via smart contract
4. **File Upload**: Uploads the file to IPFS via Pinata directly from memory

**Request:**

- Content-Type: `multipart/form-data`
- Body:
  - `file`: PDF file (max 512KB, required)
  - `signature`: Cryptographic signature of the UUID (0x-prefixed hex string, required)
  - `address`: Ethereum address (required)

**Signature Generation Example (JavaScript):**

```javascript
// 1. Get UUID
const response = await fetch(`/verify/get-verify-uuid/${address}`);
const { data: uuid } = await response.json();

// 2. Sign the UUID
const signature = await signer.signMessage(uuid);

// 3. Upload file
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('signature', signature);
formData.append('address', address);
```

**Response:**

```json
{
  "success": true,
  "data": {
    "cid": "QmXxxx..."
  }
}
```

**Error Responses:**

- `401 Unauthorized`: UUID invalid/expired, signature mismatch, or not an auditor
- `400 Bad Request`: Missing file, invalid file type, or validation errors

**Security Notes:**

- The UUID is **one-time use** and will be invalidated immediately after successful upload
- Only addresses registered as auditors in the FilNote smart contract can upload files
- The signature must be of the database UUID and signed by the corresponding address
- File size is limited to 512KB
- Files are uploaded directly from memory, not stored on server disk

## Workflow

The typical workflow for uploading a file:

1. **Get UUID**: Client calls `GET /verify/get-verify-uuid/:address` to obtain a temporary UUID
2. **Sign UUID**: Client signs the UUID with their private key (using `signMessage`)
3. **Upload file**: Client calls `POST /verify/upload` with:
   - PDF file
   - Signature generated in step 2
   - Ethereum address
4. **Service verification**: Server performs the following checks:
   - Retrieves the UUID for the address from database
   - Verifies the signature using the UUID as plaintext
   - Verifies the address is an auditor on-chain
5. **IPFS upload**: If all checks pass, file is uploaded to IPFS via Pinata directly from memory
6. **UUID invalidation**: After successful upload, the address's UUID is immediately deleted from database
7. **Response**: Service returns the IPFS CID

## Development

```bash
# Format code
pnpm run format

# Lint code
pnpm run lint

# Run unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Debug mode
pnpm run debug
```

## Security Features

- **Helmet**: HTTP header security
- **Rate Limiting**: API request throttling (100 requests per minute)
- **Input Validation**: Class-validator for DTO validation
- **File Type Validation**: Only allow PDF files
- **Size Limits**: Enforce 512KB file size restriction
- **Signature Verification**: Cryptographic signature validation using ethers.js with UUID as plaintext
- **On-chain Permission Check**: Smart contract validation for auditor status
- **One-time Tokens**: UUID tokens are single-use and automatically invalidated after upload
- **TTL Management**: Automatic expiration and cleanup of expired UUIDs
- **Memory Upload**: Files uploaded directly from memory, not stored on server, preventing data leakage

## Build and Deployment

```bash
# Build for production
pnpm run build

# Run production build
pnpm run prod
```

The production build outputs to the `dist/` directory.

## Environment Variables

| Variable                    | Description                    | Example                                       |
| --------------------------- | ------------------------------ | --------------------------------------------- |
| `PORT`                      | Server port                    | `3300`                                        |
| `RPC_URL`                   | Filecoin RPC endpoint          | `https://api.calibration.node.glif.io/rpc/v1` |
| `FIL_NOTE_CONTRACT_ADDRESS` | FilNote smart contract address | `0xa07C...e05C`                               |
| `PINATA_JWT`                | Pinata JWT token               | `eyJhbGc...`                                  |
| `PINATA_GATEWAY`            | Pinata gateway URL             | `https://gateway.pinata.cloud`                |
| `VERIFY_ID_TTL_MS`          | Verify ID TTL in milliseconds  | `300000` (5 minutes)                          |

## Database

The service uses LowDB for storing temporary verification data. The database file is located at:

- Development: `src/utils/lowdb.json`
- Production: `utils/lowdb.json`

The database stores address-to-UUID mappings with expiration timestamps. Expired entries are automatically pruned on access, and entries are immediately deleted after successful upload.

## License

UNLICENSED

## Support

For issues and questions, please create an issue in the repository.
