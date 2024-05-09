# anakin-assignment
This is a prototype of a railway-management system like IRCTC which provides different functionalities.
There are two roles - user and admin:

Admin: Has all the api access with /admin with him. All such admin API routes are protected using API key. Admin can register, login, see seat availablity, add trains between stations, etc.

User: Restricted access provided for routes like user register, login, booking a train between stations, and fetching booking details.

Tech Stack Used: Node.js, Express.js, MySQL server

Setup Instructions:
1) Clone the repository locally and install all the relevant dependencies from package.json using npm install
2) Configure the MySQL server to create connection to it and enable tcp/ip and create the database using the given schema from MySQL CLI
3) Run the app.js file using node app.js to start the web server and start using the APIs