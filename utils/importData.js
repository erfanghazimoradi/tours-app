const dotenv = require('dotenv');
const Tour = require('../models/tour-model');
const User = require('../models/user-model');
const Review = require('../models/review-model');
const { join } = require('path');

const toursData = require('../dev-data/tours.json');
const usersData = require('../dev-data/users.json');
const reviewsData = require('../dev-data/reviews.json');

const config = dotenv.config({ path: join(__dirname, '../config.env') });

if (config.error) return console.log(config.error.message);

require('../config/database');

const importData = async () => {
  try {
    await Tour.create(toursData);
    await User.create(usersData, { validateBeforeSave: false });
    await Review.create(reviewsData);

    console.info('[+] develop data imported successfully');
  } catch (err) {
    console.log(`[-] import dev-data > ${err.message}`);
  } finally {
    process.exit(1);
  }
};

const removeData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.info('[+] develop data removed successfully');
  } catch (err) {
    console.log(`[-] remove dev-data > ${err.message}`);
  } finally {
    process.exit(1);
  }
};

const command = process.argv[2];

if (command === '--import' || command === '-i') importData();
else if (command === '--remove' || command === '-r') removeData();
else {
  command
    ? console.log(`[-] command not found: ${command}` + '\n' + 'use --import or --remove')
    : console.log('use --import or --remove');

  process.exit(1);
}
