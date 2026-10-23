const express = require('express');
const router = express.Router();

const {checkForAuthorization}=require('../middlewares/authorization');

const {toCreateProject} = require("../controllers/project/createProject");
const {toViewProject} = require("../controllers/project/viewProject");
const {toSendRequest} = require("../controllers/project/sendRequest");
const {toViewRequest} = require("../controllers/project/viewRequest");
const {toAcceptRequest} = require("../controllers/project/acceptRequest");
const {toRejectRequest} = require("../controllers/project/rejectRequest");

const {getExploreProjects} = require("../controllers/project/getProjects");
const {getJoinedProjects} = require("../controllers/project/getJoinedProjects");
const {getOwnedProjects} = require("../controllers/project/getOwnedProjects");
const {getRequests} = require("../controllers/project/getRequests");
const {getMessages} = require("../controllers/project/getMessages");
const {getNote, upsertNote} = require("../controllers/project/notes");

router.post('/create-project',toCreateProject);
router.get('/view-project/:id',toViewProject);//projects/id

router.get('/explore',getExploreProjects);
router.get('/joined-projects',getJoinedProjects);
router.get('/owned-projects',getOwnedProjects);
router.get('/requests', getRequests);
router.get('/messages/:projectId', getMessages);

router.post('/send-request',toSendRequest);
// router.get('/view-request/:id',checkForAuthorization, toViewRequest);//project request only owner can see
router.get('/view-request/:id', toViewRequest);//project request only owner can see
// router.post('/accept-request/:id/:userId',checkForAuthorization,toAcceptRequest);
// router.post('/reject-request/:id/:userId',checkForAuthorization, toRejectRequest);
router.post('/accept-request/:id/:userId',toAcceptRequest);
router.post('/reject-request/:id/:userId', toRejectRequest);

// Notes routes
router.get('/notes/:projectId', getNote);
router.put('/notes/:projectId', upsertNote);

module.exports=router;