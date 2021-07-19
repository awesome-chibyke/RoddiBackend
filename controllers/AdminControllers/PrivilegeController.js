const responseObject = require("../ViewController");
const Generics = require("../../helpers/Generics");
const AuthenticationCode = require("../../helpers/AuthenticationCode");
const date = require("date-and-time");
const DbActions = require("../../model/DbActions");
const ErrorHandler = require("../../helpers/ErrorHandler");
const ErrorMessages = require("../../helpers/ErrorMessages");
const MessageType = require("../../helpers/MessageType");
const User = require("../../model/User");
const RolesModel = require("../../model/RolesModel");
const Priviledges = require("../../model/Priviledges");
const TypeOfUsers = require("../../model/TypeOfUsers");
const authData = require("../../helpers/AuthenticateLogin");
const validator = require("../../helpers/validator");
const fs = require("fs");

class PrivilegeController {
  constructor() {
    this.errorMessage = "";
    this.errorStatus = false;
    this.responseObject = new responseObject();
    this.DbActions = new DbActions();
    this.AuthenticationCode = new AuthenticationCode();
    this.Generics = new Generics();
    this.MessageType = new MessageType();
    this.User = new User();
    this.RolesModel = new RolesModel();
    this.Priviledges = new Priviledges();
    this.TypeOfUsers = new TypeOfUsers();
    this.ErrorMessages = new ErrorMessages();
    this.RoleManagerFilePath = this.Priviledges.RoleManagerFilePath;
  }

  valdateFunction(req, ValidationRule) {
    validator(req.body, ValidationRule, {}, (err, status) => {
      if (status === false) {
        this.errorMessage = err;
      }
      this.errorStatus = status;
    });
  }

  //store the privileges
  async storePrivilege(req, res) {
    try {
      let loggedUser = await authData(req); //verify the logged in user
      loggedUser = await this.User.selectOneUser([
        ["unique_id", "=", loggedUser.user.unique_id],
      ]);
      if (loggedUser === false) {
        let ErrorMessage =
          this.ErrorMessages.ErrorMessageObjects.authentication_failed;
        throw new Error(ErrorMessage);
      }

      //validate the user type_of_user_unique_id 	role_unique_id
      /*const PhoneNumberVerificationRule = {//validate the datas for the verification
                roles_management: "required|array|min",
                'roles_management.*':'required|min:1',
            };

            this.valdateFunction(req, PhoneNumberVerificationRule);//call the validation function
            if(this.errorStatus === false){
                this.responseObject.setStatus(false);
                this.responseObject.setMessage(this.errorMessage.errors);
                return res.json(this.responseObject.sendToView());
            }*/

      let rolesManagement = req.body.roles_management; //the role management from the front end

    //   rolesManagement = [
    //     {
    //       type_of_user_unique_id: "oqsi4mgom8q8g8is7xya",
    //       type_of_user: "super-admin",
    //       role_unique_id: "1c0j6h8qxfgk5itflakq",
    //       role: "manage_roles",
    //       status: "active",
    //     },
    //     {
    //       type_of_user_unique_id: "itkcxmvw60xvkpxthogp",
    //       type_of_user: "mid-admin",
    //       role_unique_id: "1c0j6h8qxfgk5itflakq",
    //       role: "manage_roles",
    //       status: "inactive",
    //     },
    //     {
    //       type_of_user_unique_id: "8n6x48qwblvfa2hx3ruf",
    //       type_of_user: "admin",
    //       role_unique_id: "1c0j6h8qxfgk5itflakq",
    //       role: "manage_roles",
    //       status: "inactive",
    //     },
    //     {
    //       type_of_user_unique_id: "7ov8pldpct4z0l9hkgxb",
    //       type_of_user: "user",
    //       role_unique_id: "1c0j6h8qxfgk5itflakq",
    //       role: "manage_roles",
    //       status: "active",
    //     },
    //   ];

      //loop through the role management data and add to the db
      for (let i in rolesManagement) {
        let objectForUpdate = {};
        //select the details to check if the details exist
        let selectedPrivilege = await this.Priviledges.selectOnePrivilege([
          [
            "type_of_user_unique_id",
            "=",
            rolesManagement[i].type_of_user_unique_id,
          ],
          ["role_unique_id", "=", rolesManagement[i].role_unique_id],
        ]);


        if (selectedPrivilege !== false) {
          objectForUpdate = {
            unique_id: selectedPrivilege.unique_id,
            status: rolesManagement[i].status,
          };
          await this.Priviledges.updatePrivilege(objectForUpdate); //update the privilege row
        } else {
          let uniqueIdDetails = await this.Generics.createUniqueId(
            "roles",
            "unique_id"
          ); //create the unique id
          if (uniqueIdDetails.status === false) {
            throw new Error(uniqueIdDetails.message);
          }

          const now = new Date(); //get the current date
          let currenctDate = date.format(now, "YYYY-MM-DD HH:mm:ss");

        //   let objectForCreationOfNewPrivilege = {
        //     unique_id: uniqueIdDetails.data,
        //     type_of_user_unique_id: rolesManagement[i].type_of_user_unique_id,
        //     role_unique_id: rolesManagement[i].role_unique_id,
        //     created_at: currenctDate,
        //     updated_at: currenctDate,
        //     status: rolesManagement[i].status,
        //   };

          rolesManagement.push({
            unique_id: uniqueIdDetails.data,
            type_of_user_unique_id: rolesManagement[i].type_of_user_unique_id,
            role_unique_id: rolesManagement[i].role_unique_id,
            created_at: currenctDate,
            updated_at: currenctDate,
            status: rolesManagement[i].status,
          });

          //insert the values into the db
        //   await this.DbActions.insertData("privileges_tb", [
        //     objectForCreationOfNewPrivilege,
        //   ]);

          selectedPrivilege.privileges = rolesManagement;
          let data = JSON.stringify(selectedPrivilege);
          fs.writeFileSync(this.RoleManagerFilePath, data);
          console.log(rolesManagement)

        }
      }

      //select the all the roles
    //   let AllPrivileges = await this.selectAllPrivilege();

      //send details to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage("Updates were successful");
      this.responseObject.setData({
        all_privileges: rolesManagement,
      });
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
      console.log(err)
    }
  }

  //select all privileges
  async getAllPrivileges(req, res) {
    try {
      let thePath = this.RoleManagerFilePath;
      //select the all the roles
      let existingPriviledgeArray = fs.readFileSync(thePath);
      existingPriviledgeArray = JSON.parse(existingPriviledgeArray);

      //send details to view
      this.responseObject.setStatus(true);
      this.responseObject.setMessage(
        "Role management details was successfully returned"
      );
      this.responseObject.setData({
        priviledges: existingPriviledgeArray.privileges,
      });
      res.json(this.responseObject.sendToView());
    } catch (err) {
      this.responseObject.setStatus(false);
      this.responseObject.setMessage({
        general_error: [ErrorHandler(err)],
      });
      res.json(this.responseObject.sendToView());
    }
  }

//   returnStatus(roleSummaryObject, roleTypeOfUserAyy, v) {
//     for (let n in roleSummaryObject) {
//       if (
//         roleTypeOfUserAyy[v].type_of_user_unique_id ===
//           roleSummaryObject[n].type_of_user_unique_id &&
//         roleTypeOfUserAyy[v].role_unique_id ===
//           roleSummaryObject[n].role_unique_id
//       ) {
//         return "no";
//       }
//     }
//     return "yes";
//   }

  async selectAllPrivilege() {
    //select the all the roles
    let roles = await this.RolesModel.selectAllRoles(
      [],
      "no",
      "no",
      "id",
      "desc"
    );

    //select all the user types
    let typeOfUser = await this.TypeOfUsers.selectAllTypeOfUsers(
      [],
      "no",
      "no",
      "id",
      "desc"
    );

    //select the all the privileges
    let privilege = await this.Priviledges.selectAllPrivileges(
      [],
      "no",
      "no",
      "id",
      "desc"
    );

    let roleTypeOfUserAyy = [];

    if (typeOfUser.length > 0 && roles.length > 0) {
      for (let i in typeOfUser) {
        //loop through the users, foreach of the user check the
        for (let e in roles) {
          roleTypeOfUserAyy.push({
            type_of_user_unique_id: typeOfUser[i].unique_id,
            type_of_user: typeOfUser[i].type_of_user,
            role_unique_id: roles[e].unique_id,
            role: roles[e].role,
          });
        }
      }

      if (roleTypeOfUserAyy.length > 0) {
        for (let v in roleTypeOfUserAyy) {
          if (privilege.length > 0) {
            //loop through the privilege and check if the two rhyme
            for (let m in privilege) {
              let roleUniqueId = privilege[m].role_unique_id;
              let typeOfUserUniqueId = privilege[m].type_of_user_unique_id;

              if (
                roleTypeOfUserAyy[v].type_of_user_unique_id ===
                  typeOfUserUniqueId &&
                roleTypeOfUserAyy[v].role_unique_id === roleUniqueId
              ) {
                roleTypeOfUserAyy[v].status = privilege[m].status;
                break;
              } else {
                roleTypeOfUserAyy[v].status = "inactive";
              }
            }
          }

          if (privilege.length == 0) {
            roleTypeOfUserAyy[v].status = "inactive";
          }
        }
      }
    }

    return roleTypeOfUserAyy;
  }

//   async selectAllPrivilege() {
//     //select the all the roles
//     let roles = await this.RolesModel.selectAllRoles(
//       [],
//       "no",
//       "no",
//       "id",
//       "desc"
//     );

//     //select all the user types
//     let typeOfUser = await this.TypeOfUsers.selectAllTypeOfUsers(
//       [],
//       "no",
//       "no",
//       "id",
//       "desc"
//     );

//     //select the all the privileges
//     let privilege = await this.Priviledges.selectAllPrivileges(
//       [],
//       "no",
//       "no",
//       "id",
//       "desc"
//     );

//     let roleSummaryObject = [];
//     let roleTypeOfUserAyy = [];

//     if (typeOfUser.length > 0 && roles.length > 0) {
//       for (let i in typeOfUser) {
//         //loop through the users, foreach of the user check the
//         let currentTypeOfUserId = typeOfUser[i].unique_id;
//         for (let e in roles) {
//           let currentRoleId = roles[e].unique_id;

//           if (privilege.length > 0) {
//             //loop through the privilege and check if the two rhyme
//             for (let m in privilege) {
//               let roleUniqueId = privilege[m].role_unique_id;
//               let typeOfUserUniqueId = privilege[m].type_of_user_unique_id;
//               //let theStatus = privilege[m].status === 'active' ? 'active' : 'inactive';
//               if (
//                 currentTypeOfUserId === typeOfUserUniqueId &&
//                 currentRoleId === roleUniqueId
//               ) {
//                 let add = this.returnStatus(
//                   roleSummaryObject,
//                   typeOfUser,
//                   i,
//                   roles,
//                   e
//                 );
//                 if (add === "yes") {
//                   console.log("kjhjh");
//                   roleSummaryObject.push({
//                     type_of_user_unique_id: typeOfUserUniqueId,
//                     type_of_user: typeOfUser[i].type_of_user,
//                     role_unique_id: roleUniqueId,
//                     role: roles[e].role,
//                     status: privilege[m].status,
//                   });
//                 }
//               } else {
//                 console.log("no");
//                 let add = this.returnStatus(
//                   roleSummaryObject,
//                   typeOfUser,
//                   i,
//                   roles,
//                   e
//                 );

//                 if (add === "yes") {
//                   roleSummaryObject.push({
//                     type_of_user_unique_id: typeOfUser[i].unique_id,
//                     type_of_user: typeOfUser[i].type_of_user,
//                     role_unique_id: roles[e].unique_id,
//                     role: roles[e].role,
//                     status: "inactive",
//                   });
//                 }
//               }
//             }
//           }

//           if (privilege.length == 0) {
//             roleSummaryObject.push({
//               type_of_user_unique_id: typeOfUser[i].unique_id,
//               type_of_user: typeOfUser[i].type_of_user,
//               role_unique_id: roles[e].unique_id,
//               role: roles[e].role,
//               status: "inactive",
//             });
//           }
//         }
//       }
//     }

//     return roleSummaryObject;
//   }
}

module.exports = PrivilegeController;
