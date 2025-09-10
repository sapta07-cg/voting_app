import { Router } from "express";
import {
  registerCandidate,
  deleteCandidate,
  updateCandidate,
  getAllCandidate,
  getCandidateById,
  castVote,
  countVote,
} from "../controllers/candidate.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();



router.route("/delete-candidate/:candidateId").delete(deleteCandidate);

router.route("/update-candidate/:candidateId").patch(updateCandidate);

router.route("/getAllCandidate").get(getAllCandidate);

router.route("/getCandidate/:candidateId").get(getCandidateById);

//secured routes

router.route("/vote/:candidateId").post(verifyJWT, castVote);
router.route("/register").post(verifyJWT,registerCandidate);
router.route("/voteCount").get(verifyJWT,countVote);

export default router;
