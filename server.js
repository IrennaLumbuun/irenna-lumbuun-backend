// modules =================================================
const { json } = require('body-parser');
const cors = require('cors'); 
const express = require('express');
const app = express();
app.use(express.json());
app.use(cors());

// set up port =============================================
// Ideally, the port that the backend listens to should not be hardcoded like this. 
// Instead, it should listen to process.env. 
// Right now, it is hardcoded as a hacky solution to resolve SSL issue. 
// For context, see https://github.com/IrennaLumbuun/irenna-lumbuun-backend/wiki/Unavailability-Tracker
const PORT = 8081;
app.get('/', (req, res) => res.send('Application is running..'));
app.listen(PORT, () => console.log(`Backend app listening on port 8081! Process.env = ${process.env.PORT}`));


// APIs -- Projects ==========================================
const projectService = require('./projectService')

// Insert a new project to the database
app.post('/projects', (req, res) => {
  if (req.body.title === undefined) res.status(400).json({"Error": "Please specify project title"});
  if (req.body.tags === undefined) res.status(400).json({"Error": "Please specify project tags"});

  const title = req.body.title;
  const tags = req.body.tags;
  projectService.addProjects(title, tags, req.body.description,
    req.body.url, req.body.bgImg)
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}));
});

// get all projects
app.get('/projects', (req, res) => {
  projectService.getAllProjects()
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}))
});

// get project by id
app.get('/projects/:projectId', (req, res) => {
  projectService.getProject(req.params.projectId)
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}))
})

// Update project attribute
app.put('/projects/:projectId/:attributeToChange', (req, res) => {
  projectService.updateProject(req.params.projectId, req.params.attributeToChange, req.body.newValue)
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}))
});

// delete project from the database
app.delete('/projects/:projectId', (req, res) => {
    // remove from tags database
    // remove from project database
return res.send(
  projectService.deleteProject(req.params.projectId)
  .then(data => res.send(data))
  .catch(err => res.status(500).json({err: err.toString}))
  );
});

// APIs -- Technologies ==========================================
const technologyService = require('./technologiesService')

// Insert a new project to the database
app.post('/technology', (req, res) => {
  if (req.body.name === undefined) res.status(400).json({"Error": "Please specify technology name"});
  if (req.body.projects === undefined) res.status(400).json({"Error": "Please specify the projects that use this technology"});

  const name = req.body.name;
  const projects = req.body.projects;
  technologyService.addTechnology(name, projects)
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}));
});

// get all technologies
app.get('/technologies', (req, res) => {
  technologyService.getAllTechnologies()
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}))
});

// get project by id
app.get('/technology/:technologyId', (req, res) => {
  technologyService.getTechnology(req.params.technologyId)
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}))
})

// Update project attribute
app.put('/technology/:technologyId/:attributeToChange', (req, res) => {
  technologyService.updateProject(req.params.technologyId, req.params.attributeToChange, req.body.newValue)
    .then(data => res.send(data))
    .catch(err => res.status(500).json({err: err.toString}))
});

// delete project from the database
app.delete('/technology/:technologyId', (req, res) => {
    // remove from tags database
    // remove from project database
return res.send(
  technologyService.deleteProject(req.params.technologyId)
  .then(data => res.send(data))
  .catch(err => res.status(500).json({err: err.toString}))
  );
});