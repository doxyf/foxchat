# foxchat
One of my bigger but shittier projects but still honest work lmao

# How to setup
## How to setup the database part
- Install Postgres on the hosting machine (you can find tutorials on the internet)
- Setup pgAdmin or other tool and create the database and table (you can find it's scheme in the "dbms_scripts" folder)
- Enter connection info in "dbms.js" file.

## How to setup the Node & NPM part
- npm install

## Encryption setup
- Go to "crypto.js" and replace '-' with your own key string (should be long strong string for better security)

#  Run and connect
- Go to cmd and enter "node server.js" command.
- Once the server runs you can visit the chat on the "http://localhost:3001" address.
