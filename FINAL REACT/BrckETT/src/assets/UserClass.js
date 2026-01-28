export default class User {
    constructor(displayName, email, username, id, img, token="")  {
        this.displayName = displayName;
        this.email = email;
        this.token = token;
        this.username = username;
        this.userId = id;
        this.img = img;
    }
}