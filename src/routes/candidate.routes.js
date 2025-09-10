import { Router } from "express";
import { registerCandidate,deleteCandidate } from "../controllers/candidate.controller.js";

const router=Router();

router.route("/register").post(
    registerCandidate
);

router.route("/delete-candidate/:candidateId").delete(
    deleteCandidate
)



export default router;