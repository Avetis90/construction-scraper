const { model, Schema } = require('mongoose');

const companySchema = new Schema({
    title: String,
    link: String,
    email: String,
    phone:String,
    site:String
});

module.exports = model('Company', companySchema);
