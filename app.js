const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Study"
});

const item2 = new Item({
  name: "Programming"
});

const item3 = new Item({
  name: "Workout"
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Default items saved to database.");
      });
      res.redirect("/");
    } else
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
      List.findOne({name: listName}, function(err, foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      });
    }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(req.body.checkbox, function(err) {
      if (err)
        console.log(err);
      else
        res.redirect("/");
    });
  } else {
      List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
        if(!err)
          res.redirect("/"+listName);
      });
    }
});

app.get("/about", function(req, res) {
  res.render("about");
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/:customRoute", function(req, res) {

  const customListName = _.capitalize(req.params.customRoute);

  List.findOne({name: customListName}, function(err, foundList) {
    if (foundList) {
      //Show an existing list
      res.render("list", {
        listTitle: customListName,
        newListItems: foundList.items
      });
      console.log(foundList.name + " is available in the database.");
    } else {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      console.log(customListName + " successfully added to the database.");
      res.redirect("/" + customListName);
    }
  });

});

app.listen(3000, function() {
  console.log("Server has started successfully");
});
