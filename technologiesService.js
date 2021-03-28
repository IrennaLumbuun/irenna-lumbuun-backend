// TECHNOLOGIES Services ===========================================

const AWS = require("aws-sdk");
const miscService = require("./miscService");

AWS.config.update({
  region: "us-east-2"
});

const DynamoDB = new AWS.DynamoDB();
const docClient = new AWS.DynamoDB.DocumentClient();
const TECHNOLOGIES_TABLE = "Technologies"

// get all technologies
let getAllTechnologies = () => {
    const params = {
      TableName:TECHNOLOGIES_TABLE,
    };

    return new Promise((resolve, reject) => {
      docClient.scan(params, function(err, data) {
        if (err) {
          console.error("Unable to get technologies", err);
          reject(err)
        } else {
          resolve(data.Items)
        }
      });
    });
  }

// get based on name
let getTechnology = (id) => {
    const params = {
      TableName:TECHNOLOGIES_TABLE,
      Key: {
        "id": id
      }
    };

    return new Promise((resolve, reject) => {
      docClient.get(params, function(err, data) {
        if (err) {
          console.error("Unable to find projects", err);
          reject(err)
        } else {
          resolve(data.Item)
        }
      });
    });
  }

// update array
let updateTechnology = (id, attributeToChange, newValue) => {
  console.log(`Attempting to update technology ${id}'s ${attributeToChange} to ${newValue}`);
  const params= {
      TableName: TECHNOLOGIES_TABLE,
      Key: {
      "id": id
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
          console.error("Unable to update technology. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
      } else {
          console.log("UpdateTechnology succeeded:", JSON.stringify(data, null, 2));
          resolve(data)
      }
    })
  })
};

// create new technologies
let addTechnology = (name, projects=[]) => {
const id = miscService.convertToId(name);
console.log(`Attempting to add ${id} to the Technology database`)
let params = {
    TableName: TECHNOLOGIES_TABLE,
    Item:{
        "id": id,
        "name": name,
        "projects": projects
        },
    ConditionalExpression: "attribute_not_exists(id)"
    };

    return new Promise((resolve, reject) => {
      docClient.put(params, function(err, data) {
        if (err) {
          console.error("Unable to add technology", err);
          reject(err);
        }
        else {
          console.log(`Added ${data} to the database`);
          resolve(data)
        }
      });
    })
};

let deleteTechnology = (id) => {
  console.log(`Attempting to delete ${id} from Technology database`);
  let params = {
      TableName: TECHNOLOGIES_TABLE,
      Key: {
      "id":id
      }
  }
  return new Promise((resolve, reject) => {
    docClient.delete(params, function(err, data){
      if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        reject(err);
    } else {
        console.log("deleteTechnology succeeded:", JSON.stringify(data, null, 2));
        resolve(data)
      }
  })
  })
}

module.exports = {
    addTechnology,
    updateTechnology,
    getTechnology,
    getAllTechnologies,
    deleteTechnology
  };
