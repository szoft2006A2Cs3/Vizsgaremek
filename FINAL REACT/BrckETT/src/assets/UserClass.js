export default class User {
    constructor(id, username, email, displayName, PASSWORD, Role, Token, img = "/src/assets/Brckett Logo.png")  {
        this.displayName = displayName;
        this.email = email;
        this.token = Token;
        this.username = username;
        this.userId = id;
        this.role = Role;
        this.img = img;
    }
}
