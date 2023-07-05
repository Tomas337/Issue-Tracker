'use strict';
const mongoose = require('mongoose');
const IssueModel = require('../models.js').Issue;
const ProjectModel = require('../models.js').Project;
const  ObjectId = require('mongodb').ObjectId;

module.exports = function (app){  

  app.route('/api/issues/:project')
  
    .get(async (req, res) => {
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text } = req.query;
 
      const response = await ProjectModel.aggregate([
        { $match: { name: projectName } },
        { $unwind: "$issues" },
        _id != undefined
          ? { $match: { "issues._id": new ObjectId(_id) } }
          : { $match: {} },
        issue_title != undefined
          ? { $match: { "issues.issue_title": issue_title } }
          : { $match: {} },
        issue_text != undefined
          ? { $match: { "issues.issue_text": issue_text } }
          : { $match: {} },
        created_on != undefined
          ? { $match: { "issues.created_on": new Date(created_on) } }
          : { $match: {} },
        updated_on != undefined
          ? { $match: { "issues.updated_on": new Date(updated_on) } }
          : { $match: {} },
        created_by != undefined
          ? { $match: { "issues.created_by": created_by } }
          : { $match: {} },
        assigned_to != undefined
          ? { $match: { "issues.assigned_to": assigned_to } }
          : { $match: {} },
        open != undefined
          ? { $match: { "issues.open": (open == 'true' ? true : false) } }
          : { $match: {} },
        status_text != undefined
          ? { $match: { "issues.status_text": status_text } }
          : { $match: {} },
      ])
      let issueArray = response.map(item => item.issues)
      res.json(issueArray)
    })
    
    .post(async (req, res) => {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if( !issue_title || !issue_text || !created_by){
        res.json({ error: 'required field(s) missing' });
        return;
      }
      const newIssue = new IssueModel({
        issue_title: issue_title || "",
        issue_text: issue_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || "",
        assigned_to: assigned_to || "",
        open: true,
        status_text: status_text || ""
      })
      const findResult = await ProjectModel.findOne({ name: project });
      if(!findResult){
        const newProject = new ProjectModel({ name: project });
        newProject.issues.push(newIssue);
        newProject.save();        
      } else{
        findResult.issues.push(newIssue);
        findResult.save();
      }
      res.json(newIssue);
    })
    
    .put(async (req, res) => {
      let projectName = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open} = req.body;

      if(!_id){
        res.json({ error: 'missing _id' });
        return;
      }
      if( !issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open){
        res.json({ error: 'no update field(s) sent', '_id': _id })
        return;
      }
      
      try{
        let project = await ProjectModel.findOne({ name: projectName });
        let issue = project.issues.id(_id)

        if(issue_title != undefined) issue.issue_title = issue_title;
        if(issue_text != undefined) issue.issue_text = issue_text;
        if(created_by != undefined) issue.created_by = created_by;
        if(assigned_to != undefined) issue.assigned_to = assigned_to;
        if(status_text != undefined) issue.status_text = status_text;
        if(open != undefined) issue.open = open;
        issue.updated_on = new Date();
        project.save();

        res.json({  result: 'successfully updated', '_id': _id });

      } catch(err){
        //console.log(err)
        res.json({ error: 'could not update', '_id': _id })
      }
      
    })
    
    .delete(async (req, res) => {
      let projectName = req.params.project;
      let { _id } = req.body;
      if(!_id) {
        res.json({ error: 'missing _id' })
        return;
      }
      try {
        let project = await ProjectModel.findOne({ name: projectName });
        let issueToBeRemoved = project.issues.id(_id);
        issueToBeRemoved.deleteOne({})
        project.save()
        res.json({ result: 'successfully deleted', '_id': _id });
      } catch(err){
        //console.log(err)
        res.json({ error: 'could not delete', '_id': _id });
      }
    }); 
};
