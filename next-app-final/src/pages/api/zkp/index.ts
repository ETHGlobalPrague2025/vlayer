// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import proverSpec from "./EmailDomainProver.json";
import verifierSpec from "./EmailDomainVerifier.json";
import {
  createContext,
  deployVlayerContracts,
  getConfig,
} from "@vlayer/sdk/config";
/*
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

try {
  const { stdout, stderr } = await execAsync("pwd");
  console.log("stdout:", stdout);
  if (stderr) console.error("stderr:", stderr);
} catch (error) {
  console.error("Error:", error.message);
}
*/
type Data = {
  name: string;
};

const config = getConfig();

const {
  chain,
  ethClient,
  account: john,
  proverUrl,
  dnsServiceUrl,
  confirmations,
} = createContext(config);

if (!john) {
  throw new Error(
    "No account found make sure EXAMPLES_TEST_PRIVATE_KEY is set in your environment variables"
  );
}

const mimeEmail = fs.readFileSync("./verify_vlayer.eml").toString();

// Initialize CORS middleware

// Helper to run middleware
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  console.log("shi")
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Your existing API logic here
  if (req.method === "POST") {
    const { data } = req.body;

    if (typeof data === "string") {
      const { prover, verifier } = await deployVlayerContracts({
        proverSpec,
        verifierSpec,
        proverArgs: [],
        verifierArgs: [],
      });

      if (!dnsServiceUrl) {
        throw new Error("DNS service URL is not set");
      }

      console.log("Proving...");
      const vlayer = createVlayerClient({
        url: proverUrl,
        token: config.token,
      });
      console.log("Vlayer", vlayer);
      const preverification = await preverifyEmail({
        mimeEmail: mimeEmail,
        dnsResolverUrl: dnsServiceUrl,
        token: config.token,
      });
      console.log("Preverification", preverification);
      const hash = await vlayer.prove({
        address: prover,
        proverAbi: proverSpec.abi,
        functionName: "main",
        chainId: chain.id,
        gasLimit: config.gasLimit,
        args: [preverification],
      });
      console.log("Proving hash:", hash);
      const result = await vlayer.waitForProvingResult({
        hash,
        numberOfRetries: 60,
        sleepDuration: 1000,
      });

      console.log(result);
      console.log("Verifying...");

      // Workaround for viem estimating gas with `latest` block causing future block assumptions to fail on slower chains like mainnet/sepolia
      const gas = await ethClient.estimateContractGas({
        address: verifier,
        abi: verifierSpec.abi,
        functionName: "verify",
        args: result,
        account: john,
        blockTag: "pending",
      });

      const verificationHash = await ethClient.writeContract({
        address: verifier,
        abi: verifierSpec.abi,
        functionName: "verify",
        args: result,
        account: john,
        gas,
      });

      const receipt = await ethClient.waitForTransactionReceipt({
        hash: verificationHash,
        confirmations,
        retryCount: 60,
        retryDelay: 1000,
      });

      console.log(receipt);
      console.log(`Verification result: ${receipt.status}`);

      res
        .status(200)
        .json({ result: receipt.status, prover: prover, verifier: verifier });
    } else {
      res.status(400).json({ name: "Invalid data" });
    }
  } else {
    res.status(405).json({ name: "Method Not Allowed" });
  }
}
