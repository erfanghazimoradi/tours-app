const mongoose = require('mongoose');

if (process.env.NODE_ENV === 'production') {
  const dbURL = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);
  mongoose
    .connect(dbURL)
    .catch(err => console.error(`[-] database connect > ${err.message}`));
} else {
  mongoose
    .connect(process.env.DB_LOCAL)
    .catch(err => console.error(`[-] database connect > ${err.message}`));
}

mongoose.connection.on('error', err =>
  console.error(`[-] database connection > ${err.message}`)
);

mongoose.connection.once('connected', () =>
  console.log('[+] database connected successfully')
);

mongoose.connection.on('disconnected', () => console.info('[i] database disconnected'));

mongoose.connection.on('reconnected', () =>
  console.log('[+] database reconnected successfully')
);
