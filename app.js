//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//const DATABASE_KEY = process.env.DATABASE_KEY;
mongoose.connect("mongodb://localhost:27017/candidateDB");

//create candidateSchema schema
const candidateSchema = mongoose.Schema ({
    firstName: String,
    lastName: String,
    phone: Number,
    applied: String,
    rating: Number
});

//create model/collection for candidateData 
const candidateData = mongoose.model("candidateData", candidateSchema);


app.get("/",function(req,res){
    res.render("home",{

    });
});

//////////////////////////////////////////////////////////////////CREATE SECTION/////////////////////////////////////////////////////////////////

app.get("/add",function(req,res){
    res.render("add",{

    });
});

//adds new record
app.post("/add",function(req,res){
    const firstName = _.capitalize(req.body.firstName);
    const lastName = _.capitalize(req.body.lastName);
    const phone = req.body.phone;
    const applied = req.body.applied;
    const rating = req.body.rating;

    candidateData.findOne({phone: phone},function(err,foundCandidate){
        if(foundCandidate){
            res.redirect("/userExists");
        } else {

            const newCandidate = new candidateData({
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                applied: applied,
                rating: rating
            });

            newCandidate.save(function(err){
                if(err){
                    console.log(err);
                } else {
                    res.redirect("/success");
                }
            });
                   
        }

    });
    
});

//displays alert message if user already present in database
app.get("/userExists",function(req,res){
    res.render("userExists",{

    });
});

//displays success message for adding new record
app.get("/success",function(req,res){
    res.render("success",{

    });
});

/////////////////////////////////////////////////////////////////DELETE SECTION/////////////////////////////////////////////////////////////////

app.get("/edit",function(req,res){

    candidateData.find({},function(err,foundItems){
        const length = foundItems.length;
        res.render("edit",{
            length: length,
            foundItems: foundItems
        });
    });

});

//identies if its update or delete operation
app.get("/edit/:operation/:key",function(req,res){

    const key = req.params.key;
    const operation = req.params.operation;

    if(operation == 1){

        candidateData.find({_id: key},function(err,foundItems){

            res.render("edit_window",{
                key: key,
                firstName: foundItems[0].firstName,
                lastName: foundItems[0].lastName,
                phone: foundItems[0].phone,
                applied: foundItems[0].applied,
                rating: foundItems[0].rating
            });
        });

    } else if(operation == 2){

        candidateData.deleteOne({_id: key}, function(err){
            if(err){
                console.log(err);
            } else {
                res.redirect("/delete_success");
            }
        });

    } else {
        console.log("opps, something went wrong.");
    }

});

//displays success message for successful deletion.
app.get("/delete_success",function(req,res){
    res.render("delete_success",{

    });
});

////////////////////////////////////////////////////////////////UPDATE SECTION////////////////////////////////////////////////////////////////

app.post("/update",function(req,res){

    const key = req.body.key;

    //new updated
    var firstName = _.capitalize(req.body.firstName);
    var lastName = _.capitalize(req.body.lastName);
    var phone = req.body.phone;
    var applied = req.body.applied;
    var rating = req.body.rating;

    //old data
    const old_firstName = req.body.old_firstName;
    const old_lastName = req.body.old_lastName;
    const old_phone = req.body.old_phone;
    const old_applied = req.body.old_applied;
    const old_rating = req.body.old_rating;

    //if not updated
    let isPhoneUpdated = true;

    if(!(firstName)){
        firstName = old_firstName;
    }
    if(!(lastName)){
        lastName = old_lastName;
    }
    if(!(phone)){
        phone = old_phone;
        isPhoneUpdated = false;
    }
    if(!(applied)){
        applied = old_applied;
    }
    if(!(rating)){
        rating = old_rating;
    }  

    console.log(phone);

    //if contact is updated it checks if there is same contact number already present or user enters same number again
    if(isPhoneUpdated){
        candidateData.find({phone: phone},function(err,result){
            console.log(result);
            if(result.length != 0){
                res.redirect("/phoneExists");
            } else {

                candidateData.findOneAndUpdate({_id: key}, {firstName: firstName, lastName: lastName, phone: phone, applied: applied, rating: rating}, function (err) {
                    if(err){
                        console.log(err);
                    } else {
                        res.redirect("/update_success");
                    }
                });

            }
            
        });

    // if contact is not updated
    } else {

        candidateData.findOneAndUpdate({_id: key}, {firstName: firstName, lastName: lastName, phone: phone, applied: applied, rating: rating}, function (err) {
            if(err){
                console.log(err);
            } else {
                res.redirect("/update_success");
            }
        });

    }
    

    

});

//displays warning for duplicate contact number
app.get("/phoneExists",function(req,res){
    res.render("phoneExists",{

    });
});

//display successfully update message
app.get("/update_success",function(req,res){
    res.render("update_success",{

    });
});

//////////////////////////////////////////////////////////////// READ SECTION ///////////////////////////////////////////////////////////////////

app.get("/view",function(req,res){

    candidateData.find({},function(err,foundItems){
        const length = foundItems.length;
        res.render("view",{
            length: length,
            foundItems: foundItems
        });
    });

});

//binds the connection on sepcified host
app.listen(3000,function(){
    console.log("server is up and running on port 3000.");
});

