import { v4 as uuidv4 } from "uuid";
import { Session } from "next-iron-session";
import { NextApiRequest, NextApiResponse } from "next";
import { withSession, contractAddress } from "./utils";

/**
 * API route that generates a message
 * @param req NextApiRequest & Session
 * @param res NextApiResponse
 * @returns Message
 */
export default withSession(
  async (req: NextApiRequest & { session: Session }, res: NextApiResponse) => {
    if (req.method === "GET") {
      try {
        // Generate a message
        const message = { contractAddress, id: uuidv4() };
        // Save the message in the session
        req.session.set("message-session", message);
        await req.session.save();

        res.json(message);
      } catch {
        res.status(422).send({ message: "Cannot generate a message!" });
      }
    } else {
      res.status(200).json({ message: "Invalid api route" });
    }
  }
);
