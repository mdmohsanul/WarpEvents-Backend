import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createEvent,
  fetchEvents,
  getAttendees,
  getEventById,
  registerForEvent,
} from "../controllers/event.controller.js";
const router = Router();

router.route("/").post(verifyJWT, createEvent);
router.route("/").get(verifyJWT, fetchEvents);

router.route("/:id/register").post(verifyJWT, registerForEvent);
router.route("/:id/attendees").get(verifyJWT, getAttendees);
router.route("/details/:id").get(verifyJWT, getEventById);


export default router;