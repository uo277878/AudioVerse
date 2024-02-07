import User from '../models/user.js'

export const signup = async (req, res) => {
    const {username, email, password, role, creationDate} = req.body

    try {
        const user = new User({
            username, email, password, role, creationDate
        })
        let newUser = await user.save()
        res.json(newUser)
    } catch(error){
        res.send(error)
    }
};

export const login = (req, res) => {
    res.send("login");
};
