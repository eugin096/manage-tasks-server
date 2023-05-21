require("dotenv").config();
require("./config/database").connect();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();
const cors = require('cors')
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({extended: true}));
const User = require("./model/user");
const Task = require("./model/Task")
const auth = require("./middleware/auth");
const multer = require("multer");
const upload = multer();
app.post("/register",upload.none(), async(req, res) => {
    try{
        const {email, password} = req.body;

        if(!(email && password)){
            res.status(400).send("All inputs are required");
        }

        const userAlreadyExists = await User.findOne({ email });

        if(userAlreadyExists) {
            res.status(409).send("User Already Exist. Please Login to continue")
        }

        encryptedPassword = password ? await bcrypt.hash(password, 10) :'';

        const user = await User.create({
            email: email.toLowerCase(),
            password: encryptedPassword
        })

            // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
            expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;

        // return new user
        res.status(201).json(user);
    }
    catch (err){
        console.log(err)
    }
})

app.post("/login",upload.none(), async (req, res) => {
    try {
      // Get user input
      const { email, password } = req.body;
  
      // Validate user input
      if (!(email && password)) {
        res.status(400).send("All input is required");
      }
      // Validate if user exist in our database
      const user = await User.findOne({ email });
  
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          { user_id: user._id, email },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
  
        // save user token
        user.token = token;
  
        // user
        res.status(200).json(user);
      }
      res.status(400).send("Invalid Credentials");
    } catch (err) {
      console.log(err);
    }
});

app.delete("/Tasks/:id", auth, async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find the task by ID and delete it
    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
      res.status(404).send("Task not found");
      return;
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/Tasks/:id", auth,upload.none(), async (req, res) => {
  try {
    const taskId = req.params.id;
    const { taskStatus } = req.body;


    // Find the task by ID and update the specific field
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        taskStatus: true
      },
      { new: true }
    );

    if (!updatedTask) {
      res.status(404).send("Task not found");
      return;
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/getTasks", auth, upload.none(), async(req, res) => {
  try{
    // Retrieve tasks from the database
    const tasks = await Task.find();

    res.status(200).json(tasks);
  }
  catch(err){
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
})
app.post("/Tasks", auth, upload.none(), async (req, res) => {
  try{
    // Get user input
    const {title, description, dueDate} = req.body;

    // Validate user input
    if(!(title && description && dueDate)){
      res.status(400).send("All input is required");
    }

    const titleAlreadyExists = await Task.findOne({ title });

    if(titleAlreadyExists) {
      res.status(409).send("Task Name should be unique")
    } else{
      const Tasks = await Task.create({
        title: title.toLowerCase(),
        description: description.toLowerCase(),
        dueDate: dueDate,
        taskStatus: false
      })
      res.status(200).json(Tasks);
    }
  }
  catch (err){
    console.error(err)
  }
})
// This should be the last route else any after it won't work
app.use("*", (req, res) => {
    res.status(404).json({
      success: "false",
      message: "Page not found",
      error: {
        statusCode: 404,
        message: "You reached a route that is not defined on this server",
      },
    });
});

module.exports = app;
