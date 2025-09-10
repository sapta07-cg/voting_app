import { Router } from "express";
import { registerCandidate,deleteCandidate, updateCandidate, getAllCandidate, getCandidateById } from "../controllers/candidate.controller.js";

const router=Router();

router.route("/register").post(
    registerCandidate
);

router.route("/delete-candidate/:candidateId").delete(
    deleteCandidate
)

router.route("/update-candidate/:candidateId").patch(
    updateCandidate
)

router.route("/getAllCandidate").get(
    getAllCandidate
)

router.route("/getCandidate/:candidateId").get(
    getCandidateById
)


export default router;