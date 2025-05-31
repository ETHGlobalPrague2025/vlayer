// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import { createVlayerClient, preverifyEmail } from "@vlayer/sdk";
import proverSpec from "../out/EmailDomainProver.sol/EmailDomainProver.json";
import verifierSpec from "../out/EmailProofVerifier.sol/EmailDomainVerifier.json";
import {
  createContext,
  deployVlayerContracts,
  getConfig,
} from "@vlayer/sdk/config";
type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "POST") {
    const { data } = req.body;
    if (typeof data === "string") {

      res.status(200).json({ name: data });
    } else {
      res.status(400).json({ name: "Invalid data" });
    }
  } else {
    res.status(405).json({ name: "Method Not Allowed" });
  }
}
