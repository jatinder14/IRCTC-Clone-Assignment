const { dB } = require('../models/db');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY || "key";

// Registering the user
exports.register = (req, res) => {
    const { username, password, role } = req.body;
  
    if (role !== 'user') {
      return res.status(403).send({ message: "Forbidden access" });// Role must be user
    }
  
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Connection cannot be obatined from the dB');
        }
        
        newConnection.query('INSERT INTO Users (username, password_hash, role) VALUES (?, ?, ?)',
          [username, password, role],
          (err, results) => {
            newConnection.release(); 
            if (err) {
              console.error(err);
              return res.status(500).send('User Registration error');
            }
            res.status(201).send('User registered successfully');
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('User Registration error');
    }
};
// Logging in the user and sending a jwt token in response
exports.login = (req, res) => {
    const { username, password } = req.body;
  
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error connecting to database');
        }
  
        newConnection.query('SELECT * FROM Users WHERE username = ? AND role = "user"',
          [username],
          (err, results) => {
            console.log(results);
            if (err) {
              console.error(err);
              newConnection.release();
              return res.status(500).send('Error logging in');
            }
  
            if (results.length === 0) {
              newConnection.release();
              return res.status(401).send('Invalid username or password');
            }
            
            const doesPasswordMatch = (results[0].password_hash === password);
  
            if (!doesPasswordMatch) {
              newConnection.release();
              return res.status(401).send('Invalid username or password');
            }
            // jwt token is signed
            const token = jwt.sign({ user_id: results[0].user_id, username: results[0].username }, SECRET_KEY);
            newConnection.release();
            res.send({ access_token: token });
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error logging in');
    }
};
//Transaction in SQL database with a for update is used to lock the row 
//that is getting modified with decremented seats in the table. This /
// ensures concurrency handling. In case the transaction fails, the system reverts 
// back to original state

exports.bookSeat = (req, res) => {
    const { train_id } = req.body;
    const decoded = req.user;

    dB.getConnection((err, newConnection) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error connecting to database');
        }
        // transacrtio begins
        newConnection.beginTransaction((err) => {
            if (err) {
                newConnection.release();
                console.error(err);
                return res.status(500).send('Error beginning transaction');
            }
        // train table is queried for available no of seats
            newConnection.query('SELECT * FROM Trains WHERE train_id = ? AND available_seats > 0 FOR UPDATE', [train_id], (err, lockResults) => {
                if (err) {
                    newConnection.rollback(() => {
                        newConnection.release();
                        console.error(err);
                        return res.status(500).send('Error locking train');
                    });
                }
                //trains table is queried for seats
                newConnection.query('SELECT available_seats FROM Trains WHERE train_id = ?', [train_id], (err, trainRows) => {
                    if (err) {
                        newConnection.rollback(() => {
                            newConnection.release();
                            console.error(err);
                            return res.status(500).send('Error fetching train availability');
                        });
                    }

                    if (trainRows.length === 0 || trainRows[0].available_seats === 0) {
                        newConnection.rollback(() => {
                            newConnection.release();
                            return res.status(404).send('No train is available between source and destination');
                        });
                    }

                    newConnection.query('UPDATE Trains SET available_seats = available_seats - 1 WHERE train_id = ?', [train_id], (err) => {
                        if (err) {
                            newConnection.rollback(() => {
                                newConnection.release();
                                console.error(err);
                                return res.status(500).send('Available seats could not be updated');
                            });
                        }

                        newConnection.query('INSERT INTO Bookings (user_id, train_id) VALUES (?, ?)', [decoded.user_id, train_id], (err) => {
                            if (err) {
                                newConnection.rollback(() => {
                                    newConnection.release();
                                    console.error(err);
                                    return res.status(500).send('details for the booking could not be updated');
                                });
                            }

                            newConnection.commit((err) => {
                                if (err) {
                                    newConnection.rollback(() => {
                                        newConnection.release();
                                        console.error(err);
                                        return res.status(500).send('Transaction could not be committed');
                                    });
                                }

                                newConnection.release();
                                res.send('Successful seat booking');
                            });
                        });
                    });
                });
            });
        });
    });
};
// Fetching all the bookings done by a particular user
// using the information from the decoded token
exports.bookingHistory = (req, res) => {
    const user_id = req.user.user_id;
  
    try {
      dB.getConnection((err, newConnection) => {
        if (err) {
          console.error(err);
          return res.status(500).send('problem connecting to the database');
        }
  
        newConnection.query('SELECT * FROM Bookings WHERE user_id = ?',
          [user_id],
          (err, bookingRows) => {
            if (err) {
              console.error(err);
              newConnection.release();
              return res.status(500).send('Problem fetching the booking history');
            }
  
            res.send(bookingRows);
            newConnection.release(); 
          });
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('problem connecting to the database');
    }
};
