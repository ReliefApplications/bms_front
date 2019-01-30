import { GlobalText } from "../../texts/global";
import { Project } from "./project";

export class ErrorInterface {
  message: string;
}

export class User {
  static __classname__ = 'User';
  /**
   * User id
   * @type {string}
   */
  id: string = '';
  /**
   * Username
   * @type {string}
   */
  username: string = '';
  /**
   * Plain text password
   * @type {string}
   */
  password: string = '';
  /**
   * Salted password
   * @type {string}
   */
  salted_password: string = '';
  /**
   * Email
   * @type {string}
   */
  email: string = '';
  /**
  * User's rights
  * @type {string}
  */
  rights: string = undefined;
  /**
   * loggedIn state
   * @type {boolean}
   */
  loggedIn: boolean = false;
  /**
   * User's projects
   * @type {number[]}
   */
  projects: any = undefined;
  /**
   * User's country
   * @type {number[]}
   */
  country: any = undefined;
  /**
   * User's language
   * @type {string}
   */
  language: string = '';

  constructor(instance?) {
    if (instance !== undefined) {
      this.id = instance.id;
      this.username = instance.username;
      this.password = instance.password;
      this.email = instance.email;
      this.salted_password = instance.salted_password;
      this.rights = instance.rights;
      this.projects = instance.projects;
      this.country = instance.country;
      this.loggedIn = instance.loggedIn;
      this.language = instance.language;
    }
  }

  public static getDisplayedName() {
    return GlobalText.TEXTS.model_user;
  }

  mapAllProperties(selfinstance): Object {
    if (!selfinstance)
      return selfinstance;

    let projects = [];
    if (selfinstance.rights == 'ROLE_PROJECT_MANAGER' && selfinstance.projects) {
      projects = selfinstance.projects;
    } else if (selfinstance.projects) {
      projects = selfinstance.projects[0];
    }

    let country = [];
    if (selfinstance.rights == 'ROLE_REGIONAL_MANAGER' && selfinstance.country) {
      country = selfinstance.country;
    } else if (selfinstance.country) {
      country = selfinstance.country[0];
    }

    return {
      id: selfinstance.id,
      username: selfinstance.username,
      email: selfinstance.email,
      salted_password: selfinstance.salted_password,
      rights: selfinstance.rights,
      projects: projects,
      country: country
    }
  }

  /**
  * return a User after formatting its properties
  */
  getMapper(selfinstance): Object {
    if (!selfinstance)
      return selfinstance;

    return {
      username: selfinstance.username,
      rights: selfinstance.rights
    }
  }

  /**
  * return a User after formatting its properties for the modal details
  */
  getMapperDetails(selfinstance): Object {
    if (!selfinstance)
      return selfinstance;

    if (selfinstance.rights === undefined) {
      selfinstance.rights = '';
    }

    let finalRight;
    let re = /\ /gi;

    selfinstance.rights = selfinstance.rights.replace(re, "");

    this.getAllRights().forEach(rights => {
      let value = Object.values(rights);
      if (value[0] == selfinstance.rights) {
        finalRight = value[1];
      }
    });

    let projects = '';
    if (selfinstance.projects) {
      selfinstance.projects.forEach(project => {
        projects = projects === '' ? project.name : projects + ', ' + project.name;
      });
    }

    return {
      username: selfinstance.username,
      rights: finalRight,
      projects: projects,
      country: selfinstance.country
    }
  }

  /**
   * return a User after formatting its properties for the modal add
   */
  getMapperAdd(selfinstance): Object {
    if (!selfinstance)
      return selfinstance;

    return {
      username: selfinstance.username,
      password: selfinstance.password,
      rights: selfinstance.rights,
      projects: selfinstance.projects,
      country: selfinstance.country
    }
  }

  /**
   * return a User after formatting its properties for the modal update
   */
  getMapperUpdate(selfinstance): Object {
    if (!selfinstance)
      return selfinstance;

    return {
      username: selfinstance.username,
      password: selfinstance.password,
      rights: selfinstance.rights,
      projects: selfinstance.projects,
      country: selfinstance.country
    }
  }

  /**
  * return the type of User properties
  */
  getTypeProperties(selfinstance): Object {
    return {
      username: "text",
      rights: "text"
    }
  }

  /**
  * return the type of User properties for modals
  */
  getModalTypeProperties(selfinstance): Object {
    return {
      username: "email",
      password: "password",
      rights: "selectSingle",
      projects: "selectProjects",
      country: "selectCountry",
    }
  }

  /**
  * return User properties name displayed
  */
  static translator(): Object {
    return {
      username: GlobalText.TEXTS.email,
      password: GlobalText.TEXTS.model_user_password,
      rights: GlobalText.TEXTS.rights,
      projects: GlobalText.TEXTS.project,
      country: GlobalText.TEXTS.model_countryIso3,
    }
  }

  public static formatArray(instance): User[] {
    let users: User[] = [];
    if (instance)
      instance.forEach(element => {
        users.push(this.formatFromApi(element));
      });
    return users;
  }

  public static formatFromApi(element: any): User {
    let user = new User(element);
    if (element.roles) {
      element.roles.forEach(element => {
        user.rights = "" + element + "";
      });
    }
    if (element.countries) {
      user.country = [];
      element.countries.forEach(
        element => {
          user.country.push(element.iso3);
        }
      )
    }
    if (element.user_projects) {
      user.projects = [];
      element.user_projects.forEach(
        element => {
          user.projects.push(
            {
              name: element.project.name,
              id: element.project.id
            }
          );
          if (!user.country.includes(element.project.iso3)) {
            user.country.push(element.project.iso3);
          }
        }
      )
    }

    if (element.password) {
      user.password = '';
      user.salted_password = element.password;
    }

    return user;
  }

  /**
   * used in modal add
   * @param element
   * @param loadedData
   */
  public static formatFromModalAdd(element: any, loadedData: any): User {
    let newObject = new User(element);

    // Format projects for the API
    let projects = [];
    if (newObject.projects && newObject.projects[0]) {
      newObject.projects.forEach(project => {
        projects.push(project.id);
      })
    }
    else if (newObject.projects) {
      projects.push(newObject.projects.id);
    }
    newObject.projects = projects;

    // Format countries for the API
    let country = [];
    if (newObject.country && newObject.country[0]) {
      newObject.country.forEach((c: any) => {
        country.push(c.id);
      })
    }
    else if (newObject.country) {
      country.push(newObject.country.id);
    }
    newObject.country = country;

    return newObject;
  }

  public static formatForApi(element: User): any {
    return new User(element);
  }

  public getAllRights() {
    return [
      {
        'id': "ROLE_ADMIN",
        'name': GlobalText.TEXTS.role_user_admin,
      },
      {
        'id': "ROLE_FIELD_OFFICER",
        'name': GlobalText.TEXTS.role_user_field_officer,
      },
      {
        'id': "ROLE_PROJECT_OFFICER",
        'name': GlobalText.TEXTS.role_user_project_officer,
      },
      {
        'id': "ROLE_PROJECT_MANAGER",
        'name': GlobalText.TEXTS.role_user_project_manager,
      },
      {
        'id': "ROLE_COUNTRY_MANAGER",
        'name': GlobalText.TEXTS.role_user_country_manager,
      },
      {
        'id': "ROLE_REGIONAL_MANAGER",
        'name': GlobalText.TEXTS.role_user_regional_manager,
      }
    ];
  }

  public getAllCountries() {
    return [
      {
        'id': "KHM",
        'name': "Cambodia",
      },
      {
        'id': "SYR",
        'name': "Syria",
      }
    ];
  }
}
