const AWS = require("aws-sdk");
const miscService = require("./miscService");
const technologiesService = require("./technologiesService")

AWS.config.update({
  region: "us-east-2",
  accessKey: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const DynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const PROJECTS_TABLE = "Projects";

// Insert new projects to the database
// TODO: reject duplicate
let addProjects = (title, tags, description="", url="", bgImg="") => {
  const id = miscService.convertToId(title);
  console.log(`Attempting to add ${id} to the Project database`)
  let params = {
    TableName: PROJECTS_TABLE,
    Item:{
        "projectId": id,
        "title": title,
        "tags": tags,
        "bgImg": bgImg,
        "description": description,
        "url": url
        },
    ConditionalExpression: "attribute_not_exists(id)"
    };

    return new Promise((resolve, reject) => {
      docClient.put(params, function(err, data) {
        if (err) {
          console.error("FAILURE: Unable to add projects", err)
          reject(err)
        }
        else {
          console.log(`SUCCESS: Added ${title} with tags ${tags} to the Project Database`);
          tags.forEach(tag => {
            tag = miscService.convertToId(tag)
            technologiesService.getTechnology(tag).then((value) => {
              if (value === undefined) technologiesService.addTechnology(tag, [id])
              else technologiesService.updateTechnology(tag, "projects", [...value["projects"], id])
            }, error => {
              console.log(`FAILURE: Error getting technology given tag ${tag}. Error = ${error}`)
              reject(error);
            });
          })
          resolve(params.Item)
        }
      })
    })
};

// Delete project from the database
let deleteProject = (id) => {
  console.log(`Attempting to delete ${id} from Project Database`);
  return new Promise((resolve, reject) => {
    getProject(id).then(value => {
      console.log("Project is present in the database. Continue deleting...")

      // step 1. delete tags from technology database
      const tags = value["tags"];
      tags.forEach(tag => {
        technologiesService.getTechnology(tag).then(tech => {
          const projects = tech['projects'];
          if (projects.length === 1) technologiesService.deleteTechnology(tag).catch(err => console.log("Unable to delete technology")) // we've deleted the last element in the array
          else {
            const idxProjectToRemove = projects.indexOf(id);
            if (idxProjectToRemove > -1) {
              projects.splice(idxProjectToRemove, 1);
              technologiesService.updateTechnology(tag, "projects", projects)
                .catch(err => reject(err));
            }
          }
        }).catch(err => {
          reject(err);
        })
      })

      // step 2. delete from project database
      const paramsDelete = {
        TableName:PROJECTS_TABLE,
        Key:{
            "projectId": id
        }
      };
      docClient.delete(paramsDelete, function(err, data) {
          if (err) {
              console.error("Unable to delete item from Project Database. Error JSON:", JSON.stringify(err, null, 2));
              reject(err)
          } else {
              console.log("Project is succesfully deleted from project database", JSON.stringify(data, null, 2));
              resolve(data)
          }
      });
    }).catch(error => {
      console.log(`Unable to find project in the database. ${JSON.stringify(error, null, 2)}`)
      reject(error)
    })
  })
}

// Get all projects
let getAllProjects = () => {
  const params = {
    TableName:PROJECTS_TABLE,
  };

  return new Promise((resolve, reject) => {
    docClient.scan(params, function(err, data) {
      if (err) {
        console.error("Unable to find projects", err);
        reject(err)
      } else {
        resolve(data.Items)
      }
    });
  });
}

// get one project
let getProject = (id) => {
  const params = {
    TableName:PROJECTS_TABLE,
    Key: {
      "projectId": id
    }
  };

  return new Promise((resolve, reject) => {
    docClient.get(params, function(err, data) {
      if (err) {
        console.error("Unable to find projects", err);
        reject(err)
      } else {
        // return items
        resolve(data.Item)
      }
    });
  });
}

// Update projects
// TODO: handle "tags" attribute change
let updateProject = (id, attributeToChange, newValue) => {
  console.log(`Attempting to update project ${id}'s ${attributeToChange} to ${newValue}`);
  const params= {
    TableName:PROJECTS_TABLE,
    Key: {
      "projectId": id
    },
    UpdateExpression: "set #attr = :val",
    ExpressionAttributeValues:{
        ":val": newValue
    },
    ExpressionAttributeNames:{
      "#attr": attributeToChange
    },
    ReturnValues:"UPDATED_NEW"
  };

  return new Promise((resolve, reject) => {
    docClient.update(params, function(err, data) {
      if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
      } else {
          console.log("updateProject succeeded:", JSON.stringify(data, null, 2));
          getProject(id).then( value => {
            resolve(value);
          })
      }
    })
  })
};

module.exports = {
  addProjects,
  deleteProject,
  getAllProjects,
  updateProject,
  getProject
};
