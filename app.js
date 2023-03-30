//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose") ;
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Connnect to MongoDB server with Mongoose zo the database "todolistDB"
mongoose.connect("mongodb+srv://nisargmewada:test123@cluster0.ioorpot.mongodb.net/todolistDB", {useNewUrlParser:true, useUnifiedTopology:true});

// create a schema
const itemsSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  }
})

const Item = mongoose.model("Item", itemsSchema);

/* const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = []; */

const item1 = new Item({
  name: "Buy Food",
}) 

const item2 = new Item({
  name: "Clean Room",
})

const item3 = new Item({
  name: "Clean Car",
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },
  items: [itemsSchema]
})

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({})
  .then(foundItem => {
    if (foundItem.length === 0) {
      return Item.insertMany(defaultItems);
    } else {
      return foundItem;
    }
  })
  .then(savedItem => {
    res.render("list", {
      listTitle: "Today",
      newListItems: savedItem
    });
  })
  .catch(err => console.log(err));
  
})


app.post("/", function(req, res){
  // Saving the New item entered by the user on thge page with the form data "name = newItem" and saving into a constant.
  const itemName = req.body.newItem;
  const listName = req.body.list;
  // Creating an item document for DataBase
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
 
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId, function(err){  // in this method we always have to provide a callback or else it would just return the query
      if(!err){
        console.log("item successfully deleted");
        res.redirect("/");
        }
      });
    }
    else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}},function(err,foundList){
        if(!err){
          res.redirect("/"+listName);
        }
      })
    }
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, (err, foundList) => {
      if (!err) {
        if (!foundList) {
          // Create a new list
          const list = new List({
            name: customListName,
            items: defaultItems
          });
          list.save();
          res.redirect("/" + customListName)
        }else {
          // If the List already exists, display the list
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
          console.log("Successfully found a list")
      } 
    }
  }
  )
  })


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
})
