# AstroBall
## A score counter and tournament simulator for the First Tech Challenge
### <i>Presented by AstroBruins</i>

### Structure
Built on a PERN stack (PostgreSQL, Express, React, Node)

Server side (hosted on AWS):
* custom hosted relational database (PostgreSQL) updated on FTC match data daily from the FTC api
* linear regression to predict future scores by teams
* handles client requests using Express and Node, returning a React page which can continue to make requests to the server for team data

Client side (built on React):
* uses fetch requests to speak with server without full updates
* features a visualization of team match history
* allows users to create a leaderboard of multiple teams based on team data
* includes a realtime scoring calculator to keep track of match scores while spectating
